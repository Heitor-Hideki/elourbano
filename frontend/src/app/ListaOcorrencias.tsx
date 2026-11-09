"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EstadoVazio, SkeletonCards } from "@/components/Estados";
import { FILTROS_PADRAO, Filtros, type ValoresFiltro } from "@/components/Filtros";
import { OcorrenciaCard } from "@/components/OcorrenciaCard";
import { Paginacao } from "@/components/Paginacao";
import { api } from "@/lib/api";
import { botao, cn, texto } from "@/lib/estilos";
import type { Ocorrencia, PaginaOcorrencias } from "@/types/ocorrencia";

const POR_PAGINA = 12;

type Carga =
  | { estado: "carregando" }
  | { estado: "erro" }
  | { estado: "pronto"; dados: PaginaOcorrencias };

export function ListaOcorrencias() {
  const [filtros, setFiltros] = useState<ValoresFiltro>(FILTROS_PADRAO);
  const [pagina, setPagina] = useState(1);
  const [carga, setCarga] = useState<Carga>({ estado: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    api
      .listar({ ...filtros, bairro: filtros.bairro || undefined, page: pagina, limit: POR_PAGINA }, controle.signal)
      .then((dados) => setCarga({ estado: "pronto", dados }))
      .catch(() => {
        if (!controle.signal.aborted) setCarga({ estado: "erro" });
      });
    return () => controle.abort();
  }, [filtros, pagina, tentativa]);

  function mudarFiltros(novos: ValoresFiltro) {
    setCarga({ estado: "carregando" });
    setFiltros(novos);
    setPagina(1);
  }

  function mudarPagina(nova: number) {
    setCarga({ estado: "carregando" });
    setPagina(nova);
  }

  const substituir = useCallback((atualizada: Ocorrencia) => {
    setCarga((atual) =>
      atual.estado !== "pronto"
        ? atual
        : {
            estado: "pronto",
            dados: {
              ...atual.dados,
              itens: atual.dados.itens.map((o) => (o.protocolo === atualizada.protocolo ? atualizada : o)),
            },
          },
    );
  }, []);

  return (
    <main className="mx-auto flex max-w-360 items-start gap-10 px-16 pt-10 pb-14 max-md:flex-col max-md:gap-6 max-md:px-4 max-md:pt-6 max-md:pb-10">
      <Filtros valores={filtros} onMudar={mudarFiltros} />
      <section className="flex min-w-0 flex-1 flex-col gap-5" aria-live="polite">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] leading-[1.2] font-light tracking-[-0.015em]">
            {carga.estado === "pronto" ? `${carga.dados.total} ocorrências` : "Ocorrências"}
          </h2>
          <span className={cn(texto.dica, "text-sm")}>Ordenadas por prioridade: gravidade, apoios e tempo em aberto.</span>
        </div>
        <Resultado carga={carga} pagina={pagina}
          onTentarDeNovo={() => { setCarga({ estado: "carregando" }); setTentativa((t) => t + 1); }}
          onLimparFiltros={() => mudarFiltros({ status: [], categoria: [], bairro: "" })}
          onMudarPagina={mudarPagina} onApoiado={substituir} />
      </section>
    </main>
  );
}

type ResultadoProps = {
  carga: Carga;
  pagina: number;
  onTentarDeNovo: () => void;
  onLimparFiltros: () => void;
  onMudarPagina: (pagina: number) => void;
  onApoiado: (atualizada: Ocorrencia) => void;
};

function Resultado({ carga, pagina, onTentarDeNovo, onLimparFiltros, onMudarPagina, onApoiado }: ResultadoProps) {
  if (carga.estado === "carregando") return <SkeletonCards />;

  if (carga.estado === "erro") {
    return (
      <EstadoVazio icone="wifiOff" tom="erro" titulo="Não foi possível carregar as ocorrências"
        acoes={<button type="button" className={botao.primario} onClick={onTentarDeNovo}>Tentar novamente</button>}>
        Verifique sua conexão com a internet. Seus filtros foram mantidos.
      </EstadoVazio>
    );
  }

  if (carga.dados.total === 0) {
    return (
      <EstadoVazio icone="inbox" titulo="Nenhuma ocorrência por aqui"
        acoes={<>
          <button type="button" className={botao.secundario} onClick={onLimparFiltros}>Limpar filtros</button>
          <Link href="/nova" className={botao.primario}>Relatar problema</Link>
        </>}>
        Tente outros filtros ou relate um problema novo.
      </EstadoVazio>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {carga.dados.itens.map((ocorrencia) => (
          <li key={ocorrencia.protocolo}><OcorrenciaCard ocorrencia={ocorrencia} onApoiado={onApoiado} /></li>
        ))}
      </ul>
      <Paginacao pagina={pagina} limite={POR_PAGINA} total={carga.dados.total} onMudar={onMudarPagina} />
    </>
  );
}
