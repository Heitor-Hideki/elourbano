from dataclasses import dataclass

import requests

from src.utils.errors import ExternalServiceError, NotFoundError
from src.validators.ocorrencia_validator import normalizar_cep

VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/"
TIMEOUT_SEGUNDOS = 5


@dataclass(frozen=True)
class Endereco:
    cep: str
    logradouro: str
    bairro: str
    cidade: str
    uf: str

    def to_dict(self) -> dict:
        return {"cep": self.cep, "logradouro": self.logradouro, "bairro": self.bairro,
                "cidade": self.cidade, "uf": self.uf}


def buscar_endereco(cep: str) -> Endereco:
    # Normalizar antes de montar a URL impede path traversal/SSRF via parâmetro (só 8 dígitos passam).
    cep_valido = normalizar_cep(cep)
    try:
        resposta = requests.get(VIACEP_URL.format(cep=cep_valido), timeout=TIMEOUT_SEGUNDOS)
        resposta.raise_for_status()
        dados = resposta.json()
    except (requests.RequestException, ValueError) as error:
        raise ExternalServiceError("A busca de endereço está fora do ar.") from error

    if not isinstance(dados, dict) or dados.get("erro"):
        raise NotFoundError("CEP não encontrado.")

    return Endereco(
        cep=cep_valido,
        logradouro=_texto(dados.get("logradouro")),
        bairro=_texto(dados.get("bairro")),
        cidade=_texto(dados.get("localidade")),
        uf=_texto(dados.get("uf"))[:2],
    )


def _texto(valor) -> str:
    return valor.strip()[:120] if isinstance(valor, str) else ""
