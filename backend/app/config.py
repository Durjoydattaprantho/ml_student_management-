import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "frontend"

DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'researchhub.db'}"

SECRET_KEY = "researchhub-ai-secret-university-key-super-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

APP_TITLE = "ResearchHub AI"
APP_DESCRIPTION = "An Intelligent University Research Management & Collaboration Platform"
APP_VERSION = "1.0.0"

