/**
 * Valores fixos da calculadora. Taxas e custos por pesquisador vêm da planilha
 * "Projeção Investimento x Incentivo Fiscal.xlsx".
 */

/** Só empresas no Lucro real usam a Lei do Bem — o regime é fixo. */
export const REGIME_FISCAL = "Lucro real"

/** Alíquota combinada IRPJ (25%) + CSLL (9%). */
export const ALIQUOTA_IRPJ_CSLL = 0.34

/** Taxa de administração: 5% sobre a bolsa anual. */
export const TAXA_ADM = 0.05

/** Análise de projeto, por pesquisador (R$). */
export const ANALISE_PROJETO = 1500

/** Gestão operacional, por pesquisador (R$). */
export const GESTAO_OPERACIONAL = 18000

export const MESES_BOLSA = 12

/** CLT: 12 salários + 13º + 1/3 constitucional de férias. */
export const MESES_CLT = 12 + 1 + 1 / 3

/** Encargos trabalhistas CLT sobre a massa salarial. */
export const ENCARGOS_CLT = 0.7
