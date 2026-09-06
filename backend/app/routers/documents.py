import uuid
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.database import get_db_connection
from app.engines.rag_engine import rag_engine

router = APIRouter(prefix="/api/v1/documents", tags=["Document Ingestion & RAG Question Generator"])

class GenerateQuestionsRequest(BaseModel):
    document_id: str
    competency_id: str
    num_questions: int = 2
    difficulty: str = "MEDIUM"

class CreateDocumentRequest(BaseModel):
    title: str
    document_type: str = "NSS_MANUAL"
    content_text: str
    uploaded_by: str = "usr_coord_1"

@router.get("")
def list_documents():
    """
    Returns list of ingested MoSPI official statistical circulars and handbooks.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, document_type, file_path, status, chunk_count, created_at FROM reference_documents ORDER BY created_at DESC")
    docs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"documents": docs}

@router.post("/create")
def create_and_index_document(payload: CreateDocumentRequest):
    """
    Ingests and indexes a new statistical document into the RAG vector store.
    """
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    chunks = rag_engine.chunk_document(doc_id, payload.title, payload.content_text)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO reference_documents (id, title, document_type, file_path, uploaded_by, status, chunk_count, content_text)
    VALUES (?, ?, ?, ?, ?, 'INGESTED', ?, ?)
    """, (doc_id, payload.title, payload.document_type, f"/mospi/docs/{doc_id}.pdf", payload.uploaded_by, len(chunks), payload.content_text))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "doc_id": doc_id,
        "title": payload.title,
        "chunks_indexed": len(chunks),
        "message": "Document successfully ingested and indexed into RAG vector store."
    }

@router.post("/generate-assessment")
def generate_questions_from_document(payload: GenerateQuestionsRequest):
    """
    RAG Assessment Generation:
    1. Retrieves top context chunks from vector index.
    2. Generates grounded assessment items with distractors and exact citations.
    3. Computes grounding confidence score S_conf.
    4. Routes to SME Review Queue.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reference_documents WHERE id = ?", (payload.document_id,))
    doc = cursor.fetchone()
    if not doc:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    cursor.execute("SELECT * FROM competencies WHERE id = ? OR code = ?", (payload.competency_id, payload.competency_id))
    comp = cursor.fetchone()
    if not comp:
        conn.close()
        raise HTTPException(status_code=404, detail="Competency not found")

    # Search relevant chunks
    chunks = rag_engine.search_relevant_chunks(comp["name"], doc_id=payload.document_id, top_k=payload.num_questions)
    if not chunks:
        # Fallback to chunking content if not in memory
        chunks = rag_engine.chunk_document(doc["id"], doc["title"], doc["content_text"] or doc["title"])

    generated_questions = []
    for i in range(min(payload.num_questions, max(1, len(chunks)))):
        chunk = chunks[i % len(chunks)]
        item = rag_engine.generate_question_from_context(chunk, comp["code"], payload.difficulty)

        # Insert into database with PENDING_REVIEW state
        cursor.execute("""
        INSERT INTO questions (
            id, document_id, competency_id, question_type, difficulty_level,
            irt_b_difficulty, irt_a_discrimination, stem, stem_hi, options,
            correct_option_index, explanation, explanation_hi, citation_text,
            citation_page, confidence_score, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"], doc["id"], comp["id"], item["question_type"], item["difficulty_level"],
            item["irt_b_difficulty"], item["irt_a_discrimination"], item["stem"], item["stem_hi"],
            json.dumps(item["options"]), item["correct_option_index"], item["explanation"],
            item["explanation_hi"], item["citation_text"], item["citation_page"], item["confidence_score"],
            item["review_status"]
        ))
        generated_questions.append(item)

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "generated_count": len(generated_questions),
        "items": generated_questions,
        "message": f"{len(generated_questions)} questions generated and queued for SME review with source citations."
    }
