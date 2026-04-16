import pandas as pd
import os
import traceback
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_full_pipeline(input_csv_path: str = "temp_upload.csv"):
    try:
        print("Starting Full Pipeline.")

        print("Running HMM Pipeline...")
        exec(open(os.path.join(ROOT_DIR, "hmm_pipeline.py")).read())
        
        print("Running Anomaly Detection Pipeline...")
        exec(open(os.path.join(ROOT_DIR, "anomaly_detection_pipeline.py")).read())
        
        print("Running NLP Pipeline...")
        exec(open(os.path.join(ROOT_DIR, "nlp_pipeline.py")).read())
        
        print("Running Risk Band Pipeline...")
        exec(open(os.path.join(ROOT_DIR, "risk_band_pipeline.py")).read())

        print("All pipelines completed successfully!")
        return True

    except Exception as e:
        print("Pipeline Error:")
        print(traceback.format_exc())
        return False