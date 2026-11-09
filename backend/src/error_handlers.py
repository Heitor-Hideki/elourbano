from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from src.utils.errors import AppError
from src.utils.logger import log_action, log_exception

MENSAGENS_HTTP = {
    400: "Requisição inválida.",
    404: "Recurso não encontrado.",
    405: "Método não permitido para este recurso.",
    413: "Corpo da requisição muito grande.",
    429: "Muitas requisições. Aguarde um pouco e tente de novo.",
}


def _erro(status: int, mensagem: str, campos: dict | None = None):
    corpo = {"erro": mensagem}
    if campos:
        corpo["campos"] = campos
    return jsonify(corpo), status


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(AppError)
    def tratar_erro_da_aplicacao(error: AppError):
        log_action(_acao(), "FALHA", status=error.status_code, tipo=type(error).__name__)
        if error.__cause__ is not None and error.status_code >= 500:
            log_exception(_acao(), error.__cause__)
        return _erro(error.status_code, error.public_message, error.details)

    @app.errorhandler(HTTPException)
    def tratar_erro_http(error: HTTPException):
        status = error.code or 500
        log_action(_acao(), "FALHA", status=status)
        return _erro(status, MENSAGENS_HTTP.get(status, "Requisição não pôde ser atendida."))

    @app.errorhandler(Exception)
    def tratar_erro_inesperado(error: Exception):
        # Detalhes (stack trace) vão só para o arquivo de log; o cliente recebe mensagem genérica.
        log_exception(_acao(), error)
        return _erro(500, "Erro interno. Tente novamente mais tarde.")


def _acao() -> str:
    return f"{request.method} {request.url_rule.rule if request.url_rule else 'rota_desconhecida'}"
