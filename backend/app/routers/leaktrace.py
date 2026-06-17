import uuid
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_admin
from app.core.supabase_client import supabase
from app.services.fingerprint_service import generate_variants_for_class, check_leak
from app.models.schemas import FingerprintCheckRequest, FingerprintCheckResponse

router = APIRouter(prefix="/leaktrace", tags=["leaktrace"])


@router.post("/fingerprint/{quiz_id}")
def fingerprint_quiz(quiz_id: str, admin=Depends(require_admin)):
    quiz_result = supabase.table("ef_quizzes").select("*").eq("id", quiz_id).execute()
    if not quiz_result.data:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz = quiz_result.data[0]

    students_result = supabase.table("ef_students").select("id").execute()
    student_ids = [s["id"] for s in students_result.data] if students_result.data else []

    if not student_ids:
        raise HTTPException(status_code=400, detail="No students found to fingerprint against")

    all_records = []
    for q in quiz["mcqs"]:
        variants = generate_variants_for_class(q, student_ids)
        for v in variants:
            all_records.append({
                "id": str(uuid.uuid4()),
                "quiz_id": quiz_id,
                "question_id": q["id"],
                "student_id": v["student_id"],
                "fingerprint_hash": v["fingerprint_hash"],
                "options": v["options"],
                "correct_index": v["correct_index"],
            })

    if all_records:
        supabase.table("ef_fingerprints").insert(all_records).execute()

    return {"quiz_id": quiz_id, "fingerprints_generated": len(all_records)}


@router.post("/check-leak", response_model=FingerprintCheckResponse)
def check_leak_endpoint(payload: FingerprintCheckRequest, admin=Depends(require_admin)):
    result = supabase.table("ef_fingerprints").select("*").execute()
    stored = result.data if result.data else []

    match = check_leak(payload.suspected_text, stored)
    return FingerprintCheckResponse(**match)