"use client";

import { CATEGORIA_LABEL, STATUS_INFO } from "@/lib/dominio";
import { campo, texto } from "@/lib/estilos";
import { CATEGORIAS, STATUS, type Categoria, type Status } from "@/types/ocorrencia";

export type ValoresFiltro = {
  status: Status[];
  categoria: Categoria[];
  bairro: string;
};

export const FILTROS_PADRAO: ValoresFiltro = {
  status: ["aberta", "em_analise", "em_andamento"],
  categoria: [],
  bairro: "",
};

type Props = {
  valores: ValoresFiltro;
  onMudar: (valores: ValoresFiltro) => void;
};

const checkbox = "flex min-h-11 items-center gap-3 text-[15px] leading-[1.3]";
const caixa = "size-5 flex-none accent-verde-700";

function alternar<T>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item];
}

export function Filtros({ valores, onMudar }: Props) {
  return (
    <aside aria-label="Filtros"
      className="flex w-68 flex-none flex-col gap-7 rounded-card border border-borda bg-superficie p-6 max-md:w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] leading-none font-medium">Filtros</h2>
        <button type="button" className="min-h-11 bg-transparent text-sm leading-none font-medium text-verde-700"
          onClick={() => onMudar({ status: [], categoria: [], bairro: "" })}>
          Limpar
        </button>
      </div>

      <fieldset className="flex flex-col">
        <legend className={`${texto.cap} mb-1.5`}>Status</legend>
        {STATUS.map((status) => (
          <label key={status} className={checkbox}>
            <input type="checkbox" className={caixa} checked={valores.status.includes(status)}
              onChange={() => onMudar({ ...valores, status: alternar(valores.status, status) })} />
            {STATUS_INFO[status].label}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className={`${texto.cap} mb-1.5`}>Categoria</legend>
        {CATEGORIAS.map((categoria) => (
          <label key={categoria} className={checkbox}>
            <input type="checkbox" className={caixa} checked={valores.categoria.includes(categoria)}
              onChange={() => onMudar({ ...valores, categoria: alternar(valores.categoria, categoria) })} />
            {CATEGORIA_LABEL[categoria]}
          </label>
        ))}
      </fieldset>

      <form className={campo.grupo} onSubmit={(e) => {
        e.preventDefault();
        const bairro = new FormData(e.currentTarget).get("bairro");
        onMudar({ ...valores, bairro: typeof bairro === "string" ? bairro.trim() : "" });
      }}>
        <label htmlFor="filtro-bairro" className={texto.cap}>Bairro</label>
        <input id="filtro-bairro" name="bairro" className={campo.input} placeholder="Todos os bairros"
          defaultValue={valores.bairro} key={valores.bairro} maxLength={60} />
        <span className={texto.dica}>Nome exato do bairro; Enter para aplicar.</span>
      </form>
    </aside>
  );
}
