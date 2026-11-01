# ResearchHub AI
### An Intelligent University Research Management & Recommendation Platform
**Recommended University CSE Final Year / Capstone Project**  
*Machine Learning + Web Engineering*

---

## 🌟 Executive Overview
**ResearchHub AI** is a state-of-the-art web application and machine learning platform designed to streamline and modernize the academic research lifecycle for university students, faculty supervisors, and department administrators.

The platform bridges modern Web Development (**FastAPI**, **HTML5/Tailwind CSS**, **SQLite/PostgreSQL schema**) with practical **Machine Learning & NLP** (**Scikit-Learn**, **Dense Vector Search**, **Random Forest Classification**, **TF-IDF Semantic Space**).

---

## 🚀 Quick Start (One-Click Launch)

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Web browser (Chrome, Edge, Firefox, Safari)

### 1. Launch the Server
In the project directory, run:
```bash
python run.py
```

### 2. Access the Platform
Once launched, open your web browser to:
- **Web Application:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger REST API:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **ReDoc API Specifications:** [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

*(If port 8000 is occupied, `run.py` automatically detects and binds to the next available port).*

---

## 👥 Pre-Seeded Demonstration Accounts

You can test all 4 user roles instantly using the **Role Mode** dropdown in the top navigation bar, or log in with these credentials:

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| 🎓 **Student / Researcher** | Alex Rivera | `student@researchhub.edu` | `password123` | Workspace, AI Assistant, Kanban, PDF Analyzer, Proposal Drafting |
| 🎓 **Student Collaborator** | Sara Chen | `sara@researchhub.edu` | `password123` | Healthcare AI Thesis, Milestone Submissions |
| 👨‍🏫 **Faculty Supervisor** | Dr. Evelyn Vance | `supervisor@researchhub.edu` | `password123` | Proposal Approvals, Milestone Grading, Student Reviews |
| 👨‍🏫 **Supervisor 2** | Prof. Marcus Thorne | `marcus@researchhub.edu` | `password123` | Robotics Lab Thesis Mentorship |
| 🏛️ **Department Admin** | Dr. Robert Langdon | `deptadmin@researchhub.edu` | `password123` | Department CSE Audits, Supervisor Allocation |
| ⚡ **Super Admin** | Dr. Catherine Hayes | `superadmin@researchhub.edu` | `password123` | Institutional Governance, All Departments |

---

## 🧠 Core Machine Learning & NLP Features

1. **AI Research Topic Recommendation**
   - *Algorithm:* TF-IDF + Cosine Similarity + Skill Synergy Overlap.
   - *Inputs:* Academic Field, Research Interest, Student Skills.
   - *Outputs:* Ranked topics, confidence score (%), difficulty level, suggested datasets, and sample methodologies.

2. **Intelligent Research Paper Recommendation & Vector Search**
   - *Algorithm:* Dense vector space model & cosine similarity.
   - *Inputs:* Natural language search query or selected paper ID.
   - *Outputs:* Ranked papers with semantic similarity match score and "Similar Papers" recommendations.

3. **Research Gap Identification Assistant**
   - *Algorithm:* Cross-corpus literature boundary analysis and failure mode clustering.
   - *Outputs:* Candidate gaps across Methodological, Generalization, Real-World Deployment, and Benchmark criteria.

4. **PDF & Research Paper Summarizer**
   - *Algorithm:* NLP binary stream parser + sentence centrality and section rank heuristics.
   - *Outputs:* 6 standardized sections: Abstract Summary, Objectives, Methodology, Results, Limitations, and Future Directions.

5. **Research Progress & Deadline Risk Prediction**
   - *Algorithm:* Trained `RandomForestClassifier` (100 estimators).
   - *Inputs:* Total tasks, completion velocity, elapsed timeline ratio, overdue count, team size, review frequency.
   - *Outputs:* Risk Level (`ON_TRACK`, `MODERATE_RISK`, `CRITICAL_RISK`), risk score percentage, on-time completion probability, delay days, and explainable feature importance weights.

6. **Research Methodology Recommender**
   - *Algorithm:* Multi-class architectural decision engine.
   - *Inputs:* Research question, domain, data type (Images, Text, Tabular, Graph, Time-Series), hardware constraint.
   - *Outputs:* State-of-the-art model recommendation, 5-phase pipeline, metrics, baselines, and code frameworks.

---

## 📁 Project Structure

```
d:\web\ml\
├── backend\
│   ├── app\
│   │   ├── config.py              # Configuration, directory paths
│   │   ├── database.py            # SQLite schema init (PostgreSQL compatible)
│   │   ├── models.py              # Schema reference documentation
│   │   ├── schemas.py             # Pydantic request/response models
│   │   ├── seed_data.py           # Pre-seeded users, papers, projects, tasks
│   │   ├── ml\                    # Machine Learning & NLP Services
│   │   │   ├── topic_recommender.py       # Feature 1: Topic Recommender
│   │   │   ├── paper_recommender.py       # Feature 2: Vector Paper Search
│   │   │   ├── gap_assistant.py           # Feature 3: Research Gap Assistant
│   │   │   ├── paper_summarizer.py        # Feature 4: PDF & Doc Summarizer
│   │   │   ├── progress_predictor.py      # Feature 5: Random Forest Risk Predictor
│   │   │   └── methodology_recommender.py # Feature 6: Methodology Recommender
│   │   ├── routers\               # FastAPI REST Routers
│   │   │   ├── auth.py            # Auth & role switcher
│   │   │   ├── projects.py        # Project CRUD, proposals, discussions
│   │   │   ├── tasks.py           # Kanban tasks & status transitions
│   │   │   ├── reviews.py         # Supervisor evaluations & grades
│   │   │   ├── papers.py          # Paper library & PDF upload
│   │   │   ├── ai_assistant.py    # Dedicated ML endpoints
│   │   │   └── admin.py           # Institutional stats & audit
│   │   └── main.py                # FastAPI entry point, static mount
├── frontend\                      # Responsive Single Page Application
│   ├── index.html                 # Main layout, sidebar, modals
│   ├── css\
│   │   └── style.css              # Custom styling, animations, glassmorphism
│   └── js\
│       ├── api.js                 # API client wrapper
│       ├── components.js          # Reusable view components
│       └── app.js                 # Router, state manager, events
├── docs\                          # Formal Engineering Documentation
│   ├── SRS_DOCUMENT.md            # IEEE 830 Software Requirements Spec
│   ├── PRD_DOCUMENT.md            # Product Requirements Document
│   └── ML_EVALUATION_REPORT.md    # Machine Learning Performance Benchmarks
├── uploads\                       # Stored PDF research papers
├── run.py                         # One-click launcher script
└── README.md                      # Project manual & defense guide
```

---

## 🎓 University Examination & Defense Guide (Viva Voce)

### Q1: Why did you choose Random Forest for progress prediction?
**Answer:** Random Forest provides high classification accuracy on small-to-medium structured tabular data while being resilient to overfitting. It also provides transparent **Gini feature importance weights**, allowing the platform to give students explainable feedback (e.g., whether schedule lag or overdue tasks contributed most to the risk score).

### Q2: How does the semantic paper recommendation work?
**Answer:** Academic papers are vectorized into dense n-gram TF-IDF embeddings capturing domain terminology and semantic context. When a user enters a query or inspects an existing paper, cosine similarity is computed across the embedding space to rank literature by semantic proximity rather than simple keyword matches.

### Q3: How is Role-Based Access Control (RBAC) enforced?
**Answer:** The relational database separates user roles into Student, Supervisor, Department Admin, and Super Admin. The frontend dynamically toggles action buttons (e.g., proposal editing for students vs. grading and score assignment for faculty), while the backend verifies permissions on write operations.

