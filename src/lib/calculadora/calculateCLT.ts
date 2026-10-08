/**
 * Mesmas variáveis e fórmulas de calculateUser.ts (massa salarial anual,
 * abatimento do cofinanciamento, encargos, custo bruto) — só que sem o passo
 * da Lei do Bem no final. É o custo de contratar o pesquisador sob CLT comum,
 * sem o incentivo fiscal.
 */

import type { FormData } from "@/lib/calculadora/getDataForms"

export interface CalculadoraCLTResultado {
  massaAnual: number
  encargos: number
  custoBruto: number
}

const MESES_FERIAS = 13

export function calcularCLT(form: FormData): CalculadoraCLTResultado {
  let massaAnual = form.salBrutoMensal * MESES_FERIAS * form.pesquisadores // valor total

  // Caso o projeto utilize programa de cofinanciamento salarial nos
  // primeiros 12 meses.
  if (form.cofinanciamento) {
    const abatimentoEconomico = massaAnual * form.subvencao * (form.periodo / 12)
    massaAnual = massaAnual - abatimentoEconomico
  }

  const encargos = massaAnual * 0.7 // 70%
  const custoBruto = massaAnual + encargos // 2a dedução padrão

  return { massaAnual, encargos, custoBruto }
}
