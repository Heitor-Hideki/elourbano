import Link from "next/link";
import { CATEGORIA_LABEL, statusFinal } from "@/lib/dominio";
import { texto } from "@/lib/estilos";
import { idadeRelativa } from "@/lib/formato";
import type { Ocorrencia } from "@/types/ocorrencia";
import { BotaoApoiar } from "./BotaoApoiar";
import { Icon } from "./Icon";
import { PrioridadePill, StatusPill } from "./Pills";

type Props = {
  ocorrencia: Ocorrencia;
  onApoiado: (atualizada: Ocorrencia) => void;
};

export function OcorrenciaCard({ ocorrencia, onApoiado }: Props) {
  const { endereco, prioridade } = ocorrencia;

  return (
    <article className="flex h-full flex-col gap-3.5 rounded-card border border-borda bg-superficie p-4 hover:shadow-za-1">
      <div className="flex items-start gap-3">
        <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-verde-50 text-verde-700">
          <Icon name={ocorrencia.categoria} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={texto.cap}>{CATEGORIA_LABEL[ocorrencia.categoria]}</span>
          <h3 className="text-[17px] leading-[1.35] font-medium">
            <Link href={`/ocorrencias/${ocorrencia.protocolo}`} className="text-texto no-underline hover:text-texto hover:underline">
              {ocorrencia.titulo}
            </Link>
          </h3>
          <span className="flex items-center gap-1 text-sm leading-[1.3] text-texto-2">
            <Icon name="pin" size={16} />{endereco.bairro}, {endereco.cidade}/{endereco.uf}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusPill status={ocorrencia.status} />
        <PrioridadePill nivel={prioridade.nivel} score={prioridade.score} />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-borda pt-3">
        <span className="flex items-center gap-3 text-sm leading-[1.3] text-texto-2">
          <span className="flex items-center gap-1">
            <Icon name="apoio" size={16} /><b className="font-semibold text-texto">{ocorrencia.apoios}</b> apoios
          </span>
          <span className="flex items-center gap-1"><Icon name="clock" size={16} />{idadeRelativa(ocorrencia.criado_em)}</span>
        </span>
        <BotaoApoiar protocolo={ocorrencia.protocolo} encerrado={statusFinal(ocorrencia.status)} onApoiado={onApoiado} />
      </div>
    </article>
  );
}
