from datetime import timedelta

from src.services.priorizacao import calcular_score, montar_prioridade, nivel_do_score
from src.utils.clock import agora


def test_score_soma_categoria_apoios_idade_e_ia():
    criado = agora() - timedelta(days=4)
    assert calcular_score("buraco", apoios=5, criado_em=criado, urgencia_ia=4) == 35 + 15 + 4 + 12


def test_score_respeita_tetos_e_limite_de_100():
    criado = agora() - timedelta(days=90)
    assert calcular_score("alagamento", apoios=500, criado_em=criado, urgencia_ia=5) == 100


def test_faixas_de_nivel_do_design():
    assert [nivel_do_score(s) for s in (0, 34, 35, 59, 60, 79, 80, 100)] == [
        "baixa", "baixa", "media", "media", "alta", "alta", "critica", "critica"]


def test_nivel_manual_e_preservado_no_recalculo():
    ocorrencia = {"categoria": "outros", "apoios": 0, "criado_em": agora(),
                  "prioridade": {"score": 10, "nivel": "critica", "nivel_manual": True}}
    assert montar_prioridade(ocorrencia)["nivel"] == "critica"
