import { BuscaProtocolo } from "@/components/BuscaProtocolo";
import { DetalheOcorrencia } from "./DetalheOcorrencia";

export default async function OcorrenciaPage({ params }: { params: Promise<{ protocolo: string }> }) {
  const { protocolo } = await params;
  const protocoloDecodificado = decodeURIComponent(protocolo);

  return (
    <>
      <div className="border-b border-borda bg-superficie px-16 py-4 max-md:px-4 max-md:py-3">
        <BuscaProtocolo inicial={protocoloDecodificado} key={protocoloDecodificado} />
      </div>
      <DetalheOcorrencia protocolo={protocoloDecodificado} key={protocoloDecodificado} />
    </>
  );
}
