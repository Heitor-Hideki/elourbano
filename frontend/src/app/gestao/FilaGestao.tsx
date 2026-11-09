"use client";

import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import { EstadoVazio } from "@/components/Estados";
import { Icon } from "@/components/Icon";
import { Paginacao } from "@/components/Paginacao";
import { PrioridadePill, StatusPill } from "@/components/Pills";
import { ApiError, api } from "@/lib/api";
import { CATEGORIA_CURTA, PROTOCOLO_REGEX, STATUS_INFO } from "@/lib/dominio";
import { botao, campo, cn, texto } from "@/lib/estilos";
import { duracaoEmDias, formatarHora, normalizarProtocolo } from "@/lib/formato";
import { encerrarSessao } from "@/lib/sessaoAdmin";
import { CATEGORIAS, STATUS, type Categoria, type Ocorrencia, type PaginaOcorrencias, type Status } from "@/types/ocorrencia";
import { ModalExcluir } from "./ModalExcluir";
import { PainelEdicao } from "./PainelEdicao";
import { Toast, type Aviso } from "./Toast";

const POR_PAGINA = 15;
const ATIVAS: Status[] = ["aberta", "em_analise", "em_andamento"];

type FiltroStatus = "ativas" | "todas" | Status;

type Props = { token: string; onSessaoExpirada: () => void };

