import uuid
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_admin, require_student, get_current_user
from app.core.supabase_client import supabase
from app.services.groq_service import generate_quiz, grade_subjective_answer
from app.models.schemas import GenerateQuizRequest, QuizResponse, QuizSubmission, QuizResult

router = APIRouter(prefix="/mockboard", tags=["mockboard"])


@router.post("/generate", response_model=QuizResponse)
def generate(payload: GenerateQuizRequest, admin=Depends(require_admin)):
    if not payload.topic and not payload.syllabus_text:
        raise HTTPException(status_code=400, detail="Provide either a topic or syllabus_text")

    quiz_data = generate_quiz(
        topic=payload.topic,
        syllabus_text=payload.syllabus_text,
        num_mcq=payload.num_mcq,
        num_subjective=payload.num_subjective,
        difficulty=payload.difficulty,
    )

    quiz_id = str(uuid.uuid4())
    mcqs = []
    for m in quiz_data.get("mcqs", []):
        mcqs.append({"id": str(uuid.uuid4()), **m})

    subjective = []
    for s in quiz_data.get("subjective", []):
        subjective.append({"id": str(uuid.uuid4()), **s})

    quiz_row = {
        "id": quiz_id,
        "admin_id": admin["sub"],
        "title": quiz_data.get("title", payload.topic or "Generated Quiz"),
        "mcqs": mcqs,
        "subjective": subjective,
    }
    supabase.table("ef_quizzes").insert(quiz_row).execute()

    return QuizResponse(quiz_id=quiz_id, title=quiz_row["title"], mcqs=mcqs, subjective=subjective)


@router.get("/quiz/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: str, user=Depends(get_current_user)):
    result = supabase.table("ef_quizzes").select("*").eq("id", quiz_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz = result.data[0]
    mcqs = quiz["mcqs"]

    if user.get("role") == "student":
        mcqs = [{k: v for k, v in m.items() if k != "correct_index"} for m in mcqs]

    return QuizResponse(quiz_id=quiz["id"], title=quiz["title"], mcqs=mcqs, subjective=quiz["subjective"])


@router.post("/submit/{quiz_id}", response_model=QuizResult)
def submit(quiz_id: str, payload: QuizSubmission, student=Depends(require_student)):
    result = supabase.table("ef_quizzes").select("*").eq("id", quiz_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz = result.data[0]

    mcq_breakdown = []
    mcq_score = 0
    for q in quiz["mcqs"]:
        selected = payload.mcq_answers.get(q["id"])
        is_correct = selected == q["correct_index"]
        if is_correct:
            mcq_score += 1
        mcq_breakdown.append({
            "question_id": q["id"],
            "selected_index": selected,
            "correct_index": q["correct_index"],
            "is_correct": is_correct,
        })

    subjective_breakdown = []
    subjective_score = 0.0
    subjective_max = 0.0
    for q in quiz["subjective"]:
        answer_text = payload.subjective_answers.get(q["id"], "")
        max_marks = q.get("max_marks", 10)
        subjective_max += max_marks

        if answer_text.strip():
            grading = grade_subjective_answer(q["question"], answer_text, max_marks)
            marks = grading.get("marks_awarded", 0)
            explanation = grading.get("explanation", "")
        else:
            marks = 0
            explanation = "No answer submitted."

        subjective_score += marks
        subjective_breakdown.append({
            "question_id": q["id"],
            "marks_awarded": marks,
            "max_marks": max_marks,
            "explanation": explanation,
        })

    total_score = mcq_score + subjective_score
    max_score = len(quiz["mcqs"]) + subjective_max

    supabase.table("ef_quiz_attempts").insert({
        "id": str(uuid.uuid4()),
        "quiz_id": quiz_id,
        "student_id": student["sub"],
        "score": total_score,
        "max_score": max_score,
        "mcq_breakdown": mcq_breakdown,
        "subjective_breakdown": subjective_breakdown,
    }).execute()

    return QuizResult(
        score=total_score,
        max_score=max_score,
        mcq_breakdown=mcq_breakdown,
        subjective_breakdown=subjective_breakdown,
    )

@router.get("/leaderboard/{quiz_id}")
def leaderboard(quiz_id: str, user=Depends(get_current_user)):
    result = supabase.table("ef_quiz_attempts").select("*").eq("quiz_id", quiz_id).order("score", desc=True).execute()
    ranked = [
        {"rank": i + 1, "student_id": r["student_id"], "score": r["score"], "max_score": r["max_score"]}
        for i, r in enumerate(result.data)
    ]
    return ranked
    # return 