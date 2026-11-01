import numpy as np
from datetime import datetime, date
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestClassifier

class ProgressPredictor:
    def __init__(self):
        self.feature_names = [
            "total_tasks",
            "completed_ratio",
            "days_elapsed_ratio",
            "overdue_tasks_count",
            "team_size",
            "reviews_count",
            "task_velocity"
        ]
        self._train_model()

    def _train_model(self):
        np.random.seed(42)
        n_samples = 600

        total_tasks = np.random.randint(5, 35, n_samples)
        completed_ratio = np.random.uniform(0.0, 1.0, n_samples)
        days_elapsed_ratio = np.random.uniform(0.1, 1.2, n_samples)
        overdue_tasks_count = np.random.poisson(1.5, n_samples)
        team_size = np.random.randint(1, 6, n_samples)
        reviews_count = np.random.randint(0, 8, n_samples)
        task_velocity = (completed_ratio * total_tasks) / np.maximum(1.0, (days_elapsed_ratio * 90.0))

        X = np.column_stack([
            total_tasks,
            completed_ratio,
            days_elapsed_ratio,
            overdue_tasks_count,
            team_size,
            reviews_count,
            task_velocity
        ])

        # Define labels based on realistic project delivery dynamics
        y = np.zeros(n_samples, dtype=int)
        for i in range(n_samples):
            # If time is nearly up and work is lagging
            lag = days_elapsed_ratio[i] - completed_ratio[i]
            overdue = overdue_tasks_count[i]
            
            if lag > 0.45 or (days_elapsed_ratio[i] > 0.85 and completed_ratio[i] < 0.50) or overdue >= 4:
                y[i] = 2 # CRITICAL_RISK
            elif lag > 0.15 or overdue >= 2 or (days_elapsed_ratio[i] > 0.70 and completed_ratio[i] < 0.65):
                y[i] = 1 # MODERATE_RISK
            else:
                y[i] = 0 # ON_TRACK

        self.model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        self.model.fit(X, y)

    def predict_project_risk(
        self,
        total_tasks: int,
        completed_tasks: int,
        start_date_str: str,
        target_deadline_str: str,
        overdue_tasks_count: int = 0,
        team_size: int = 2,
        reviews_count: int = 1
    ) -> Dict[str, Any]:
        
        # Calculate dates
        try:
            start_date = datetime.strptime(start_date_str[:10], "%Y-%m-%d").date()
        except Exception:
            start_date = date.today()

        try:
            deadline = datetime.strptime(target_deadline_str[:10], "%Y-%m-%d").date()
        except Exception:
            deadline = date.today()

        today = date.today()
        total_days = max(1, (deadline - start_date).days)
        days_passed = max(1, (today - start_date).days)
        days_remaining = (deadline - today).days

        completed_ratio = min(1.0, completed_tasks / max(1, total_tasks))
        days_elapsed_ratio = min(1.5, days_passed / total_days)
        task_velocity = completed_tasks / max(1, days_passed)

        features = np.array([[
            total_tasks,
            completed_ratio,
            days_elapsed_ratio,
            overdue_tasks_count,
            team_size,
            reviews_count,
            task_velocity
        ]])

        probs = self.model.predict_proba(features)[0]
        # Classes: 0: ON_TRACK, 1: MODERATE_RISK, 2: CRITICAL_RISK
        p_on_track = float(probs[0])
        p_mod_risk = float(probs[1]) if len(probs) > 1 else 0.0
        p_crit_risk = float(probs[2]) if len(probs) > 2 else 0.0

        # Weighted risk calculation
        risk_score = round((p_mod_risk * 50.0 + p_crit_risk * 100.0), 1)

        if risk_score < 30.0:
            risk_level = "ON_TRACK"
            estimated_delay_days = 0
        elif risk_score < 65.0:
            risk_level = "MODERATE_RISK"
            estimated_delay_days = max(5, int((1.0 - completed_ratio) * 14))
        else:
            risk_level = "CRITICAL_RISK"
            estimated_delay_days = max(15, int((days_elapsed_ratio - completed_ratio) * 45))

        # Build explainable risk factors
        risk_factors = []
        mitigations = []

        if overdue_tasks_count > 0:
            risk_factors.append(f"{overdue_tasks_count} project task(s) are currently past their scheduled milestone deadline.")
            mitigations.append("Reprioritize overdue tasks into a dedicated 48-hour recovery sprint.")

        if days_elapsed_ratio > completed_ratio + 0.15:
            risk_factors.append(f"Progress lag detected: {round(days_elapsed_ratio * 100)}% of timeline elapsed, but only {round(completed_ratio * 100)}% of tasks are completed.")
            mitigations.append("Reduce secondary experimental scope or reallocate workload among team members.")

        if reviews_count == 0:
            risk_factors.append("No supervisor reviews or milestone feedback records found for this phase.")
            mitigations.append("Schedule an urgent 15-minute review meeting with your assigned research supervisor.")

        if len(risk_factors) == 0:
            risk_factors.append("Milestone velocity is healthy and task completion rate aligns with scheduled deadlines.")
            mitigations.append("Maintain current development tempo and draft the research methodology chapter.")

        # Extract feature importances
        importance_dict = {
            self.feature_names[i]: round(float(self.model.feature_importances_[i]), 3)
            for i in range(len(self.feature_names))
        }

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "completion_probability": round(p_on_track * 100, 1),
            "estimated_days_delay": estimated_delay_days,
            "days_remaining_to_deadline": days_remaining,
            "risk_factors": risk_factors,
            "actionable_mitigations": mitigations,
            "feature_importance": importance_dict
        }

progress_predictor = ProgressPredictor()

