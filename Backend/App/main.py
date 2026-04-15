from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinSight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FinSight Backend is running"}