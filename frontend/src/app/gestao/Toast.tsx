"use client";

import { useEffect } from "react";
import { Icon } from "@/components/Icon";

export type Aviso = { tipo: "sucesso" | "erro"; titulo: string; texto?: string };

const DURACAO_MS = 6000;

export function Toast({ aviso, onFechar }: { aviso: Aviso; onFechar: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onFechar, DURACAO_MS);
    return () => window.clearTimeout(timer);
  }, [aviso, onFechar]);

  const erro = aviso.tipo === "erro";

  return (
    <div role={erro ? "alert" : "status"}
      className="fixed bottom-8 left-12 z-40 flex w-[min(420px,calc(100%-32px))] items-start gap-3 rounded-2xl bg-texto p-4 text-sm leading-[1.45] text-white shadow-za-3 max-md:bottom-4 max-md:left-4">
      <span className={erro ? "flex text-[#f2a7a1]" : "flex text-[#a9c77a]"}>
        <Icon name={erro ? "alert" : "resolvida"} />
      </span>
      <span className="flex-1 wrap-anywhere"><b>{aviso.titulo}</b>{aviso.texto ? <><br />{aviso.texto}</> : null}</span>
      <button type="button" aria-label="Fechar aviso" onClick={onFechar}
        className="-my-3 -mr-3 flex size-11 flex-none items-center justify-center border-0 bg-transparent text-white">
        <Icon name="x" size={20} />
      </button>
    </div>
  );
}
