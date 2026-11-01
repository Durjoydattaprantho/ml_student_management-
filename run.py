#!/usr/bin/env python3
"""
ResearchHub AI - Launcher Script
Intelligent University Research Management & Collaboration Platform
"""

import sys
import os
import socket
import uvicorn
from pathlib import Path

# Add root directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

def find_available_port(start_port=8000, max_attempts=10):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def print_banner(port):
    print("=" * 72)
    print("🎓  ResearchHub AI — University Research Management & ML Platform  🎓")
    print("=" * 72)
    print(f" Web Application:      http://localhost:{port}")
    print(f" Swagger API Docs:     http://localhost:{port}/api/docs")
    print(f" ReDoc Specifications: http://localhost:{port}/api/redoc")
    print("=" * 72)
    print("Active User Personas:")
    print("  • 🎓 Student:        student@researchhub.edu     (Password: password123)")
    print("  • 👨‍🏫 Supervisor:     supervisor@researchhub.edu  (Password: password123)")
    print("  • 🏛️ Dept Admin:     deptadmin@researchhub.edu   (Password: password123)")
    print("  • ⚡ Super Admin:    superadmin@researchhub.edu  (Password: password123)")
    print("=" * 72)
    print("Press CTRL+C to stop the server.\n")

if __name__ == "__main__":
    port = find_available_port(8000)
    print_banner(port)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=port, reload=False, log_level="info")

