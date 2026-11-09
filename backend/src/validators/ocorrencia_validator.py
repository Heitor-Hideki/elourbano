import re
from dataclasses import dataclass

from src.domain import (
    BAIRRO_FILTRO_MAX, CATEGORIAS, CEP_REGEX, DESCRICAO_MAX, DESCRICAO_MIN, LIMITE_PAGINA_MAX,
    NIVEIS_PRIORIDADE, OBSERVACAO_MAX, PROTOCOLO_REGEX, REFERENCIA_MAX, STATUS, TITULO_MAX, TITULO_MIN,
)
from src.utils.errors import ValidationError

_PROTOCOLO = re.compile(PROTOCOLO_REGEX)
_CEP = re.compile(CEP_REGEX)
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

CAMPOS_CRIACAO = {"categoria", "titulo", "descricao", "cep", "referencia"}
CAMPOS_ATUALIZACAO = {"status", "nivel", "observacao"}
FILTROS_LISTAGEM = {"status", "categoria", "bairro", "page", "limit"}


@dataclass(frozen=True)
class NovaOcorrencia:
    categoria: str
    titulo: str
    descricao: str
    cep: str
    referencia: str | None


@dataclass(frozen=True)
class AtualizacaoOcorrencia:
    status: str | None
    nivel: str | None
    observacao: str | None


@dataclass(frozen=True)
class FiltrosListagem:
    status: tuple[str, ...]
    categoria: tuple[str, ...]
    bairro: str | None
    page: int
    limit: int


def validar_protocolo(valor: str) -> str:
    if not isinstance(valor, str) or not _PROTOCOLO.fullmatch(valor):
        raise ValidationError("Protocolo em formato inválido.")
    return valor


def normalizar_cep(valor) -> str:
    cep = re.sub(r"\D", "", valor) if isinstance(valor, str) else ""
    if not _CEP.fullmatch(cep):
        raise ValidationError("CEP deve conter 8 dígitos.", {"cep": "Informe os 8 números do CEP."})
    return cep


def validar_nova_ocorrencia(payload) -> NovaOcorrencia:
    dados = _exigir_objeto(payload, CAMPOS_CRIACAO)
    erros: dict[str, str] = {}

    categoria = _enum(dados.get("categoria"), CATEGORIAS, "categoria", erros)
    titulo = _texto(dados.get("titulo"), "titulo", TITULO_MIN, TITULO_MAX, erros)
    descricao = _texto(dados.get("descricao"), "descricao", DESCRICAO_MIN, DESCRICAO_MAX, erros)
    referencia = _texto_opcional(dados.get("referencia"), "referencia", REFERENCIA_MAX, erros)
    cep = _capturar(lambda: normalizar_cep(dados.get("cep")), "cep", erros)

    if erros:
        raise ValidationError("Dados inválidos.", erros)
    return NovaOcorrencia(categoria, titulo, descricao, cep, referencia)


def validar_atualizacao(payload) -> AtualizacaoOcorrencia:
    dados = _exigir_objeto(payload, CAMPOS_ATUALIZACAO)
    erros: dict[str, str] = {}

    status = _enum(dados["status"], STATUS, "status", erros) if "status" in dados else None
    nivel = _enum(dados["nivel"], NIVEIS_PRIORIDADE, "nivel", erros) if "nivel" in dados else None
    observacao = _texto_opcional(dados.get("observacao"), "observacao", OBSERVACAO_MAX, erros)

    if not erros and status is None and nivel is None and observacao is None:
        erros["_"] = "Informe ao menos um campo: status, nivel ou observacao."
    if erros:
        raise ValidationError("Dados inválidos.", erros)
    return AtualizacaoOcorrencia(status, nivel, observacao)


def validar_filtros(args) -> FiltrosListagem:
    desconhecidos = set(args.keys()) - FILTROS_LISTAGEM
    if desconhecidos:
        raise ValidationError("Parâmetro de consulta não suportado.")
    erros: dict[str, str] = {}

    status = _lista_enum(args.get("status"), STATUS, "status", erros)
    categoria = _lista_enum(args.get("categoria"), CATEGORIAS, "categoria", erros)
    bairro = _texto_opcional(args.get("bairro"), "bairro", BAIRRO_FILTRO_MAX, erros)
    page = _inteiro(args.get("page", "1"), "page", 1, 10_000, erros)
    limit = _inteiro(args.get("limit", "12"), "limit", 1, LIMITE_PAGINA_MAX, erros)

    if erros:
        raise ValidationError("Filtros inválidos.", erros)
    return FiltrosListagem(status, categoria, bairro, page, limit)


def _exigir_objeto(payload, campos_permitidos: set[str]) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("O corpo da requisição deve ser um objeto JSON.")
    desconhecidos = set(payload.keys()) - campos_permitidos
    if desconhecidos:
        raise ValidationError("Campos não permitidos no corpo da requisição.")
    return payload


def _enum(valor, opcoes, campo: str, erros: dict) -> str | None:
    # Exigir str bloqueia operadores do Mongo injetados como objeto, ex.: {"$ne": null}.
    if isinstance(valor, str) and valor in opcoes:
        return valor
    erros[campo] = "Valor não permitido."
    return None


def _lista_enum(valor, opcoes, campo: str, erros: dict) -> tuple[str, ...]:
    if not valor:
        return ()
    itens = tuple(dict.fromkeys(item.strip() for item in str(valor).split(",")))
    if any(item not in opcoes for item in itens):
        erros[campo] = "Valor não permitido."
        return ()
    return itens


def _texto(valor, campo: str, minimo: int, maximo: int, erros: dict) -> str | None:
    if not isinstance(valor, str):
        erros[campo] = "Campo obrigatório."
        return None
    texto = _limpar(valor)
    if not minimo <= len(texto) <= maximo:
        erros[campo] = f"Use entre {minimo} e {maximo} caracteres."
        return None
    return texto


def _texto_opcional(valor, campo: str, maximo: int, erros: dict) -> str | None:
    if valor is None or valor == "":
        return None
    if not isinstance(valor, str):
        erros[campo] = "Deve ser texto."
        return None
    texto = _limpar(valor)
    if len(texto) > maximo:
        erros[campo] = f"Use no máximo {maximo} caracteres."
        return None
    return texto or None


def _inteiro(valor, campo: str, minimo: int, maximo: int, erros: dict) -> int:
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        erros[campo] = "Deve ser um número inteiro."
        return minimo
    if not minimo <= numero <= maximo:
        erros[campo] = f"Deve estar entre {minimo} e {maximo}."
    return numero


def _capturar(funcao, campo: str, erros: dict):
    try:
        return funcao()
    except ValidationError as error:
        erros[campo] = error.details.get(campo, error.public_message)
        return None


def _limpar(texto: str) -> str:
    return _CONTROL_CHARS.sub("", texto).strip()
