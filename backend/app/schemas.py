from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Authentication & Users
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student" # student, supervisor, dept_admin, super_admin
    department_id: Optional[int] = None
    designation: Optional[str] = None
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    avatar_url: Optional[str] = None
    designation: Optional[str] = None

# Projects
class ProjectCreate(BaseModel):
    title: str
    domain: str
    abstract: Optional[str] = None
    department_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    start_date: Optional[str] = None
    target_completion_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    domain: Optional[str] = None
    abstract: Optional[str] = None
    status: Optional[str] = None
    supervisor_id: Optional[int] = None
    progress_percent: Optional[float] = None
    risk_level: Optional[str] = None
    target_completion_date: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    title: str
    domain: str
    abstract: Optional[str] = None
    status: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    created_by: int
    creator_name: Optional[str] = None
    supervisor_id: Optional[int] = None
    supervisor_name: Optional[str] = None
    start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    progress_percent: float = 0.0
    risk_level: str = "ON_TRACK"
    created_at: Optional[str] = None
    members_count: Optional[int] = 1
    tasks_count: Optional[int] = 0
    completed_tasks_count: Optional[int] = 0

# Tasks
class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = 10.0

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    completed_at: Optional[str] = None
    actual_hours: Optional[float] = None

# Reviews & Proposals
class ProposalCreate(BaseModel):
    project_id: int
    problem_statement: str
    objectives: str
    methodology: str
    expected_outcomes: str
    budget: Optional[float] = 0.0

class ReviewCreate(BaseModel):
    project_id: int
    feedback: str
    score: Optional[float] = 85.0
    action_items: Optional[str] = None
    review_type: Optional[str] = "milestone_review"
    new_project_status: Optional[str] = None # e.g. 'approved', 'in_progress'

# Research Papers
class PaperCreate(BaseModel):
    title: str
    authors: str
    abstract: str
    domain: str
    publication_year: Optional[int] = 2024
    venue: Optional[str] = None
    doi_or_url: Optional[str] = None

class PaperSearchRequest(BaseModel):
    query: str
    domain: Optional[str] = None
    top_k: int = 6

# ML Feature Requests & Responses
class TopicRecommendationRequest(BaseModel):
    field: str
    interest: str
    skills: List[str]
    preferred_domain: Optional[str] = None

class TopicRecommendationItem(BaseModel):
    title: str
    domain: str
    confidence_score: float
    rationale: str
    difficulty: str
    suggested_datasets: List[str]
    sample_methodology: str

class MethodologyRecommendationRequest(BaseModel):
    research_question: str
    domain: str
    data_type: str # images, text, audio, tabular, time-series, multimodal
    hardware_constraint: Optional[str] = "standard" # standard, high_gpu, edge_device

class MethodologyRecommendationResponse(BaseModel):
    recommended_model: str
    algorithm_category: str
    rationale: str
    pipeline_steps: List[str]
    alternative_models: List[str]
    suggested_metrics: List[str]
    code_frameworks: List[str]

class GapAnalysisRequest(BaseModel):
    topic: str
    domain: str
    keywords: Optional[List[str]] = []

class GapAnalysisItem(BaseModel):
    gap_title: str
    category: str # "Methodological", "Dataset/Demographic", "Evaluation/Benchmark", "Real-World Deployment"
    description: str
    potential_novelty: str
    recommended_direction: str

class ProgressPredictionRequest(BaseModel):
    project_id: int

class ProgressPredictionResponse(BaseModel):
    project_id: int
    risk_level: str # "ON_TRACK", "MODERATE_RISK", "CRITICAL_RISK"
    risk_score: float # 0.0 to 100.0%
    completion_probability: float
    estimated_days_delay: int
    risk_factors: List[str]
    actionable_mitigations: List[str]
    feature_importance: Dict[str, float]

class DiscussionCreate(BaseModel):
    project_id: int
    message: str
