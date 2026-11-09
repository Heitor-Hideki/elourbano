from datetime import datetime


def serializar_ocorrencia(ocorrencia: dict) -> dict:
    return _converter(ocorrencia)


def _converter(valor):
    if isinstance(valor, datetime):
        return valor.isoformat()
    if isinstance(valor, dict):
        return {chave: _converter(item) for chave, item in valor.items() if chave != "_id"}
    if isinstance(valor, list):
        return [_converter(item) for item in valor]
    return valor
