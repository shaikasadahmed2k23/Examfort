# 🏰 ExamFort

> **Secure. Smart. Seamless.**
> A full-stack exam management platform built with FastAPI & React — built solo for **FAR AWAY 2026**, India's Biggest International Hackathon, under the **Examinations** theme.

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![Groq](https://img.shields.io/badge/Groq-LLM%20Inference-F55036?style=for-the-badge&logo=groq)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

🌐 **Live Demo:** [https://examfort.vercel.app/](https://examfort.vercel.app/)

---

## 📱 About ExamFort

ExamFort is a comprehensive exam management platform built to solve four real, recurring problems in how Indian schools and institutions conduct exams: chaotic seating arrangements that enable copying, paper leaks before exams, slow and inconsistent grading, and a lack of secure, time-gated access to exam content.

Instead of building four separate tools, ExamFort unifies them behind a single login: one private code shared by an institution lets admins create and manage exams, and lets students log in and land directly on their assigned exam — no extra menus, no confusion.

Admins can generate AI-assisted mock exams, view live leaderboards, monitor for paper leaks, auto-generate seating plans, and securely time-lock exam papers until the moment the exam begins. Students log in with a single shared code, attempt exams, and instantly see their results with AI-explained scoring on subjective answers.

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="Screenshots/AdminLogin.png" width="100%" alt="Admin Login"/><p align="center"><b>Admin Login</b></p></td>
    <td><img src="Screenshots/AdminGeneratedSeating.png" width="100%" alt="Generated Seating"/><p align="center"><b>Generated Seating</b></p></td>
  </tr>
  <tr>
    <td><img src="Screenshots/AdminMockBoard.png" width="100%" alt="Mock Board"/><p align="center"><b>Mock Board</b></p></td>
    <td><img src="Screenshots/AdminPaperLeak.png" width="100%" alt="Paper Leak"/><p align="center"><b>Paper Leak Tracker</b></p></td>
  </tr>
  <tr>
    <td><img src="Screenshots/AdminPaperVault.png" width="100%" alt="Paper Vault"/><p align="center"><b>Paper Vault</b></p></td>
    <td><img src="Screenshots/AdminSmartSeat.png" width="100%" alt="Smart Seat"/><p align="center"><b>Seat Smart</b></p></td>
  </tr>
  <tr>
    <td><img src="Screenshots/StudentDashboard.png" width="100%" alt="Student Dashboard"/><p align="center"><b>Student Dashboard</b></p></td>
    <td><img src="Screenshots/StudentPageDowlnload.png" width="100%" alt="Student Download"/><p align="center"><b>Download Page</b></p></td>
  </tr>
  <tr>
    <td><img src="Screenshots/StudentQuiz.png" width="100%" alt="Student Quiz"/><p align="center"><b>Student Quiz</b></p></td>
    <td><img src="Screenshots/StudentResults.png" width="100%" alt="Student Results"/><p align="center"><b>Results View</b></p></td>
  </tr>
</table>

---

## 🧩 Core Modules

ExamFort is built around four modules, all reachable from a single admin dashboard:

### 🪑 SeatSmart
Admins upload roll-number sheets (Excel), one per class/section. The subject for each sheet is auto-derived from the filename itself (the system reads the characters after a fixed prefix length, so files can be named consistently per class, e.g. `CSE_AI_DSA.xlsx` → subject `DSA`). Admin then specifies the number of blocks, rooms per block, and capacity per room. The system interleaves students from different sheets/sections so that no two students from the same class end up seated next to each other — reducing the chance of copying — and outputs a downloadable, room-by-room seating sheet.

### 📝 MockBoard
Teachers provide either a topic or pasted syllabus content. Groq's LLM generates a complete exam paper — a mix of MCQs and subjective questions — on the spot. Students attempt the quiz through their dashboard; MCQs are graded instantly, and subjective answers are graded by AI against the question with a short explanation justifying the score awarded. A live leaderboard ranks all attempts for that quiz.

### 🔍 LeakTrace
Every question can be fingerprinted with a unique hash per student (using subtly reordered answer options), so that if a paper or question surfaces online before or during an exam, admins can paste the leaked text into LeakTrace and trace it back to the exact student version it came from.

### 🔐 PaperVault
Admins upload the exam paper (Word or Excel). The content is encrypted and locked behind a time gate — the decryption key is only released once the exam's official start time is reached. Every access attempt, successful or denied, is logged with the user and timestamp, giving institutions a clear audit trail of who opened the paper and when.

---

## 🔑 Authentication Flow

ExamFort uses a single unified login screen for both roles:

- **Admins** log in with email + password + their institution's private code.
- **Students** log in with just the shared private code — no separate account needed — and are routed directly to their assigned exam page, skipping any admin-style menus entirely.

On the admin side, after login there are two top-level choices: **Create** (build a new SeatSmart plan, MockBoard quiz, LeakTrace fingerprint set, or PaperVault entry) or **Attend** (review existing ones).

---

## ✨ Features

- ✅ Unified login for admins and students via a shared private code
- ✅ AI-generated mock exams (MCQ + subjective) from a topic or syllabus text
- ✅ Instant MCQ grading and AI-explained subjective grading
- ✅ Live leaderboard per quiz
- ✅ Automated, anti-copying seating arrangement generator with exportable room sheets
- ✅ Per-student question fingerprinting to trace leaked papers
- ✅ Encrypted, time-locked paper vault with full access logging
- ✅ REST API backend (FastAPI) fully integrated with a React frontend
- ✅ Supabase as the single source of truth for users, sheets, seatings, quizzes, attempts, fingerprints, and papers

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Backend REST API |
| **React + Vite** | Frontend UI |
| **Supabase** | Database & Auth |
| **Groq API** | AI quiz generation & subjective grading |
| **JWT (python-jose)** | Session/token-based authentication |
| **cryptography (Fernet)** | Time-locked paper encryption |
| **pandas / openpyxl** | Excel sheet parsing for SeatSmart |
| **Render** | Backend deployment |
| **Vercel** | Frontend deployment |

---

## 📂 Project Structure

```
examfort/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                # FastAPI app entrypoint, router wiring, CORS
│       ├── core/
│       │   ├── config.py          # Env-based settings
│       │   ├── supabase_client.py # Shared Supabase client
│       │   └── security.py        # JWT creation/verification, role guards
│       ├── models/
│       │   └── schemas.py         # Pydantic request/response models
│       ├── services/
│       │   ├── groq_service.py        # Quiz generation + subjective grading
│       │   ├── seating_service.py     # Anti-copying seating algorithm
│       │   ├── fingerprint_service.py # Per-student question fingerprinting
│       │   └── crypto_service.py      # Time-locked encryption for PaperVault
│       └── routers/
│           ├── auth.py
│           ├── seatsmart.py
│           ├── mockboard.py
│           ├── leaktrace.py
│           └── papervault.py
│
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx / App.jsx
        ├── api/client.js          # Axios instance with auth interceptor
        ├── context/AuthContext.jsx
        ├── components/            # Navbar, ProtectedRoute
        └── pages/
            ├── Login.jsx / RegisterAdmin.jsx
            ├── AdminHome.jsx
            ├── SeatSmart.jsx
            ├── MockBoardCreate.jsx
            ├── LeakTrace.jsx
            ├── PaperVault.jsx
            └── StudentExam.jsx
```

---

## 🚀 Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=change-this-to-a-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```
VITE_API_BASE_URL=https://examfort.onrender.com
```

---

## 🔮 Future Enhancements

- **EquiTest accessibility layer** — text-to-speech support, automatic extra-time allocation for accommodations, dyslexia-friendly font/layout toggle
- **BiasCheck** — NLP-based scan of question papers for cultural, regional, or language bias before publishing
- **WhatsApp dispatch** — auto-send generated seating sheets to invigilators via the WhatsApp Cloud API
- Hardware-free OMR-style answer sheet scanning for offline objective exams

---

## 📄 License

MIT License — Copyright (c) 2026
