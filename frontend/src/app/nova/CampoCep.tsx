import { Icon } from "@/components/Icon";
import { campo, cn, texto } from "@/lib/estilos";
import type { EstadoCep } from "./useConsultaCep";

type Props = {
  valor: string;
  erro?: string;
  consulta: { estado: EstadoCep; tentarDeNovo: () => void };
  onMudar: (valor: string) => void;
};

const status = "flex flex-wrap items-center gap-1.5 text-[13px] leading-[1.4] font-medium";

export function CampoCep({ valor, erro, consulta, onMudar }: Props) {
  const { estado } = consulta;
  const endereco = estado.estado === "encontrado" ? estado.endereco : null;
  const comErro = Boolean(erro) || estado.estado === "nao_encontrado";
  const carregando = estado.estado === "buscando";

  return (
    <>
      <div className="grid grid-cols-[240px_minmax(0,1fr)] items-start gap-4 max-md:grid-cols-1">
        <div className={campo.grupo}>
          <label htmlFor="cep" className={campo.rotulo}>CEP</label>
          <input id="cep" className={cn(campo.input, "font-mono", comErro && campo.erro)} inputMode="numeric"
            autoComplete="postal-code" placeholder="00000-000" value={valor} maxLength={9}
            aria-invalid={comErro} aria-describedby="cep-status" onChange={(e) => onMudar(e.target.value)} />
          <StatusCep id="cep-status" estado={estado} erro={erro} onTentarDeNovo={consulta.tentarDeNovo} />
        </div>
        <CampoSomenteLeitura rotulo="Logradouro" valor={endereco?.logradouro} carregando={carregando} dica />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <CampoSomenteLeitura rotulo="Bairro" valor={endereco?.bairro} carregando={carregando} />
        <CampoSomenteLeitura rotulo="Cidade/UF" valor={endereco ? `${endereco.cidade}/${endereco.uf}` : undefined}
          carregando={carregando} />
      </div>
    </>
  );
}

type StatusProps = { id: string; estado: EstadoCep; erro?: string; onTentarDeNovo: () => void };

function StatusCep({ id, estado, erro, onTentarDeNovo }: StatusProps) {
  if (erro) return <span id={id} className={texto.erro}><Icon name="alert" size={16} />{erro}</span>;

  switch (estado.estado) {
    case "buscando":
      return <span id={id} role="status" className={cn(status, "text-foco")}><Icon name="refresh" size={16} />Buscando endereço…</span>;
    case "encontrado":
      return <span id={id} role="status" className={cn(status, "text-verde-700")}><Icon name="check" size={16} />Endereço encontrado</span>;
    case "nao_encontrado":
      return (
        <span id={id} role="alert" className={texto.erro}>
          <Icon name="alert" size={16} />
          <span>
            Não encontramos esse CEP. Confira os números ou use o CEP de uma rua próxima.{" "}
            <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener noreferrer">Consultar nos Correios</a>
          </span>
        </span>
      );
    case "indisponivel":
      return (
        <span id={id} role="alert" className={cn(status, "text-alerta")}>
          <Icon name="wifiOff" size={16} />A busca de endereço está fora do ar.
          <button type="button" onClick={onTentarDeNovo}
            className="min-h-8 bg-transparent text-[13px] leading-none font-semibold text-verde-700 underline">
            Tentar de novo
          </button>
        </span>
      );
    default:
      return <span id={id} className={texto.dica}>Digite os 8 números.</span>;
  }
}

type SomenteLeituraProps = { rotulo: string; valor?: string; carregando: boolean; dica?: boolean };

function CampoSomenteLeitura({ rotulo, valor, carregando, dica }: SomenteLeituraProps) {
  return (
    <div className={campo.grupo}>
      <span className={campo.rotulo}>{rotulo}{dica ? <small className={campo.rotuloExtra}>preenchido pelo CEP</small> : null}</span>
      <div className={cn(campo.input, campo.somenteLeitura)}>
        {carregando ? <span aria-hidden="true" className="block h-3.5 w-[55%] rounded-lg bg-skeleton" /> : (valor || "—")}
      </div>
    </div>
  );
}
