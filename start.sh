#!/usr/bin/env bash
# Sobe o banco, a API e o front. Ctrl+C encerra a API e o front.
cd "$(dirname "$0")"

docker compose --env-file backend/.env up -d

(cd backend && .venv/bin/python app.py) &
API_PID=$!
trap 'kill $API_PID' EXIT

cd frontend && npm run dev
