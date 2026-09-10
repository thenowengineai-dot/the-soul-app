FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies supporting both root build and subdir build
COPY requirements.txt* genesis/requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; elif [ -f genesis/requirements.txt ]; then pip install --no-cache-dir -r genesis/requirements.txt; fi

# Copy source code
COPY . .

# If copied from repository root, bring genesis contents to /app and clean up
RUN if [ -d genesis ]; then cp -rn genesis/* ./ && rm -rf backend frontend; fi

# Ensure Python can resolve modules in any directory hierarchy
ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE 8080

# Launch The Soul Genesis Engine
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
