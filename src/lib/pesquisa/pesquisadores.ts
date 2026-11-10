/**
 * Pesquisadores da aba Pesquisa, vindos da api_pesquisadores: por nome
 * (GET /authors, OpenAlex) ou por tema (GET /researchers, lambda
 * search-pesquisadores). A API ainda não tem região, UF, formação, curso,
 * conceito CAPES etc.: esses campos ficam `null` (ou vazios) e a tela mostra
 * "Sem informação".
 */
import { apiGet } from "@/lib/api/client"

export type Regiao = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul"

export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA" | "MT" | "MS" | "MG" | "PA"
  | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO"

export type NivelFormacao = "Mestrado" | "Doutorado" | "Pós-Doutorado"

/** Vínculo com o programa da maior formação. */
export type SituacaoAcademica = "Matriculado" | "Titulado" | "Desligado"

export interface Formacao {
  nivel: NivelFormacao
  curso: string
  instituicao: string
  /** Conclusão; se matriculado, é a previsão; se desligado, o ano do desligamento. */
  ano: number
}

export interface Pesquisador {
  id: string
  nome: string
  regiao: Regiao | null
  uf: UF | null
  municipio: string | null
  nacionalidade: string | null
  situacaoAcademica: SituacaoAcademica | null
  /** Maior titulação; é a que aparece na tabela. */
  formacao: NivelFormacao | null
  instituicao: string | null
  curso: string | null
  /** Conceito CAPES do curso (1 a 7). Na tela aparece só o rótulo, nunca o número. */
  conceitoCurso: number | null
  formacoes: Formacao[]
  /** Títulos dos artigos; só a busca por tema traz (os ligados ao tema). */
  artigos: string[]
  /** Nota de 0 a 100 pelas citações desses artigos; só na busca por tema. */
  notaCitacoes: number | null
  /** Soma das citações desses artigos; só na busca por tema. */
  totalCitacoes: number | null
  curriculoUrl: string | null
  orcidUrl: string | null
  openAlexUrl: string | null
}

export const REGIOES: Regiao[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]

export const UFS_POR_REGIAO: Record<Regiao, UF[]> = {
  Norte: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MS", "MT"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
}

export const UFS: UF[] = Object.values(UFS_POR_REGIAO)
  .flat()
  .sort((a, b) => a.localeCompare(b))

export const NIVEIS_FORMACAO: NivelFormacao[] = ["Mestrado", "Doutorado", "Pós-Doutorado"]

/** Rótulo do conceito CAPES mostrado na tabela — o número nunca aparece. */
export function rotuloConceito(conceito: number | null): string | null {
  if (conceito === null) return null
  if (conceito <= 2) return "Sem conceito"
  if (conceito === 3) return "Regular"
  if (conceito === 4) return "Boa"
  if (conceito === 5) return "Muito boa"
  return "Excelente"
}

/** Pesquisador só com o que a API sabe dele; o resto fica sem informação. */
function pesquisador(dados: Pick<Pesquisador, "id" | "nome"> & Partial<Pesquisador>): Pesquisador {
  return {
    regiao: null,
    uf: null,
    municipio: null,
    nacionalidade: null,
    situacaoAcademica: null,
    formacao: null,
    instituicao: null,
    curso: null,
    conceitoCurso: null,
    formacoes: [],
    artigos: [],
    notaCitacoes: null,
    totalCitacoes: null,
    curriculoUrl: null,
    orcidUrl: null,
    openAlexUrl: null,
    ...dados,
  }
}

/** Contrato de `AuthorRead`/`AuthorPage` da API (app/schemas/author.py). */
interface AuthorRead {
  id: string
  name: string
  orcid: string | null
  works_count: number
  cited_by_count: number
  institutions: string[]
}

interface AuthorPage {
  total: number
  page: number
  per_page: number
  results: AuthorRead[]
}

export interface PaginaPesquisadores {
  total: number
  resultados: Pesquisador[]
}

/** Limites de GET /authors: o OpenAlex só pagina até o 10.000º resultado. */
export const MAX_CARACTERES_NOME = 200
export const MAX_RESULTADOS_PAGINADOS = 10_000

/** Busca por nome (GET /authors), paginada na API. */
export async function buscarPesquisadoresPorNome(
  { nome, pagina, porPagina }: { nome: string; pagina: number; porPagina: number },
  signal?: AbortSignal,
): Promise<PaginaPesquisadores> {
  const page = await apiGet<AuthorPage>("/authors", { name: nome, page: pagina, per_page: porPagina }, signal)
  return {
    total: page.total,
    resultados: page.results.map((author) =>
      pesquisador({
        id: author.id,
        nome: author.name,
        instituicao: author.institutions[0] ?? null,
        orcidUrl: author.orcid,
        openAlexUrl: `https://openalex.org/${author.id}`,
      }),
    ),
  }
}

/** Contrato de `ResearcherRead` da API (app/schemas/researcher.py). */
interface ResearcherWorkRead {
  id: string
  title: string | null
  publication_year: number | null
  cited_by_count: number
  relevance_score: number | null
}

interface ResearcherRead {
  id: string
  name: string
  total_citations: number
  citation_score: number
  works: ResearcherWorkRead[]
}

/** Limite de GET /researchers: a lambda parte da busca semântica do OpenAlex. */
export const MAX_CARACTERES_TEMA = 2000

/**
 * Busca por tema (GET /researchers): o termo vai para a busca semântica da
 * lambda, que devolve os autores dos artigos mais próximos dele. Vêm todos de
 * uma vez, já da maior para a menor nota de citações. Pode levar minutos.
 */
export async function buscarPesquisadoresPorTema(termo: string, signal?: AbortSignal): Promise<Pesquisador[]> {
  const researchers = await apiGet<ResearcherRead[]>("/researchers", { query: termo }, signal)
  return researchers.map((researcher) =>
    pesquisador({
      id: researcher.id,
      nome: researcher.name,
      artigos: researcher.works.map((work) => work.title ?? "Sem título"),
      notaCitacoes: researcher.citation_score,
      totalCitacoes: researcher.total_citations,
      openAlexUrl: `https://openalex.org/${researcher.id}`,
    }),
  )
}
