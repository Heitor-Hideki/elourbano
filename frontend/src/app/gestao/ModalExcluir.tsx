"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";
import { botao, campo, cn, texto } from "@/lib/estilos";
import type { Ocorrencia } from "@/types/ocorrencia";

type Props = {
  ocorrencia: Ocorrencia;
  token: string;
  onCancelar: () => void;
  onExcluido: (protocolo: string) => void;
  onErro: (erro: unknown, acao: string) => void;
};

export function ModalExcluir({ ocorrencia, token, onCancelar, onExcluido, onErro }: Props) {
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const confere = confirmacao.trim().toUpperCase() === ocorrencia.protocolo;

  useEffect(() => {
    entrada.current?.focus();
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => { if (e.key === "Escape") onCancelar(); };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onCancelar]);

  async function excluir() {
    setExcluindo(true);
    try {
      await api.excluir(ocorrencia.protocolo, token);
      onExcluido(ocorrencia.protocolo);
    } catch (erro) {
      onErro(erro, "excluir");
      setExcluindo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-texto/45 p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="excluir-titulo" aria-describedby="excluir-texto"
        className="flex w-[min(520px,100%)] flex-col gap-4 rounded-modal bg-superficie p-8 text-[15px] leading-normal shadow-za-3">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-perigo-50 text-perigo">
          <Icon name="trash" size={28} />
        </span>
        <h2 id="excluir-titulo" className={texto.h2}>Excluir ocorrência?</h2>
        <p id="excluir-texto">
          Esta ação não pode ser desfeita. O protocolo, o histórico e os apoios serão apagados, e quem acompanha{" "}
          <span className="font-mono">{ocorrencia.protocolo}</span> verá “não encontrado”.
        </p>
        <p className="flex gap-2.5 rounded-xl bg-info-50 p-3.5 text-sm leading-normal">
          <span className="flex flex-none text-foco"><Icon name="info" size={20} /></span>
          Para duplicadas ou relatos sem fundamento, prefira mudar o status para Cancelada. Assim o histórico fica público.
        </p>
        <div className={campo.grupo}>
          <label htmlFor="confirmar-protocolo" className={campo.rotulo}>
            <span>Digite <span className="font-mono">{ocorrencia.protocolo}</span> para confirmar</span>
          </label>
          <input ref={entrada} id="confirmar-protocolo" className={cn(campo.input, "font-mono")} autoComplete="off"
            value={confirmacao} maxLength={20} onChange={(e) => setConfirmacao(e.target.value)} />
          {confere ? (
            <span className="flex items-center gap-1.5 text-[13px] leading-[1.4] font-medium text-verde-700">
              <Icon name="check" size={16} />Protocolo confere
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={botao.secundario} onClick={onCancelar}>Manter ocorrência</button>
          <button type="button" className={botao.perigo} disabled={!confere || excluindo} onClick={excluir}>
            {excluindo ? "Excluindo…" : "Excluir definitivamente"}
          </button>
        </div>
        <p className={texto.dica}>O botão de excluir só fica ativo quando o protocolo digitado é idêntico.</p>
      </div>
    </div>
  );
}
