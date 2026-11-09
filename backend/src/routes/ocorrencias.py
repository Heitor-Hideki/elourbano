from flask import Blueprint, current_app, jsonify, request, url_for

from src.extensions import limiter
from src.security.auth import require_admin
from src.serializers import serializar_ocorrencia
from src.utils.errors import UnsupportedMediaTypeError
from src.validators.ocorrencia_validator import (
    validar_atualizacao, validar_filtros, validar_nova_ocorrencia, validar_protocolo,
)

ocorrencias_bp = Blueprint("ocorrencias", __name__, url_prefix="/api/ocorrencias")


def _service():
    return current_app.extensions["ocorrencia_service"]


def _corpo_json():
    if not request.is_json:
        raise UnsupportedMediaTypeError()
    return request.get_json(silent=True)


@ocorrencias_bp.get("")
def listar():
    resultado = _service().listar(validar_filtros(request.args))
    resultado["itens"] = [serializar_ocorrencia(item) for item in resultado["itens"]]
    return jsonify(resultado), 200


@ocorrencias_bp.get("/<protocolo>")
def obter(protocolo: str):
    ocorrencia = _service().obter(validar_protocolo(protocolo))
    return jsonify(serializar_ocorrencia(ocorrencia)), 200


@ocorrencias_bp.post("")
@limiter.limit("5 per minute; 30 per hour")
def criar():
    ocorrencia = _service().criar(validar_nova_ocorrencia(_corpo_json()))
    resposta = jsonify(serializar_ocorrencia(ocorrencia))
    resposta.headers["Location"] = url_for("ocorrencias.obter", protocolo=ocorrencia["protocolo"])
    return resposta, 201


@ocorrencias_bp.post("/<protocolo>/apoios")
@limiter.limit("20 per minute")
def apoiar(protocolo: str):
    ocorrencia = _service().apoiar(validar_protocolo(protocolo))
    return jsonify(serializar_ocorrencia(ocorrencia)), 200


@ocorrencias_bp.put("/<protocolo>")
@require_admin
def atualizar(protocolo: str):
    protocolo_valido = validar_protocolo(protocolo)
    ocorrencia = _service().atualizar(protocolo_valido, validar_atualizacao(_corpo_json()))
    return jsonify(serializar_ocorrencia(ocorrencia)), 200


@ocorrencias_bp.delete("/<protocolo>")
@require_admin
def excluir(protocolo: str):
    _service().excluir(validar_protocolo(protocolo))
    return "", 204
