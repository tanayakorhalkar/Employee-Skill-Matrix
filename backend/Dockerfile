FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2 and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run migrations and start FastAPI server
CMD ["sh", "-c", "alembic upgrade head && python -m app.database.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
