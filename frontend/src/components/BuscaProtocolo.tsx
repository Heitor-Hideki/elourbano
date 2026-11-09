"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SyntheticEvent } from "react";
import { PROTOCOLO_REGEX } from "@/lib/dominio";
import { botao, campo, cn, texto } from "@/lib/estilos";
import { normalizarProtocolo } from "@/lib/formato";
import { Icon } from "./Icon";

type Props = {
  inicial?: string;
  variante?: "destaque" | "barra";
};

export function BuscaProtocolo({ inicial = "", variante = "barra" }: Props) {
  const router = useRouter();
  const id = useId();
  const [valor, setValor] = useState(inicial);
  const [invalido, setInvalido] = useState(false);

  function buscar(evento: SyntheticEvent) {
    evento.preventDefault();
    const protocolo = normalizarProtocolo(valor);
    if (!PROTOCOLO_REGEX.test(protocolo)) {
      setInvalido(true);
      return;
    }
    setInvalido(false);
    router.push(`/ocorrencias/${protocolo}`);
  }

  const destaque = variante === "destaque";

  return (
    <form onSubmit={buscar} noValidate
      className={destaque
        ? "flex flex-col gap-3 rounded-3xl bg-fundo p-7"
        : "flex max-w-155 flex-wrap items-center gap-x-3 gap-y-2"}>
      <label htmlFor={id}
        className={destaque ? "text-[22px] leading-[1.3] tracking-[-0.01em]" : "text-[15px] leading-none font-medium whitespace-nowrap"}>
        {destaque ? "Acompanhe sua ocorrência" : "Protocolo"}
      </label>
      {destaque ? <p className={texto.dica}>Digite o protocolo que você recebeu ao relatar.</p> : null}
      <div className={cn("flex gap-2", !destaque && "flex-1")}>
        <input id={id} className={cn(campo.input, "font-mono", invalido && campo.erro)} placeholder="ZEL-2026-000000"
          autoComplete="off" maxLength={20} value={valor} aria-invalid={invalido}
          aria-describedby={invalido ? `${id}-erro` : undefined}
          onChange={(e) => setValor(e.target.value)} />
        <button type="submit" className={cn(destaque ? botao.primario : botao.secundario, "min-h-12")}>
          <Icon name="search" size={18} strokeWidth={2} />Buscar
        </button>
      </div>
      {invalido ? (
        <span id={`${id}-erro`} role="alert" className={cn(texto.erro, "basis-full")}>
          <Icon name="alert" size={16} />Formato inválido. Use o formato ZEL-2026-000042.
        </span>
      ) : null}
    </form>
  );
}
