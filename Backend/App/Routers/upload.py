from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from db import get_db
from Core.pipelines import run_full_pipeline
from Crud.transaction import bulk_insert_transactions
from Crud.quarterly import bulk_insert_quarterly

router = APIRouter()

@router.post("/")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are allowed"}
    
    content = await file.read()
    with open("temp_upload.csv", "wb") as f:
        f.write(content)
    
    success = run_full_pipeline("temp_upload.csv")
    
    if success:
        bulk_insert_transactions(db)
        bulk_insert_quarterly(db)
        return {"message": "File uploaded and processed successfully", "status": "success"}
    else:
        return {"error": "Processing failed"}