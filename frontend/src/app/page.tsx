import Link from "next/link";
import { BuscaProtocolo } from "@/components/BuscaProtocolo";
import { Icon } from "@/components/Icon";
import { botao, cn } from "@/lib/estilos";
import { ListaOcorrencias } from "./ListaOcorrencias";

export default function InicioPage() {
  return (
    <>
      <section className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-12 border-b border-borda bg-superficie px-16 pt-14 pb-12 max-md:grid-cols-1 max-md:gap-6 max-md:px-4 max-md:py-8">
        <div className="flex flex-col gap-5">
          <h1 className="max-w-170 text-[44px] leading-[1.12] font-light tracking-[-0.025em] max-md:text-[32px]">
            Problemas na sua rua, priorizados por quem passa por eles.
          </h1>
          <p className="max-w-150 text-lg leading-normal text-texto-3">
            Relate buracos, postes apagados, lixo ou alagamentos. Apoie o que já foi relatado para subir a
            prioridade, e acompanhe a resposta da prefeitura.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/nova" className={cn(botao.primario, botao.grande)}>
              <Icon name="plus" size={20} strokeWidth={2.25} />Relatar problema
            </Link>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border-[1.5px] border-verde-700 bg-superficie px-3 text-[13px] leading-none font-medium text-verde-700">
              <Icon name="anonimo" size={16} />Anônimo · sem cadastro
            </span>
          </div>
        </div>
        <BuscaProtocolo variante="destaque" />
      </section>
      <ListaOcorrencias />
    </>
  );
}
