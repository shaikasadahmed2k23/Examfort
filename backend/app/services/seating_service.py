import random
from typing import List, Dict
from collections import deque


def extract_subject_from_filename(filename: str) -> str:
    """
    Subject naming rule: subject name = characters AFTER the 7th character
    of the uploaded filename (excluding extension).

    Example: 'CSE_AI_DSA.xlsx' -> base name 'CSE_AI_DSA'
             first 7 chars = 'CSE_AI_'
             remaining     = 'DSA'  -> this is the subject name
    """
    base = filename.rsplit(".", 1)[0]
    if len(base) <= 7:
        return base
    return base[7:]


def generate_seating(sheets: List[Dict], rooms: List[Dict]) -> Dict:
    """
    sheets: [{ "subject": "DSA", "students": ["101","102",...] }, ...]
    rooms:  [{ "block_name": "Block 1", "room_no": "101", "capacity": 30 }, ...]

    Strategy: round-robin interleave students from different subject groups
    so that no two consecutive seats in a room come from the same sheet/subject.
    This minimizes the chance of friends from the same class sitting together.
    """
    queues = []
    for sheet in sheets:
        students = sheet["students"][:]
        random.shuffle(students)
        queues.append(deque((s, sheet["subject"]) for s in students))

    interleaved = []
    while any(queues):
        for q in queues:
            if q:
                interleaved.append(q.popleft())

    assignments = []
    summary = []
    idx = 0
    total_students = len(interleaved)

    for room in rooms:
        room_capacity = room["capacity"]
        room_students = interleaved[idx: idx + room_capacity]
        idx += room_capacity

        for roll_no, subject in room_students:
            assignments.append({
                "block_name": room["block_name"],
                "room_no": room["room_no"],
                "roll_no": roll_no,
                "subject": subject,
            })

        summary.append({
            "block_name": room["block_name"],
            "room_no": room["room_no"],
            "num_students": len(room_students),
        })

        if idx >= total_students:
            break

    unseated = interleaved[idx:] if idx < total_students else []

    return {
        "assignments": assignments,
        "summary": summary,
        "unseated_count": len(unseated),
        "unseated_students": [s[0] for s in unseated],
    }