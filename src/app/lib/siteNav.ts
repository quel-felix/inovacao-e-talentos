/** Seções da página única; o `id` é a âncora (#id) usada pelo menu do topo. */
export const SECOES = [
  { id: "inicio", label: "Início" },
  { id: "calculadora", label: "Calculadora" },
  { id: "pesquisa", label: "Pesquisa" },
] as const

export type SecaoId = (typeof SECOES)[number]["id"]
