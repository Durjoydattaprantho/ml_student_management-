import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.app.config import APP_TITLE, APP_DESCRIPTION, APP_VERSION, STATIC_DIR, UPLOAD_DIR
from backend.app.database import init_db
from backend.app.seed_data import seed_database
from backend.app.routers import auth, projects, tasks, reviews, papers, ai_assistant, admin

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(reviews.router)
app.include_router(papers.router)
app.include_router(ai_assistant.router)
app.include_router(admin.router)

# Mount uploads directory for PDF downloads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Mount frontend assets
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.on_event("startup")
def on_startup():
    print("Initializing ResearchHub AI SQLite Database...")
    init_db()
    print("Checking / Seeding Database...")
    seed_database()
    print("ResearchHub AI Server Ready!")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": APP_TITLE,
        "version": APP_VERSION,
        "ml_engines": [
            "TopicRecommender (TF-IDF + Cosine)",
            "PaperRecommender (Vector Semantic Search)",
            "ResearchGapAssistant (Cluster & Boundary Analysis)",
            "PaperSummarizer (NLP 6-Section Structured Extractor)",
            "ProgressPredictor (Random Forest Deadline Risk Classifier)",
            "MethodologyRecommender (Multi-Class Architecture Decision Engine)"
        ]
    }

# Serve Frontend SPA
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Check if a static file exists
    file_path = STATIC_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routes
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    
    return JSONResponse(status_code=404, content={"detail": "Frontend not found"})

