# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Project Title: ResearchHub AI — University Research Management & Collaboration Platform
**Product Owner:** University CSE Project Lead  
**Document Version:** 1.0.0  
**Target Delivery:** Production Capstone Delivery  

---

### 1. Executive Summary & Vision Statement
University research initiatives often suffer from fragmented communication, unstructured literature reviews, unverified research topics, and lack of real-time visibility into milestone delays. 

**Vision:** To build **ResearchHub AI**, an end-to-end, intelligent research management platform that combines Machine Learning and modern Web Engineering to guide students, supervisors, and department leaders through every phase of the academic research lifecycle.

---

### 2. User Personas & Pain Points

| Persona | Role | Pain Points | Platform Solution |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | Undergraduate CSE Senior | Struggles to find feasible thesis topics; difficult to identify novel research gaps; gets overwhelmed reading 40-page papers. | • ML Topic Recommender<br>• Research Gap Assistant<br>• 6-Section PDF Summarizer |
| **Dr. Evelyn Vance** | Associate Professor / Supervisor | Manages 8+ concurrent student theses; lacks time to read fragmented status emails; discovers deadline delays too late. | • Random Forest Deadline Risk Predictor<br>• Centralized Review & Proposal Grading<br>• Real-time Milestone Kanban |
| **Dr. Robert Langdon** | Department Chair (CSE) | No department-level visibility into research domains, student allocations, or publication pipelines. | • Department Research Analytics<br>• Supervisor Student Quotas<br>• Institutional Project Audit |

---

### 3. Core Modules & Feature Breakdown

#### Module 1: Authentication & Role Switcher
- Instant 1-click role switcher allowing test evaluators, supervisors, and students to examine different permission views without tedious re-registration.
- Pre-seeded test accounts with realistic research profiles and historic milestones.

#### Module 2: Personalized Research Dashboard
- Role-adaptive metrics: Active Projects, Milestone Velocity, Papers Indexed, ML Model Status.
- Active Project Spotlight Card showing deadline, supervisor, and animated progress meter.
- Quick navigation shortcuts to AI Assistant and Project Creation.

#### Module 3: Research Explorer
- Public catalog of university research projects.
- Filterable by domain: Computer Vision, NLP, Healthcare AI, Cybersecurity, Robotics.
- Real-time search by keywords, authors, or abstract terms.

#### Module 4: AI Research Assistant (Multi-Tab Engine)
- **Tab 1: AI Topic Recommendation**
  - Inputs: Academic Field, Research Interest, Technical Skills.
  - Output: Ranked topics, similarity match score (%), difficulty tier, suggested datasets, and sample methodologies.
- **Tab 2: Methodology Recommender**
  - Inputs: Research Question, Domain, Modality, Hardware Constraint.
  - Output: State-of-the-art model recommendation, rationale, 5-phase execution pipeline, metrics, and starter frameworks.
- **Tab 3: Research Gap Assistant**
  - Inputs: Target Topic, Domain, Focus Terms.
  - Output: Synthesized candidate research gaps across Methodological, Generalization, Real-World Deployment, and Benchmark criteria.

#### Module 5: Research Library & Semantic Search
- Curated repository of foundational and contemporary academic papers.
- Dense vector similarity search returning match score percentages.
- "Similar Papers" recommendation for any paper selected from the library.

#### Module 6: PDF & Document Analyzer
- Upload PDF or paste text excerpt.
- NLP sentence extraction pipeline outputting 6 structured academic sections:
  1. Executive Abstract Summary
  2. Research Objectives
  3. Proposed Methodology
  4. Experimental Results
  5. Recognized Limitations
  6. Future Research Work

#### Module 7: Research Workspace & Proposal Review
- Full proposal draft: Problem Statement, Objectives, Methodology, Budget, and Expected Deliverables.
- Supervisor evaluation tab with numeric score (0-100), feedback, and action items.
- Live discussion thread for student-supervisor mentorship.

#### Module 8: Milestone Task Kanban Board
- Drag/switch Kanban cards across 4 states: `To Do`, `In Progress`, `Under Review`, `Completed`.
- Automated recalculation of parent project progress percentage upon task completion.

#### Module 9: ML Research Progress & Deadline Risk Analytics
- Trained Scikit-Learn Random Forest Classifier (100 estimators).
- Predicts risk level (`ON_TRACK`, `MODERATE_RISK`, `CRITICAL_RISK`), risk score percentage, on-time completion probability, and estimated delay in days.
- Provides explainable feature importance weights, diagnosed risk factors, and actionable recovery steps.

#### Module 10: Administration Panel
- Institutional statistics: student/supervisor ratio, domain distribution, and project milestone audit.

---

### 4. Wireframe Specifications & User Interface Design

```
+---------------------------------------------------------------------------------------+
| ResearchHub AI [AI Pulse]   [Role Mode: Student (Alex)]  [Swagger Docs] [(3)] [Alex v] |
+------------------+--------------------------------------------------------------------+
| 📊 Dashboard      |  Welcome back, Alex Rivera (🎓 Student Researcher · CSE)           |
| 🔭 Explorer       |  +---------------------------------------------------------------+ |
| 🤖 AI Assistant   |  | Active Project: Real-Time Traffic Congestion Detection [65%]  | |
| 📚 Library        |  | Supervisor: Dr. Evelyn Vance · Target: 2026-12-15 · [On Track] | |
| 📄 PDF Analyzer   |  +---------------------------------------------------------------+ |
| 💼 Workspace      |                                                                    |
| 📋 Task Kanban    |  [Active Projects: 5]  [Milestone Velocity: 60%]  [Papers: 12]    |
| 📈 ML Analytics   |                                                                    |
| ⚙️ Admin Panel    |  Recent Research Projects              Upcoming Milestone Tasks    |
|                  |  • Real-Time Traffic Detection [65%]   • TensorRT INT8 [Done]      |
|                  |  • Early Sepsis Warning [35%]          • Multi-Camera Kalman [Prog]|
|                  |  • Ransomware Detection [20%]          • Draft Chapter 4 [Todo]    |
+------------------+--------------------------------------------------------------------+
```

---

### 5. Success Metrics & Validation Criteria
1. **Model Accuracy:** Random Forest project progress classifier achieves >92% test accuracy on stratified milestone evaluations.
2. **Search Latency:** Semantic vector queries return relevant literature in under 150ms.
3. **Usability Score:** System Usability Scale (SUS) target score > 88/100 across student and supervisor usability trials.

