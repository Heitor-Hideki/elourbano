import { Icon } from "@/components/Icon";
import { FLUXO_STATUS, STATUS_INFO } from "@/lib/dominio";
import { card, cn, texto } from "@/lib/estilos";
import { formatarData, formatarDiaMes } from "@/lib/formato";
import type { EventoHistorico, Ocorrencia, Status } from "@/types/ocorrencia";

type Situacao = "feito" | "atual" | "futuro";

const PONTO: Record<Situacao, string> = {
  feito: "bg-verde-700 text-white",
  atual: "border-3 border-andamento bg-superficie text-andamento shadow-[0_0_0_5px_var(--color-andamento-50)]",
  futuro: "border-2 border-borda-forte bg-superficie text-borda-forte",
};

function dataDoStatus(historico: EventoHistorico[], status: Status) {
  return historico.find((evento) => evento.status === status)?.data;
}

export function ProgressoStatus({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  if (ocorrencia.status === "cancelada") return <BlocoCancelada ocorrencia={ocorrencia} />;

  const atual = FLUXO_STATUS.indexOf(ocorrencia.status);
  const progresso = (atual / (FLUXO_STATUS.length - 1)) * 75;

  return (
    <section className={card} aria-label="Progresso do status">
      <ol className="relative flex items-start">
        <span aria-hidden="true" className="absolute top-4.75 right-[12.5%] left-[12.5%] h-0.75 bg-borda" />
        <span aria-hidden="true" className="absolute top-4.75 left-[12.5%] h-0.75 bg-verde-700" style={{ width: `${progresso}%` }} />
        {FLUXO_STATUS.map((status, i) => {
          const data = dataDoStatus(ocorrencia.historico, status);
          const situacao: Situacao = i < atual || ocorrencia.status === "resolvida" ? "feito" : i === atual ? "atual" : "futuro";
          return (
            <li key={status} aria-current={situacao === "atual" ? "step" : undefined}
              className="flex flex-1 flex-col items-center gap-2 text-center">
              <span className={cn("relative z-1 flex size-10 items-center justify-center rounded-full", PONTO[situacao])}>
                <Icon name={situacao === "feito" ? "check" : STATUS_INFO[status].icon} size={20} strokeWidth={2} />
              </span>
              <span className={cn("text-sm leading-[1.25] font-medium max-md:text-xs", situacao === "atual" && "font-bold text-andamento")}>
                {STATUS_INFO[status].label}
              </span>
              <span className={texto.dica}>{data ? formatarDiaMes(data) : "—"}{situacao === "atual" ? " · atual" : ""}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function BlocoCancelada({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  const evento = [...ocorrencia.historico].reverse().find((e) => e.status === "cancelada");

  return (
    <section aria-label="Status"
      className="flex items-start gap-4 rounded-card border-2 border-dashed border-borda-forte bg-superficie p-6 text-[15px] leading-normal">
      <span className="flex text-texto-2"><Icon name="cancelada" size={28} /></span>
      <div className="flex flex-col gap-1.5">
        <b>Ocorrência cancelada{evento ? ` em ${formatarData(evento.data)}` : ""}</b>
        {evento?.observacao ? <p><b>Prefeitura:</b> {evento.observacao}</p> : null}
      </div>
    </section>
  );
}
