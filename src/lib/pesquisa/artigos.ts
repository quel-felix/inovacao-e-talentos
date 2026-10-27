/**
 * Artigos da aba Pesquisa, vindos de GET /works da api_pesquisadores: busca
 * semântica no OpenAlex, que devolve os mais próximos do termo pelo significado.
 */
import { apiGet } from "@/lib/api/client"

/** Contrato de `WorkRead` da API (app/schemas/work.py). */
interface WorkRead {
  id: string
  doi: string | null
  title: string | null
  publication_year: number | null
  type: string | null
  cited_by_count: number
  authors: string[]
  source: string | null
  open_access_url: string | null
  relevance_score: number | null
}

export interface Artigo {
  /** ID do OpenAlex, ex.: "W2790016800". */
  id: string
  /** URL completa do DOI. */
  doi: string | null
  titulo: string | null
  ano: number | null
  tipo: string | null
  citacoes: number
  /** Só os nomes: a API não devolve o ID de cada autor. */
  autores: string[]
  /** Periódico, repositório ou conferência. */
  fonte: string | null
  urlAcessoAberto: string | null
}

/** Limites de GET /works, os mesmos da busca semântica do OpenAlex. */
export const MAX_CARACTERES_BUSCA_ARTIGOS = 2000
export const MAX_ARTIGOS = 50

const TIPOS: Record<string, string> = {
  article: "Artigo",
  "book-chapter": "Capítulo de livro",
  book: "Livro",
  dissertation: "Dissertação ou tese",
  preprint: "Preprint",
  review: "Revisão",
  dataset: "Conjunto de dados",
}

/** Tipo do OpenAlex em português; tipos menos comuns aparecem como vieram. */
export function rotuloTipo(tipo: string | null): string | null {
  return tipo && (TIPOS[tipo] ?? tipo)
}

export function urlOpenAlexArtigo(id: string): string {
  return `https://openalex.org/${id}`
}

function paraArtigo(work: WorkRead): Artigo {
  return {
    id: work.id,
    doi: work.doi,
    titulo: work.title,
    ano: work.publication_year,
    tipo: work.type,
    citacoes: work.cited_by_count,
    autores: work.authors,
    fonte: work.source,
    urlAcessoAberto: work.open_access_url,
  }
}

/** Os `MAX_ARTIGOS` mais relevantes, do mais para o menos relevante. */
export async function buscarArtigos(termo: string, signal?: AbortSignal): Promise<Artigo[]> {
  const works = await apiGet<WorkRead[]>("/works", { query: termo, limit: MAX_ARTIGOS }, signal)
  return works.map(paraArtigo)
}
