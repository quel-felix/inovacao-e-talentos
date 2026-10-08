import type { NivelFormacao, Pesquisador, Regiao } from "@/lib/pesquisa/pesquisadores"

export type TipoPesquisa = "nome" | "artigos" | "instituicoes"

/**
 * Faixas do conceito CAPES mostradas na tela — o usuário escolhe pelo rótulo,
 * sem ver o número. `min` é o menor conceito da faixa; o filtro é "a partir de".
 */
export const FAIXAS_CONCEITO = [
  { value: "sem", label: "Sem conceito (1 e 2)", min: 1 },
  { value: "regular", label: "Regular", min: 3 },
  { value: "boa", label: "Boa", min: 4 },
  { value: "muito-boa", label: "Muito boa", min: 5 },
  { value: "excelente", label: "Excelente", min: 6 },
] as const

export type FaixaConceito = (typeof FAIXAS_CONCEITO)[number]["value"]

/** Padrão do filtro: conceito 3 (Regular) para cima. */
export const FAIXA_CONCEITO_PADRAO: FaixaConceito = "regular"

export function rotuloConceito(conceito: number): string {
  if (conceito <= 2) return "Sem conceito"
  if (conceito === 3) return "Regular"
  if (conceito === 4) return "Boa"
  if (conceito === 5) return "Muito boa"
  return "Excelente"
}

export interface FiltrosPesquisa {
  tipo: TipoPesquisa
  termo: string
  regiao: Regiao | null
  formacao: NivelFormacao | null
  instituicao: string | null
  conceito: FaixaConceito
}

/** Busca sem diferenciar maiúsculas nem acentos ("sao" encontra "São"). */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function correspondeAoTermo(pesquisador: Pesquisador, tipo: TipoPesquisa, termo: string) {
  if (!termo) return true
  switch (tipo) {
    case "nome":
      return normalizar(pesquisador.nome).includes(termo)
    case "artigos":
      return pesquisador.artigos.some((artigo) => normalizar(artigo).includes(termo))
    case "instituicoes":
      return [pesquisador.instituicao, ...pesquisador.formacoes.map((f) => f.instituicao)].some((inst) =>
        normalizar(inst).includes(termo),
      )
  }
}

export function filtrarPesquisadores(pesquisadores: Pesquisador[], filtros: FiltrosPesquisa): Pesquisador[] {
  const termo = normalizar(filtros.termo.trim())
  const conceitoMinimo = FAIXAS_CONCEITO.find((faixa) => faixa.value === filtros.conceito)?.min ?? 1

  return pesquisadores.filter(
    (p) =>
      correspondeAoTermo(p, filtros.tipo, termo) &&
      (!filtros.regiao || p.regiao === filtros.regiao) &&
      (!filtros.formacao || p.formacao === filtros.formacao) &&
      (!filtros.instituicao || p.instituicao === filtros.instituicao) &&
      p.conceitoCurso >= conceitoMinimo,
  )
}
