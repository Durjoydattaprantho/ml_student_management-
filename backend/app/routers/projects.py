import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows
from backend.app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProposalCreate, DiscussionCreate
from backend.app.ml.progress_predictor import progress_predictor

router = APIRouter(prefix="/api/projects", tags=["Research Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    search: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT 
            p.*,
            d.name as department_name,
            u.name as creator_name,
            s.name as supervisor_name,
            (SELECT COUNT(*) FROM research_members WHERE project_id = p.id) as members_count,
            (SELECT COUNT(*) FROM research_tasks WHERE project_id = p.id) as tasks_count,
            (SELECT COUNT(*) FROM research_tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks_count
        FROM research_projects p
        LEFT JOIN departments d ON p.department_id = d.id
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN users s ON p.supervisor_id = s.id
        WHERE 1=1
        """
        params = []
        if domain and domain.lower() != "all":
            query += " AND p.domain LIKE ?"
            params.append(f"%{domain}%")
        if status and status.lower() != "all":
            query += " AND p.status = ?"
            params.append(status)
        if user_id:
            query += """ AND (
                p.created_by = ? OR 
                p.supervisor_id = ? OR 
                p.id IN (SELECT project_id FROM research_members WHERE user_id = ?)
            )"""
            params.extend([user_id, user_id, user_id])
        if search:
            query += " AND (p.title LIKE ? OR p.abstract LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " ORDER BY p.id DESC;"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return dicts_from_rows(rows)

@router.post("", response_model=ProjectResponse)
def create_project(data: ProjectCreate, user_id: int = 1):
    with get_db() as conn:
        cursor = conn.cursor()
        start = data.start_date or datetime.now().strftime("%Y-%m-%d")
        cursor.execute("""
        INSERT INTO research_projects (title, domain, abstract, department_id, created_by, supervisor_id, start_date, target_completion_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'proposal_pending');
        """, (data.title, data.domain, data.abstract or "", data.department_id, user_id, data.supervisor_id, start, data.target_completion_date))
        project_id = cursor.lastrowid

        # Add creator as lead researcher
        cursor.execute("""
        INSERT INTO research_members (project_id, user_id, role)
        VALUES (?, ?, 'lead_researcher');
        """, (project_id, user_id))

        # Add notification for supervisor if assigned
        if data.supervisor_id:
            cursor.execute("""
            INSERT INTO notifications (user_id, title, message, notification_type, link_url)
            VALUES (?, ?, ?, 'approval', '/workspace');
            """, (data.supervisor_id, "New Project Supervision Request", f"You have been assigned to supervise project: {data.title}"))

        cursor.execute("""
        SELECT 
            p.*,
            d.name as department_name,
            u.name as creator_name,
            s.name as supervisor_name,
            1 as members_count,
            0 as tasks_count,
            0 as completed_tasks_count
        FROM research_projects p
        LEFT JOIN departments d ON p.department_id = d.id
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN users s ON p.supervisor_id = s.id
        WHERE p.id = ?;
        """, (project_id,))
        return dict_from_row(cursor.fetchone())

@router.get("/{project_id}")
def get_project_details(project_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT 
            p.*,
            d.name as department_name,
            u.name as creator_name,
            s.name as supervisor_name
        FROM research_projects p
        LEFT JOIN departments d ON p.department_id = d.id
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN users s ON p.supervisor_id = s.id
        WHERE p.id = ?;
        """, (project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        project_dict = dict_from_row(project)

        # Members
        cursor.execute("""
        SELECT m.id, m.role, m.joined_at, u.id as user_id, u.name, u.email, u.avatar_url, u.designation
        FROM research_members m
        JOIN users u ON m.user_id = u.id
        WHERE m.project_id = ?;
        """, (project_id,))
        project_dict["members"] = dicts_from_rows(cursor.fetchall())

        # Proposal
        cursor.execute("SELECT * FROM research_proposals WHERE project_id = ?;", (project_id,))
        proposal = cursor.fetchone()
        project_dict["proposal"] = dict_from_row(proposal)

        # Tasks
        cursor.execute("""
        SELECT t.*, u.name as assignee_name, u.avatar_url as assignee_avatar
        FROM research_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id = ?
        ORDER BY t.id DESC;
        """, (project_id,))
        project_dict["tasks"] = dicts_from_rows(cursor.fetchall())

        # Reviews
        cursor.execute("""
        SELECT r.*, u.name as supervisor_name, u.avatar_url as supervisor_avatar
        FROM research_reviews r
        JOIN users u ON r.supervisor_id = u.id
        WHERE r.project_id = ?
        ORDER BY r.id DESC;
        """, (project_id,))
        project_dict["reviews"] = dicts_from_rows(cursor.fetchall())

        # Discussions
        cursor.execute("""
        SELECT d.*, u.name as sender_name, u.role as sender_role, u.avatar_url as sender_avatar
        FROM discussions d
        JOIN users u ON d.sender_id = u.id
        WHERE d.project_id = ?
        ORDER BY d.id ASC;
        """, (project_id,))
        project_dict["discussions"] = dicts_from_rows(cursor.fetchall())

        # ML Risk Prediction
        total_tasks = len(project_dict["tasks"])
        completed_tasks = len([t for t in project_dict["tasks"] if t["status"] == "completed"])
        overdue_tasks = len([t for t in project_dict["tasks"] if t["status"] != "completed" and t.get("due_date") and t["due_date"] < datetime.now().strftime("%Y-%m-%d")])
        
        ml_prediction = progress_predictor.predict_project_risk(
            total_tasks=max(1, total_tasks),
            completed_tasks=completed_tasks,
            start_date_str=project_dict.get("start_date") or datetime.now().strftime("%Y-%m-%d"),
            target_deadline_str=project_dict.get("target_completion_date") or datetime.now().strftime("%Y-%m-%d"),
            overdue_tasks_count=overdue_tasks,
            team_size=len(project_dict["members"]),
            reviews_count=len(project_dict["reviews"])
        )
        project_dict["ml_prediction"] = ml_prediction

        return project_dict

@router.patch("/{project_id}")
def update_project(project_id: int, data: ProjectUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        fields = []
        params = []
        if data.title is not None:
            fields.append("title = ?")
            params.append(data.title)
        if data.domain is not None:
            fields.append("domain = ?")
            params.append(data.domain)
        if data.abstract is not None:
            fields.append("abstract = ?")
            params.append(data.abstract)
        if data.status is not None:
            fields.append("status = ?")
            params.append(data.status)
        if data.supervisor_id is not None:
            fields.append("supervisor_id = ?")
            params.append(data.supervisor_id)
        if data.progress_percent is not None:
            fields.append("progress_percent = ?")
            params.append(data.progress_percent)
        if data.risk_level is not None:
            fields.append("risk_level = ?")
            params.append(data.risk_level)
        if data.target_completion_date is not None:
            fields.append("target_completion_date = ?")
            params.append(data.target_completion_date)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(project_id)
        cursor.execute(f"UPDATE research_projects SET {', '.join(fields)} WHERE id = ?;", params)
        return {"status": "success", "message": "Project updated"}

@router.post("/{project_id}/proposal")
def save_or_update_proposal(project_id: int, data: ProposalCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO research_proposals (project_id, problem_statement, objectives, methodology, expected_outcomes, budget, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ON CONFLICT(project_id) DO UPDATE SET
            problem_statement = excluded.problem_statement,
            objectives = excluded.objectives,
            methodology = excluded.methodology,
            expected_outcomes = excluded.expected_outcomes,
            budget = excluded.budget,
            status = 'pending';
        """, (project_id, data.problem_statement, data.objectives, data.methodology, data.expected_outcomes, data.budget))
        return {"status": "success", "message": "Proposal submitted for supervisor review"}

@router.post("/{project_id}/discussions")
def post_discussion(project_id: int, data: DiscussionCreate, user_id: int = 1):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO discussions (project_id, sender_id, message)
        VALUES (?, ?, ?);
        """, (project_id, user_id, data.message))
        return {"status": "success", "message": "Message posted"}

