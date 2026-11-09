import { BuscaProtocolo } from "@/components/BuscaProtocolo";
import { texto } from "@/lib/estilos";

export default function AcompanharPage() {
  return (
    <main className="mx-auto max-w-180 px-4 py-16">
      <div className="flex flex-col gap-5 rounded-card border border-borda bg-superficie p-8">
        <h1 className="text-[32px] leading-[1.15] font-light tracking-[-0.02em]">Acompanhe sua ocorrência</h1>
        <BuscaProtocolo />
        <p className={texto.dica}>O número aparece na tela de confirmação após o envio.</p>
      </div>
    </main>
  );
}
