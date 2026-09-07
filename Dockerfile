FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies from backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ ./

# Cloud Run dynamically injects $PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

# Launch FastAPI application via Uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
