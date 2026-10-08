/**
 * Porta de backend/calculateUser.py: mesmo cálculo de calculadora.py (raiz da
 * pasta sandbox), só que recebendo os dados já extraídos por getDataForms.ts
 * em vez de variáveis fixas no topo do arquivo — e rodando direto no front.
 */

import type { FormData } from "@/lib/calculadora/getDataForms"

export interface CalculadoraResultado {
  massaAnual: number
  encargos: number
  custoBruto: number
  leidobem: number
  incentivo: number
}

const MESES_FERIAS = 13

export function calcularIncentivo(form: FormData): CalculadoraResultado {
  let massaAnual = form.salBrutoMensal * MESES_FERIAS * form.pesquisadores // valor total

  // Caso o projeto utilize programa de cofinanciamento salarial nos
  // primeiros 12 meses.
  if (form.cofinanciamento) {
    const abatimentoEconomico = massaAnual * form.subvencao * (form.periodo / 12)
    massaAnual = massaAnual - abatimentoEconomico
  }

  const encargos = massaAnual * 0.7 // 70%
  const custoBruto = massaAnual + encargos // 2a dedução padrão

  // Lei do Bem
  let leidobem: number
  if (form.alocacaoExclusiva && form.incremento) {
    leidobem = 1
  } else if (form.alocacaoExclusiva || form.incremento) {
    leidobem = 0.8
  } else {
    leidobem = 0.6
  }

  const incentivo = custoBruto * leidobem // 3

  return { massaAnual, encargos, custoBruto, leidobem, incentivo }
}
