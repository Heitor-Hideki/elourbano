from flask import Blueprint, current_app, jsonify

from src.extensions import limiter

cep_bp = Blueprint("cep", __name__, url_prefix="/api/cep")


@cep_bp.get("/<cep>")
@limiter.limit("30 per minute")
def consultar(cep: str):
    endereco = current_app.extensions["ocorrencia_service"].consultar_cep(cep)
    return jsonify(endereco), 200
