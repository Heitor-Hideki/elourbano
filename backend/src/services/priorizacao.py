from datetime import datetime

from src.utils.clock import agora

PESO_CATEGORIA = {
    "alagamento": 40,
    "arvore": 38,
    "buraco": 35,
    "iluminacao": 30,
    "calcada": 25,
    "sinalizacao": 25,
    "lixo": 20,
    "outros": 10,
}

PONTOS_POR_APOIO, TETO_APOIOS = 3, 30
TETO_IDADE_DIAS = 15
PONTOS_POR_URGENCIA = 3

# Faixas definidas no guia de estilo do design.
FAIXAS_NIVEL = ((80, "critica"), (60, "alta"), (35, "media"), (0, "baixa"))


def calcular_score(categoria: str, apoios: int, criado_em: datetime, urgencia_ia: int | None) -> int:
    pontos_categoria = PESO_CATEGORIA.get(categoria, PESO_CATEGORIA["outros"])
    pontos_apoio = min(apoios * PONTOS_POR_APOIO, TETO_APOIOS)
    pontos_idade = min(max((agora() - criado_em).days, 0), TETO_IDADE_DIAS)
    pontos_ia = (urgencia_ia or 0) * PONTOS_POR_URGENCIA
    return min(pontos_categoria + pontos_apoio + pontos_idade + pontos_ia, 100)


def nivel_do_score(score: int) -> str:
    return next(nivel for limite, nivel in FAIXAS_NIVEL if score >= limite)


def montar_prioridade(ocorrencia: dict, urgencia_ia: int | None = None, justificativa_ia: str | None = None) -> dict:
    anterior = ocorrencia.get("prioridade", {})
    urgencia = urgencia_ia if urgencia_ia is not None else anterior.get("urgencia_ia")
    score = calcular_score(ocorrencia["categoria"], ocorrencia.get("apoios", 0), ocorrencia["criado_em"], urgencia)
    nivel_manual = anterior.get("nivel_manual", False)

    return {
        "score": score,
        "nivel": anterior["nivel"] if nivel_manual else nivel_do_score(score),
        "nivel_manual": nivel_manual,
        "urgencia_ia": urgencia,
        "justificativa_ia": justificativa_ia if justificativa_ia is not None else anterior.get("justificativa_ia"),
    }
