import hashlib
import json
from datetime import datetime, timedelta
from backend.app.database import get_db
from backend.app.ml.paper_recommender import paper_recommender

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if users already seeded
        cursor.execute("SELECT COUNT(*) as cnt FROM users;")
        if cursor.fetchone()["cnt"] > 0:
            print("Database already contains records. Syncing papers and skipping user seed.")
            paper_recommender.sync_database_papers()
            return

        print("Seeding initial ResearchHub AI database...")

        # 1. Departments
        depts = [
            ("Computer Science & Engineering", "CSE", "Leading CSE education, distributed systems, and core computing.", "Dr. Robert Langdon"),
            ("Data Science & Artificial Intelligence", "DSAI", "Specializing in deep learning, NLP, statistical modeling, and machine intelligence.", "Dr. Sophia Rodriguez"),
            ("Software Engineering & Cyber Security", "SECS", "Focusing on secure architectures, cloud orchestration, and software verification.", "Prof. Alan Turing"),
            ("Robotics & Intelligent Systems", "RIS", "Autonomous mobile robots, computer vision, sensor fusion, and embedded IoT.", "Prof. Marcus Thorne")
        ]
        dept_ids = []
        for name, code, desc, hod in depts:
            cursor.execute("""
            INSERT INTO departments (name, code, description, head_of_dept)
            VALUES (?, ?, ?, ?);
            """, (name, code, desc, hod))
            dept_ids.append(cursor.lastrowid)

        # 2. Users (Student, Supervisor, Dept Admin, Super Admin)
        pw_hash = hash_pw("password123")
        users_data = [
            # 1. Student Lead
            ("Al Kabi Imtiaz Uddin", "student@researchhub.edu", pw_hash, "student", dept_ids[0], "Undergraduate Final Year Researcher", "https://api.dicebear.com/7.x/avataaars/svg?seed=AlKabi"),
            # 2. Student Collaborator
            ("Sara Chen", "sara@researchhub.edu", pw_hash, "student", dept_ids[1], "Master's Candidate in Machine Learning", "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara"),
            # 3. Supervisor Lead
            ("Dr. Evelyn Vance", "supervisor@researchhub.edu", pw_hash, "supervisor", dept_ids[0], "Associate Professor & AI Lab Lead", "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"),
            # 4. Supervisor 2
            ("Prof. Marcus Thorne", "marcus@researchhub.edu", pw_hash, "supervisor", dept_ids[3], "Professor of Robotics & Computer Vision", "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"),
            # 5. Department Admin
            ("Dr. Robert Langdon", "deptadmin@researchhub.edu", pw_hash, "dept_admin", dept_ids[0], "Head of CSE Department & Academic Chair", "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"),
            # 6. Super Admin
            ("Dr. Catherine Hayes", "superadmin@researchhub.edu", pw_hash, "super_admin", None, "Dean of University Research & Super Administrator", "https://api.dicebear.com/7.x/avataaars/svg?seed=Catherine")
        ]

        user_ids = {}
        for name, email, pwh, role, did, desig, avatar in users_data:
            cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, department_id, designation, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (name, email, pwh, role, did, desig, avatar))
            user_ids[email] = cursor.lastrowid

        # 3. Student Profiles
        cursor.execute("""
        INSERT INTO student_profiles (user_id, student_id_number, degree_program, current_semester, skills, interests, preferred_domain, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            user_ids["student@researchhub.edu"],
            "CSE-2023-8891",
            "B.Sc. Computer Science and Engineering",
            8,
            json.dumps(["Python", "PyTorch", "YOLOv8", "OpenCV", "FastAPI"]),
            json.dumps(["Real-Time Object Detection", "Intelligent Transportation", "Edge Computing"]),
            "Computer Vision",
            "Final year undergraduate focusing on lightweight computer vision models deployed on edge sensor networks."
        ))

        cursor.execute("""
        INSERT INTO student_profiles (user_id, student_id_number, degree_program, current_semester, skills, interests, preferred_domain, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            user_ids["sara@researchhub.edu"],
            "DSAI-2024-4102",
            "M.Sc. Artificial Intelligence & Data Science",
            2,
            json.dumps(["Python", "Transformers", "XGBoost", "SHAP", "EHR Healthcare"]),
            json.dumps(["Explainable AI", "Clinical NLP", "Predictive Sepsis Modeling"]),
            "Healthcare AI",
            "Graduate researcher investigating clinical model interpretability and ICU time-series early warning systems."
        ))

        # 4. Supervisor Profiles
        cursor.execute("""
        INSERT INTO supervisor_profiles (user_id, title, research_domains, max_students, office_location)
        VALUES (?, ?, ?, ?, ?);
        """, (
            user_ids["supervisor@researchhub.edu"],
            "Associate Professor",
            json.dumps(["Computer Vision", "Healthcare AI", "Deep Learning"]),
            8,
            "Turing Science Complex, Room 412"
        ))

        # 5. Research Projects
        today = datetime.now()
        p1_start = (today - timedelta(days=45)).strftime("%Y-%m-%d")
        p1_end = (today + timedelta(days=45)).strftime("%Y-%m-%d")

        p2_start = (today - timedelta(days=20)).strftime("%Y-%m-%d")
        p2_end = (today + timedelta(days=70)).strftime("%Y-%m-%d")

        p3_start = (today - timedelta(days=10)).strftime("%Y-%m-%d")
        p3_end = (today + timedelta(days=80)).strftime("%Y-%m-%d")

        projects_data = [
            (
                "Real-Time Traffic Congestion & Anomaly Detection Using Edge YOLO",
                "Computer Vision",
                "Autonomous traffic monitoring platform that detects vehicle density, abnormal bottlenecks, and accidents in multi-camera feeds with edge inference under 30ms latency.",
                "in_progress",
                dept_ids[0],
                user_ids["student@researchhub.edu"],
                user_ids["supervisor@researchhub.edu"],
                p1_start,
                p1_end,
                65.0,
                "ON_TRACK"
            ),
            (
                "Explainable AI for Early Sepsis Warning in ICU Electronic Health Records",
                "Healthcare AI",
                "Clinical decision support system utilizing XGBoost and Temporal Transformers on MIMIC-IV vitals to forecast sepsis onset 6 hours ahead with real-time SHAP feature explanations.",
                "approved",
                dept_ids[1],
                user_ids["sara@researchhub.edu"],
                user_ids["supervisor@researchhub.edu"],
                p2_start,
                p2_end,
                35.0,
                "MODERATE_RISK"
            ),
            (
                "Zero-Day Ransomware Detection via Dynamic Behavioral Graph Learning",
                "Cybersecurity AI",
                "Constructs dynamic system call invocation graphs from Cuckoo Sandbox traces and employs Graph Attention Networks (GAT) to identify evasion-prone malware.",
                "review_required",
                dept_ids[2],
                user_ids["student@researchhub.edu"],
                user_ids["supervisor@researchhub.edu"],
                p3_start,
                p3_end,
                20.0,
                "HIGH_RISK"
            ),
            (
                "Self-Supervised Medical Ultrasound Segmentation on Constrained Hardware",
                "Computer Vision",
                "Contrastive learning pipeline (SimCLR + Swin-UNet) for segmenting cardiac ultrasound chambers without requiring thousands of manually labeled clinician masks.",
                "proposal_pending",
                dept_ids[0],
                user_ids["sara@researchhub.edu"],
                user_ids["marcus@researchhub.edu"],
                today.strftime("%Y-%m-%d"),
                (today + timedelta(days=90)).strftime("%Y-%m-%d"),
                5.0,
                "ON_TRACK"
            ),
            (
                "Parameter-Efficient Cross-Lingual Sentiment Adaptation for Regional Corpora",
                "Natural Language Processing",
                "Applies Low-Rank Adaptation (LoRA) to multilingual RoBERTa to enable zero-shot sentiment transfer across regional dialects with under 1% trainable parameter footprint.",
                "completed",
                dept_ids[0],
                user_ids["student@researchhub.edu"],
                user_ids["supervisor@researchhub.edu"],
                (today - timedelta(days=120)).strftime("%Y-%m-%d"),
                (today - timedelta(days=10)).strftime("%Y-%m-%d"),
                100.0,
                "ON_TRACK"
            )
        ]

        proj_ids = []
        for title, dom, abst, stat, did, cby, supid, sdate, edate, prog, rlevel in projects_data:
            cursor.execute("""
            INSERT INTO research_projects (title, domain, abstract, status, department_id, created_by, supervisor_id, start_date, target_completion_date, progress_percent, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (title, dom, abst, stat, did, cby, supid, sdate, edate, prog, rlevel))
            proj_ids.append(cursor.lastrowid)

        # 6. Research Members
        cursor.execute("INSERT INTO research_members (project_id, user_id, role) VALUES (?, ?, 'lead_researcher');", (proj_ids[0], user_ids["student@researchhub.edu"]))
        cursor.execute("INSERT INTO research_members (project_id, user_id, role) VALUES (?, ?, 'collaborator');", (proj_ids[0], user_ids["sara@researchhub.edu"]))
        cursor.execute("INSERT INTO research_members (project_id, user_id, role) VALUES (?, ?, 'lead_researcher');", (proj_ids[1], user_ids["sara@researchhub.edu"]))
        cursor.execute("INSERT INTO research_members (project_id, user_id, role) VALUES (?, ?, 'lead_researcher');", (proj_ids[2], user_ids["student@researchhub.edu"]))

        # 7. Research Proposals
        cursor.execute("""
        INSERT INTO research_proposals (project_id, problem_statement, objectives, methodology, expected_outcomes, budget, status)
        VALUES (?, ?, ?, ?, ?, ?, 'approved');
        """, (
            proj_ids[0],
            "Existing urban traffic monitoring solutions suffer from extreme latency when processing 4K CCTV streams at cloud datacenters, causing multi-hour congestion response delays.",
            "1. Train a pruned YOLOv8 model on UA-DETRAC.\n2. Quantize model to INT8 for Jetson Nano.\n3. Implement Kalman filter multi-object tracking.",
            "Transfer learning on PyTorch with Cosine Annealing, followed by TensorRT engine serialization.",
            "Real-time edge dashboard with under 35ms latency and >88% mAP@0.5.",
            1200.00
        ))

        # 8. Research Tasks (Kanban)
        tasks_p1 = [
            (proj_ids[0], "Benchmark UA-DETRAC dataset and preprocess annotations", "completed", "high", (today - timedelta(days=35)).strftime("%Y-%m-%d"), 15.0, 14.0),
            (proj_ids[0], "Train YOLOv8 baseline with Mosaic and MixUp augmentations", "completed", "high", (today - timedelta(days=20)).strftime("%Y-%m-%d"), 25.0, 26.0),
            (proj_ids[0], "Evaluate TensorRT INT8 quantization against FP16 baseline", "completed", "medium", (today - timedelta(days=5)).strftime("%Y-%m-%d"), 18.0, 16.5),
            (proj_ids[0], "Implement multi-camera Kalman filter tracking module", "in_progress", "high", (today + timedelta(days=7)).strftime("%Y-%m-%d"), 20.0, 12.0),
            (proj_ids[0], "Draft Experimental Results and Comparative Analysis chapter", "todo", "high", (today + timedelta(days=20)).strftime("%Y-%m-%d"), 30.0, 0.0),
            (proj_ids[0], "Final thesis viva defense preparation and slide deck", "todo", "medium", (today + timedelta(days=40)).strftime("%Y-%m-%d"), 15.0, 0.0)
        ]
        for pid, t_title, t_status, t_prio, t_due, est_h, act_h in tasks_p1:
            cursor.execute("""
            INSERT INTO research_tasks (project_id, title, status, priority, due_date, estimated_hours, actual_hours, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (pid, t_title, t_status, t_prio, t_due, est_h, act_h, user_ids["student@researchhub.edu"]))

        # 9. Supervisor Reviews
        cursor.execute("""
        INSERT INTO research_reviews (project_id, supervisor_id, feedback, score, action_items, review_type)
        VALUES (?, ?, ?, ?, ?, 'midterm_milestone');
        """, (
            proj_ids[0],
            user_ids["supervisor@researchhub.edu"],
            "Excellent progress on INT8 quantization. The latency drop on Jetson Nano is very impressive. Focus now on occluded tracking scenarios.",
            92.5,
            "1. Benchmark tracking under heavy vehicle overlap.\n2. Include precision-recall curves in Chapter 4 draft.",
        ))

        # 10. Initial Notifications
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, notification_type, link_url)
        VALUES (?, ?, ?, 'review', '/workspace');
        """, (
            user_ids["student@researchhub.edu"],
            "Supervisor Feedback Received",
            "Dr. Evelyn Vance posted a review on your Traffic Congestion Detection project (Score: 92.5/100).",
        ))

        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, notification_type, link_url)
        VALUES (?, ?, ?, 'deadline', '/tasks');
        """, (
            user_ids["student@researchhub.edu"],
            "Upcoming Milestone Due",
            "Milestone 'Multi-camera Kalman filter tracking module' is due in 7 days.",
        ))

        # 11. Initial Discussions
        cursor.execute("""
        INSERT INTO discussions (project_id, sender_id, message)
        VALUES (?, ?, ?);
        """, (
            proj_ids[0],
            user_ids["supervisor@researchhub.edu"],
            "Alex, ensure you log the GPU VRAM consumption across batch sizes 1, 4, and 8 for the thesis appendix."
        ))

        cursor.execute("""
        INSERT INTO discussions (project_id, sender_id, message)
        VALUES (?, ?, ?);
        """, (
            proj_ids[0],
            user_ids["student@researchhub.edu"],
            "Thank you Dr. Vance! I have already generated the profiling graphs with PyTorch Benchmark and will commit them to the workspace repository today."
        ))

    # Sync academic papers corpus
    paper_recommender.sync_database_papers()
    print("Database seeding completed successfully.")

