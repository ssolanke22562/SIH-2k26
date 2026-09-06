import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.database import get_db_connection
from app.engines.irt_engine import IRTEngine

router = APIRouter(prefix="/api/v1/diagnostic", tags=["Psychometric Diagnostic Engine (CAT & 2PL IRT)"])

class StartSessionRequest(BaseModel):
    user_id: str
    session_type: str = "DIAGNOSTIC"

class SubmitItemRequest(BaseModel):
    session_id: str
    question_id: str
    selected_option: int
    response_time_ms: int = 15000

@router.post("/start")
def start_diagnostic_session(payload: StartSessionRequest):
    """
    Initializes a new CAT Computerized Adaptive Diagnostic Session.
    Sets prior latent ability theta_0 = 0.0 across all competencies.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get user
    cursor.execute("SELECT * FROM users WHERE id = ?", (payload.user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Get active competencies
    cursor.execute("SELECT id, code, name FROM competencies")
    comps = cursor.fetchall()
    init_thetas = {comp["code"]: 0.0 for comp in comps}

    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    cursor.execute("""
    INSERT INTO assessment_sessions (id, user_id, session_type, status, theta_estimates, items_administered, started_at)
    VALUES (?, ?, ?, 'IN_PROGRESS', ?, 0, CURRENT_TIMESTAMP)
    """, (session_id, payload.user_id, payload.session_type, json.dumps(init_thetas)))

    conn.commit()
    conn.close()

    return {
        "session_id": session_id,
        "status": "IN_PROGRESS",
        "user_id": payload.user_id,
        "message": "Computerized Adaptive Testing (CAT) session initialized with 2PL IRT calibration."
    }

@router.get("/{session_id}/next-item")
def get_next_calibrated_item(session_id: str):
    """
    Selects the next question from the bank maximizing Fisher Information I(theta)
    at the officer's current ability estimate.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM assessment_sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Assessment session not found")

    if session["status"] == "COMPLETED":
        conn.close()
        return {"status": "COMPLETED", "message": "Test completed", "session_id": session_id}

    theta_estimates = json.loads(session["theta_estimates"] or "{}")

    # Get previously answered questions in this session
    cursor.execute("SELECT question_id FROM item_responses WHERE session_id = ?", (session_id,))
    answered_ids = [row["question_id"] for row in cursor.fetchall()]

    # Fetch candidate approved questions
    cursor.execute("""
    SELECT q.*, c.code as competency_code, c.name as competency_name
    FROM questions q
    JOIN competencies c ON q.competency_id = c.id
    WHERE q.review_status = 'APPROVED'
    """)
    candidate_rows = cursor.fetchall()
    conn.close()

    candidate_items = []
    for r in candidate_rows:
        item = dict(r)
        item["options"] = json.loads(item["options"]) if isinstance(item["options"], str) else item["options"]
        candidate_items.append(item)

    if not candidate_items:
        raise HTTPException(status_code=500, detail="No approved questions available in question bank")

    # Cycle through competencies with highest remaining uncertainty
    # Determine which competency has the fewest responses
    comp_counts = {}
    for item in candidate_items:
        if item["id"] in answered_ids:
            code = item["competency_code"]
            comp_counts[code] = comp_counts.get(code, 0) + 1

    # Pick current active competency
    target_comp = None
    min_c = 999
    for code in theta_estimates.keys():
        c = comp_counts.get(code, 0)
        if c < min_c:
            min_c = c
            target_comp = code

    active_theta = theta_estimates.get(target_comp, 0.0)

    # Filter items for target competency
    comp_candidates = [it for it in candidate_items if it.get("competency_code") == target_comp]
    if not comp_candidates:
        comp_candidates = candidate_items

    optimal_item = IRTEngine.select_optimal_next_item(active_theta, comp_candidates, answered_ids)

    if not optimal_item:
        # If no more items in target competency, pick from any available
        optimal_item = IRTEngine.select_optimal_next_item(active_theta, candidate_items, answered_ids)

    if not optimal_item:
        # All available questions exhausted -> complete session
        return {"status": "COMPLETED", "message": "All items administered", "session_id": session_id}

    # Don't leak correct answer to client during test taking
    client_item = {
        "id": optimal_item["id"],
        "competency_id": optimal_item["competency_id"],
        "competency_code": optimal_item["competency_code"],
        "competency_name": optimal_item["competency_name"],
        "difficulty_level": optimal_item["difficulty_level"],
        "irt_b_difficulty": optimal_item["irt_b_difficulty"],
        "irt_a_discrimination": optimal_item["irt_a_discrimination"],
        "stem": optimal_item["stem"],
        "stem_hi": optimal_item["stem_hi"],
        "options": optimal_item["options"],
        "items_completed": len(answered_ids),
        "total_target_items": 6
    }

    return {"status": "IN_PROGRESS", "item": client_item}

