"use client";

import { useState } from "react";
import { FormularioOcorrencia } from "./FormularioOcorrencia";
import { Sucesso } from "./Sucesso";
import type { Ocorrencia } from "@/types/ocorrencia";

export default function NovaOcorrenciaPage() {
  const [criada, setCriada] = useState<Ocorrencia | null>(null);

  if (criada) return <Sucesso ocorrencia={criada} onNova={() => setCriada(null)} />;
  return <FormularioOcorrencia onCriada={setCriada} />;
}
