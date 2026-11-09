import type {
  AtualizacaoPayload, Endereco, FiltrosOcorrencias, NovaOcorrenciaPayload, Ocorrencia, PaginaOcorrencias,
} from "@/types/ocorrencia";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly campos: Record<string, string> = {},
  ) {
    super(message);
  }

  get semConexao() {
    return this.status === 0;
  }
}

type Opcoes = { method?: string; body?: unknown; adminToken?: string; signal?: AbortSignal };

async function requisitar<T>(caminho: string, { method = "GET", body, adminToken, signal }: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (adminToken) headers["X-Admin-Token"] = adminToken;

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: "no-store",
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  if (resposta.status === 204) return undefined as T;
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new ApiError(resposta.status, corpo.erro ?? "Erro inesperado.", corpo.campos ?? {});
  return corpo as T;
}

function querystring(filtros: FiltrosOcorrencias) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    const texto = Array.isArray(valor) ? valor.join(",") : valor === undefined ? "" : String(valor);
    if (texto) params.set(chave, texto);
  }
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

const protocoloSeguro = (protocolo: string) => encodeURIComponent(protocolo);

export const api = {
  listar: (filtros: FiltrosOcorrencias, signal?: AbortSignal) =>
    requisitar<PaginaOcorrencias>(`/api/ocorrencias${querystring(filtros)}`, { signal }),
  obter: (protocolo: string, signal?: AbortSignal) =>
    requisitar<Ocorrencia>(`/api/ocorrencias/${protocoloSeguro(protocolo)}`, { signal }),
  criar: (payload: NovaOcorrenciaPayload) =>
    requisitar<Ocorrencia>("/api/ocorrencias", { method: "POST", body: payload }),
  apoiar: (protocolo: string) =>
    requisitar<Ocorrencia>(`/api/ocorrencias/${protocoloSeguro(protocolo)}/apoios`, { method: "POST" }),
  atualizar: (protocolo: string, payload: AtualizacaoPayload, adminToken: string) =>
    requisitar<Ocorrencia>(`/api/ocorrencias/${protocoloSeguro(protocolo)}`, { method: "PUT", body: payload, adminToken }),
  excluir: (protocolo: string, adminToken: string) =>
    requisitar<void>(`/api/ocorrencias/${protocoloSeguro(protocolo)}`, { method: "DELETE", adminToken }),
  consultarCep: (cep: string, signal?: AbortSignal) =>
    requisitar<Omit<Endereco, "referencia">>(`/api/cep/${encodeURIComponent(cep)}`, { signal }),
  verificarSessao: (adminToken: string) =>
    requisitar<{ autenticado: boolean }>("/api/admin/sessao", { adminToken }),
};
