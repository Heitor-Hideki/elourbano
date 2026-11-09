import { Icon } from "@/components/Icon";
import { NIVEL_INFO, STATUS_INFO } from "@/lib/dominio";
import { card, cn, texto } from "@/lib/estilos";
import { formatarData, formatarHora } from "@/lib/formato";
import type { EventoHistorico, Status } from "@/types/ocorrencia";

const COR_PONTO: Record<Status, string> = {
  aberta: "bg-fundo text-texto-3",
  em_analise: "bg-analise-50 text-analise",
  em_andamento: "bg-andamento-50 text-andamento",
  resolvida: "bg-verde-50 text-verde-700",
  cancelada: "bg-fundo text-texto-2",
};

export function LinhaDoTempo({ historico }: { historico: EventoHistorico[] }) {
  const eventos = [...historico].reverse();

  return (
    <section className={card}>
      <h2 className={texto.h2}>Linha do tempo</h2>
      <ol>
        {eventos.map((evento, i) => (
          <li key={`${evento.data}-${i}`}
            className="relative grid grid-cols-[28px_160px_minmax(0,1fr)] gap-4 pb-7 last:pb-0 max-md:grid-cols-[28px_minmax(0,1fr)]
              before:absolute before:top-7.5 before:bottom-0 before:left-3.25 before:w-0.5 before:bg-borda before:content-[''] last:before:hidden">
            <span className={cn("flex size-7 items-center justify-center rounded-full", COR_PONTO[evento.status])}>
              <Icon name={STATUS_INFO[evento.status].icon} size={16} strokeWidth={2} />
            </span>
            <span className="flex flex-col gap-1 text-sm leading-[1.3] font-medium">
              <time dateTime={evento.data}>{formatarData(evento.data)}</time>
              <span className={texto.dica}>{formatarHora(evento.data)}</span>
            </span>
            <div className="flex flex-col gap-2 max-md:col-start-2">
              <span className="text-base leading-[1.3] font-semibold">{STATUS_INFO[evento.status].label}</span>
              <DescricaoEvento evento={evento} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DescricaoEvento({ evento }: { evento: EventoHistorico }) {
  if (evento.autor === "cidadao") {
    return <p className={texto.dica}>Ocorrência registrada de forma anônima.</p>;
  }
  return (
    <>
      {evento.observacao ? (
        <p className="rounded-xl bg-muted px-3.5 py-3 text-[15px] leading-normal wrap-anywhere">
          <b>Prefeitura:</b> {evento.observacao}
        </p>
      ) : null}
      {evento.nivel_ajustado ? (
        <p className={texto.dica}>Prioridade ajustada manualmente para {NIVEL_INFO[evento.nivel_ajustado].label}.</p>
      ) : null}
    </>
  );
}
