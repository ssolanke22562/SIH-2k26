import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.database import get_db_connection
from app.engines.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/v1/recommendations", tags=["iGOT Karmayogi Course Recommendation Engine"])

class EnrollRequest(BaseModel):
    user_id: str
    course_id: str

class XAPICompletionRequest(BaseModel):
    user_id: str
    course_id: str
    score_pct: float = 90.0

class CoordinatorAssignRequest(BaseModel):
    coordinator_id: str
    target_user_id: str
    course_id: str
    mandatory_due_date: Optional[str] = "2026-10-30"

@router.get("/user/{user_id}")
def get_personalized_recommendations(user_id: str):
    """
    Computes personalized iGOT Karmayogi course roadmap ranked by deficit vector Delta C_m.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get user
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Get latest completed session scores
    cursor.execute("""
    SELECT final_scores FROM assessment_sessions
    WHERE user_id = ? AND status = 'COMPLETED'
    ORDER BY completed_at DESC LIMIT 1
    """, (user_id,))
    latest_sess = cursor.fetchone()

    assessed_scores = {}
    if latest_sess and latest_sess["final_scores"]:
        assessed_scores = json.loads(latest_sess["final_scores"])
    else:
        # Fallback baseline
        assessed_scores = {"STAT_SAMPLING_01": 66, "STAT_PLFS_02": 72, "STAT_INDEX_03": 58, "STAT_ASI_04": 61, "STAT_NATACC_05": 49}

    # Get role targets
    cursor.execute("""
    SELECT c.id as comp_id, c.code, c.name, t.target_proficiency
    FROM competencies c
    LEFT JOIN role_competency_targets t ON t.competency_id = c.id AND t.cadre = ?
    """, (user["cadre"],))
    target_rows = cursor.fetchall()

    target_scores = {}
    comp_id_to_code = {}
    for r in target_rows:
        target_scores[r["code"]] = r["target_proficiency"] or 80
        comp_id_to_code[r["comp_id"]] = r["code"]

    gap_vector = recommendation_engine.calculate_gap_vector(assessed_scores, target_scores)

    # Fetch iGOT courses
    cursor.execute("""
    SELECT c.*, comp.code as competency_code, comp.name as competency_name
    FROM igot_courses c
    JOIN competencies comp ON c.competency_id = comp.id
    """)
    course_rows = cursor.fetchall()
    conn.close()

    raw_courses = [dict(r) for r in course_rows]
    ranked_pathway = recommendation_engine.rank_courses_for_learner(gap_vector, raw_courses, user["cadre"])

    total_training_hours = sum(c["estimated_hours"] for c in ranked_pathway if not c["is_completed"])

    return {
        "user_id": user_id,
        "cadre": user["cadre"],
        "gap_vector": gap_vector,
        "total_recommended_hours": round(total_training_hours, 1),
        "learning_pathway": ranked_pathway
    }

@router.post("/enroll")
def enroll_course(payload: EnrollRequest):
    """
    Enrolls user in iGOT course.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE igot_courses SET enrolled = 1 WHERE id = ?", (payload.course_id,))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Successfully enrolled in iGOT Karmayogi module"}

@router.post("/xapi-complete")
def simulate_xapi_completion(payload: XAPICompletionRequest):
    """
    Simulates xAPI/SCORM completion webhook statement from iGOT Karmayogi platform.
    Triggers re-assessment recommendation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE igot_courses SET completed = 1 WHERE id = ?", (payload.course_id,))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "verb": "http://adlnet.gov/expapi/verbs/completed",
        "message": "iGOT course completion verified. Adaptive re-assessment session is now ready to measure skill gain!"
    }

@router.post("/coordinator-assign")
def assign_mandatory_course(payload: CoordinatorAssignRequest):
    """
    Allows Departmental Training Coordinator to mandate a specific iGOT course.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'MANDATE_TRAINING', 'COURSE', ?, ?)
    """, (f"log_assign_{payload.course_id}", payload.coordinator_id, payload.course_id, f"Mandated for user {payload.target_user_id} with due date {payload.mandatory_due_date}"))

    cursor.execute("UPDATE igot_courses SET enrolled = 1 WHERE id = ?", (payload.course_id,))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Course successfully mandated and added to officer training queue"}
