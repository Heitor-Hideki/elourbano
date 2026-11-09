"use client";

import Link from "next/link";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Icon } from "@/components/Icon";
import { ApiError, api } from "@/lib/api";
import { CATEGORIA_LABEL, LIMITES } from "@/lib/dominio";
import { botao, campo, cn, texto } from "@/lib/estilos";
import { apenasDigitos, mascararCep } from "@/lib/formato";
import { CATEGORIAS, type Ocorrencia } from "@/types/ocorrencia";
import { CampoCep } from "./CampoCep";
import { useConsultaCep } from "./useConsultaCep";
import { ROTULOS, validarFormulario, type CamposFormulario, type ErrosFormulario } from "./validacao";

const VAZIO: CamposFormulario = { categoria: null, titulo: "", descricao: "", cep: "", referencia: "" };

const numeroEtapa = "inline-flex flex-none items-center justify-center rounded-full font-semibold leading-none";

export function FormularioOcorrencia({ onCriada }: { onCriada: (ocorrencia: Ocorrencia) => void }) {
  const [campos, setCampos] = useState<CamposFormulario>(VAZIO);
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const cep = useConsultaCep(campos.cep);

  const atualizar = <K extends keyof CamposFormulario>(nome: K, valor: CamposFormulario[K]) =>
    setCampos((atual) => ({ ...atual, [nome]: valor }));

  const aguardandoCep = cep.estado.estado === "buscando";

  async function enviar(evento: SyntheticEvent) {
    evento.preventDefault();
    const encontrados = validarFormulario(campos);
    setErros(encontrados);
    setErroGeral(null);
    if (Object.keys(encontrados).length > 0 || !campos.categoria) return;

    setEnviando(true);
    try {
      onCriada(await api.criar({
        categoria: campos.categoria,
        titulo: campos.titulo.trim(),
        descricao: campos.descricao.trim(),
        cep: apenasDigitos(campos.cep),
        referencia: campos.referencia.trim() || undefined,
      }));
    } catch (erro) {
      tratarErroEnvio(erro);
    } finally {
      setEnviando(false);
    }
  }

  function tratarErroEnvio(erro: unknown) {
    if (!(erro instanceof ApiError)) {
      setErroGeral("Não foi possível enviar. Tente novamente.");
      return;
    }
    setErros(erro.campos as ErrosFormulario);
    setErroGeral(erro.status === 429
      ? "Muitos envios em sequência. Aguarde um minuto e tente de novo."
      : erro.message);
  }

  const listaErros = Object.entries(erros) as [keyof CamposFormulario, string][];

  return (
    <div className="mx-auto flex max-w-310 gap-12 px-16 pt-12 pb-16 max-md:flex-col max-md:gap-6 max-md:px-4 max-md:pt-6 max-md:pb-10">
      <Etapas campos={campos} />
      <form className="flex min-w-0 flex-1 flex-col gap-5" onSubmit={enviar} noValidate>
        {listaErros.length > 0 || erroGeral ? (
          <div role="alert" className="flex flex-col gap-2 rounded-2xl border-2 border-perigo bg-[#fffbfa] px-4.5 py-4 text-perigo">
            <b className="flex items-center gap-2 text-[15px] leading-[1.3] font-semibold">
              <Icon name="alert" size={18} />{erroGeral ?? `Corrija ${listaErros.length} campo(s) para enviar`}
            </b>
            {listaErros.length > 0 ? (
              <ul className="list-disc pl-6.5 text-sm leading-[1.6]">
                {listaErros.map(([nome, msg]) => <li key={nome}>{ROTULOS[nome] ?? nome}: {msg}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}

        <Secao numero={1} titulo="Qual é o problema?">
          <div role="radiogroup" aria-label="Categoria" className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
            {CATEGORIAS.map((categoria) => {
              const ativa = campos.categoria === categoria;
              return (
                <button key={categoria} type="button" role="radio" aria-checked={ativa}
                  onClick={() => atualizar("categoria", categoria)}
                  className={cn(
                    "relative flex min-h-28 flex-col items-start justify-between gap-3 rounded-2xl p-3.5 text-left text-[15px] leading-[1.25] font-medium text-texto",
                    ativa ? "border-2 border-verde-700 bg-verde-50" : "border-[1.5px] border-borda bg-superficie",
                  )}>
                  <span className={cn("flex size-11 items-center justify-center rounded-xl text-verde-700", ativa ? "bg-superficie" : "bg-verde-50")}>
                    <Icon name={categoria} />
                  </span>
                  <span>{CATEGORIA_LABEL[categoria]}</span>
                  {ativa ? (
                    <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-verde-700 text-white">
                      <Icon name="check" size={16} strokeWidth={2.25} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {erros.categoria ? <span className={texto.erro}><Icon name="alert" size={16} />{erros.categoria}</span> : null}
        </Secao>

        <Secao numero={2} titulo="Descreva">
          <CampoTexto id="titulo" rotulo="Título" valor={campos.titulo} erro={erros.titulo}
            max={LIMITES.tituloMax} ajuda={`Entre ${LIMITES.tituloMin} e ${LIMITES.tituloMax} caracteres.`}
            onMudar={(v) => atualizar("titulo", v)} />
          <CampoTexto id="descricao" rotulo="Descrição" valor={campos.descricao} erro={erros.descricao} multilinha
            max={LIMITES.descricaoMax} ajuda={`Entre ${LIMITES.descricaoMin} e ${LIMITES.descricaoMax} caracteres.`}
            onMudar={(v) => atualizar("descricao", v)} />
        </Secao>

        <Secao numero={3} titulo="Onde fica?">
          <CampoCep valor={campos.cep} erro={erros.cep} consulta={cep}
            onMudar={(v) => atualizar("cep", mascararCep(v))} />
          <CampoTexto id="referencia" rotulo="Ponto de referência" opcional valor={campos.referencia}
            erro={erros.referencia} max={LIMITES.referenciaMax} aviso="Não inclua nomes, telefones ou dados pessoais."
            placeholder="Ex.: lado da quadra, perto da saída do metrô"
            onMudar={(v) => atualizar("referencia", v)} />
        </Secao>

        <div className="flex items-center justify-between gap-4 pt-1 max-md:flex-col-reverse max-md:items-stretch">
          <Link href="/" className={botao.fantasma}>Cancelar</Link>
          <div className="flex items-center gap-4 max-md:flex-col max-md:items-stretch">
            {aguardandoCep ? <span className={texto.dica}>Aguarde a busca do CEP</span> : null}
            <button type="submit" className={cn(botao.primario, botao.grande)} disabled={enviando || aguardandoCep}>
              {enviando ? "Enviando…" : "Enviar ocorrência"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Secao({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 rounded-card border border-borda bg-superficie p-7 max-md:p-5">
      {/* display:contents evita que a legend "corte" a borda do fieldset. */}
      <legend className="contents">
        <span className="flex items-center gap-3 text-[22px] leading-[1.2]">
          <span className={cn(numeroEtapa, "size-8 bg-verde-700 text-sm text-white")}>{numero}</span>{titulo}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function Etapas({ campos }: { campos: CamposFormulario }) {
  const etapas = [
    { nome: "Categoria", ok: Boolean(campos.categoria), detalhe: campos.categoria ? CATEGORIA_LABEL[campos.categoria] : "Escolha uma opção" },
    { nome: "Descrição", ok: campos.titulo.trim().length >= LIMITES.tituloMin && campos.descricao.trim().length >= LIMITES.descricaoMin, detalhe: "Título e descrição" },
    { nome: "Local", ok: apenasDigitos(campos.cep).length === 8, detalhe: "Informe o CEP" },
  ];

  return (
    <aside className="flex w-75 flex-none flex-col gap-6 max-md:w-full">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-4xl leading-[1.15] font-light tracking-[-0.02em]">Relatar um problema</h1>
        <p className="text-base leading-normal text-texto-3">Três passos, menos de um minuto.</p>
      </div>
      <ol aria-label="Etapas" className="flex flex-col border-l-2 border-borda pl-4 max-md:hidden">
        {etapas.map((etapa, i) => (
          <li key={etapa.nome} className="flex items-start gap-3 py-2.5">
            <span className={cn(numeroEtapa, "size-6 text-xs",
              etapa.ok ? "bg-verde-700 text-white" : "border-2 border-texto bg-superficie text-texto")}>
              {etapa.ok ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <b className="text-[15px] leading-[1.3] font-medium">{etapa.nome}</b>
              <span className={texto.dica}>{etapa.ok ? "Tudo certo" : etapa.detalhe}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-verde-700 bg-verde-50 p-4.5">
        <span className="flex items-center gap-2 text-[15px] leading-[1.2] font-semibold text-verde-800">
          <Icon name="shield" size={20} />Anônimo · sem cadastro
        </span>
        <p className="text-sm leading-normal">
          Não pedimos nome, e-mail, CPF, telefone nem localização GPS. Só o que descreve o problema e o CEP do local.
        </p>
      </div>
    </aside>
  );
}

type CampoTextoProps = {
  id: string;
  rotulo: string;
  valor: string;
  max: number;
  onMudar: (valor: string) => void;
  erro?: string;
  ajuda?: string;
  aviso?: string;
  placeholder?: string;
  opcional?: boolean;
  multilinha?: boolean;
};

function CampoTexto({ id, rotulo, valor, max, onMudar, erro, ajuda, aviso, placeholder, opcional, multilinha }: CampoTextoProps) {
  const props = {
    id,
    className: cn(campo.input, multilinha && "resize-y", erro && campo.erro),
    value: valor,
    maxLength: max,
    placeholder,
    "aria-invalid": Boolean(erro),
    "aria-describedby": `${id}-ajuda`,
    onChange: (e: { target: { value: string } }) => onMudar(e.target.value),
  };
  const classeAjuda = erro ? texto.erro : aviso ? cn(texto.erro, "text-alerta") : texto.dica;

  return (
    <div className={campo.grupo}>
      <label htmlFor={id} className={campo.rotulo}>
        {rotulo}{opcional ? <small className={campo.rotuloExtra}>opcional</small> : null}
      </label>
      {multilinha ? <textarea rows={4} {...props} /> : <input {...props} />}
      <div className={campo.rodape}>
        <span id={`${id}-ajuda`} className={classeAjuda}>
          {erro || aviso ? <Icon name="alert" size={16} /> : null}{erro ?? aviso ?? ajuda}
        </span>
        <span className={texto.dica}>{valor.length}/{max}</span>
      </div>
    </div>
  );
}
