import copy
import tempfile
from pathlib import Path

import pytest

from src.utils import logger

# Os testes não podem escrever no backend/logs/app.log real (que é evidência do sistema rodando).
logger.LOG_DIR = Path(tempfile.mkdtemp(prefix="elourbano-test-logs-"))
logger.LOG_FILE = logger.LOG_DIR / "app.log"

from config import Settings
from src.integrations import viacep_client
from src.integrations.viacep_client import Endereco
from src.repositories import ocorrencia_repository as repositorio
from src.utils.errors import ExternalServiceError, NotFoundError

ADMIN_TOKEN = "token-de-teste-com-mais-de-24-caracteres"


class RepositorioEmMemoria:
    def __init__(self):
        self.docs: dict[str, dict] = {}
        self.seq = 0

    def proximo_numero_protocolo(self):
        self.seq += 1
        return self.seq

    def inserir(self, documento):
        self.docs[documento["protocolo"]] = copy.deepcopy(documento)

    def buscar_por_protocolo(self, protocolo):
        return copy.deepcopy(self.docs.get(protocolo))

    def listar(self, filtro, pagina, limite):
        def combina(doc):
            return all(_combina_campo(_valor(doc, campo), valor) for campo, valor in filtro.items())
        itens = sorted((d for d in self.docs.values() if combina(d)),
                       key=lambda d: d["prioridade"]["score"], reverse=True)
        inicio = (pagina - 1) * limite
        return copy.deepcopy(itens[inicio:inicio + limite]), len(itens)

    def incrementar_apoio(self, protocolo, status_bloqueados):
        doc = self.docs.get(protocolo)
        if not doc or doc["status"] in status_bloqueados:
            return None
        doc["apoios"] += 1
        return copy.deepcopy(doc)

    def atualizar(self, protocolo, status_esperado, campos, evento):
        doc = self.docs.get(protocolo)
        if not doc or doc["status"] != status_esperado:
            return None
        for campo, valor in campos.items():
            alvo, chave = _alvo(doc, campo)
            alvo[chave] = valor
        if evento:
            doc["historico"].append(evento)
        return copy.deepcopy(doc)

    def atualizar_prioridade(self, protocolo, prioridade):
        self.docs[protocolo]["prioridade"] = prioridade
        return copy.deepcopy(self.docs[protocolo])

    def excluir(self, protocolo):
        return self.docs.pop(protocolo, None) is not None


def _combina_campo(atual, esperado):
    if isinstance(esperado, dict) and "$in" in esperado:
        return atual in esperado["$in"]
    return atual == esperado


def _valor(doc, caminho):
    for parte in caminho.split("."):
        doc = doc.get(parte) if isinstance(doc, dict) else None
    return doc


def _alvo(doc, caminho):
    *partes, ultima = caminho.split(".")
    for parte in partes:
        doc = doc[parte]
    return doc, ultima


def _viacep_falso(cep):
    if cep == "00000000":
        raise NotFoundError("CEP não encontrado.")
    if cep == "99999999":
        raise ExternalServiceError("A busca de endereço está fora do ar.")
    return Endereco(cep=cep, logradouro="Rua dos Pinheiros", bairro="Pinheiros", cidade="São Paulo", uf="SP")


@pytest.fixture
def repo(monkeypatch):
    falso = RepositorioEmMemoria()
    for nome in ("proximo_numero_protocolo", "inserir", "buscar_por_protocolo", "listar",
                 "incrementar_apoio", "atualizar", "atualizar_prioridade", "excluir"):
        monkeypatch.setattr(repositorio, nome, getattr(falso, nome))
    return falso


@pytest.fixture
def client(repo, monkeypatch):
    monkeypatch.setattr(viacep_client, "buscar_endereco",
                        lambda cep: _viacep_falso(viacep_client.normalizar_cep(cep)))
    from app import create_app
    from src.extensions import limiter

    settings = Settings(mongo_uri="mongodb://unused", mongo_db_name="test", admin_token=ADMIN_TOKEN,
                        gemini_api_key="", gemini_model="x", cors_origin="http://localhost:3000", api_port=5000)
    app = create_app(settings, conectar_banco=False)
    app.config["TESTING"] = True
    limiter.enabled = False
    yield app.test_client()
    limiter.enabled = True


@pytest.fixture
def admin_headers():
    return {"X-Admin-Token": ADMIN_TOKEN}


@pytest.fixture
def payload_valido():
    return {
        "categoria": "buraco",
        "titulo": "Buraco profundo na faixa",
        "descricao": "Buraco com cerca de 1 metro logo depois do semáforo.",
        "cep": "05422-010",
        "referencia": "sentido centro",
    }
