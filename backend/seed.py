"""Popula o banco com ocorrências FICTÍCIAS para demonstração (CEPs públicos de São Paulo)."""
from config import load_settings
from src.db.connection import init_db
from src.integrations.gemini_client import GeminiClient
from src.services.ocorrencia_service import OcorrenciaService
from src.utils.errors import AppError
from src.utils.logger import configure_logging, log_action
from src.validators.ocorrencia_validator import AtualizacaoOcorrencia, validar_nova_ocorrencia

EXEMPLOS = [
    ("arvore", "Árvore inclinada sobre o ponto de ônibus", "Árvore grande inclinada sobre o abrigo do ônibus, com raízes expostas depois da chuva.", "04101300", 12, "em_analise"),
    ("alagamento", "Bueiro entupido alaga a esquina a cada chuva", "Qualquer chuva forte deixa a esquina alagada e os pedestres precisam andar pela rua.", "04210000", 9, None),
    ("buraco", "Buraco profundo na faixa da direita", "Buraco com cerca de 1 metro na faixa da direita, logo depois do semáforo.", "05422010", 7, "em_andamento"),
    ("iluminacao", "Três postes apagados na praça", "Os três postes do lado da quadra estão apagados há uma semana; a praça fica escura.", "03104002", 5, None),
    ("calcada", "Calçada quebrada em frente à escola", "Placas de concreto soltas na calçada da escola; crianças tropeçam na saída.", "02012000", 4, "em_analise"),
    ("lixo", "Lixo acumulado em terreno baldio", "Sacos de lixo e entulho acumulados há dias no terreno da esquina.", "05508000", 2, None),
    ("sinalizacao", "Placa de PARE caída no cruzamento", "A placa de PARE do cruzamento foi derrubada e os carros não param mais.", "03310000", 1, "resolvida"),
    ("outros", "Banco da praça quebrado", "Um dos bancos da praça está com o assento quebrado e pregos expostos.", "01310100", 0, None),
]

CAMINHO_ATE = {
    "em_analise": ["em_analise"],
    "em_andamento": ["em_analise", "em_andamento"],
    "resolvida": ["em_analise", "em_andamento", "resolvida"],
}


def main() -> None:
    configure_logging()
    settings = load_settings()
    init_db(settings.mongo_uri, settings.mongo_db_name)
    servico = OcorrenciaService(GeminiClient(api_key="", model=settings.gemini_model))

    for categoria, titulo, descricao, cep, apoios, status_final in EXEMPLOS:
        try:
            criada = servico.criar(validar_nova_ocorrencia(
                {"categoria": categoria, "titulo": titulo, "descricao": descricao, "cep": cep}))
        except AppError as erro:
            print(f"Ignorado ({cep}): {erro.public_message}")
            continue
        protocolo = criada["protocolo"]
        for _ in range(apoios):
            servico.apoiar(protocolo)
        for status in CAMINHO_ATE.get(status_final, []):
            servico.atualizar(protocolo, AtualizacaoOcorrencia(status, None, f"Atualização de demonstração: {status}."))
        print(f"Criada {protocolo} · {titulo}")

    log_action("SEED", "SUCESSO", quantidade=len(EXEMPLOS))


if __name__ == "__main__":
    main()
