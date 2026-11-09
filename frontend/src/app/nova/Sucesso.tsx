"use client";

import Link from "next/link";
import { BotaoCopiar } from "@/components/BotaoCopiar";
import { Icon } from "@/components/Icon";
import { StatusPill } from "@/components/Pills";
import { ScoreMeter, SugestaoIA } from "@/components/ScoreMeter";
import { botao, card, cn, texto } from "@/lib/estilos";
import type { Ocorrencia } from "@/types/ocorrencia";

export function Sucesso({ ocorrencia, onNova }: { ocorrencia: Ocorrencia; onNova: () => void }) {
  const { endereco } = ocorrencia;

  return (
    <main className="mx-auto flex max-w-260 flex-col gap-8 px-4 py-14">
      <div role="status" className="flex items-center gap-5">
        <span className="flex size-16 flex-none items-center justify-center rounded-full bg-verde-700 text-white">
          <Icon name="check" size={32} strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="text-[40px] leading-[1.1] font-light tracking-[-0.025em] max-md:text-[30px]">Ocorrência registrada</h1>
          <p className="mt-1.5 text-[17px] leading-normal text-texto-3">
            {ocorrencia.titulo} · {endereco.bairro}, {endereco.cidade}/{endereco.uf}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <section className={cn(card, "justify-between border-2 border-texto")}>
          <div className="flex flex-col gap-3">
            <span className={texto.cap}>Seu protocolo</span>
            <span className="font-mono text-[34px] tracking-[0.02em] wrap-anywhere max-md:text-[26px]">{ocorrencia.protocolo}</span>
          </div>
          <BotaoCopiar texto={ocorrencia.protocolo} />
          <p className="flex gap-2.5 rounded-xl bg-alerta-50 p-3.5 text-sm leading-normal">
            <span className="flex flex-none text-alerta"><Icon name="info" /></span>
            Guarde este número. Como o relato é anônimo, ele é o único jeito de acompanhar a resposta da prefeitura.
          </p>
        </section>

        <div className="flex flex-col gap-5">
          <section className={card}>
            <div className="flex items-center justify-between">
              <span className={texto.cap}>Prioridade calculada</span><StatusPill status={ocorrencia.status} />
            </div>
            <ScoreMeter prioridade={ocorrencia.prioridade} />
          </section>
          <SugestaoIA prioridade={ocorrencia.prioridade} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/ocorrencias/${ocorrencia.protocolo}`} className={cn(botao.primario, botao.grande)}>
          Acompanhar ocorrência<Icon name="arrowRight" size={20} />
        </Link>
        <button type="button" className={cn(botao.secundario, botao.grande)} onClick={onNova}>Relatar outro problema</button>
        <Link href="/" className="ml-auto flex min-h-11 items-center text-[15px] leading-none font-medium max-md:ml-0">
          Ver todas as ocorrências
        </Link>
      </div>
    </main>
  );
}
