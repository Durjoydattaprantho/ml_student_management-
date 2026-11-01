from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows
from backend.app.schemas import TaskCreate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["Task Management & Kanban"])

def _recalculate_project_progress(conn, project_id: int):
    cursor = conn.cursor()
    cursor.execute("""
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM research_tasks
    WHERE project_id = ?;
    """, (project_id,))
    row = cursor.fetchone()
    total = row["total"] or 0
    completed = row["completed"] or 0
    progress = round((completed / total) * 100.0, 1) if total > 0 else 0.0
    
    cursor.execute("UPDATE research_projects SET progress_percent = ? WHERE id = ?;", (progress, project_id))

@router.get("")
def list_tasks(project_id: Optional[int] = None, assigned_to: Optional[int] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT t.*, u.name as assignee_name, u.avatar_url as assignee_avatar, p.title as project_title
        FROM research_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN research_projects p ON t.project_id = p.id
        WHERE 1=1
        """
        params = []
        if project_id:
            query += " AND t.project_id = ?"
            params.append(project_id)
        if assigned_to:
            query += " AND t.assigned_to = ?"
            params.append(assigned_to)

        query += " ORDER BY t.due_date ASC, t.id DESC;"
        cursor.execute(query, params)
        return dicts_from_rows(cursor.fetchall())

@router.post("")
def create_task(data: TaskCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO research_tasks (project_id, title, description, assigned_to, status, priority, due_date, estimated_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (data.project_id, data.title, data.description or "", data.assigned_to, data.status, data.priority, data.due_date, data.estimated_hours))
        task_id = cursor.lastrowid
        _recalculate_project_progress(conn, data.project_id)

        # Notify assigned user if specified
        if data.assigned_to:
            cursor.execute("""
            INSERT INTO notifications (user_id, title, message, notification_type, link_url)
            VALUES (?, ?, ?, 'task', '/tasks');
            """, (data.assigned_to, "New Research Task Assigned", f"You have been assigned task: '{data.title}'"))

        cursor.execute("""
        SELECT t.*, u.name as assignee_name, u.avatar_url as assignee_avatar
        FROM research_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = ?;
        """, (task_id,))
        return dict_from_row(cursor.fetchone())

@router.patch("/{task_id}")
def update_task(task_id: int, data: TaskUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT project_id, status FROM research_tasks WHERE id = ?;", (task_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")

        project_id = existing["project_id"]
        fields = []
        params = []

        if data.title is not None:
            fields.append("title = ?")
            params.append(data.title)
        if data.description is not None:
            fields.append("description = ?")
            params.append(data.description)
        if data.assigned_to is not None:
            fields.append("assigned_to = ?")
            params.append(data.assigned_to)
        if data.status is not None:
            fields.append("status = ?")
            params.append(data.status)
            if data.status == "completed":
                fields.append("completed_at = ?")
                params.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if data.priority is not None:
            fields.append("priority = ?")
            params.append(data.priority)
        if data.due_date is not None:
            fields.append("due_date = ?")
            params.append(data.due_date)
        if data.actual_hours is not None:
            fields.append("actual_hours = ?")
            params.append(data.actual_hours)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        params.append(task_id)
        cursor.execute(f"UPDATE research_tasks SET {', '.join(fields)} WHERE id = ?;", params)
        _recalculate_project_progress(conn, project_id)

        return {"status": "success", "message": "Task updated"}

@router.delete("/{task_id}")
def delete_task(task_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT project_id FROM research_tasks WHERE id = ?;", (task_id,))
        task = cursor.fetchone()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        project_id = task["project_id"]

        cursor.execute("DELETE FROM research_tasks WHERE id = ?;", (task_id,))
        _recalculate_project_progress(conn, project_id)
        return {"status": "success", "message": "Task deleted"}

