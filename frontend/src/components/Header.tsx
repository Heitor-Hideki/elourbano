"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { botao, cn } from "@/lib/estilos";
import { Icon } from "./Icon";

const NAV = [
  { href: "/", label: "Ocorrências", ativo: (p: string) => p === "/" },
  { href: "/nova", label: "Nova ocorrência", ativo: (p: string) => p.startsWith("/nova") },
  { href: "/acompanhar", label: "Acompanhar", ativo: (p: string) => p.startsWith("/acompanhar") || p.startsWith("/ocorrencias") },
  { href: "/gestao", label: "Gestão", ativo: (p: string) => p.startsWith("/gestao") },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex min-h-18 items-center gap-10 border-b border-borda bg-superficie px-16 max-md:flex-wrap max-md:gap-x-4 max-md:gap-y-2 max-md:px-4 max-md:py-2">
      <Link href="/" aria-label="EloUrbano, página inicial"
        className="flex min-h-11 items-center gap-2.5 text-texto no-underline hover:text-texto">
        <span className="flex size-9 items-center justify-center rounded-[11px] bg-verde-500 text-texto">
          <Icon name="pin" size={22} strokeWidth={2} />
        </span>
        <span className="text-xl leading-none font-semibold tracking-[-0.01em]">EloUrbano</span>
      </Link>
      <nav aria-label="Principal" className="flex flex-1 gap-1 self-stretch max-md:order-3 max-md:basis-full max-md:overflow-x-auto">
        {NAV.map((item) => {
          const ativo = item.ativo(pathname);
          return (
            <Link key={item.href} href={item.href} aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center border-y-3 border-transparent px-3.5 text-[15px] leading-none whitespace-nowrap no-underline max-md:min-h-11",
                ativo ? "border-b-verde-500 font-semibold text-texto hover:text-texto" : "font-medium text-texto-2 hover:text-texto",
              )}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <span className="flex items-center gap-1.5 text-[13px] leading-none font-medium text-verde-700 max-xl:hidden">
        <Icon name="shield" size={18} />Anônimo · sem cadastro
      </span>
      <Link href="/nova" className={cn(botao.primario, "max-md:ml-auto")}>
        <Icon name="plus" size={18} strokeWidth={2.25} />Relatar problema
      </Link>
    </header>
  );
}
