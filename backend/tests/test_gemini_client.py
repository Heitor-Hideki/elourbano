import json

import requests

from src.integrations import gemini_client
from src.integrations.gemini_client import GeminiClient


class RespostaFalsa:
    def __init__(self, status: int, corpo):
        self.status_code = status
        self.ok = status < 400
        self._corpo = corpo
        self.text = json.dumps(corpo) if not isinstance(corpo, str) else corpo

    def json(self):
        if isinstance(self._corpo, str):
            raise ValueError("não é JSON")
        return self._corpo


def _sucesso(urgencia=4):
    texto = json.dumps({"urgencia": urgencia, "justificativa": "Risco a pedestres."})
    return {"candidates": [{"content": {"parts": [{"text": texto}]}}],
            "usageMetadata": {"promptTokenCount": 120, "candidatesTokenCount": 20}}


def _cliente(monkeypatch, resposta, registros):
    monkeypatch.setattr(gemini_client.requests, "post", lambda *a, **k: resposta)
    monkeypatch.setattr(gemini_client, "log_action", lambda acao, resultado, **ctx: registros.append((resultado, ctx)))
    return GeminiClient(api_key="chave-falsa", model="gemini-teste")


def test_sucesso_registra_urgencia_tokens_e_justificativa(monkeypatch):
    registros = []
    avaliacao = _cliente(monkeypatch, RespostaFalsa(200, _sucesso()), registros).avaliar_urgencia("buraco", "t", "d")
    assert avaliacao.urgencia == 4
    resultado, ctx = registros[-1]
    assert resultado == "SUCESSO"
    assert ctx["tokens_entrada"] == 120
    assert "Risco a pedestres." in ctx["justificativa"]


def test_erro_http_registra_mensagem_do_google(monkeypatch):
    registros = []
    erro = {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "Quota exceeded"}}
    assert _cliente(monkeypatch, RespostaFalsa(429, erro), registros).avaliar_urgencia("buraco", "t", "d") is None
    resultado, ctx = registros[-1]
    assert resultado == "FALHA"
    assert ctx["http"] == 429
    assert "RESOURCE_EXHAUSTED: Quota exceeded" in ctx["erro_google"]


def test_resposta_malformada_registra_corpo_resumido(monkeypatch):
    registros = []
    corpo = {"candidates": [{"content": {"parts": [{"text": '{"urgencia": 9}'}]}}]}
    assert _cliente(monkeypatch, RespostaFalsa(200, corpo), registros).avaliar_urgencia("buraco", "t", "d") is None
    assert registros[-1][0] == "FALHA"
    assert "resposta" in registros[-1][1]


def test_falha_de_rede_nao_quebra(monkeypatch):
    registros = []

    def explode(*a, **k):
        raise requests.Timeout()

    monkeypatch.setattr(gemini_client.requests, "post", explode)
    monkeypatch.setattr(gemini_client, "log_action", lambda acao, resultado, **ctx: registros.append((resultado, ctx)))
    assert GeminiClient("chave", "m").avaliar_urgencia("buraco", "t", "d") is None
    resultado, ctx = registros[-1]
    assert resultado == "FALHA"
    assert ctx["motivo"] == "Timeout"
    assert "duracao_s" in ctx


def test_chave_nunca_aparece_no_log(monkeypatch):
    registros = []
    _cliente(monkeypatch, RespostaFalsa(200, _sucesso()), registros).avaliar_urgencia("buraco", "t", "d")
    assert "chave-falsa" not in str(registros)
