"""
MedEase AI — Backend Runner
"""

import uvicorn
import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting MedEase AI Backend on http://localhost:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
