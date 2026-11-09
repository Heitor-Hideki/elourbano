"use client";

import { useState } from "react";
import { botao, cn, texto } from "@/lib/estilos";
import { Icon } from "./Icon";

type Props = { texto: string; compacto?: boolean };

export function BotaoCopiar({ texto: conteudo, compacto = false }: Props) {
  const [copiado, setCopiado] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      setFalhou(false);
    } catch {
      setFalhou(true);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" onClick={copiar}
        className={cn(
          botao.secundario,
          compacto && "min-h-10 border-borda-forte px-3.5 text-sm",
          copiado && "border-verde-700 bg-verde-50 text-verde-800 hover:text-verde-800",
        )}>
        <Icon name={copiado ? "check" : "copy"} size={18} />{copiado ? "Copiado" : "Copiar"}
      </button>
      <span role="status" className={texto.dica}>
        {copiado && !compacto ? "Protocolo copiado para a área de transferência." : null}
        {falhou ? "Não foi possível copiar. Selecione e copie manualmente." : null}
      </span>
    </span>
  );
}
