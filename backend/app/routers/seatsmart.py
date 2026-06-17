import pandas as pd
import io
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List

from app.core.security import require_admin
from app.core.supabase_client import supabase
from app.services.seating_service import extract_subject_from_filename, generate_seating
from app.models.schemas import SeatingGenerateRequest, SeatingGenerateResponse

router = APIRouter(prefix="/seatsmart", tags=["seatsmart"])


@router.get("/naming-convention-example")
def naming_convention_example():
    example_filename = "CSE_AI_DSA.xlsx"
    base = example_filename.rsplit(".", 1)[0]
    return {
        "example_filename": example_filename,
        "first_7_chars": base[:7],
        "extracted_subject": base[7:],
        "explanation": (
            "The subject name is everything AFTER the first 7 characters of the "
            "filename (excluding the extension). For 'CSE_AI_DSA.xlsx', the first "
            "7 characters are 'CSE_AI_' and the remaining 'DSA' becomes the subject name. "
            "Name your files following this pattern: <7-char-prefix><SUBJECT>.xlsx"
        ),
    }


@router.post("/upload-sheet")
async def upload_sheet(file: UploadFile = File(...), admin=Depends(require_admin)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files are accepted")

    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    roll_col = None
    for col in df.columns:
        if "roll" in str(col).lower():
            roll_col = col
            break
    if roll_col is None:
        roll_col = df.columns[0]

    roll_numbers = df[roll_col].dropna().astype(str).tolist()
    subject = extract_subject_from_filename(file.filename)

    sheet_id = str(uuid.uuid4())
    sheet_row = {
        "id": sheet_id,
        "admin_id": admin["sub"],
        "filename": file.filename,
        "subject": subject,
        "roll_numbers": roll_numbers,
    }
    supabase.table("ef_sheets").insert(sheet_row).execute()

    return {
        "sheet_id": sheet_id,
        "subject": subject,
        "num_students": len(roll_numbers),
        "filename": file.filename,
    }


@router.get("/sheets")
def list_sheets(admin=Depends(require_admin)):
    result = supabase.table("ef_sheets").select("*").eq("admin_id", admin["sub"]).execute()
    return result.data


@router.post("/generate", response_model=SeatingGenerateResponse)
def generate(payload: SeatingGenerateRequest, admin=Depends(require_admin)):
    sheets_data = []
    for sid in payload.sheet_ids:
        result = supabase.table("ef_sheets").select("*").eq("id", sid).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Sheet {sid} not found")
        row = result.data[0]
        sheets_data.append({"subject": row["subject"], "students": row["roll_numbers"]})

    rooms_data = [r.dict() for r in payload.rooms]
    seating_result = generate_seating(sheets_data, rooms_data)

    seating_id = str(uuid.uuid4())
    supabase.table("ef_seatings").insert({
        "id": seating_id,
        "admin_id": admin["sub"],
        "assignments": seating_result["assignments"],
        "summary": seating_result["summary"],
    }).execute()

    return SeatingGenerateResponse(
        seating_id=seating_id,
        assignments=seating_result["assignments"],
        summary=seating_result["summary"],
    )


@router.get("/seating/{seating_id}")
def get_seating(seating_id: str, admin=Depends(require_admin)):
    result = supabase.table("ef_seatings").select("*").eq("id", seating_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Seating plan not found")
    return result.data[0]