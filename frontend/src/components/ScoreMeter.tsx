import { COR_NIVEL } from "@/lib/dominio";
import { cn, texto } from "@/lib/estilos";
import type { Prioridade } from "@/types/ocorrencia";
import { Icon } from "./Icon";
import { PrioridadePill } from "./Pills";

export function ScoreMeter({ prioridade }: { prioridade: Prioridade }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-end gap-2.5">
        <span className="text-[52px] leading-none font-light tracking-[-0.03em]">{prioridade.score}</span>
        <span className="text-[15px] leading-[1.8] text-texto-2">/ 100</span>
        <span className="ml-auto"><PrioridadePill nivel={prioridade.nivel} /></span>
      </div>
      <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prioridade.score}
        aria-label="Score de prioridade" className="h-2 overflow-hidden rounded-lg bg-borda">
        <div className="h-full rounded-lg" style={{ width: `${prioridade.score}%`, background: COR_NIVEL[prioridade.nivel] }} />
      </div>
    </div>
  );
}

type SugestaoProps = { prioridade: Prioridade; compacta?: boolean };

export function SugestaoIA({ prioridade, compacta = false }: SugestaoProps) {
  if (prioridade.urgencia_ia === null || !prioridade.justificativa_ia) return null;
  const urgencia = prioridade.urgencia_ia;

  return (
    <div className={cn("flex flex-col border border-borda bg-muted",
      compacta ? "gap-2 rounded-[14px] p-4" : "gap-3.5 rounded-card p-6")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="flex text-ia"><Icon name="sparkle" /></span>
          <span className={texto.cap}>Sugestão automática{compacta ? "" : " · IA"}</span>
        </span>
        <span className="flex items-center gap-2.5 text-sm leading-none font-medium">
          Urgência {urgencia} de 5
          <span aria-hidden="true" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={cn("h-2 w-4.5 rounded", n <= urgencia ? "bg-texto-3" : "bg-[#d2d2d0]")} />
            ))}
          </span>
        </span>
      </div>
      <p className="text-[15px] leading-[1.55]">{prioridade.justificativa_ia}</p>
      <p className={texto.dica}>Gerada automaticamente a partir da descrição. Não substitui a avaliação técnica da prefeitura.</p>
    </div>
  );
}
