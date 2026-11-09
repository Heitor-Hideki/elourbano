import { cn } from "@/lib/estilos";
import { NIVEL_INFO, STATUS_INFO } from "@/lib/dominio";
import type { NivelPrioridade, Status } from "@/types/ocorrencia";
import { Icon } from "./Icon";

const pill =
  "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-current pr-2.5 pl-2 text-[13px] leading-none font-medium";

const COR_STATUS: Record<Status, string> = {
  aberta: "text-texto-3",
  em_analise: "text-analise",
  em_andamento: "text-andamento",
  resolvida: "text-verde-700",
  cancelada: "border-dashed text-texto-2",
};

export const COR_NIVEL_PILL: Record<NivelPrioridade, string> = {
  baixa: "bg-fundo text-baixa",
  media: "bg-info-50 text-foco",
  alta: "bg-alerta-50 text-alerta",
  critica: "bg-perigo-50 text-perigo",
};

export function StatusPill({ status }: { status: Status }) {
  const info = STATUS_INFO[status];
  return (
    <span className={cn(pill, "bg-superficie", COR_STATUS[status])}>
      <Icon name={info.icon} size={16} strokeWidth={2} />{info.label}
    </span>
  );
}

export function PrioridadePill({ nivel, score }: { nivel: NivelPrioridade; score?: number }) {
  const info = NIVEL_INFO[nivel];
  return (
    <span className={cn(pill, COR_NIVEL_PILL[nivel])}>
      <Icon name={info.icon} size={16} />
      {info.label}{score === undefined ? "" : ` · ${score}`}
    </span>
  );
}
