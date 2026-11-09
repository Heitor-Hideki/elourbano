import type { ReactNode } from "react";
import { cn, texto } from "@/lib/estilos";
import { Icon, type IconName } from "./Icon";

type EstadoProps = {
  icone: IconName;
  titulo: string;
  children?: ReactNode;
  acoes?: ReactNode;
  tom?: "neutro" | "erro";
};

export function EstadoVazio({ icone, titulo, children, acoes, tom = "neutro" }: EstadoProps) {
  return (
    <div role={tom === "erro" ? "alert" : "status"}
      className="flex flex-col items-center gap-3 rounded-card border border-borda bg-superficie px-6 py-12 text-center">
      <span className={cn("flex size-18 items-center justify-center rounded-3xl",
        tom === "erro" ? "bg-perigo-50 text-perigo" : "bg-fundo text-texto-3")}>
        <Icon name={icone} size={32} />
      </span>
      <h2 className={texto.h2}>{titulo}</h2>
      {children ? <div className="max-w-120 text-[15px] leading-normal text-texto-3">{children}</div> : null}
      {acoes ? <div className="flex flex-wrap justify-center gap-3 pt-2">{acoes}</div> : null}
    </div>
  );
}

export function SkeletonCards({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <ul aria-busy="true" aria-label="Carregando ocorrências…" className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      {Array.from({ length: quantidade }, (_, i) => (
        <li key={i} className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
          <span className="block size-11 rounded-lg bg-skeleton" />
          <span className="block h-4 w-[70%] rounded-lg bg-skeleton" />
          <span className="block h-3 w-[45%] rounded-lg bg-skeleton" />
          <span className="block h-7 w-full rounded-lg bg-skeleton" />
        </li>
      ))}
    </ul>
  );
}
