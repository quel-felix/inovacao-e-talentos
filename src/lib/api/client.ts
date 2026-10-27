/**
 * Cliente HTTP da api_pesquisadores. O front sempre chama `/api/v1/...` no
 * próprio domínio; o proxy do Vite (vite.config.ts) repassa para a API e
 * injeta o X-API-Key, para a chave nunca ir para o navegador.
 */

const BASE_URL = "/api/v1"

export class ApiError extends Error {
  /** Status HTTP da resposta; 0 quando nem chegou a haver resposta. */
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** A API responde `{detail}` em inglês; na tela aparece a mensagem do status. */
function mensagemDeErro(status: number): string {
  switch (status) {
    case 401:
      return "Acesso à API negado: a chave de acesso está ausente ou inválida."
    case 400:
    case 422:
      return "A API recusou a busca. Revise o termo e tente de novo."
    // A API devolve 502 para qualquer falha do OpenAlex; na prática, quase
    // sempre é o limite de uso da busca semântica (429 lá), que libera em segundos.
    case 502:
      return "O OpenAlex está limitando as buscas no momento. Aguarde alguns segundos e tente de novo."
    default:
      return "Não foi possível falar com a API de pesquisadores."
  }
}

export type ApiParams = Record<string, string | number | undefined>

export async function apiGet<T>(path: string, params: ApiParams = {}, signal?: AbortSignal): Promise<T> {
  const query = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined) query.set(chave, String(valor))
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}?${query}`, { signal, headers: { Accept: "application/json" } })
  } catch (erro) {
    // Cancelamento não é erro de rede: quem cancelou decide o que fazer.
    if (signal?.aborted) throw erro
    throw new ApiError(0, "Não foi possível conectar à API de pesquisadores.")
  }

  if (!response.ok) throw new ApiError(response.status, mensagemDeErro(response.status))
  return (await response.json()) as T
}
