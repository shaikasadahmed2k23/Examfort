from fastapi import APIRouter, HTTPException
from app.models.schemas import LoginRequest, LoginResponse, RegisterAdminRequest
from app.core.supabase_client import supabase
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-admin", response_model=LoginResponse)
def register_admin(payload: RegisterAdminRequest):
    """
    Creates a new admin/teacher account with a private_code.
    The same private_code is later shared with students so they can log in
    and land directly on their assigned exam.
    """
    existing = supabase.table("ef_users").select("*").eq("email", payload.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    code_exists = supabase.table("ef_users").select("*").eq("private_code", payload.private_code).execute()
    if code_exists.data:
        raise HTTPException(status_code=400, detail="Private code already in use, choose another")

    user_row = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "private_code": payload.private_code,
        "role": "admin",
    }
    result = supabase.table("ef_users").insert(user_row).execute()
    user = result.data[0]

    token = create_access_token({"sub": user["id"], "role": "admin", "name": user["name"]})
    return LoginResponse(access_token=token, role="admin", user_id=user["id"], name=user["name"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Unified login for both admin and student.

    - If email + password are provided: validates as admin/teacher.
    - If only private_code is provided (no password): validates as student,
      and the private_code must match one created by an admin. Student is
      then routed directly to their assigned exam page on the frontend.
    """
    if payload.email and payload.password:
        result = supabase.table("ef_users").select("*").eq("email", payload.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user = result.data[0]
        if not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user["private_code"] != payload.private_code:
            raise HTTPException(status_code=401, detail="Invalid private code")

        token = create_access_token({"sub": user["id"], "role": "admin", "name": user["name"]})
        return LoginResponse(access_token=token, role="admin", user_id=user["id"], name=user["name"])

    # Student login path: only private_code required
    admin_result = supabase.table("ef_users").select("*").eq("private_code", payload.private_code).eq("role", "admin").execute()
    if not admin_result.data:
        raise HTTPException(status_code=401, detail="Invalid private code")

    admin = admin_result.data[0]

    student_result = supabase.table("ef_students").select("*").eq("private_code", payload.private_code).execute()
    if student_result.data:
        student = student_result.data[0]
    else:
        student_row = {"private_code": payload.private_code, "admin_id": admin["id"]}
        inserted = supabase.table("ef_students").insert(student_row).execute()
        student = inserted.data[0]

    token = create_access_token({"sub": student["id"], "role": "student", "admin_id": admin["id"]})
    return LoginResponse(access_token=token, role="student", user_id=student["id"], name=None)