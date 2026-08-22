FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq-dev gcc tesseract-ocr tesseract-ocr-por tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/* \
    || (echo "WARNING: Some apt packages failed, continuing..." && true)

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
