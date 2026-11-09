import { cn, texto } from "@/lib/estilos";
import { Icon } from "./Icon";

type Props = {
  pagina: number;
  limite: number;
  total: number;
  onMudar: (pagina: number) => void;
};

const botaoPagina =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-full border-[1.5px] border-transparent bg-transparent " +
  "text-[15px] leading-none font-medium text-texto disabled:cursor-not-allowed disabled:text-borda-forte";

function paginasVisiveis(atual: number, ultima: number): (number | "…")[] {
  const candidatas = new Set([1, atual - 1, atual, atual + 1, ultima]);
  const ordenadas = [...candidatas].filter((p) => p >= 1 && p <= ultima).sort((a, b) => a - b);
  return ordenadas.flatMap((p, i) => (i > 0 && p - ordenadas[i - 1] > 1 ? ["…" as const, p] : [p]));
}

export function Paginacao({ pagina, limite, total, onMudar }: Props) {
  const ultima = Math.max(1, Math.ceil(total / limite));
  const inicio = total === 0 ? 0 : (pagina - 1) * limite + 1;
  const fim = Math.min(pagina * limite, total);

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <span className={cn(texto.dica, "text-sm")}>{inicio}–{fim} de {total}</span>
      <div className="flex items-center gap-1">
        <button type="button" className={botaoPagina} aria-label="Página anterior" disabled={pagina <= 1}
          onClick={() => onMudar(pagina - 1)}>
          <Icon name="arrowLeft" size={20} />
        </button>
        {paginasVisiveis(pagina, ultima).map((p, i) =>
          p === "…" ? (
            <span key={`r${i}`} className="min-w-8 text-center text-texto-2">…</span>
          ) : (
            <button key={p} type="button" aria-current={p === pagina ? "page" : undefined} onClick={() => onMudar(p)}
              className={cn(botaoPagina, p === pagina && "bg-texto text-white")}>
              {p}
            </button>
          ),
        )}
        <button type="button" className={botaoPagina} aria-label="Próxima página" disabled={pagina >= ultima}
          onClick={() => onMudar(pagina + 1)}>
          <Icon name="arrowRight" size={20} />
        </button>
      </div>
    </nav>
  );
}
