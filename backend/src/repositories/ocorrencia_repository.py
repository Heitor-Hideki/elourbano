from pymongo import DESCENDING, ReturnDocument
from pymongo.errors import PyMongoError

from src.db.connection import CONTADORES, OCORRENCIAS, get_collection
from src.domain import HISTORICO_MAX
from src.utils.clock import agora
from src.utils.errors import DatabaseUnavailableError

# Nunca expomos o _id interno: o protocolo é o identificador público.
_PROJECAO_PUBLICA = {"_id": 0}


def _executar(operacao):
    try:
        return operacao()
    except PyMongoError as error:
        raise DatabaseUnavailableError() from error


def proximo_numero_protocolo() -> int:
    contador = _executar(lambda: get_collection(CONTADORES).find_one_and_update(
        {"_id": OCORRENCIAS},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    ))
    return contador["seq"]


def inserir(documento: dict) -> None:
    _executar(lambda: get_collection(OCORRENCIAS).insert_one(dict(documento)))


def buscar_por_protocolo(protocolo: str) -> dict | None:
    return _executar(lambda: get_collection(OCORRENCIAS).find_one({"protocolo": protocolo}, _PROJECAO_PUBLICA))


def listar(filtro: dict, pagina: int, limite: int) -> tuple[list[dict], int]:
    colecao = get_collection(OCORRENCIAS)

    def consultar():
        total = colecao.count_documents(filtro)
        cursor = (
            colecao.find(filtro, _PROJECAO_PUBLICA)
            .sort([("prioridade.score", DESCENDING), ("criado_em", DESCENDING)])
            .skip((pagina - 1) * limite)
            .limit(limite)
        )
        return list(cursor), total

    return _executar(consultar)


def incrementar_apoio(protocolo: str, status_bloqueados: list[str]) -> dict | None:
    return _executar(lambda: get_collection(OCORRENCIAS).find_one_and_update(
        {"protocolo": protocolo, "status": {"$nin": status_bloqueados}},
        {"$inc": {"apoios": 1}, "$set": {"atualizado_em": agora()}},
        projection=_PROJECAO_PUBLICA,
        return_document=ReturnDocument.AFTER,
    ))


def atualizar(protocolo: str, status_esperado: str, campos: dict, evento_historico: dict | None) -> dict | None:
    """Atualiza só se o status ainda for o esperado (evita sobrescrever uma transição concorrente)."""
    operacao = {"$set": campos}
    if evento_historico:
        operacao["$push"] = {"historico": {"$each": [evento_historico], "$slice": -HISTORICO_MAX}}
    return _executar(lambda: get_collection(OCORRENCIAS).find_one_and_update(
        {"protocolo": protocolo, "status": status_esperado},
        operacao,
        projection=_PROJECAO_PUBLICA,
        return_document=ReturnDocument.AFTER,
    ))


def atualizar_prioridade(protocolo: str, prioridade: dict) -> dict | None:
    return _executar(lambda: get_collection(OCORRENCIAS).find_one_and_update(
        {"protocolo": protocolo},
        {"$set": {"prioridade": prioridade}},
        projection=_PROJECAO_PUBLICA,
        return_document=ReturnDocument.AFTER,
    ))


def excluir(protocolo: str) -> bool:
    resultado = _executar(lambda: get_collection(OCORRENCIAS).delete_one({"protocolo": protocolo}))
    return resultado.deleted_count == 1
