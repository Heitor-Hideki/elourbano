export const CATEGORIAS = [
  "buraco", "iluminacao", "lixo", "calcada", "arvore", "alagamento", "sinalizacao", "outros",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const STATUS = ["aberta", "em_analise", "em_andamento", "resolvida", "cancelada"] as const;
export type Status = (typeof STATUS)[number];

export const NIVEIS = ["baixa", "media", "alta", "critica"] as const;
export type NivelPrioridade = (typeof NIVEIS)[number];

export type Endereco = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string | null;
};

export type Prioridade = {
  score: number;
  nivel: NivelPrioridade;
  nivel_manual: boolean;
  urgencia_ia: number | null;
  justificativa_ia: string | null;
};

export type EventoHistorico = {
  status: Status;
  data: string;
  observacao: string | null;
  nivel_ajustado?: NivelPrioridade | null;
  autor: "cidadao" | "prefeitura";
};

export type Ocorrencia = {
  protocolo: string;
  categoria: Categoria;
  titulo: string;
  descricao: string;
  endereco: Endereco;
  status: Status;
  prioridade: Prioridade;
  apoios: number;
  historico: EventoHistorico[];
  criado_em: string;
  atualizado_em: string;
};

export type PaginaOcorrencias = {
  itens: Ocorrencia[];
  total: number;
  page: number;
  limit: number;
};

export type NovaOcorrenciaPayload = {
  categoria: Categoria;
  titulo: string;
  descricao: string;
  cep: string;
  referencia?: string;
};

export type AtualizacaoPayload = {
  status?: Status;
  nivel?: NivelPrioridade;
  observacao?: string;
};

export type FiltrosOcorrencias = {
  status?: Status[];
  categoria?: Categoria[];
  bairro?: string;
  page?: number;
  limit?: number;
};
