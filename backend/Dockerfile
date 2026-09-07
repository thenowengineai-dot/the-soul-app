FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements supporting both root context and backend/ context
COPY requirements.txt* backend/requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; elif [ -f backend/requirements.txt ]; then pip install --no-cache-dir -r backend/requirements.txt; fi

# Copy source code
COPY . .
# If copied from root, bring backend contents to /app
RUN if [ -d backend ]; then cp -rn backend/* ./ && rm -rf backend frontend; fi

ENV PORT=8080
EXPOSE 8080

CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
