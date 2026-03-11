# Causal Impact of Interventions Pipeline

A reproducible pipeline for estimating causal effects using classical and modern machine learning estimators. This project provides a complete ecosystem: python source components (`src/`), Jupyter notebooks for interactive analysis (`notebooks/`), a combined demonstration script (`causal_demo.py`), and a FastAPI dashboard.

## Setup

1. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

2. Run the demo script (Backend logic check):
```bash
python causal_demo.py
```

3. Run the Backend Server (FastAPI):
```bash
# Keep this terminal running
uvicorn src.app:app --reload
```

4. Run the Frontend App (React + Vite):
```bash
# Open a NEW terminal
cd frontend
npm install
npm run dev
```

## Structure
- `data/`: Raw and processed datasets.
- `notebooks/`: Interactive method explorations.
- `src/`: Core implementation containing data IO, preprocessing, estimators, diagnostics, and reporting modules.
- `report/`: Output figures and final thesis material.
