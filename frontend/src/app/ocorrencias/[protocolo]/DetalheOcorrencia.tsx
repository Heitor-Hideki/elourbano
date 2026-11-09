"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BotaoApoiar } from "@/components/BotaoApoiar";
import { BotaoCopiar } from "@/components/BotaoCopiar";
import { EstadoVazio } from "@/components/Estados";
import { Icon } from "@/components/Icon";
import { PrioridadePill, StatusPill } from "@/components/Pills";
import { ScoreMeter, SugestaoIA } from "@/components/ScoreMeter";
import { ApiError, api } from "@/lib/api";
import { CATEGORIA_LABEL, PROTOCOLO_REGEX, statusFinal } from "@/lib/dominio";
import { botao, card, cn, texto } from "@/lib/estilos";
import { duracaoEmDias, formatarData, mascararCep } from "@/lib/formato";
import type { Ocorrencia } from "@/types/ocorrencia";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { ProgressoStatus } from "./ProgressoStatus";

type Carga =
  | { estado: "carregando" }
  | { estado: "nao_encontrada" }
  | { estado: "erro" }
  | { estado: "pronta"; ocorrencia: Ocorrencia };

const cardLateral = cn(card, "gap-3.5 p-6");

function PaginaEstado({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-180 px-4 py-14">{children}</main>;
}

export function DetalheOcorrencia({ protocolo }: { protocolo: string }) {
  const formatoValido = PROTOCOLO_REGEX.test(protocolo);
  const [carga, setCarga] = useState<Carga>({ estado: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!formatoValido) return;
    const controle = new AbortController();
    api
      .obter(protocolo, controle.signal)
      .then((ocorrencia) => setCarga({ estado: "pronta", ocorrencia }))
      .catch((erro) => {
        if (controle.signal.aborted) return;
        setCarga({ estado: erro instanceof ApiError && erro.status === 404 ? "nao_encontrada" : "erro" });
      });
    return () => controle.abort();
  }, [protocolo, formatoValido, tentativa]);

  if (!formatoValido) {
    return (
      <PaginaEstado>
        <EstadoVazio icone="alert" tom="erro" titulo="Protocolo em formato inválido">
          Use o formato ZEL-2026-000042. O número aparece na tela de confirmação após o envio.
        </EstadoVazio>
      </PaginaEstado>
    );
  }

  if (carga.estado === "carregando") {
    return <PaginaEstado><p className={texto.dica} role="status">Carregando ocorrência…</p></PaginaEstado>;
  }

  if (carga.estado === "nao_encontrada") {
    return (
      <PaginaEstado>
        <EstadoVazio icone="search" titulo="Protocolo não encontrado"
          acoes={<Link href="/" className={botao.secundario}>Ver todas as ocorrências</Link>}>
          Não existe ocorrência com o número <span className="font-mono">{protocolo}</span>. Confira os dígitos.
          Ocorrências excluídas pela prefeitura também deixam de aparecer.
        </EstadoVazio>
      </PaginaEstado>
    );
  }

  if (carga.estado === "erro") {
    return (
      <PaginaEstado>
        <EstadoVazio icone="wifiOff" tom="erro" titulo="Não foi possível carregar a ocorrência"
          acoes={<button type="button" className={botao.primario}
            onClick={() => { setCarga({ estado: "carregando" }); setTentativa((t) => t + 1); }}>Tentar novamente</button>}>
          Verifique sua conexão e tente de novo.
        </EstadoVazio>
      </PaginaEstado>
    );
  }

  return <Conteudo ocorrencia={carga.ocorrencia} onAtualizada={(o) => setCarga({ estado: "pronta", ocorrencia: o })} />;
}

function Conteudo({ ocorrencia, onAtualizada }: { ocorrencia: Ocorrencia; onAtualizada: (o: Ocorrencia) => void }) {
  const { endereco, prioridade } = ocorrencia;
  const encerrada = statusFinal(ocorrencia.status);

  return (
    <main className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)_400px] items-start gap-8 px-16 pt-10 pb-14 max-md:grid-cols-1 max-md:px-4 max-md:pt-6 max-md:pb-10">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg tracking-[0.02em]">{ocorrencia.protocolo}</span>
            <BotaoCopiar texto={ocorrencia.protocolo} compacto />
          </div>
          <span className="flex items-center gap-2 text-verde-700">
            <Icon name={ocorrencia.categoria} /><span className={texto.cap}>{CATEGORIA_LABEL[ocorrencia.categoria]}</span>
          </span>
          <h1 className="text-[40px] leading-[1.12] font-light tracking-[-0.025em] max-md:text-[30px]">{ocorrencia.titulo}</h1>
          <div className="flex flex-wrap gap-2">
            <StatusPill status={ocorrencia.status} />
            <PrioridadePill nivel={prioridade.nivel} score={prioridade.score} />
          </div>
        </section>

        <ProgressoStatus ocorrencia={ocorrencia} />

        <section className={card}>
          <h2 className={texto.h2}>Descrição</h2>
          <p className="max-w-180 text-base leading-[1.6] whitespace-pre-line">{ocorrencia.descricao}</p>
        </section>

        <LinhaDoTempo historico={ocorrencia.historico} />
      </div>

      <aside className="flex flex-col gap-5">
        <section className={cardLateral}>
          <h2 className={texto.h2}>Prioridade</h2>
          <ScoreMeter prioridade={prioridade} />
          <dl className="grid grid-cols-2 gap-3">
            <Metrica rotulo="Apoios" valor={ocorrencia.apoios} />
            <Metrica rotulo={encerrada ? "Registrada há" : "Em aberto há"} valor={duracaoEmDias(ocorrencia.criado_em)} />
          </dl>
          <SugestaoIA prioridade={prioridade} compacta />
        </section>

        <section className={cardLateral}>
          <p className="text-[15px] leading-normal">
            {ocorrencia.status === "resolvida" ? "Problema resolvido. Obrigado por apoiar."
              : ocorrencia.status === "cancelada" ? "Ocorrências canceladas não recebem apoios."
              : "Passa por aqui também? Apoiar aumenta a prioridade."}
          </p>
          <BotaoApoiar protocolo={ocorrencia.protocolo} encerrado={encerrada} onApoiado={onAtualizada} grande />
          {ocorrencia.status === "resolvida" ? (
            <p className={texto.dica}>Voltou a acontecer? <Link href="/nova">Relate de novo</Link>.</p>
          ) : null}
        </section>

        <section className={cardLateral}>
          <h2 className={texto.h2}>Local</h2>
          <div className="flex gap-2.5">
            <span className="flex flex-none text-verde-700"><Icon name="pin" /></span>
            <div className="flex flex-col gap-1">
              <span className="text-[15px] leading-[1.4] font-medium">
                {endereco.logradouro || "Logradouro não informado"} · {endereco.bairro}
              </span>
              <span className={cn(texto.dica, "text-sm")}>{endereco.cidade}/{endereco.uf} · CEP {mascararCep(endereco.cep)}</span>
              {endereco.referencia ? <span className={cn(texto.dica, "text-sm")}>Referência: {endereco.referencia}</span> : null}
            </div>
          </div>
          <span className={texto.dica}>Registrada em {formatarData(ocorrencia.criado_em)}</span>
        </section>
      </aside>
    </main>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className={texto.dica}>{rotulo}</dt>
      <dd className="text-xl leading-none font-medium">{valor}</dd>
    </div>
  );
}
