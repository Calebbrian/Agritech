import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/upload", tags=["File Upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO = {".mp4", ".mov", ".avi", ".webm"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (image or video). Returns the URL to access it."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE and ext not in ALLOWED_VIDEO:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed. Use: {', '.join(ALLOWED_IMAGE | ALLOWED_VIDEO)}")

    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_SIZE // (1024*1024)}MB")

    # Generate unique filename
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(contents)

    file_type = "image" if ext in ALLOWED_IMAGE else "video"
    url = f"/api/upload/files/{filename}"

    return {
        "url": url,
        "filename": filename,
        "type": file_type,
        "size": len(contents),
    }


@router.post("/multiple")
async def upload_multiple(files: list[UploadFile] = File(...)):
    """Upload multiple files. Returns list of URLs."""
    results = []
    for file in files:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_IMAGE and ext not in ALLOWED_VIDEO:
            continue

        contents = await file.read()
        if len(contents) > MAX_SIZE:
            continue

        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(contents)

        file_type = "image" if ext in ALLOWED_IMAGE else "video"
        results.append({
            "url": f"/api/upload/files/{filename}",
            "filename": filename,
            "type": file_type,
            "size": len(contents),
        })

    return results


@router.get("/files/{filename}")
async def serve_file(filename: str):
    """Serve an uploaded file."""
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)
