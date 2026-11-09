from src.domain import STATUS_FINAIS, TRANSICOES_PERMITIDAS
from src.integrations import viacep_client
from src.integrations.gemini_client import GeminiClient
from src.repositories import ocorrencia_repository as repositorio
from src.services.priorizacao import montar_prioridade
from src.utils.clock import agora
from src.utils.errors import ConflictError, NotFoundError, UnprocessableError
from src.utils.logger import log_action
from src.validators.ocorrencia_validator import (
    AtualizacaoOcorrencia, FiltrosListagem, NovaOcorrencia,
)


class OcorrenciaService:
    def __init__(self, gemini: GeminiClient):
        self._gemini = gemini

    def criar(self, dados: NovaOcorrencia) -> dict:
        endereco = self._endereco_oficial(dados.cep)
        avaliacao = self._gemini.avaliar_urgencia(dados.categoria, dados.titulo, dados.descricao)
        momento = agora()

        ocorrencia = {
            "protocolo": self._gerar_protocolo(momento.year),
            "categoria": dados.categoria,
            "titulo": dados.titulo,
            "descricao": dados.descricao,
            "endereco": {**endereco.to_dict(), "referencia": dados.referencia},
            "status": "aberta",
            "apoios": 0,
            "historico": [{"status": "aberta", "data": momento, "observacao": None, "autor": "cidadao"}],
            "criado_em": momento,
            "atualizado_em": momento,
        }
        ocorrencia["prioridade"] = montar_prioridade(
            ocorrencia,
            urgencia_ia=avaliacao.urgencia if avaliacao else None,
            justificativa_ia=avaliacao.justificativa if avaliacao else None,
        )

        repositorio.inserir(ocorrencia)
        log_action("CRIAR_OCORRENCIA", "SUCESSO", protocolo=ocorrencia["protocolo"],
                   categoria=dados.categoria, ia="sim" if avaliacao else "nao")
        return repositorio.buscar_por_protocolo(ocorrencia["protocolo"])

    def listar(self, filtros: FiltrosListagem) -> dict:
        filtro_mongo = {}
        if filtros.status:
            filtro_mongo["status"] = {"$in": list(filtros.status)}
        if filtros.categoria:
            filtro_mongo["categoria"] = {"$in": list(filtros.categoria)}
        if filtros.bairro:
            filtro_mongo["endereco.bairro"] = filtros.bairro
        itens, total = repositorio.listar(filtro_mongo, filtros.page, filtros.limit)
        return {"itens": itens, "total": total, "page": filtros.page, "limit": filtros.limit}

    def obter(self, protocolo: str) -> dict:
        ocorrencia = repositorio.buscar_por_protocolo(protocolo)
        if ocorrencia is None:
            raise NotFoundError("Ocorrência não encontrada.")
        return ocorrencia

    def apoiar(self, protocolo: str) -> dict:
        atualizada = repositorio.incrementar_apoio(protocolo, list(STATUS_FINAIS))
        if atualizada is None:
            self.obter(protocolo)
            raise ConflictError("Ocorrências resolvidas ou canceladas não recebem apoios.")

        resultado = repositorio.atualizar_prioridade(protocolo, montar_prioridade(atualizada))
        log_action("APOIAR_OCORRENCIA", "SUCESSO", protocolo=protocolo, apoios=resultado["apoios"])
        return resultado

    def atualizar(self, protocolo: str, dados: AtualizacaoOcorrencia) -> dict:
        atual = self.obter(protocolo)
        novo_status = dados.status if dados.status and dados.status != atual["status"] else None
        if novo_status:
            self._validar_transicao(atual["status"], novo_status)

        momento = agora()
        campos = {"atualizado_em": momento}
        if novo_status:
            campos["status"] = novo_status
        if dados.nivel:
            campos["prioridade.nivel"] = dados.nivel
            campos["prioridade.nivel_manual"] = True

        evento = self._evento_historico(atual["status"], novo_status, dados, momento)
        atualizada = repositorio.atualizar(protocolo, atual["status"], campos, evento)
        if atualizada is None:
            raise ConflictError("A ocorrência foi alterada por outra pessoa. Recarregue e tente de novo.")

        resultado = repositorio.atualizar_prioridade(protocolo, montar_prioridade(atualizada))
        log_action("ATUALIZAR_OCORRENCIA", "SUCESSO", protocolo=protocolo,
                   status=resultado["status"], nivel_manual=bool(dados.nivel))
        return resultado

    def excluir(self, protocolo: str) -> None:
        if not repositorio.excluir(protocolo):
            raise NotFoundError("Ocorrência não encontrada.")
        log_action("EXCLUIR_OCORRENCIA", "SUCESSO", protocolo=protocolo)

    @staticmethod
    def consultar_cep(cep: str) -> dict:
        return viacep_client.buscar_endereco(cep).to_dict()

    @staticmethod
    def _endereco_oficial(cep: str) -> viacep_client.Endereco:
        try:
            return viacep_client.buscar_endereco(cep)
        except NotFoundError as error:
            raise UnprocessableError("CEP não encontrado.", {"cep": "Não encontramos esse CEP."}) from error

    @staticmethod
    def _gerar_protocolo(ano: int) -> str:
        return f"ZEL-{ano}-{repositorio.proximo_numero_protocolo():06d}"

    @staticmethod
    def _validar_transicao(atual: str, novo: str) -> None:
        if novo not in TRANSICOES_PERMITIDAS[atual]:
            raise ConflictError(f"Transição de status não permitida: {atual} → {novo}.")

    @staticmethod
    def _evento_historico(status_atual: str, novo_status: str | None, dados: AtualizacaoOcorrencia, momento) -> dict | None:
        if not (novo_status or dados.nivel or dados.observacao):
            return None
        return {
            "status": novo_status or status_atual,
            "data": momento,
            "observacao": dados.observacao,
            "nivel_ajustado": dados.nivel,
            "autor": "prefeitura",
        }
