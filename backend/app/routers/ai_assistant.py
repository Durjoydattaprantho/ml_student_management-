from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from backend.app.database import get_db, dict_from_row
from backend.app.schemas import (
    TopicRecommendationRequest,
    TopicRecommendationItem,
    MethodologyRecommendationRequest,
    MethodologyRecommendationResponse,
    GapAnalysisRequest,
    GapAnalysisItem,
    ProgressPredictionRequest,
    ProgressPredictionResponse,
    PaperSearchRequest
)
from backend.app.ml.topic_recommender import topic_recommender
from backend.app.ml.paper_recommender import paper_recommender
from backend.app.ml.gap_assistant import gap_assistant
from backend.app.ml.paper_summarizer import paper_summarizer
from backend.app.ml.progress_predictor import progress_predictor
from backend.app.ml.methodology_recommender import methodology_recommender

router = APIRouter(prefix="/api/ai", tags=["Core Machine Learning & NLP Assistant"])

# Feature 1: AI Research Topic Recommendation
@router.post("/topic-recommend", response_model=List[TopicRecommendationItem])
def get_topic_recommendations(data: TopicRecommendationRequest):
    return topic_recommender.recommend(
        field=data.field,
        interest=data.interest,
        skills=data.skills,
        preferred_domain=data.preferred_domain,
        top_k=5
    )

# Feature 2: Intelligent Research Paper Recommendation
@router.post("/paper-recommend")
def get_paper_recommendations(data: PaperSearchRequest):
    return paper_recommender.search_and_recommend(
        query=data.query,
        domain=data.domain,
        top_k=data.top_k
    )

# Feature 3: Research Gap Identification Assistant
@router.post("/gap-analysis", response_model=List[GapAnalysisItem])
def analyze_research_gaps(data: GapAnalysisRequest):
    return gap_assistant.analyze_gaps(
        topic=data.topic,
        domain=data.domain,
        keywords=data.keywords
    )

# Feature 4: Research Paper Summarization
@router.post("/summarize-paper")
def summarize_paper_text(text: str, title: Optional[str] = "Academic Research Paper"):
    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text is too short to summarize.")
    return paper_summarizer.summarize_text(text, title=title)

# Feature 5: Research Progress Prediction
@router.post("/predict-progress", response_model=ProgressPredictionResponse)
def predict_project_risk(data: ProgressPredictionRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM research_projects WHERE id = ?;", (data.project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Gather tasks
        cursor.execute("""
        SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
            SUM(CASE WHEN status != 'completed' AND due_date < ? THEN 1 ELSE 0 END) as overdue_tasks
        FROM research_tasks
        WHERE project_id = ?;
        """, (datetime.now().strftime("%Y-%m-%d"), data.project_id))
        task_stats = cursor.fetchone()

        # Members and reviews count
        cursor.execute("SELECT COUNT(*) as cnt FROM research_members WHERE project_id = ?;", (data.project_id,))
        team_size = cursor.fetchone()["cnt"] or 1

        cursor.execute("SELECT COUNT(*) as cnt FROM research_reviews WHERE project_id = ?;", (data.project_id,))
        reviews_count = cursor.fetchone()["cnt"] or 0

        prediction = progress_predictor.predict_project_risk(
            total_tasks=max(1, task_stats["total_tasks"] or 1),
            completed_tasks=task_stats["completed_tasks"] or 0,
            start_date_str=project["start_date"] or datetime.now().strftime("%Y-%m-%d"),
            target_deadline_str=project["target_completion_date"] or datetime.now().strftime("%Y-%m-%d"),
            overdue_tasks_count=task_stats["overdue_tasks"] or 0,
            team_size=team_size,
            reviews_count=reviews_count
        )

        # Update project record
        cursor.execute("""
        UPDATE research_projects 
        SET risk_level = ? 
        WHERE id = ?;
        """, (prediction["risk_level"], data.project_id))

        return {
            "project_id": data.project_id,
            "risk_level": prediction["risk_level"],
            "risk_score": prediction["risk_score"],
            "completion_probability": prediction["completion_probability"],
            "estimated_days_delay": prediction["estimated_days_delay"],
            "risk_factors": prediction["risk_factors"],
            "actionable_mitigations": prediction["actionable_mitigations"],
            "feature_importance": prediction["feature_importance"]
        }

# Feature 6: Research Methodology Recommendation
@router.post("/methodology-recommend", response_model=MethodologyRecommendationResponse)
def recommend_methodology(data: MethodologyRecommendationRequest):
    return methodology_recommender.recommend(
        research_question=data.research_question,
        domain=data.domain,
        data_type=data.data_type,
        hardware_constraint=data.hardware_constraint or "standard"
    )

