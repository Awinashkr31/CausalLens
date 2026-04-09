# ── Stage 1: Build React frontend ──────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + built frontend ──────────────────────
FROM python:3.10-slim
WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source & data
COPY src/ ./src/
COPY data/ ./data/

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Render sets PORT env var; default to 10000
ENV PORT=10000
EXPOSE ${PORT}

CMD uvicorn src.app:app --host 0.0.0.0 --port ${PORT}
