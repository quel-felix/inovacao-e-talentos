import { useEffect, useRef, useState } from "react"

import { ApiError } from "@/lib/api/client"

export type EstadoConsulta<T> =
  | { status: "ocioso" }
  | { status: "carregando" }
  | { status: "sucesso"; dados: T }
  | { status: "erro"; mensagem: string }

type Resultado<T> = { chave: string; dados: T; erro: null } | { chave: string; dados: null; erro: string }

/**
 * Roda `consultar` sempre que `chave` muda e cancela a requisição anterior,
 * para uma resposta atrasada nunca sobrescrever a da busca mais recente.
 * `chave` nula = nada a buscar ("ocioso").
 */
export function useConsulta<T>(chave: string | null, consultar: (signal: AbortSignal) => Promise<T>): EstadoConsulta<T> {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  // Só a chave dispara a busca; a função mais recente fica guardada aqui.
  const consultarRef = useRef(consultar)
  useEffect(() => {
    consultarRef.current = consultar
  })

  useEffect(() => {
    if (chave === null) return
    const controller = new AbortController()
    consultarRef.current(controller.signal).then(
      (dados) => {
        if (!controller.signal.aborted) setResultado({ chave, dados, erro: null })
      },
      (erro: unknown) => {
        if (controller.signal.aborted) return
        const mensagem = erro instanceof ApiError ? erro.message : "Erro inesperado ao buscar os dados."
        setResultado({ chave, dados: null, erro: mensagem })
      },
    )
    return () => controller.abort()
  }, [chave])

  if (chave === null) return { status: "ocioso" }
  if (resultado?.chave !== chave) return { status: "carregando" }
  return resultado.erro === null
    ? { status: "sucesso", dados: resultado.dados }
    : { status: "erro", mensagem: resultado.erro }
}
