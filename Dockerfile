FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies for backend and genesis
COPY backend/requirements.txt ./backend_requirements.txt
COPY genesis/requirements.txt* ./genesis_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements.txt

# Copy application source
COPY . .

# Ensure Python can resolve modules
ENV PYTHONPATH=/app:/app/backend:/app/genesis
ENV PORT=8080
EXPOSE 8080

# Dynamic service entrypoint: runs genesis if K_SERVICE contains "genesis", otherwise backend
CMD sh -c 'if [ "$SERVICE_TYPE" = "genesis" ] || echo "$K_SERVICE" | grep -qi "genesis"; then \
        echo "🚀 Starting The Soul Genesis Engine (Service: $K_SERVICE)..." && \
        exec uvicorn genesis.main:app --host 0.0.0.0 --port $PORT; \
    else \
        echo "🚀 Starting The Soul Player Backend (Service: $K_SERVICE)..." && \
        cd /app/backend && \
        exec uvicorn main:app --host 0.0.0.0 --port $PORT; \
    fi'
