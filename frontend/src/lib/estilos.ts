import { twMerge } from "tailwind-merge";

/** Junta classes condicionais; em conflito (ex.: duas cores de borda) vence a última, como esperado. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

const botaoBase =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-transparent px-5 " +
  "text-[15px] leading-none font-medium no-underline " +
  "disabled:cursor-not-allowed disabled:border-borda disabled:bg-borda disabled:text-texto-2";

export const botao = {
  primario: cn(botaoBase, "bg-verde-700 text-white hover:text-white"),
  secundario: cn(botaoBase, "border-texto bg-superficie text-texto hover:text-texto"),
  perigo: cn(botaoBase, "bg-perigo text-white"),
  fantasma: cn(botaoBase, "bg-transparent text-texto hover:text-texto"),
  perigoFantasma: cn(botaoBase, "bg-transparent text-perigo"),
  grande: "min-h-13 px-6 text-base",
  bloco: "w-full",
};

export const campo = {
  input:
    "block w-full min-h-12 rounded-xl border-[1.5px] border-borda-forte bg-superficie px-3.5 py-3 " +
    "text-base leading-[1.4] text-texto placeholder:text-[#6b6b69]",
  erro: "border-2 border-perigo bg-[#fffbfa]",
  somenteLeitura: "flex items-center border-borda bg-[#ebebe9] text-texto-3",
  rotulo: "flex items-baseline justify-between text-[15px] leading-[1.3] font-medium",
  rotuloExtra: "text-[13px] leading-none font-normal text-texto-2",
  grupo: "flex flex-col gap-2",
  rodape: "flex justify-between gap-3",
};

export const texto = {
  cap: "text-xs leading-[1.2] font-semibold tracking-[0.06em] uppercase text-texto-2",
  dica: "text-[13px] leading-[1.45] text-texto-2",
  h2: "text-[22px] leading-[1.25] tracking-[-0.01em]",
  erro: "flex items-start gap-1.5 text-[13px] leading-[1.4] font-medium text-perigo",
};

export const card = "flex flex-col gap-[18px] rounded-card border border-borda bg-superficie p-7 max-md:p-5";
