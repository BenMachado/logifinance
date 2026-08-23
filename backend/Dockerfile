FROM python:3.12

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD sh -c "alembic upgrade head 2>/dev/null || alembic stamp head; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
