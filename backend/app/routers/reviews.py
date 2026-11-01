from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows
from backend.app.schemas import ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["Supervisor Reviews & Feedback"])

@router.get("")
def list_reviews(project_id: Optional[int] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT r.*, u.name as supervisor_name, u.avatar_url as supervisor_avatar, p.title as project_title
        FROM research_reviews r
        JOIN users u ON r.supervisor_id = u.id
        JOIN research_projects p ON r.project_id = p.id
        WHERE 1=1
        """
        params = []
        if project_id:
            query += " AND r.project_id = ?"
            params.append(project_id)

        query += " ORDER BY r.id DESC;"
        cursor.execute(query, params)
        return dicts_from_rows(cursor.fetchall())

@router.post("")
def submit_review(data: ReviewCreate, supervisor_id: int = 3):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, created_by, title FROM research_projects WHERE id = ?;", (data.project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        cursor.execute("""
        INSERT INTO research_reviews (project_id, supervisor_id, feedback, score, action_items, review_type)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (data.project_id, supervisor_id, data.feedback, data.score, data.action_items, data.review_type))
        review_id = cursor.lastrowid

        # Update project status if specified
        if data.new_project_status:
            cursor.execute("UPDATE research_projects SET status = ? WHERE id = ?;", (data.new_project_status, data.project_id))
            if data.new_project_status == "approved":
                cursor.execute("UPDATE research_proposals SET status = 'approved' WHERE project_id = ?;", (data.project_id,))

        # Notify project lead
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, notification_type, link_url)
        VALUES (?, ?, ?, 'review', '/workspace');
        """, (project["created_by"], "Supervisor Feedback Posted", f"Supervisor submitted feedback for '{project['title']}' with score {data.score}/100."))

        cursor.execute("""
        SELECT r.*, u.name as supervisor_name, u.avatar_url as supervisor_avatar
        FROM research_reviews r
        JOIN users u ON r.supervisor_id = u.id
        WHERE r.id = ?;
        """, (review_id,))
        return dict_from_row(cursor.fetchone())

