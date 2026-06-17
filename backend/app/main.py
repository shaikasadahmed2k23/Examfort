from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, seatsmart, mockboard, leaktrace, papervault, student


app = FastAPI(title="ExamFort API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(seatsmart.router)
app.include_router(mockboard.router)
app.include_router(leaktrace.router)
app.include_router(papervault.router)
app.include_router(student.router)

@app.get("/")
def root():
    return {"status": "ExamFort API running"}


@app.get("/health")
def health():
    return {"status": "ok"}