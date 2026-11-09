"use client";

import { useState, type SyntheticEvent } from "react";
import { Icon } from "@/components/Icon";
import { ApiError, api } from "@/lib/api";
import { botao, campo, cn, texto } from "@/lib/estilos";
import { salvarToken } from "@/lib/sessaoAdmin";

const TOKEN_RECUSADO = "Este token não foi aceito.";

export function LoginGestao({ aviso }: { aviso: string | null }) {
  const [token, setToken] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  async function entrar(evento: SyntheticEvent) {
    evento.preventDefault();
    const valor = token.trim();
    if (!valor) {
      setErro("Informe o token de acesso.");
      return;
    }
    setVerificando(true);
    setErro(null);
    try {
      await api.verificarSessao(valor);
      salvarToken(valor);
    } catch (e) {
      setErro(e instanceof ApiError && e.status === 401
        ? TOKEN_RECUSADO
        : "Não foi possível verificar o token agora. Tente de novo.");
    } finally {
      setVerificando(false);
    }
  }

  const tokenRecusado = erro === TOKEN_RECUSADO;

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
      <form onSubmit={entrar} noValidate
        className="flex w-full max-w-120 flex-col gap-5 rounded-modal border border-borda bg-superficie p-10 max-md:p-6">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-fundo"><Icon name="lock" size={28} /></span>
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] leading-[1.15] font-light tracking-[-0.02em]">Área da prefeitura</h1>
          <p className="text-base leading-normal text-texto-3">
            Para triar e atualizar ocorrências, informe o token de acesso fornecido pela equipe técnica.
          </p>
        </div>

        {aviso || tokenRecusado ? (
          <div role="alert" className="flex gap-2.5 rounded-xl bg-perigo-50 p-3.5 text-sm leading-normal text-perigo">
            <Icon name="alert" size={20} />
            <span>
              <b>{tokenRecusado ? "Token inválido ou expirado." : aviso}</b>
              {tokenRecusado ? <> Confira com a equipe técnica e tente de novo. <span className={texto.dica}>(erro 401)</span></> : null}
            </span>
          </div>
        ) : null}

        <div className={campo.grupo}>
          <label htmlFor="token" className={campo.rotulo}>Token de acesso</label>
          <div className="relative">
            <input id="token" type={visivel ? "text" : "password"} autoComplete="off" spellCheck={false}
              className={cn(campo.input, "pr-14 font-mono", erro && campo.erro)} value={token} maxLength={256}
              aria-invalid={Boolean(erro)} aria-describedby="token-ajuda" onChange={(e) => setToken(e.target.value)} />
            <button type="button" aria-label={visivel ? "Ocultar token" : "Mostrar token"} aria-pressed={visivel}
              onClick={() => setVisivel((v) => !v)}
              className="absolute top-0.5 right-1 flex size-11 items-center justify-center rounded-full bg-transparent text-texto-3">
              <Icon name="key" size={20} />
            </button>
          </div>
          {erro ? <span className={texto.erro}><Icon name="alert" size={16} />{erro}</span> : null}
        </div>

        <button type="submit" className={cn(botao.primario, botao.grande, botao.bloco)} disabled={verificando}>
          {verificando ? "Verificando…" : "Entrar"}
        </button>
        <p id="token-ajuda" className="flex gap-2.5 rounded-xl bg-info-50 p-3.5 text-sm leading-normal">
          <span className="flex flex-none text-foco"><Icon name="info" /></span>
          O token fica só nesta aba e é apagado quando você a fecha. Nada é salvo no navegador depois disso.
        </p>
      </form>
    </main>
  );
}
