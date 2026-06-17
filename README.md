```markdown
# 🏰 ExamFort

<div align="center">

### Secure. Smart. Seamless Exam Management.

*A full-stack platform for schools and institutions to run mock exams, assign seats, manage paper vault security, and monitor student performance in real time.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

### 🌐 [Live Demo → https://examfort.vercel.app/](https://examfort.vercel.app/)

</div>

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/AdminLogin.png" alt="Admin Login" width="100%"/>
      <br/><b>Admin Login</b>
      <br/><sub>Secure admin authentication landing page</sub>
    </td>
    <td align="center" width="50%">
      <img src="screenshots/AdminGeneratedSeating.png" alt="Generated Seating" width="100%"/>
      <br/><b>Generated Seating</b>
      <br/><sub>Automated smart seating assignment</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/AdminMockBoard.png" alt="Mock Board" width="100%"/>
      <br/><b>Mock Board</b>
      <br/><sub>Create and manage mock exams</sub>
    </td>
    <td align="center" width="50%">
      <img src="screenshots/AdminPaperLeak.png" alt="Paper Leak" width="100%"/>
      <br/><b>Paper Leak Tracker</b>
      <br/><sub>Monitor suspicious paper leak events</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/AdminPaperVault.png" alt="Paper Vault" width="100%"/>
      <br/><b>Paper Vault</b>
      <br/><sub>Secure exam content storage</sub>
    </td>
    <td align="center" width="50%">
      <img src="screenshots/AdminSmartSeat.png" alt="Smart Seat" width="100%"/>
      <br/><b>Seat Smart</b>
      <br/><sub>Seat allocation and student placement</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/StudentDashboard.png" alt="Student Dashboard" width="100%"/>
      <br/><b>Student Dashboard</b>
      <br/><sub>Student home with exam status and results</sub>
    </td>
    <td align="center" width="50%">
      <img src="screenshots/StudentPageDowlnload.png" alt="Student Download" width="100%"/>
      <br/><b>Download Page</b>
      <br/><sub>Student access to download exam materials</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/StudentQuiz.png" alt="Student Quiz" width="100%"/>
      <br/><b>Student Quiz</b>
      <br/><sub>Exam interface for taking tests</sub>
    </td>
    <td align="center" width="50%">
      <img src="screenshots/StudentResults.png" alt="Student Results" width="100%"/>
      <br/><b>Results View</b>
      <br/><sub>Score overview and leaderboard placement</sub>
    </td>
  </tr>
</table>
---

## ✨ Core Features

- ✅ Admin authentication and protected admin dashboard
- ✅ Mock exam creation and leaderboard tracking
- ✅ Student login and exam access portal
- ✅ Paper vault tracking and leak monitoring
- ✅ Smart seating assignment and seating export
- ✅ Real-time score display and detailed student reports
- ✅ REST API backend with frontend integration

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Uvicorn |
| **Frontend** | React, Vite, JavaScript |
| **Database** | Supabase / PostgreSQL |
| **Auth** | JWT-based token authentication |
| **AI** | Groq API |
| **Deployment** | Render (API) + Vercel (Frontend) |

---

## 🚀 Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `frontend/.env` file:
```
VITE_API_BASE_URL=https://examfort.onrender.com
```

---

## 📁 Project Structure

```
examfort/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── core/          # config, security, supabase client
│       ├── models/        # schemas
│       ├── routers/       # auth, leaktrace, mockboard, papervault, seatsmart, student
│       └── services/      # crypto, fingerprint, groq, seating
├── frontend/
│   └── src/
│       ├── api/           # axios client
│       ├── components/    # Navbar, ProtectedRoute
│       ├── context/       # AuthContext
│       └── pages/         # Admin & Student views
└── Screenshots/
```

---

## 📝 Notes

- Keep the `Screenshots/` folder at the repository root for Markdown image rendering.
- Confirm Supabase credentials in backend environment variables before running.
- This project targets educational exam management.
```
