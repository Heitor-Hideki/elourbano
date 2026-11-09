CATEGORIAS = ("buraco", "iluminacao", "lixo", "calcada", "arvore", "alagamento", "sinalizacao", "outros")

STATUS = ("aberta", "em_analise", "em_andamento", "resolvida", "cancelada")
STATUS_FINAIS = frozenset({"resolvida", "cancelada"})

TRANSICOES_PERMITIDAS = {
    "aberta": {"em_analise", "cancelada"},
    "em_analise": {"em_andamento", "cancelada"},
    "em_andamento": {"resolvida", "cancelada"},
    "resolvida": set(),
    "cancelada": set(),
}

NIVEIS_PRIORIDADE = ("baixa", "media", "alta", "critica")

PROTOCOLO_REGEX = r"^ZEL-\d{4}-\d{6}$"
CEP_REGEX = r"^\d{8}$"

TITULO_MIN, TITULO_MAX = 5, 80
DESCRICAO_MIN, DESCRICAO_MAX = 10, 500
REFERENCIA_MAX = 120
OBSERVACAO_MAX = 500
BAIRRO_FILTRO_MAX = 60
LIMITE_PAGINA_MAX = 50
HISTORICO_MAX = 50
