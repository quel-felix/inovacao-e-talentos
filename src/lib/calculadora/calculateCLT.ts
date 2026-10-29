/**
 * Custo de contratar os mesmos pesquisadores sob CLT comum, sem a Lei do Bem:
 * a bolsa vira salário, com 13º e 1/3 de férias somados, mais os encargos
 * trabalhistas.
 */

import { ENCARGOS_CLT, MESES_CLT } from "@/lib/calculadora/constantes"
import { aplicarCofinanciamento, bolsaMensalTotal, type FormData } from "@/lib/calculadora/getDataForms"

export interface CalculadoraCLTResultado {
  massaAnual: number
  encargos: number
  custoBruto: number
}

export function calcularCLT(form: FormData): CalculadoraCLTResultado {
  const massaAnual = aplicarCofinanciamento(form, bolsaMensalTotal(form) * MESES_CLT)

  const encargos = massaAnual * ENCARGOS_CLT
  const custoBruto = massaAnual + encargos

  return { massaAnual, encargos, custoBruto }
}
