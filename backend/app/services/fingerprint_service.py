import hashlib
import random
from typing import List, Dict


def fingerprint_question(question_text: str, student_id: str) -> str:
    """
    Creates a unique hash per (question, student) pair.
    This hash is stored so that if this exact variant leaks,
    we can trace it back to the student it was generated for.
    """
    combined = f"{question_text.strip().lower()}::{student_id}"
    return hashlib.sha256(combined.encode()).hexdigest()


def create_variant(question: Dict, student_id: str) -> Dict:
    """
    Produces a slightly varied version of an MCQ for a specific student:
    - shuffles option order (keeps track of new correct_index)
    - this subtle variation acts as an invisible watermark per student
    """
    options = question["options"][:]
    correct_option_text = options[question["correct_index"]]

    indices = list(range(len(options)))
    random.shuffle(indices)
    shuffled_options = [options[i] for i in indices]
    new_correct_index = shuffled_options.index(correct_option_text)

    variant_text = question["question"]
    fp_hash = fingerprint_question(variant_text + str(shuffled_options), student_id)

    return {
        "question": variant_text,
        "options": shuffled_options,
        "correct_index": new_correct_index,
        "fingerprint_hash": fp_hash,
        "student_id": student_id,
    }


def generate_variants_for_class(question: Dict, student_ids: List[str]) -> List[Dict]:
    """Generate one fingerprinted variant per student for a single question."""
    return [create_variant(question, sid) for sid in student_ids]


def check_leak(suspected_text: str, stored_fingerprints: List[Dict]) -> Dict:
    """
    Compares suspected leaked text/options against stored fingerprint hashes.
    """
    suspected_hash = hashlib.sha256(suspected_text.strip().lower().encode()).hexdigest()

    for record in stored_fingerprints:
        if record["fingerprint_hash"] == suspected_hash:
            return {
                "matched": True,
                "matched_student_roll": record["student_id"],
                "matched_question_id": record.get("question_id"),
                "confidence": 1.0,
            }

    best_match = None
    best_score = 0.0
    for record in stored_fingerprints:
        option_str = "".join(record.get("options", []))
        overlap = len(set(suspected_text.lower().split()) & set(option_str.lower().split()))
        score = overlap / max(len(option_str.split()), 1)
        if score > best_score:
            best_score = score
            best_match = record

    if best_match and best_score > 0.6:
        return {
            "matched": True,
            "matched_student_roll": best_match["student_id"],
            "matched_question_id": best_match.get("question_id"),
            "confidence": round(best_score, 2),
        }

    return {"matched": False, "matched_student_roll": None, "matched_question_id": None, "confidence": 0.0}