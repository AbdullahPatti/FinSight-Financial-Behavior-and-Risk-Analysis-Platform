import pandas as pd
import os
import traceback
import sys
import runpy
from pathlib import Path
from Routers.auth import get_current_user
from App.db import get_db
from App.Models.users import User
from sqlalchemy.orm import Session
from fastapi import Depends

ROOT_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT_DIR.parent / "Models"
DATA_DIR = ROOT_DIR.parent / "Data"

def run_full_pipeline(input_csv_path: str = "temp_upload.csv",db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    try:
        
        print(f"Starting Full Pipeline with input: {input_csv_path}")
        
        # Ensure directories exist
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        userFolderData = DATA_DIR / f"user_{current_user.id}"
        userFolderData.mkdir(parents=True, exist_ok=True)

        userFolderModels = MODELS_DIR / f"user_{current_user.id}"
        userFolderModels.mkdir(parents=True, exist_ok=True)

        # Check if input file exists
        if not os.path.exists(input_csv_path):
            raise FileNotFoundError(f"Input file not found: {input_csv_path}")
        
        # Validate CSV format
        df = pd.read_csv(input_csv_path)
        print(f"Loaded CSV with shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")

        os.environ['INPUT_CSV'] = input_csv_path
        os.environ['HMM_OUTPUT'] = str(userFolderData / 'temp_hmm.csv')
        os.environ['QUARTERLY_OUTPUT'] = str(userFolderData / 'temp_quarterly.csv')
        os.environ['MODELS_DIR'] = str(userFolderModels)
        
        print("Running HMM Pipeline...")
        try:
            runpy.run_path(os.path.join(ROOT_DIR, "Pipelines", "hmm_pipeline.py"), run_name="__main__")
            print("HMM Pipeline completed successfully!")
        except Exception as hmm_error:
            print(f"HMM Pipeline Error: {str(hmm_error)}")
            raise
        
        os.environ['ANOMALY_INPUT'] = str(userFolderData / 'temp_hmm.csv')
        os.environ['ANOMALY_OUTPUT'] = str(userFolderData / 'temp_hmm.csv')
        print("Running Anomaly Detection Pipeline...")
        try:
            runpy.run_path(os.path.join(ROOT_DIR, "Pipelines", "anomaly_detection_pipeline.py"), run_name="__main__")
            print("Anomaly Detection Pipeline completed successfully!")
        except Exception as anomaly_error:
            print(f"Anomaly Detection Pipeline Error: {str(anomaly_error)}")
            raise
        
        os.environ['NLP_INPUT'] = str(userFolderData / 'temp_hmm.csv')
        os.environ['NLP_OUTPUT'] = str(userFolderData / 'temp_nlp.csv')
        print("Running NLP Pipeline...")
        try:
            runpy.run_path(os.path.join(ROOT_DIR, "Pipelines", "nlp_pipeline.py"), run_name="__main__")
            print("NLP Pipeline completed successfully!")
        except Exception as nlp_error:
            print(f"NLP Pipeline Error: {str(nlp_error)}")
            raise
        
        os.environ['RISK_INPUT'] = str(userFolderData / 'temp_quarterly.csv')
        os.environ['RISK_OUTPUT'] = str(userFolderData / 'temp_risk.csv')
        print("Running Risk Band Pipeline...")
        try:
            runpy.run_path(os.path.join(ROOT_DIR, "Pipelines", "risk_band_pipeline.py"), run_name="__main__")
            print("Risk Band Pipeline completed successfully!")
        except Exception as risk_error:
            print(f"Risk Band Pipeline Error: {str(risk_error)}")
            raise

        print("All pipelines completed successfully!")
        return True

    except Exception as e:
        print("\n" + "="*50)
        print("PIPELINE EXECUTION FAILED")
        print("="*50)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("\nFull Traceback:")
        print(traceback.format_exc())
        print("="*50 + "\n")
        return False
