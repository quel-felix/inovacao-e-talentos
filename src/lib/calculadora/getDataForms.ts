/**
 * Porta de backend/getDataForms.py: recebe os dados brutos do formulário
 * (CalculadoraForm, mesmos campos de formulario.html) e devolve um `FormData`
 * com cada campo validado e nomeado exatamente como em calculadora.py — só
 * que agora rodando no próprio front, sem precisar de um back-end.
 */

export interface FormData {
  titulo: string
  salBrutoMensal: number
  pesquisadores: number
  regime: string
  aliquota: number
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

/** Valida o payload do formulário e devolve os campos já nomeados e tipados
 * como em calculadora.py, prontos para calculateUser.ts. */
export function getDataFromForm(payload: FormData): FormData {
  if (!payload.titulo) {
    throw new FormValidationError('"titulo" é obrigatório.')
  }
  if (!payload.regime) {
    throw new FormValidationError('"regime" é obrigatório.')
  }

  assertRange("salBrutoMensal", payload.salBrutoMensal, 0, Number.POSITIVE_INFINITY)
  assertRange("pesquisadores", payload.pesquisadores, 1, Number.POSITIVE_INFINITY)
  assertRange("aliquota", payload.aliquota, 0, 100)
  assertRange("subvencao", payload.subvencao, 0, 50)
  assertRange("periodo", payload.periodo, 0, 12)

  return { ...payload }
}
