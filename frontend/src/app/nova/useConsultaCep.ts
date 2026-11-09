"use client";

import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { apenasDigitos } from "@/lib/formato";
import type { Endereco } from "@/types/ocorrencia";

export type EstadoCep =
  | { estado: "incompleto" }
  | { estado: "buscando" }
  | { estado: "encontrado"; endereco: Omit<Endereco, "referencia"> }
  | { estado: "nao_encontrado" }
  | { estado: "indisponivel" };

export function useConsultaCep(cepDigitado: string) {
  const cep = apenasDigitos(cepDigitado);
  const [resultado, setResultado] = useState<{ cep: string; estado: EstadoCep } | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (cep.length !== 8) return;
    const controle = new AbortController();
    api
      .consultarCep(cep, controle.signal)
      .then((endereco) => setResultado({ cep, estado: { estado: "encontrado", endereco } }))
      .catch((erro) => {
        if (controle.signal.aborted) return;
        const naoEncontrado = erro instanceof ApiError && erro.status === 404;
        setResultado({ cep, estado: { estado: naoEncontrado ? "nao_encontrado" : "indisponivel" } });
      });
    return () => controle.abort();
  }, [cep, tentativa]);

  // O estado é derivado do CEP atual: um resultado antigo de outro CEP nunca aparece na tela.
  const estado: EstadoCep =
    cep.length !== 8 ? { estado: "incompleto" }
    : resultado?.cep === cep ? resultado.estado
    : { estado: "buscando" };

  return {
    estado,
    tentarDeNovo: () => {
      setResultado(null);
      setTentativa((t) => t + 1);
    },
  };
}
