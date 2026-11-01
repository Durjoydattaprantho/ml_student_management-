import hashlib
import json
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from backend.app.database import get_db, dict_from_row, dicts_from_rows
from backend.app.schemas import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication & Users"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@router.post("/register", response_model=UserResponse)
def register_user(data: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?;", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User with this email already exists")

        pw_hash = hash_pw(data.password)
        avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.name.replace(' ', '')}"
        
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, department_id, designation, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (data.name, data.email, pw_hash, data.role, data.department_id, data.designation or f"{data.role.capitalize()}", avatar))
        user_id = cursor.lastrowid

        # Profile insertion if student
        if data.role == "student":
            cursor.execute("""
            INSERT INTO student_profiles (user_id, student_id_number, skills, interests)
            VALUES (?, ?, ?, ?);
            """, (user_id, f"STU-{user_id:04d}", json.dumps(data.skills or []), json.dumps(data.interests or [])))

        cursor.execute("""
        SELECT u.id, u.name, u.email, u.role, u.department_id, u.designation, u.avatar_url, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = ?;
        """, (user_id,))
        return dict_from_row(cursor.fetchone())

@router.post("/login")
def login_user(data: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT u.id, u.name, u.email, u.password_hash, u.role, u.department_id, u.designation, u.avatar_url, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.email = ?;
        """, (data.email,))
        user = cursor.fetchone()
        if not user or user["password_hash"] != hash_pw(data.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_dict = dict_from_row(user)
        del user_dict["password_hash"]
        return {
            "access_token": f"bearer-token-{user['id']}-{user['role']}",
            "token_type": "bearer",
            "user": user_dict
        }

@router.get("/switch-role/{role}")
def switch_active_role(role: str):
    """Convenience endpoint allowing instant switching between user roles for testing."""
    valid_roles = ["student", "supervisor", "dept_admin", "super_admin"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT u.id, u.name, u.email, u.role, u.department_id, u.designation, u.avatar_url, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.role = ?
        ORDER BY u.id ASC
        LIMIT 1;
        """, (role,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail=f"No user found with role {role}")
        return dict_from_row(user)

@router.get("/users")
def get_all_users(role: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if role:
            cursor.execute("""
            SELECT u.id, u.name, u.email, u.role, u.designation, u.avatar_url, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role = ?
            ORDER BY u.name ASC;
            """, (role,))
        else:
            cursor.execute("""
            SELECT u.id, u.name, u.email, u.role, u.designation, u.avatar_url, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY u.name ASC;
            """)
        return dicts_from_rows(cursor.fetchall())

@router.get("/departments")
def get_departments():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM departments ORDER BY name ASC;")
        return dicts_from_rows(cursor.fetchall())

