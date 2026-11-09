import pytest

from src.utils.errors import ValidationError
from src.validators.ocorrencia_validator import (
    normalizar_cep, validar_atualizacao, validar_filtros, validar_nova_ocorrencia, validar_protocolo,
)


def test_nova_ocorrencia_valida_normaliza_cep(payload_valido):
    dados = validar_nova_ocorrencia(payload_valido)
    assert dados.cep == "05422010"
    assert dados.categoria == "buraco"


@pytest.mark.parametrize("campo, valor", [
    ("categoria", {"$ne": None}),
    ("categoria", "foguete"),
    ("titulo", "abc"),
    ("descricao", "x" * 501),
    ("cep", "123"),
    ("referencia", 42),
])
def test_nova_ocorrencia_rejeita_valores_invalidos(payload_valido, campo, valor):
    payload_valido[campo] = valor
    with pytest.raises(ValidationError) as erro:
        validar_nova_ocorrencia(payload_valido)
    assert campo in erro.value.details


def test_nova_ocorrencia_rejeita_campos_extras(payload_valido):
    payload_valido["$where"] = "sleep(1000)"
    with pytest.raises(ValidationError):
        validar_nova_ocorrencia(payload_valido)


def test_nova_ocorrencia_rejeita_corpo_que_nao_e_objeto():
    with pytest.raises(ValidationError):
        validar_nova_ocorrencia(["lista"])


def test_texto_remove_caracteres_de_controle(payload_valido):
    payload_valido["titulo"] = "  Poste\x00 apagado  "
    assert validar_nova_ocorrencia(payload_valido).titulo == "Poste apagado"


@pytest.mark.parametrize("protocolo", ["ZEL-2026-1", "../etc", "ZEL-2026-000042x", ""])
def test_protocolo_invalido(protocolo):
    with pytest.raises(ValidationError):
        validar_protocolo(protocolo)


def test_cep_com_mascara_e_aceito():
    assert normalizar_cep("01310-100") == "01310100"


def test_atualizacao_exige_ao_menos_um_campo():
    with pytest.raises(ValidationError):
        validar_atualizacao({})


def test_filtros_rejeitam_parametro_desconhecido():
    with pytest.raises(ValidationError):
        validar_filtros({"$where": "1"})


def test_filtros_limitam_tamanho_da_pagina():
    with pytest.raises(ValidationError):
        validar_filtros({"limit": "1000"})


def test_filtros_aceitam_lista_separada_por_virgula():
    filtros = validar_filtros({"status": "aberta,em_analise", "categoria": "buraco"})
    assert filtros.status == ("aberta", "em_analise")
    assert filtros.categoria == ("buraco",)


def test_filtros_rejeitam_valor_fora_da_lista():
    with pytest.raises(ValidationError):
        validar_filtros({"status": "aberta,$ne"})
