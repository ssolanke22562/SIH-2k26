from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    user_id: str

@router.get("/users")
def list_demo_users():
    """
    Returns all persona accounts for quick 1-click switching in the hackathon interface.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, official_id, full_name, email, role, cadre, state_code, division_id, language_preference FROM users")
    rows = cursor.fetchall()
    conn.close()

    users = [dict(row) for row in rows]
    return {"users": users}

@router.post("/login")
def login_user(payload: LoginRequest):
    """
    Authenticates user and returns active profile + permissions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ? OR official_id = ?", (payload.user_id, payload.user_id))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_dict = dict(user)
    return {
        "status": "authenticated",
        "token": f"bearer_token_{user_dict['id']}",
        "user": user_dict
    }
