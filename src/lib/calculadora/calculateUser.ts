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
  /** Economia fiscal (IRPJ/CSLL) obtida com a Lei do Bem. */
  incentivo: number
  /** Custo bruto − economia: o que o pesquisador custa de fato. */
  custoLiquido: number
  /** Economia em % do custo bruto. */
  percentualEconomia: number
}

const MESES_FERIAS = 13

export function calcularIncentivo(form: FormData): CalculadoraResultado {
  let massaAnual = form.salBrutoMensal * MESES_FERIAS * form.pesquisadores // valor total

  // Caso o projeto utilize programa de cofinanciamento salarial nos
  // primeiros 12 meses.
  if (form.cofinanciamento) {
    const abatimentoEconomico = massaAnual * (form.subvencao / 100) * (form.periodo / 12)
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

  // Patente concedida ou depositada no período: +20% de exclusão adicional.
  if (form.havePatente) {
    leidobem += 0.2
  }

  // O dispêndio já é dedutível como despesa operacional (100%) e a Lei do Bem
  // soma a exclusão adicional (leidobem) — tudo sobre a alíquota de IRPJ/CSLL.
  // Só empresas no Lucro real podem usar o benefício.
  const aliquota = form.regime === "Lucro real" ? form.aliquota / 100 : 0
  const incentivo = custoBruto * (1 + leidobem) * aliquota // 3
  const custoLiquido = custoBruto - incentivo
  const percentualEconomia = custoBruto > 0 ? (incentivo / custoBruto) * 100 : 0

  return { massaAnual, encargos, custoBruto, leidobem, incentivo, custoLiquido, percentualEconomia }
}
