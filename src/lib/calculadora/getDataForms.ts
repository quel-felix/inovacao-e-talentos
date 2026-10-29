/**
 * Porta de backend/getDataForms.py: recebe os dados brutos do formulário
 * (CalculadoraForm) e devolve um `FormData` com cada campo validado — rodando
 * no próprio front, sem precisar de um back-end. Regime (Lucro real) e
 * alíquota (34%) são fixos, ver constantes.ts.
 */

export interface PesquisadorInput {
  categoria: string
  bolsaMensal: number
  quantidade: number
}

export interface FormData {
  pesquisadores: PesquisadorInput[]
  alocacaoExclusiva: boolean
  incremento: boolean
  havePatente: boolean
  cofinanciamento: boolean
  subvencao: number
  periodo: number
}

class FormValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "FormValidationError"
  }
}

function assertRange(field: string, value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    throw new FormValidationError(`"${field}" precisa ser um número.`)
  }
  if (value < min || value > max) {
    throw new FormValidationError(`"${field}" precisa estar entre ${min} e ${max}.`)
  }
}

/** Valida o payload do formulário e devolve os campos já tipados, prontos
 * para calculateUser.ts e calculateCLT.ts. */
export function getDataFromForm(payload: FormData): FormData {
  if (payload.pesquisadores.length === 0) {
    throw new FormValidationError("Adicione ao menos um pesquisador.")
  }

  for (const pesquisador of payload.pesquisadores) {
    if (!pesquisador.categoria) {
      throw new FormValidationError('"categoria" é obrigatória.')
    }
    assertRange("bolsa mensal", pesquisador.bolsaMensal, 0, Number.POSITIVE_INFINITY)
    assertRange("quantidade", pesquisador.quantidade, 1, Number.POSITIVE_INFINITY)
  }

  assertRange("subvencao", payload.subvencao, 0, 50)
  assertRange("periodo", payload.periodo, 0, 12)

  return { ...payload }
}

/** Total de pesquisadores somando as quantidades de cada perfil. */
export function totalPesquisadores(form: FormData): number {
  return form.pesquisadores.reduce((total, pesquisador) => total + pesquisador.quantidade, 0)
}

/** Soma de bolsa mensal × quantidade de todos os perfis. */
export function bolsaMensalTotal(form: FormData): number {
  return form.pesquisadores.reduce(
    (total, pesquisador) => total + pesquisador.bolsaMensal * pesquisador.quantidade,
    0,
  )
}

/** Abatimento do cofinanciamento salarial nos primeiros 12 meses. */
export function aplicarCofinanciamento(form: FormData, valorAnual: number): number {
  if (!form.cofinanciamento) return valorAnual
  const abatimentoEconomico = valorAnual * (form.subvencao / 100) * (form.periodo / 12)
  return valorAnual - abatimentoEconomico
}
