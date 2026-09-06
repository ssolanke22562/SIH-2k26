import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mospi_al.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        official_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        cadre TEXT NOT NULL,
        state_code TEXT NOT NULL,
        division_id TEXT NOT NULL,
        language_preference TEXT DEFAULT 'en',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 2. Competencies Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS competencies (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 3. Role Competency Targets
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS role_competency_targets (
        id TEXT PRIMARY KEY,
        cadre TEXT NOT NULL,
        competency_id TEXT NOT NULL,
        target_proficiency INTEGER NOT NULL,
        FOREIGN KEY (competency_id) REFERENCES competencies (id)
    )
    ''')

    # 4. Reference Documents
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reference_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by TEXT,
        status TEXT DEFAULT 'INGESTED',
        chunk_count INTEGER DEFAULT 0,
        content_text TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )
    ''')

    # 5. AI-Generated & Calibrated Question Bank
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        competency_id TEXT NOT NULL,
        question_type TEXT NOT NULL,
        difficulty_level TEXT NOT NULL,
        irt_b_difficulty REAL DEFAULT 0.0,
        irt_a_discrimination REAL DEFAULT 1.0,
        stem TEXT NOT NULL,
        stem_hi TEXT,
        options TEXT NOT NULL, -- JSON array of {"id": 0, "text": "...", "text_hi": "..."}
        correct_option_index INTEGER NOT NULL,
        explanation TEXT NOT NULL,
        explanation_hi TEXT,
        citation_text TEXT NOT NULL,
        citation_page INTEGER,
        confidence_score REAL NOT NULL,
        review_status TEXT DEFAULT 'APPROVED',
        reviewed_by TEXT,
        reviewed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES reference_documents (id),
        FOREIGN KEY (competency_id) REFERENCES competencies (id),
        FOREIGN KEY (reviewed_by) REFERENCES users (id)
    )
    ''')

    # 6. Active Diagnostic Assessment Sessions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assessment_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_type TEXT DEFAULT 'DIAGNOSTIC',
        status TEXT DEFAULT 'IN_PROGRESS',
        theta_estimates TEXT, -- JSON dict of competency_code -> theta
        final_scores TEXT, -- JSON dict of competency_code -> score (0-100)
        items_administered INTEGER DEFAULT 0,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # 7. Item Response Logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS item_responses (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        selected_option INTEGER NOT NULL,
        is_correct INTEGER NOT NULL,
        response_time_ms INTEGER NOT NULL,
        theta_before REAL NOT NULL,
        theta_after REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES assessment_sessions (id),
        FOREIGN KEY (question_id) REFERENCES questions (id)
    )
    ''')

    # 8. iGOT Course Catalog
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS igot_courses (
        id TEXT PRIMARY KEY,
        igot_course_id TEXT UNIQUE NOT NULL,
        course_name TEXT NOT NULL,
        course_name_hi TEXT,
        provider TEXT DEFAULT 'iGOT Karmayogi',
        duration_minutes INTEGER NOT NULL,
        competency_id TEXT NOT NULL,
        difficulty_level TEXT DEFAULT 'Intermediate',
        thumbnail_url TEXT,
        course_url TEXT NOT NULL,
        enrolled INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        rating REAL DEFAULT 4.8,
        FOREIGN KEY (competency_id) REFERENCES competencies (id)
    )
    ''')

    # 9. Audit Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