export function FilaGestao({ token, onSessaoExpirada }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("ativas");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<PaginaOcorrencias | null>(null);
  const [erroCarga, setErroCarga] = useState(false);
  const [atualizadaEm, setAtualizadaEm] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [editando, setEditando] = useState<Ocorrencia | null>(null);
  const [excluindo, setExcluindo] = useState<Ocorrencia | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    const controle = new AbortController();
    const status = filtroStatus === "ativas" ? ATIVAS : filtroStatus === "todas" ? [] : [filtroStatus];
    api
      .listar({ status, categoria: categoria ? [categoria] : [], page: pagina, limit: POR_PAGINA }, controle.signal)
      .then((resultado) => {
        setDados(resultado);
        setErroCarga(false);
        setAtualizadaEm(new Date().toISOString());
      })
      .catch(() => {
        if (!controle.signal.aborted) setErroCarga(true);
      });
    return () => controle.abort();
  }, [filtroStatus, categoria, pagina, recarga]);

  const recarregar = useCallback(() => setRecarga((r) => r + 1), []);
  const fecharPainel = useCallback(() => setEditando(null), []);
  const cancelarExclusao = useCallback(() => setExcluindo(null), []);
  const fecharAviso = useCallback(() => setAviso(null), []);

  const tratarErroAdmin = useCallback((erro: unknown, acao: string) => {
    if (erro instanceof ApiError && erro.status === 401) {
      onSessaoExpirada();
      encerrarSessao();
      return;
    }
    if (erro instanceof ApiError && erro.status === 409) {
      setAviso({ tipo: "erro", titulo: "Transição não permitida (409).", texto: erro.message });
      setEditando(null);
      recarregar();
      return;
    }
    setAviso({ tipo: "erro", titulo: `Não foi possível ${acao}.`, texto: erro instanceof ApiError ? erro.message : "Tente novamente." });
  }, [onSessaoExpirada, recarregar]);

  async function abrirPorProtocolo(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    const valor = new FormData(evento.currentTarget).get("protocolo");
    const protocolo = normalizarProtocolo(typeof valor === "string" ? valor : "");
    if (!PROTOCOLO_REGEX.test(protocolo)) {
      setAviso({ tipo: "erro", titulo: "Protocolo inválido.", texto: "Use o formato ZEL-2026-000042." });
      return;
    }
    try {
      setEditando(await api.obter(protocolo));
    } catch (erro) {
      setAviso({ tipo: "erro", titulo: "Protocolo não encontrado.", texto: erro instanceof ApiError ? erro.message : "" });
    }
  }

  function aoSalvar(atualizada: Ocorrencia) {
    setEditando(null);
    setAviso({ tipo: "sucesso", titulo: "Alterações salvas.",
      texto: `${atualizada.protocolo} agora está ${STATUS_INFO[atualizada.status].label.toLowerCase()}.` });
    recarregar();
  }

  function aoExcluir(protocolo: string) {
    setExcluindo(null);
    setEditando(null);
    setAviso({ tipo: "sucesso", titulo: "Ocorrência excluída.", texto: `${protocolo} foi removida.` });
    recarregar();
  }

  const filtroSelect = cn(campo.input, "w-50 max-md:w-full");

  return (
    <main className="mx-auto flex max-w-360 flex-col gap-5 px-12 py-8 max-md:px-4 max-md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] leading-[1.15] font-light tracking-[-0.02em]">Fila de ocorrências</h1>
          <span className={cn(texto.dica, "text-sm")}>
            Ordenada por score de prioridade{atualizadaEm ? ` · atualizada às ${formatarHora(atualizadaEm)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[13px] leading-none font-medium text-verde-700">
            <Icon name="key" size={18} />Sessão ativa nesta aba
          </span>
          <button type="button" className={botao.secundario} onClick={encerrarSessao}>Sair</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <form onSubmit={abrirPorProtocolo} className="relative w-65 max-md:w-full">
          <span className="absolute top-3.5 left-3 flex text-texto-2"><Icon name="search" size={20} /></span>
          <input name="protocolo" className={cn(campo.input, "pl-10 font-mono text-sm")} placeholder="Buscar protocolo"
            aria-label="Buscar protocolo" maxLength={20} autoComplete="off" />
        </form>
        <select className={filtroSelect} aria-label="Status" value={filtroStatus}
          onChange={(e) => { setFiltroStatus(e.target.value as FiltroStatus); setPagina(1); }}>
          <option value="ativas">Status: ativas</option>
          <option value="todas">Status: todas</option>
          {STATUS.map((s) => <option key={s} value={s}>{STATUS_INFO[s].label}</option>)}
        </select>
        <select className={filtroSelect} aria-label="Categoria" value={categoria}
          onChange={(e) => { setCategoria(e.target.value as Categoria | ""); setPagina(1); }}>
          <option value="">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_CURTA[c]}</option>)}
        </select>
        <span className={cn(texto.dica, "ml-auto text-sm max-md:ml-0")}>{dados ? `${dados.total} resultados` : ""}</span>
      </div>

      {erroCarga ? (
        <EstadoVazio icone="wifiOff" tom="erro" titulo="Não foi possível carregar a fila"
          acoes={<button type="button" className={botao.primario} onClick={recarregar}>Tentar novamente</button>} />
      ) : (
        <TabelaFila itens={dados?.itens ?? null} selecionado={editando?.protocolo} onEditar={setEditando} />
      )}
      {dados && dados.total > POR_PAGINA ? (
        <Paginacao pagina={pagina} limite={POR_PAGINA} total={dados.total} onMudar={setPagina} />
      ) : null}

      {editando ? (
        <PainelEdicao ocorrencia={editando} token={token} onFechar={fecharPainel}
          onSalvo={aoSalvar} onErro={tratarErroAdmin} onExcluir={() => setExcluindo(editando)} />
      ) : null}
      {excluindo ? (
        <ModalExcluir ocorrencia={excluindo} token={token} onCancelar={cancelarExclusao}
          onExcluido={aoExcluir} onErro={tratarErroAdmin} />
      ) : null}
      {aviso ? <Toast aviso={aviso} onFechar={fecharAviso} /> : null}
    </main>
  );
}

type TabelaProps = {
  itens: Ocorrencia[] | null;
  selecionado?: string;
  onEditar: (ocorrencia: Ocorrencia) => void;
};

const th = "border-b border-borda bg-[#fafaf8] px-3 py-3.5 text-left text-xs leading-[1.2] font-semibold tracking-[0.04em] whitespace-nowrap text-texto-2 uppercase";
const td = "border-b border-borda px-3 py-2.5 align-middle whitespace-nowrap";

function TabelaFila({ itens, selecionado, onEditar }: TabelaProps) {
  if (itens === null) return <p className={texto.dica} role="status">Carregando fila…</p>;
  if (itens.length === 0) return <EstadoVazio icone="inbox" titulo="Nenhuma ocorrência com esses filtros" />;

  return (
    <div className="overflow-auto rounded-card border border-borda bg-superficie">
      <table className="w-full border-collapse text-sm leading-[1.3]">
        <thead>
          <tr>
            <th scope="col" className={th}>Protocolo</th>
            <th scope="col" className={th}>Categoria</th>
            <th scope="col" className={th}>Bairro</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={th}>Prioridade</th>
            <th scope="col" className={th}>Apoios</th>
            <th scope="col" className={th}>Idade</th>
            <th scope="col" className={th}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((o) => (
            <tr key={o.protocolo} className={o.protocolo === selecionado ? "bg-verde-50" : undefined}>
              <td className={cn(td, "font-mono")}>{o.protocolo}</td>
              <td className={td}>
                <span className="flex items-center gap-2">
                  <span className="flex text-verde-700"><Icon name={o.categoria} size={20} /></span>{CATEGORIA_CURTA[o.categoria]}
                </span>
              </td>
              <td className={td}>{o.endereco.bairro || "—"}</td>
              <td className={td}><StatusPill status={o.status} /></td>
              <td className={td}><PrioridadePill nivel={o.prioridade.nivel} score={o.prioridade.score} /></td>
              <td className={cn(td, "font-medium")}>{o.apoios}</td>
              <td className={cn(td, texto.dica, "text-sm")}>{duracaoEmDias(o.criado_em)}</td>
              <td className={cn(td, "text-right")}>
                <button type="button" aria-label={`Editar ${o.protocolo}`} onClick={() => onEditar(o)}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-transparent text-texto hover:bg-fundo">
                  <Icon name="edit" size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
