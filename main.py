"""
Student Project AI Tutor — FastAPI + Gemini (Google AI Studio)
POST /tutor/generate
POST /auth/register
POST /auth/login
"""

import json
import os
import re
import sqlite3
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from google import genai
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ValidationError
from typing import Optional

load_dotenv()

# ---------------------------------------------------------------------------
# Auth setup
# ---------------------------------------------------------------------------
# NOTE: Vercel's filesystem is read-only EXCEPT for /tmp. Writing anywhere
# else (e.g. a relative "users.db" path) crashes the function immediately on
# cold start. /tmp is writable but ALSO wiped between cold starts, so this
# still won't give you real persistence — see the README/chat note about
# migrating to a hosted DB (e.g. Supabase) for production.
DB_PATH = os.getenv("DB_PATH", "/tmp/users.db")

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set in .env or environment variables.")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: sqlite3.Connection = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.execute("SELECT id, name, email FROM users WHERE email = ?", (email,)).fetchone()
    if user is None:
        raise credentials_exception
    return dict(user)


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Student Project AI Tutor",
    description=(
        "An AI-powered tutor that helps students plan and structure their assignments. "
        "Provide an assignment prompt (and optional rubric) to receive a project plan, "
        "report outline, tutor guidance, and a quality checklist."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Gemini client
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-1.5-pro"

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in .env or environment variables.")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Pydantic response schemas
# ---------------------------------------------------------------------------
class Milestone(BaseModel):
    milestone: str
    tasks: list[str]
    estimated_time_days: int


class ReportSection(BaseModel):
    section: str
    subsections: list[str]


class TutorGuidance(BaseModel):
    clarifying_questions: list[str]
    what_to_do_next: list[str]
    improvement_tips: list[str]


class ChecklistItem(BaseModel):
    item: str
    meets_requirement: str  # "yes" | "no" | "unknown"


class TutorResponse(BaseModel):
    project_plan: list[Milestone]
    report_outline: list[ReportSection]
    tutor_guidance: TutorGuidance
    quality_checklist: list[ChecklistItem]


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------
SYSTEM_INSTRUCTION = """You are a strict JSON API. You MUST return ONLY valid JSON — no markdown, 
no code fences, no commentary, no explanation outside the JSON object. 
Your role is that of an academic tutor. You help students plan and structure 
their work. You must NEVER write the full final report text for the student."""


def build_prompt(
    assignment_prompt: str,
    rubric_text: Optional[str],
    grade_level: Optional[str],
    deadline: Optional[str],
    report_type: Optional[str],
) -> str:
    context_lines = []
    if grade_level:
        context_lines.append(f"- Grade level / audience: {grade_level}")
    if deadline:
        context_lines.append(f"- Deadline: {deadline}")
    if report_type:
        context_lines.append(f"- Report type: {report_type}")

    context_block = (
        "\n\nAdditional context:\n" + "\n".join(context_lines)
        if context_lines
        else ""
    )

    rubric_block = (
        f"\n\nRubric provided by student:\n{rubric_text}"
        if rubric_text
        else "\n\nNo rubric was provided. Use a generic academic report checklist."
    )

    checklist_instruction = (
        "Derive checklist items directly from the rubric criteria above. "
        "Set 'meets_requirement' to 'unknown' for all items since the student hasn't written the report yet."
        if rubric_text
        else "Generate a generic academic report quality checklist (e.g., clear thesis, logical flow, grammar, citations). "
             "Set 'meets_requirement' to 'unknown' for all items."
    )

    return f"""You are an academic tutor. A student needs help planning and structuring an assignment.
DO NOT write the full report. Act as a tutor only.
{context_block}

Student assignment prompt:
{assignment_prompt}
{rubric_block}

Return a single JSON object with EXACTLY these four top-level keys:

1. "project_plan": Array of milestone objects. Each object has:
   - "milestone": string (name of the milestone)
   - "tasks": array of strings (specific actionable tasks for this milestone)
   - "estimated_time_days": integer (how many days this milestone should take)
   Provide 4-6 milestones covering the full assignment lifecycle.

2. "report_outline": Array of section objects. Each object has:
   - "section": string (section heading)
   - "subsections": array of strings (subsection headings or bullet points)
   Map the outline to the assignment requirements exactly.

3. "tutor_guidance": Object with exactly three keys:
   - "clarifying_questions": array of strings (questions the student should answer before starting)
   - "what_to_do_next": array of strings (concrete immediate next steps for the student)
   - "improvement_tips": array of strings (tips to elevate the quality of this specific assignment)

4. "quality_checklist": Array of checklist item objects. Each object has:
   - "item": string (what to check)
   - "meets_requirement": one of "yes", "no", or "unknown"
   {checklist_instruction}

Return ONLY the JSON object. No markdown. No code fences. No text before or after the JSON."""


# ---------------------------------------------------------------------------
# Gemini call + JSON extraction
# ---------------------------------------------------------------------------
def call_gemini(prompt: str) -> dict:
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.3,
                max_output_tokens=4096,
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API call failed: {exc}",
        )

    raw_text = response.text or ""

    # Strip markdown fences if Gemini wraps output despite instructions
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Gemini returned invalid JSON: {exc}. "
                f"Raw response (first 500 chars): {raw_text[:500]}"
            ),
        )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@app.post(
    "/tutor/generate",
    response_model=TutorResponse,
    summary="Generate tutor guidance for a student assignment",
    response_description="Structured tutor output: project plan, outline, guidance, checklist",
)
async def generate_tutor_output(
    assignment_prompt: str = Form(..., description="The student's assignment prompt (required)"),
    rubric_text: Optional[str] = Form(None, description="Optional rubric as plain text"),
    rubric_file: Optional[UploadFile] = File(None, description="Optional rubric as a .txt file upload"),
    grade_level: Optional[str] = Form(None, description="e.g. 'Grade 10', 'University Year 2'"),
    deadline: Optional[str] = Form(None, description="e.g. '2 weeks', 'June 30 2025'"),
    report_type: Optional[str] = Form(None, description="e.g. 'research report', 'lab report'"),
    current_user: dict = Depends(get_current_user),
):
    # Handle rubric_file upload
    if rubric_file is not None:
        filename = rubric_file.filename or ""
        if not filename.lower().endswith(".txt"):
            raise HTTPException(
                status_code=400,
                detail="rubric_file must be a .txt file. Other file types are not supported in the Day 2 MVP.",
            )
        try:
            raw_bytes = await rubric_file.read()
            rubric_text = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="rubric_file could not be decoded as UTF-8. Please ensure the file uses UTF-8 encoding.",
            )

    # Build prompt and call Gemini
    prompt = build_prompt(
        assignment_prompt=assignment_prompt,
        rubric_text=rubric_text,
        grade_level=grade_level,
        deadline=deadline,
        report_type=report_type,
    )

    raw_data = call_gemini(prompt)

    # Validate structure with Pydantic
    try:
        result = TutorResponse(**raw_data)
    except (ValidationError, TypeError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini response did not match expected schema: {exc}",
        )

    return result


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@app.post(
    "/auth/register",
    response_model=TokenResponse,
    summary="Register a new user account",
)
def register(payload: RegisterRequest, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_password = pwd_context.hash(payload.password)
    cursor = db.execute(
        "INSERT INTO users (name, email, hashed_password, created_at) VALUES (?, ?, ?, ?)",
        (payload.name, payload.email, hashed_password, datetime.now(timezone.utc).isoformat()),
    )
    db.commit()
    user_id = cursor.lastrowid

    token = create_access_token({"sub": payload.email})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, name=payload.name, email=payload.email),
    )


@app.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Log in with email and password",
)
def login(payload: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    user = db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    if not user or not pwd_context.verify(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"sub": user["email"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user["id"], name=user["name"], email=user["email"]),
    )


@app.get(
    "/auth/me",
    response_model=UserOut,
    summary="Get the currently authenticated user",
)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", summary="Health check")
def root():
    return {"status": "ok", "message": "Student Project AI Tutor is running. Visit /docs for the API."}