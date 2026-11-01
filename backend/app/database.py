import sqlite3
import json
from contextlib import contextmanager
from pathlib import Path
from backend.app.config import DATA_DIR

DB_PATH = DATA_DIR / "researchhub.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(str(DB_PATH), timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def dict_from_row(row):
    if row is None:
        return None
    return dict(row)

def dicts_from_rows(rows):
    return [dict(r) for r in rows]

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Departments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            code TEXT NOT NULL UNIQUE,
            description TEXT,
            head_of_dept TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Users table (Students, Supervisors, Dept Admins, Super Admins)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'supervisor', 'dept_admin', 'super_admin')),
            department_id INTEGER,
            avatar_url TEXT,
            designation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
        );
        """)

        # 3. Student Profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            student_id_number TEXT UNIQUE,
            degree_program TEXT,
            current_semester INTEGER DEFAULT 1,
            skills TEXT, -- JSON array of strings
            interests TEXT, -- JSON array of strings
            preferred_domain TEXT,
            bio TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 4. Supervisor Profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS supervisor_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            title TEXT,
            research_domains TEXT, -- JSON array
            max_students INTEGER DEFAULT 10,
            office_location TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 5. Research Projects
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            domain TEXT NOT NULL,
            abstract TEXT,
            status TEXT NOT NULL DEFAULT 'proposal_pending' 
                CHECK(status IN ('proposal_pending', 'approved', 'in_progress', 'review_required', 'completed', 'archived')),
            department_id INTEGER,
            created_by INTEGER NOT NULL,
            supervisor_id INTEGER,
            start_date TEXT,
            target_completion_date TEXT,
            actual_completion_date TEXT,
            progress_percent REAL DEFAULT 0.0,
            risk_level TEXT DEFAULT 'ON_TRACK', -- 'ON_TRACK', 'MODERATE_RISK', 'HIGH_RISK'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 6. Research Members (Collaborators / Co-authors / Students)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role TEXT NOT NULL DEFAULT 'lead_researcher' 
                CHECK(role IN ('lead_researcher', 'collaborator', 'advisor', 'research_assistant')),
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, user_id),
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 7. Research Proposals
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_proposals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL UNIQUE,
            problem_statement TEXT,
            objectives TEXT,
            methodology TEXT,
            expected_outcomes TEXT,
            budget REAL DEFAULT 0.0,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'revision_requested', 'rejected')),
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE
        );
        """)

        # 8. Research Papers (Catalog & Uploaded Papers)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            authors TEXT NOT NULL,
            abstract TEXT NOT NULL,
            domain TEXT NOT NULL,
            publication_year INTEGER DEFAULT 2024,
            venue TEXT,
            doi_or_url TEXT,
            pdf_path TEXT,
            uploaded_by INTEGER,
            citations_count INTEGER DEFAULT 0,
            extracted_summary TEXT, -- JSON structured summary
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 9. Paper Embeddings / Vector Representation (for FAISS/Cosine Semantic Search)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS paper_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paper_id INTEGER NOT NULL UNIQUE,
            embedding_json TEXT NOT NULL, -- JSON list of float values
            FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE CASCADE
        );
        """)

        # 10. Research Tasks (Kanban / Milestone Tracker)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            assigned_to INTEGER,
            status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'review', 'completed')),
            priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
            due_date TEXT,
            completed_at TEXT,
            estimated_hours REAL DEFAULT 10.0,
            actual_hours REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 11. Research Reviews / Supervisor Feedback
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            supervisor_id INTEGER NOT NULL,
            review_type TEXT DEFAULT 'milestone_review',
            feedback TEXT NOT NULL,
            score REAL, -- 0-100 rating
            action_items TEXT,
            status TEXT DEFAULT 'feedback_given',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 12. Project ML Predictions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            risk_score REAL NOT NULL, -- 0.0 (safe) to 1.0 (critical delay)
            predicted_status TEXT NOT NULL, -- 'ON_TRACK', 'AT_RISK', 'DELAY_LIKELY'
            days_behind_schedule INTEGER DEFAULT 0,
            predicted_completion_date TEXT,
            prediction_factors TEXT, -- JSON details (tasks pending, velocity, etc.)
            recommendations TEXT,
            evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE
        );
        """)

        # 13. Notifications
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT DEFAULT 'info', -- 'deadline', 'review', 'approval', 'task'
            link_url TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 14. Project Discussions / Messages
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS discussions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            attachment_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

