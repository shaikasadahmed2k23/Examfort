import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import Response
import io
import pandas as pd
from docx import Document

from app.core.security import require_admin, get_current_user
from app.core.supabase_client import supabase
from app.services.crypto_service import (
    generate_key, encrypt_paper, decrypt_paper, encrypt_bytes, decrypt_bytes,
    is_unlock_time_reached, encode_key_for_storage, decode_key_from_storage,
)
from app.models.schemas import PaperUploadResponse

router = APIRouter(prefix="/papervault", tags=["papervault"])

CONTENT_TYPES = {
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".txt": "text/plain",
}


def _extract_text_from_file(filename: str, contents: bytes) -> str:
    if filename.endswith(".docx"):
        doc = Document(io.BytesIO(contents))
        return "\n".join(p.text for p in doc.paragraphs)
    elif filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(contents))
        return df.to_csv(index=False)
    else:
        return contents.decode(errors="ignore")


def _get_extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return "." + filename.rsplit(".", 1)[1].lower()


@router.post("/upload", response_model=PaperUploadResponse)
async def upload_paper(
    file: UploadFile = File(...),
    unlock_time: str = Form(...),
    admin=Depends(require_admin),
):
    """
    Admin uploads exam paper (Word or Excel). Both the extracted text AND
    the original file bytes are encrypted and stored, so students can later
    download the actual original file (not just see text) once unlocked.
    """
    contents = await file.read()
    text_content = _extract_text_from_file(file.filename, contents)
    extension = _get_extension(file.filename)

    key = generate_key()
    encrypted_content = encrypt_paper(text_content, key)
    encrypted_file_bytes = encrypt_bytes(contents, key)
    encoded_key = encode_key_for_storage(key)

    paper_id = str(uuid.uuid4())
    unlock_dt = datetime.fromisoformat(unlock_time)

    supabase.table("ef_papers").insert({
        "id": paper_id,
        "admin_id": admin["sub"],
        "filename": file.filename,
        "encrypted_content": encrypted_content,
        "encrypted_file_bytes": encrypted_file_bytes,
        "original_extension": extension,
        "encryption_key": encoded_key,
        "unlock_time": unlock_dt.isoformat(),
    }).execute()

    return PaperUploadResponse(paper_id=paper_id, unlock_time=unlock_dt, status="locked")


@router.post("/unlock/{paper_id}")
def unlock_paper(paper_id: str, user=Depends(get_current_user)):
    """
    Returns decrypted paper TEXT content ONLY if current server time has
    reached unlock_time. Use /papervault/download/{paper_id} to get the
    actual original file once unlocked. Every access attempt is logged.
    """
    result = supabase.table("ef_papers").select("*").eq("id", paper_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper = result.data[0]

    unlock_dt = datetime.fromisoformat(paper["unlock_time"])
    log_entry = {
        "id": str(uuid.uuid4()),
        "paper_id": paper_id,
        "user_id": user["sub"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if not is_unlock_time_reached(unlock_dt):
        log_entry["action"] = "denied_too_early"
        supabase.table("ef_access_logs").insert(log_entry).execute()
        raise HTTPException(
            status_code=403,
            detail=f"Paper is locked until {paper['unlock_time']}",
        )

    key = decode_key_from_storage(paper["encryption_key"])
    decrypted = decrypt_paper(paper["encrypted_content"], key)

    log_entry["action"] = "unlocked"
    supabase.table("ef_access_logs").insert(log_entry).execute()

    return {"paper_id": paper_id, "content": decrypted, "unlocked_at": log_entry["timestamp"]}


@router.get("/download/{paper_id}")
def download_paper(paper_id: str, user=Depends(get_current_user)):
    """
    Returns the actual original file (docx/xlsx/etc), decrypted, as a
    downloadable binary response. Only works once unlock_time is reached.
    Logs the download the same way unlock is logged.
    """
    result = supabase.table("ef_papers").select("*").eq("id", paper_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper = result.data[0]

    unlock_dt = datetime.fromisoformat(paper["unlock_time"])
    log_entry = {
        "id": str(uuid.uuid4()),
        "paper_id": paper_id,
        "user_id": user["sub"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if not is_unlock_time_reached(unlock_dt):
        log_entry["action"] = "denied_too_early"
        supabase.table("ef_access_logs").insert(log_entry).execute()
        raise HTTPException(
            status_code=403,
            detail=f"Paper is locked until {paper['unlock_time']}",
        )

    if not paper.get("encrypted_file_bytes"):
        raise HTTPException(
            status_code=404,
            detail="Original file bytes not stored for this paper (uploaded before this feature was added)",
        )

    key = decode_key_from_storage(paper["encryption_key"])
    file_bytes = decrypt_bytes(paper["encrypted_file_bytes"], key)

    log_entry["action"] = "downloaded"
    supabase.table("ef_access_logs").insert(log_entry).execute()

    extension = paper.get("original_extension", "")
    content_type = CONTENT_TYPES.get(extension, "application/octet-stream")
    filename = paper["filename"]

    return Response(
        content=file_bytes,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/access-logs/{paper_id}")
def get_access_logs(paper_id: str, admin=Depends(require_admin)):
    """Admin views exactly who opened the paper and when."""
    result = supabase.table("ef_access_logs").select("*").eq("paper_id", paper_id).order("timestamp").execute()
    return result.data