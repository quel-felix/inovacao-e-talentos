import type { NivelFormacao, Pesquisador, Regiao, UF } from "@/lib/pesquisa/pesquisadores"

export type TipoPesquisa = "nome" | "artigos" | "instituicoes"

/** Rótulo do conceito CAPES mostrado na tabela — o número nunca aparece. */
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
  uf: UF | null
  formacao: NivelFormacao | null
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

  return pesquisadores.filter(
    (p) =>
      correspondeAoTermo(p, filtros.tipo, termo) &&
      (!filtros.regiao || p.regiao === filtros.regiao) &&
      (!filtros.uf || p.uf === filtros.uf) &&
      (!filtros.formacao || p.formacao === filtros.formacao),
  )
}
