# from Core.pipelines import ROOT_DIR

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent 

print(f"Root directory for pipelines: {ROOT_DIR}")