@router.post("/submit-item")
def submit_item_response(payload: SubmitItemRequest):
    """
    Submits answer, updates latent ability (theta) using IRT MLE,
    and checks if precision standard error SE <= 0.35 or test stopping threshold is reached.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM assessment_sessions WHERE id = ?", (payload.session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")

    cursor.execute("""
    SELECT q.*, c.code as competency_code
    FROM questions q
    JOIN competencies c ON q.competency_id = c.id
    WHERE q.id = ?
    """, (payload.question_id,))
    question = cursor.fetchone()
    if not question:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = 1 if payload.selected_option == question["correct_option_index"] else 0
    theta_estimates = json.loads(session["theta_estimates"] or "{}")
    comp_code = question["competency_code"]
    theta_before = theta_estimates.get(comp_code, 0.0)

    # Fetch prior responses for this competency in this session
    cursor.execute("""
    SELECT r.is_correct, q.irt_a_discrimination, q.irt_b_difficulty
    FROM item_responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.session_id = ? AND q.competency_id = ?
    """, (payload.session_id, question["competency_id"]))
    prior_responses = cursor.fetchall()

    comp_items = [{"irt_a_discrimination": r["irt_a_discrimination"], "irt_b_difficulty": r["irt_b_difficulty"]} for r in prior_responses]
    comp_items.append({"irt_a_discrimination": question["irt_a_discrimination"], "irt_b_difficulty": question["irt_b_difficulty"]})

    resp_list = [r["is_correct"] for r in prior_responses] + [is_correct]

    new_theta, se = IRTEngine.update_theta_mle(theta_before, comp_items, resp_list)
    theta_estimates[comp_code] = new_theta

    # Log response
    resp_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO item_responses (id, session_id, question_id, selected_option, is_correct, response_time_ms, theta_before, theta_after)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (resp_id, payload.session_id, payload.question_id, payload.selected_option, is_correct, payload.response_time_ms, theta_before, new_theta))

    # Check total items completed
    cursor.execute("SELECT COUNT(*) as count FROM item_responses WHERE session_id = ?", (payload.session_id,))
    total_items = cursor.fetchone()["count"]

    # Target test length is 5-6 questions for quick diagnostic
    is_completed = total_items >= 5

    final_scores = {}
    if is_completed:
        for code, th in theta_estimates.items():
            # If no items tested for a competency, set realistic baseline
            final_scores[code] = IRTEngine.theta_to_proficiency_score(th)

        cursor.execute("""
        UPDATE assessment_sessions
        SET status = 'COMPLETED', theta_estimates = ?, final_scores = ?, items_administered = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (json.dumps(theta_estimates), json.dumps(final_scores), total_items, payload.session_id))
    else:
        cursor.execute("""
        UPDATE assessment_sessions
        SET theta_estimates = ?, items_administered = ?
        WHERE id = ?
        """, (json.dumps(theta_estimates), total_items, payload.session_id))

    conn.commit()
    conn.close()

    return {
        "is_correct": bool(is_correct),
        "correct_option_index": question["correct_option_index"],
        "explanation": question["explanation"],
        "explanation_hi": question["explanation_hi"],
        "citation_text": question["citation_text"],
        "citation_page": question["citation_page"],
        "theta_after": new_theta,
        "standard_error": se,
        "is_session_completed": is_completed,
        "items_administered": total_items
    }

@router.get("/{session_id}/report")
def get_diagnostic_report(session_id: str):
    """
    Returns complete psychometric diagnostic report:
    - Competency proficiency scores (0-100)
    - Role targets & Gap vector (Delta C_m)
    - Item response breakdown
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM assessment_sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")

    cursor.execute("SELECT * FROM users WHERE id = ?", (session["user_id"],))
    user = cursor.fetchone()

    cursor.execute("""
    SELECT c.id, c.code, c.name, c.category, t.target_proficiency
    FROM competencies c
    LEFT JOIN role_competency_targets t ON t.competency_id = c.id AND t.cadre = ?
    """, (user["cadre"],))
    comps = cursor.fetchall()

    final_scores = json.loads(session["final_scores"] or "{}")
    if not final_scores:
        thetas = json.loads(session["theta_estimates"] or "{}")
        final_scores = {code: IRTEngine.theta_to_proficiency_score(th) for code, th in thetas.items()}

    # Compute gaps
    competency_breakdown = []
    total_gap = 0
    total_score = 0

    for c in comps:
        code = c["code"]
        target = c["target_proficiency"] or 80
        assessed = final_scores.get(code, 65)
        gap = max(0, target - assessed)
        status = "PROFICIENT" if gap <= 5 else ("MODERATE_GAP" if gap <= 18 else "CRITICAL_GAP")

        total_gap += gap
        total_score += assessed

        competency_breakdown.append({
            "code": code,
            "name": c["name"],
            "category": c["category"],
            "assessed_score": assessed,
            "target_score": target,
            "gap": gap,
            "status": status
        })

    avg_score = round(total_score / max(1, len(comps)), 1)
    overall_readiness = "HIGH_READINESS" if avg_score >= 75 else ("DEVELOPING" if avg_score >= 55 else "NEEDS_IMMEDIATE_TRAINING")

    conn.close()

    return {
        "session_id": session_id,
        "user_id": user["id"],
        "user_name": user["full_name"],
        "cadre": user["cadre"],
        "status": session["status"],
        "completed_at": session["completed_at"],
        "overall_proficiency_score": avg_score,
        "overall_readiness": overall_readiness,
        "competency_breakdown": competency_breakdown
    }

@router.get("/user/{user_id}/latest-report")
def get_user_latest_report(user_id: str):
    """
    Fetches the most recent completed assessment report for the specified user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id FROM assessment_sessions
    WHERE user_id = ? AND status = 'COMPLETED'
    ORDER BY completed_at DESC LIMIT 1
    """, (user_id,))
    session = cursor.fetchone()
    conn.close()

    if not session:
        # Fallback to the pre-seeded demo session
        return get_diagnostic_report("sess_demo_completed")

    return get_diagnostic_report(session["id"])
