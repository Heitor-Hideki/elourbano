import type { IconName } from "@/components/Icon";
import type { Categoria, NivelPrioridade, Status } from "@/types/ocorrencia";

export const PROTOCOLO_REGEX = /^ZEL-\d{4}-\d{6}$/;

export const LIMITES = {
  tituloMin: 5,
  tituloMax: 80,
  descricaoMin: 10,
  descricaoMax: 500,
  referenciaMax: 120,
  observacaoMax: 500,
} as const;

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  buraco: "Buraco",
  iluminacao: "Iluminação apagada",
  lixo: "Lixo acumulado",
  calcada: "Calçada quebrada",
  arvore: "Árvore com risco de queda",
  alagamento: "Alagamento",
  sinalizacao: "Sinalização",
  outros: "Outro problema",
};

export const CATEGORIA_CURTA: Record<Categoria, string> = {
  buraco: "Buraco",
  iluminacao: "Iluminação",
  lixo: "Lixo",
  calcada: "Calçada",
  arvore: "Árvore",
  alagamento: "Alagamento",
  sinalizacao: "Sinalização",
  outros: "Outros",
};

type InfoStatus = { label: string; icon: IconName; css: string };

export const STATUS_INFO: Record<Status, InfoStatus> = {
  aberta: { label: "Aberta", icon: "aberta", css: "aberta" },
  em_analise: { label: "Em análise", icon: "analise", css: "analise" },
  em_andamento: { label: "Em andamento", icon: "andamento", css: "andamento" },
  resolvida: { label: "Resolvida", icon: "resolvida", css: "resolvida" },
  cancelada: { label: "Cancelada", icon: "cancelada", css: "cancelada" },
};

export const FLUXO_STATUS: Status[] = ["aberta", "em_analise", "em_andamento", "resolvida"];

export const TRANSICOES: Record<Status, Status[]> = {
  aberta: ["em_analise", "cancelada"],
  em_analise: ["em_andamento", "cancelada"],
  em_andamento: ["resolvida", "cancelada"],
  resolvida: [],
  cancelada: [],
};

export const statusFinal = (status: Status) => status === "resolvida" || status === "cancelada";

type InfoNivel = { label: string; icon: IconName };

export const NIVEL_INFO: Record<NivelPrioridade, InfoNivel> = {
  baixa: { label: "Baixa", icon: "prBaixa" },
  media: { label: "Média", icon: "prMedia" },
  alta: { label: "Alta", icon: "prAlta" },
  critica: { label: "Crítica", icon: "prCritica" },
};

export const COR_NIVEL: Record<NivelPrioridade, string> = {
  baixa: "#4F4F4D",
  media: "#1D5FA8",
  alta: "#8A5300",
  critica: "#B3261E",
};
