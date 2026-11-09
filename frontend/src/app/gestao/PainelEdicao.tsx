"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Icon } from "@/components/Icon";
import { COR_NIVEL_PILL, PrioridadePill, StatusPill } from "@/components/Pills";
import { api } from "@/lib/api";
import { FLUXO_STATUS, LIMITES, NIVEL_INFO, STATUS_INFO, TRANSICOES } from "@/lib/dominio";
import { botao, campo, cn, texto } from "@/lib/estilos";
import { NIVEIS, STATUS, type AtualizacaoPayload, type NivelPrioridade, type Ocorrencia, type Status } from "@/types/ocorrencia";

type Props = {
  ocorrencia: Ocorrencia;
  token: string;
  onFechar: () => void;
  onSalvo: (atualizada: Ocorrencia) => void;
  onErro: (erro: unknown, acao: string) => void;
  onExcluir: () => void;
};

const legenda = "mb-1 text-[15px] leading-[1.3] font-medium";

const COR_TEXTO_NIVEL: Record<NivelPrioridade, string> = {
  baixa: "text-baixa",
  media: "text-foco",
  alta: "text-alerta",
  critica: "text-perigo",
};

function motivoBloqueio(atual: Status, destino: Status) {
  if (destino === "resolvida" && atual !== "em_andamento") return "só após “em andamento”";
  const ordemAtual = FLUXO_STATUS.indexOf(atual);
  const ordemDestino = FLUXO_STATUS.indexOf(destino);
  return ordemDestino >= 0 && ordemDestino <= ordemAtual ? "etapa já passou" : "fora do fluxo";
}

export function PainelEdicao({ ocorrencia, token, onFechar, onSalvo, onErro, onExcluir }: Props) {
  const permitidos = TRANSICOES[ocorrencia.status];
  const [status, setStatus] = useState<Status | null>(null);
  const [nivel, setNivel] = useState<NivelPrioridade>(ocorrencia.prioridade.nivel);
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fechar.current?.focus();
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === "Escape") onFechar(); };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  const payload: AtualizacaoPayload = {
    ...(status ? { status } : {}),
    ...(nivel !== ocorrencia.prioridade.nivel ? { nivel } : {}),
    ...(observacao.trim() ? { observacao: observacao.trim() } : {}),
  };
  const semMudancas = Object.keys(payload).length === 0;

  async function salvar(evento: SyntheticEvent) {
    evento.preventDefault();
    if (semMudancas) return;
    setSalvando(true);
    try {
      onSalvo(await api.atualizar(ocorrencia.protocolo, payload, token));
    } catch (erro) {
      onErro(erro, "salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div aria-hidden="true" onClick={onFechar} className="fixed inset-0 z-20 bg-texto/36" />
      <aside role="dialog" aria-modal="true" aria-labelledby="painel-titulo"
        className="fixed top-0 right-0 bottom-0 z-21 flex w-[min(460px,100%)] flex-col bg-superficie shadow-za-2">
        <div className="flex flex-col gap-2.5 border-b border-borda px-7 pt-6 pb-4.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono">{ocorrencia.protocolo}</span>
            <button ref={fechar} type="button" aria-label="Fechar painel" onClick={onFechar}
              className="inline-flex size-11 items-center justify-center rounded-full bg-fundo text-texto">
              <Icon name="x" size={20} />
            </button>
          </div>
          <h2 id="painel-titulo" className={texto.h2}>{ocorrencia.titulo}</h2>
          <div className="flex flex-wrap gap-2">
            <StatusPill status={ocorrencia.status} />
            <PrioridadePill nivel={ocorrencia.prioridade.nivel} score={ocorrencia.prioridade.score} />
          </div>
        </div>

        <form id="form-edicao" onSubmit={salvar} className="flex flex-1 flex-col gap-5.5 overflow-auto px-7 py-5.5">
          <fieldset className="flex flex-col gap-2">
            <legend className={legenda}>Novo status</legend>
            {permitidos.length === 0 ? (
              <p className={texto.dica}>Ocorrência {STATUS_INFO[ocorrencia.status].label.toLowerCase()}: não há transições possíveis.</p>
            ) : (
              STATUS.filter((s) => s !== ocorrencia.status && s !== "aberta").map((s) => {
                const habilitado = permitidos.includes(s);
                const ativo = status === s;
                return (
                  <label key={s} className={cn(
                    "flex min-h-13 items-center gap-3 rounded-[14px] px-3.5 text-[15px] leading-[1.2] font-medium",
                    ativo ? "border-2 border-verde-700 bg-verde-50" : "border-[1.5px] border-borda",
                    habilitado ? "cursor-pointer" : "cursor-not-allowed bg-muted text-borda-forte",
                  )}>
                    <input type="radio" name="status" className="size-5 accent-verde-700" checked={ativo} disabled={!habilitado}
                      onChange={() => setStatus(s)} />
                    <Icon name={STATUS_INFO[s].icon} size={20} />{STATUS_INFO[s].label}
                    {habilitado ? null : <span className="ml-auto text-xs leading-[1.3] font-normal text-texto-2">{motivoBloqueio(ocorrencia.status, s)}</span>}
                  </label>
                );
              })
            )}
            <span className={texto.dica}>Mostramos apenas as transições permitidas a partir de “{STATUS_INFO[ocorrencia.status].label}”.</span>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className={legenda}>Nível de prioridade</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {NIVEIS.map((n) => (
                <label key={n} className={cn(
                  "relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm leading-none font-medium",
                  "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-foco",
                  nivel === n ? cn("border-2 border-current", COR_NIVEL_PILL[n]) : cn("border-[1.5px] border-borda", COR_TEXTO_NIVEL[n]),
                )}>
                  <input type="radio" name="nivel" className="sr-only" checked={nivel === n} onChange={() => setNivel(n)} />
                  {nivel === n ? <Icon name="check" size={16} strokeWidth={2.25} /> : null}{NIVEL_INFO[n].label}
                </label>
              ))}
            </div>
            <span className={texto.dica}>Score atual {ocorrencia.prioridade.score}. Ajustes manuais ficam registrados no histórico.</span>
          </fieldset>

          <div className={campo.grupo}>
            <label htmlFor="observacao" className={legenda}>Observação para o histórico</label>
            <textarea id="observacao" className={cn(campo.input, "resize-y")} rows={4} maxLength={LIMITES.observacaoMax}
              value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            <div className={campo.rodape}>
              <span className={texto.dica}>Visível para quem acompanha o protocolo.</span>
              <span className={texto.dica}>{observacao.length}/{LIMITES.observacaoMax}</span>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-2.5 border-t border-borda px-7 py-4">
          <button type="button" className={cn(botao.perigoFantasma, "px-3")} onClick={onExcluir}>
            <Icon name="trash" size={18} />Excluir
          </button>
          <button type="button" className={cn(botao.fantasma, "ml-auto")} onClick={onFechar}>Cancelar</button>
          <button type="submit" form="form-edicao" className={botao.primario} disabled={salvando || semMudancas}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </aside>
    </>
  );
}
