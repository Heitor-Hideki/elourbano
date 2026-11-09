from flask import Blueprint, jsonify

from src.extensions import limiter
from src.security.auth import require_admin

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/sessao")
@limiter.limit("10 per minute")
@require_admin
def verificar_sessao():
    return jsonify({"autenticado": True}), 200
