import json
import os
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows
from backend.app.schemas import PaperCreate, PaperSearchRequest
from backend.app.ml.paper_recommender import paper_recommender
from backend.app.ml.paper_summarizer import paper_summarizer
from backend.app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/papers", tags=["Research Papers & PDF Analyzer"])

@router.get("")
def list_papers(domain: Optional[str] = None, search: Optional[str] = None, top_k: int = 15):
    if search:
        return paper_recommender.search_and_recommend(query=search, domain=domain, top_k=top_k)
    
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM research_papers WHERE 1=1"
        params = []
        if domain and domain.lower() != "all":
            query += " AND domain LIKE ?"
            params.append(f"%{domain}%")
        query += " ORDER BY citations_count DESC, id DESC LIMIT ?;"
        params.append(top_k)
        cursor.execute(query, params)
        return dicts_from_rows(cursor.fetchall())

@router.get("/{paper_id}")
def get_paper_detail(paper_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM research_papers WHERE id = ?;", (paper_id,))
        paper = cursor.fetchone()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        paper_dict = dict_from_row(paper)
        if paper_dict.get("extracted_summary"):
            try:
                paper_dict["extracted_summary"] = json.loads(paper_dict["extracted_summary"])
            except Exception:
                pass

        similar = paper_recommender.recommend_similar_papers(paper_id, top_k=3)
        paper_dict["similar_papers"] = similar
        return paper_dict

@router.post("")
def create_paper(data: PaperCreate, user_id: int = 1):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO research_papers (title, authors, abstract, domain, publication_year, venue, doi_or_url, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (data.title, data.authors, data.abstract, data.domain, data.publication_year, data.venue, data.doi_or_url, user_id))
        paper_id = cursor.lastrowid
        
        # Trigger vector sync
        paper_recommender.sync_database_papers()

        cursor.execute("SELECT * FROM research_papers WHERE id = ?;", (paper_id,))
        return dict_from_row(cursor.fetchone())

@router.post("/upload")
async def upload_and_analyze_paper(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    domain: Optional[str] = Form("Computer Science"),
    user_id: int = Form(1)
):
    paper_title = title or "Academic Research Document"
    file_path = None
    extracted_text = ""

    if file:
        paper_title = title or file.filename.replace(".pdf", "").replace(".txt", "").replace("_", " ").title()
        safe_filename = f"{int(datetime.now().timestamp())}_{file.filename}"
        dest = UPLOAD_DIR / safe_filename
        content = await file.read()
        with open(dest, "wb") as f:
            f.write(content)
        file_path = str(dest)

        if file.filename.lower().endswith(".pdf"):
            extracted_text = paper_summarizer.extract_text_from_pdf_bytes(content)
        else:
            try:
                extracted_text = content.decode("utf-8", errors="ignore")
            except Exception:
                extracted_text = "Sample parsed text from document."

    elif raw_text:
        extracted_text = raw_text

    if not extracted_text or len(extracted_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Could not extract meaningful text from the uploaded document or input.")

    # Run ML/NLP Structured Summarization
    summary_dict = paper_summarizer.summarize_text(extracted_text, title=paper_title)

    # Save to database
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO research_papers (title, authors, abstract, domain, publication_year, pdf_path, uploaded_by, extracted_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            paper_title,
            "Uploaded Author(s)",
            summary_dict["abstract_summary"],
            domain,
            datetime.now().year,
            file_path,
            user_id,
            json.dumps(summary_dict)
        ))
        paper_id = cursor.lastrowid
        
        # Sync recommender
        paper_recommender.sync_database_papers()

    return {
        "status": "success",
        "paper_id": paper_id,
        "title": paper_title,
        "summary": summary_dict
    }

