from flask import Blueprint, jsonify

from src.db.connection import ping

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.get("/health")
def health():
    if ping():
        return jsonify({"status": "ok"}), 200
    return jsonify({"status": "indisponivel"}), 503
