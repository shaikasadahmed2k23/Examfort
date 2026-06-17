from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---------- AUTH ----------
class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    private_code: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: Optional[str] = None


class RegisterAdminRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    private_code: str


# ---------- SEATSMART ----------
class RoomConfig(BaseModel):
    block_name: str
    room_no: str
    capacity: int


class SeatingGenerateRequest(BaseModel):
    sheet_ids: List[str]
    rooms: List[RoomConfig]


class SeatAssignment(BaseModel):
    block_name: str
    room_no: str
    roll_no: str
    subject: str


class SeatingGenerateResponse(BaseModel):
    seating_id: str
    assignments: List[SeatAssignment]
    summary: List[dict]


# ---------- MOCKBOARD ----------
class GenerateQuizRequest(BaseModel):
    topic: Optional[str] = None
    syllabus_text: Optional[str] = None
    num_mcq: int = 5
    num_subjective: int = 2
    difficulty: str = "medium"

class MCQQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: Optional[int] = None


class SubjectiveQuestion(BaseModel):
    id: str
    question: str
    max_marks: int = 10


class QuizResponse(BaseModel):
    quiz_id: str
    title: str
    mcqs: List[MCQQuestion]
    subjective: List[SubjectiveQuestion]


class QuizSubmission(BaseModel):
    quiz_id: str
    mcq_answers: dict  # {question_id: selected_index}
    subjective_answers: dict  # {question_id: answer_text}


class QuizResult(BaseModel):
    score: float
    max_score: float
    mcq_breakdown: List[dict]
    subjective_breakdown: List[dict]


# ---------- LEAKTRACE ----------
class FingerprintCheckRequest(BaseModel):
    suspected_text: str


class FingerprintCheckResponse(BaseModel):
    matched: bool
    matched_student_roll: Optional[str] = None
    matched_question_id: Optional[str] = None
    confidence: float


# ---------- PAPERVAULT ----------
class PaperUploadResponse(BaseModel):
    paper_id: str
    unlock_time: datetime
    status: str


class PaperUnlockRequest(BaseModel):
    paper_id: str


class AccessLogEntry(BaseModel):
    user_id: str
    action: str
    timestamp: datetime

# ---------- STUDENT DASHBOARD ----------
class DashboardQuizItem(BaseModel):
    quiz_id: str
    title: str
    attempted: bool


class DashboardPaperItem(BaseModel):
    paper_id: str
    filename: str
    unlock_time: datetime
    is_unlocked: bool


class StudentDashboardResponse(BaseModel):
    quizzes: List[DashboardQuizItem]
    papers: List[DashboardPaperItem]