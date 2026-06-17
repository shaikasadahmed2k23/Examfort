import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "llama-3.3-70b-versatile"


def generate_quiz(topic: str, syllabus_text: str, num_mcq: int, num_subjective: int, difficulty: str) -> dict:
    """
    Calls Groq to generate a full quiz: MCQs + subjective questions.
    Returns parsed JSON dict.
    """
    source = syllabus_text if syllabus_text else f"Topic: {topic}"

    system_prompt = (
        "You are an expert exam question setter. You must respond with ONLY valid JSON, "
        "no markdown formatting, no preamble, no code fences. "
        "The JSON must match this exact structure: "
        '{"title": "string", "mcqs": [{"question": "string", "options": ["a","b","c","d"], '
        '"correct_index": 0}], "subjective": [{"question": "string", "max_marks": 10}]}'
    )

    user_prompt = (
        f"Generate an exam paper based on: {source}\n"
        f"Difficulty: {difficulty}\n"
        f"Generate exactly {num_mcq} MCQ questions (each with 4 options) and "
        f"{num_subjective} subjective/descriptive questions.\n"
        f"Ensure correct_index is accurate (0-indexed) for every MCQ."
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=3000,
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def grade_subjective_answer(question: str, student_answer: str, max_marks: int) -> dict:
    """
    Uses Groq to grade a subjective answer and return marks + explanation.
    """
    system_prompt = (
        "You are a fair, experienced exam evaluator. You must respond with ONLY valid JSON, "
        "no markdown, no preamble. Structure: "
        '{"marks_awarded": 0, "max_marks": 0, "explanation": "string"}'
    )

    user_prompt = (
        f"Question: {question}\n"
        f"Maximum marks: {max_marks}\n"
        f"Student's answer: {student_answer}\n\n"
        "Grade this answer fairly based on accuracy, completeness, and relevance. "
        "Give marks_awarded as a number between 0 and max_marks. "
        "Give a short explanation (2-3 sentences) justifying the score."
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def generate_seating_plan(rooms: list, student_groups: list) -> dict:
    """
    Optional AI-assisted seating shuffle suggestion.
    For determinism and reliability, the actual seating algorithm in
    seating_service.py is rule-based. This function is kept available
    for cases where you want Groq to validate/suggest an alternate
    arrangement, but is NOT required for core SeatSmart functionality.
    """
    system_prompt = (
        "You are a fair exam-seating planner. Respond with ONLY valid JSON. "
        "Avoid placing students from the same group/section adjacent to each other."
    )
    user_prompt = f"Rooms: {json.dumps(rooms)}\nStudent groups: {json.dumps(student_groups)}"

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
        max_tokens=2000,
    )
    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)