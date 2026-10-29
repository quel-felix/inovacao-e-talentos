/**
 * Porta de backend/calculateUser.py, agora no modelo de bolsa da planilha
 * "Projeção Investimento x Incentivo Fiscal.xlsx": bolsa anual + taxa adm 5%
 * + análise de projeto + gestão operacional = investimento total; o benefício
 * da Lei do Bem é a exclusão adicional × 34% sobre a bolsa anual (coluna J).
 */

import {
  ALIQUOTA_IRPJ_CSLL,
  ANALISE_PROJETO,
  GESTAO_OPERACIONAL,
  MESES_BOLSA,
  TAXA_ADM,
} from "@/lib/calculadora/constantes"
import {
  aplicarCofinanciamento,
  bolsaMensalTotal,
  totalPesquisadores,
  type FormData,
} from "@/lib/calculadora/getDataForms"

export interface CalculadoraResultado {
  bolsaAnual: number
  taxaAdm: number
  analiseProjeto: number
  gestaoOperacional: number
  /** Custo do pesquisador bolsista, sem o incentivo. */
  investimentoTotal: number
  leidobem: number
  /** Economia fiscal (IRPJ/CSLL) obtida com a Lei do Bem. */
  incentivo: number
  /** Investimento total − economia: o que o pesquisador custa de fato. */
  custoLiquido: number
  /** Economia em % do investimento total. */
  percentualEconomia: number
}

export function calcularIncentivo(form: FormData): CalculadoraResultado {
  const quantidade = totalPesquisadores(form)
  const bolsaAnual = aplicarCofinanciamento(form, bolsaMensalTotal(form) * MESES_BOLSA)

  const taxaAdm = bolsaAnual * TAXA_ADM
  const analiseProjeto = ANALISE_PROJETO * quantidade
  const gestaoOperacional = GESTAO_OPERACIONAL * quantidade
  const investimentoTotal = bolsaAnual + taxaAdm + analiseProjeto + gestaoOperacional

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

  // Exclusão adicional sobre a bolsa anual, à alíquota de IRPJ/CSLL (Lucro
  // real). Ex.: 60% × 34% = 20,4% da bolsa anual, como na planilha.
  const incentivo = bolsaAnual * leidobem * ALIQUOTA_IRPJ_CSLL
  const custoLiquido = investimentoTotal - incentivo
  const percentualEconomia = investimentoTotal > 0 ? (incentivo / investimentoTotal) * 100 : 0

  return {
    bolsaAnual,
    taxaAdm,
    analiseProjeto,
    gestaoOperacional,
    investimentoTotal,
    leidobem,
    incentivo,
    custoLiquido,
    percentualEconomia,
  }
}
