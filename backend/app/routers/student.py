from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_student
from app.core.supabase_client import supabase
from app.services.crypto_service import is_unlock_time_reached
from app.models.schemas import StudentDashboardResponse, DashboardQuizItem, DashboardPaperItem

router = APIRouter(prefix="/student", tags=["student"])


@router.get("/dashboard", response_model=StudentDashboardResponse)
def get_dashboard(student=Depends(require_student)):
    """
    Returns every quiz and paper created by the student's admin (i.e. every
    quiz/paper tied to the private_code group this student belongs to),
    along with attempt/unlock status for each.
    """
    student_result = supabase.table("ef_students").select("*").eq("id", student["sub"]).execute()
    if not student_result.data:
        raise HTTPException(status_code=404, detail="Student record not found")
    admin_id = student_result.data[0]["admin_id"]

    quizzes_result = supabase.table("ef_quizzes").select("id, title").eq("admin_id", admin_id).execute()
    attempts_result = supabase.table("ef_quiz_attempts").select("quiz_id").eq("student_id", student["sub"]).execute()
    attempted_quiz_ids = {a["quiz_id"] for a in attempts_result.data} if attempts_result.data else set()

    quizzes = [
        DashboardQuizItem(
            quiz_id=q["id"],
            title=q["title"],
            attempted=q["id"] in attempted_quiz_ids,
        )
        for q in (quizzes_result.data or [])
    ]

    papers_result = supabase.table("ef_papers").select("id, filename, unlock_time").eq("admin_id", admin_id).execute()
    papers = [
        DashboardPaperItem(
            paper_id=p["id"],
            filename=p["filename"],
            unlock_time=datetime.fromisoformat(p["unlock_time"]),
            is_unlocked=is_unlock_time_reached(datetime.fromisoformat(p["unlock_time"])),
        )
        for p in (papers_result.data or [])
    ]

    return StudentDashboardResponse(quizzes=quizzes, papers=papers)