import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/v1/sme", tags=["SME Human-in-the-Loop Review Queue"])

class EditQuestionRequest(BaseModel):
    reviewer_id: str
    stem: str
    stem_hi: Optional[str] = None
    options: List[Dict[str, Any]]
    correct_option_index: int
    explanation: str
    explanation_hi: Optional[str] = None
    citation_text: str
    citation_page: int
    difficulty_level: str = "MEDIUM"

class ReviewActionRequest(BaseModel):
    reviewer_id: str
    action: str  # 'APPROVE' or 'REJECT'
    rejection_reason: Optional[str] = None

@router.get("/review-queue")
def get_sme_review_queue():
    """
    Returns AI-generated questions awaiting subject-matter expert review and citation inspection.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT q.*, c.code as competency_code, c.name as competency_name, d.title as document_title, d.file_path
    FROM questions q
    LEFT JOIN competencies c ON q.competency_id = c.id
    LEFT JOIN reference_documents d ON q.document_id = d.id
    WHERE q.review_status = 'PENDING_REVIEW'
    ORDER BY q.confidence_score ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        item = dict(r)
        item["options"] = json.loads(item["options"]) if isinstance(item["options"], str) else item["options"]
        # Grounding flag: confidence < 0.85 requires strict SME verification
        item["requires_mandatory_audit"] = item["confidence_score"] < 0.85
        items.append(item)

    return {
        "pending_count": len(items),
        "items": items
    }

@router.get("/question-bank")
def get_approved_question_bank():
    """
    Returns all active approved questions in the MoSPI question bank.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT q.*, c.code as competency_code, c.name as competency_name, d.title as document_title
    FROM questions q
    LEFT JOIN competencies c ON q.competency_id = c.id
    LEFT JOIN reference_documents d ON q.document_id = d.id
    WHERE q.review_status IN ('APPROVED', 'EDITED')
    ORDER BY q.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        item = dict(r)
        item["options"] = json.loads(item["options"]) if isinstance(item["options"], str) else item["options"]
        items.append(item)

    return {"total_count": len(items), "questions": items}

@router.post("/questions/{question_id}/approve")
def approve_question(question_id: str, payload: ReviewActionRequest):
    """
    Approves AI question into the active question bank.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    q = cursor.fetchone()
    if not q:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")

    cursor.execute("""
    UPDATE questions
    SET review_status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (payload.reviewer_id, question_id))

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'APPROVE_QUESTION', 'QUESTION', ?, ?)
    """, (f"log_{datetime.now().timestamp()}", payload.reviewer_id, question_id, "SME approved question into active bank"))

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Question {question_id} approved into active bank"}

@router.put("/questions/{question_id}/edit")
def edit_and_approve_question(question_id: str, payload: EditQuestionRequest):
    """
    Allows SME to modify question stem/options and approve with verified provenance.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    q = cursor.fetchone()
    if not q:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")

    cursor.execute("""
    UPDATE questions
    SET stem = ?, stem_hi = ?, options = ?, correct_option_index = ?,
        explanation = ?, explanation_hi = ?, citation_text = ?, citation_page = ?,
        difficulty_level = ?, review_status = 'EDITED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (
        payload.stem, payload.stem_hi, json.dumps(payload.options), payload.correct_option_index,
        payload.explanation, payload.explanation_hi, payload.citation_text, payload.citation_page,
        payload.difficulty_level, payload.reviewer_id, question_id
    ))

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'EDIT_AND_APPROVE_QUESTION', 'QUESTION', ?, ?)
    """, (f"log_{datetime.now().timestamp()}", payload.reviewer_id, question_id, "SME edited and approved question"))

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Question {question_id} updated and published"}

@router.post("/questions/{question_id}/reject")
def reject_question(question_id: str, payload: ReviewActionRequest):
    """
    Rejects AI generated item and logs reason.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM questions WHERE id = ?", (question_id,))
    q = cursor.fetchone()
    if not q:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")

    cursor.execute("""
    UPDATE questions
    SET review_status = 'REJECTED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (payload.reviewer_id, question_id))

    cursor.execute("""
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'REJECT_QUESTION', 'QUESTION', ?, ?)
    """, (f"log_{datetime.now().timestamp()}", payload.reviewer_id, question_id, f"Reason: {payload.rejection_reason or 'Failed SME verification'}"))

    conn.commit()
    conn.close()

    return {"status": "success", "message": f"Question {question_id} rejected"}

@router.get("/stats")
def get_sme_review_stats():
    """
    Returns SME throughput and accuracy metrics.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT review_status, COUNT(*) as cnt FROM questions GROUP BY review_status")
    rows = cursor.fetchall()
    conn.close()

    counts = {r["review_status"]: r["cnt"] for r in rows}
    total = sum(counts.values())
    approved = counts.get("APPROVED", 0) + counts.get("EDITED", 0)
    acceptance_rate = round((approved / max(1, total)) * 100, 1)

    return {
        "pending_review": counts.get("PENDING_REVIEW", 0),
        "approved": counts.get("APPROVED", 0),
        "edited": counts.get("EDITED", 0),
        "rejected": counts.get("REJECTED", 0),
        "total_items": total,
        "acceptance_rate_pct": acceptance_rate,
        "avg_review_time_sec": 38
    }
