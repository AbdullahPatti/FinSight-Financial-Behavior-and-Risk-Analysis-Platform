from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import engine, Base
from Routers import auth, upload, dashboard, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinSight API",
    description="Financial Behavior and Risk Analysis Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])

@app.get("/")
def root():
    return {
        "message": "FinSight Backend is running successfully",
        "status": "active"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}