from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows

router = APIRouter(tags=["Admin & Notifications"])

@router.get("/api/admin/stats")
def get_admin_dashboard_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student';")
        students_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'supervisor';")
        supervisors_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM research_projects;")
        total_projects = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM research_papers;")
        total_papers = cursor.fetchone()["count"]

        cursor.execute("""
        SELECT 
            SUM(CASE WHEN risk_level = 'ON_TRACK' THEN 1 ELSE 0 END) as on_track,
            SUM(CASE WHEN risk_level = 'MODERATE_RISK' THEN 1 ELSE 0 END) as moderate_risk,
            SUM(CASE WHEN risk_level IN ('CRITICAL_RISK', 'HIGH_RISK') THEN 1 ELSE 0 END) as critical_risk
        FROM research_projects;
        """)
        risk_counts = dict_from_row(cursor.fetchone())

        cursor.execute("""
        SELECT 
            status, COUNT(*) as count 
        FROM research_projects 
        GROUP BY status;
        """)
        status_breakdown = dicts_from_rows(cursor.fetchall())

        cursor.execute("""
        SELECT 
            d.name, COUNT(p.id) as project_count
        FROM departments d
        LEFT JOIN research_projects p ON d.id = p.department_id
        GROUP BY d.id;
        """)
        dept_breakdown = dicts_from_rows(cursor.fetchall())

        return {
            "students_count": students_count,
            "supervisors_count": supervisors_count,
            "total_projects": total_projects,
            "total_papers": total_papers,
            "risk_distribution": risk_counts,
            "status_breakdown": status_breakdown,
            "department_breakdown": dept_breakdown
        }

@router.get("/api/notifications")
def get_user_notifications(user_id: int = 1):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY id DESC LIMIT 20;
        """, (user_id,))
        return dicts_from_rows(cursor.fetchall())

@router.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?;", (notification_id,))
        return {"status": "success"}

@router.post("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, role: str):
    valid_roles = ["student", "supervisor", "dept_admin", "super_admin"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = ? WHERE id = ?;", (role, user_id))
        return {"status": "success", "message": f"User role updated to {role}"}

