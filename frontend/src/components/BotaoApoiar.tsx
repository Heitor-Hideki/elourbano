"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { botao, cn, texto } from "@/lib/estilos";
import type { Ocorrencia } from "@/types/ocorrencia";
import { Icon } from "./Icon";

type Props = {
  protocolo: string;
  encerrado: boolean;
  onApoiado: (atualizada: Ocorrencia) => void;
  grande?: boolean;
};

const compacto = "px-4 text-sm";

export function BotaoApoiar({ protocolo, encerrado, onApoiado, grande = false }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (encerrado) {
    return (
      <button type="button" disabled className={cn(botao.secundario, grande ? cn(botao.grande, botao.bloco) : compacto)}>
        Apoio encerrado
      </button>
    );
  }

  async function apoiar() {
    setEnviando(true);
    setErro(null);
    try {
      onApoiado(await api.apoiar(protocolo));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível registrar o apoio.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1.5">
      <button type="button" onClick={apoiar} disabled={enviando}
        className={grande
          ? cn(botao.primario, botao.grande, botao.bloco)
          : cn(botao.secundario, compacto, "border-verde-700 text-verde-700 hover:text-verde-700")}>
        <Icon name="apoio" size={18} />{enviando ? "Enviando…" : "Apoiar (+1)"}
      </button>
      {erro ? <span role="alert" className={texto.erro}>{erro}</span> : null}
    </span>
  );
}
