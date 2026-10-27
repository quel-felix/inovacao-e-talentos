import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, RotateCwIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtigoSheet } from "@/features/pesquisa/components/ArtigoSheet"
import { PesquisadorSheet } from "@/features/pesquisa/components/PesquisadorSheet"
import { ouSemInformacao } from "@/features/pesquisa/components/SemInformacao"
import { useConsulta, type EstadoConsulta } from "@/lib/api/useConsulta"
import { formatNumber } from "@/lib/number"
import { buscarArtigos, MAX_CARACTERES_BUSCA_ARTIGOS, type Artigo } from "@/lib/pesquisa/artigos"
import {
  buscarPesquisadoresPorNome,
  MAX_CARACTERES_NOME,
  MAX_RESULTADOS_PAGINADOS,
  NIVEIS_FORMACAO,
  REGIOES,
  rotuloConceito,
  UFS,
  type Pesquisador,
} from "@/lib/pesquisa/pesquisadores"

type TipoPesquisa = "nome" | "artigos" | "instituicoes"

const TIPO_PESQUISA_OPTIONS: { value: TipoPesquisa; label: string; placeholder: string; maxLength: number }[] = [
  { value: "nome", label: "Nome", placeholder: "Buscar por nome do pesquisador", maxLength: MAX_CARACTERES_NOME },
  {
    value: "artigos",
    label: "Artigos",
    placeholder: "Buscar pelo tema dos artigos",
    maxLength: MAX_CARACTERES_BUSCA_ARTIGOS,
  },
  { value: "instituicoes", label: "Instituições", placeholder: "Buscar por instituição", maxLength: 200 },
]

/** Valor do item "Todas" nos selects de filtro. */
const TODAS = "todas"

const comTodas = (valores: string[]) => [
  { value: TODAS, label: "Todas" },
  ...valores.map((valor) => ({ value: valor, label: valor })),
]

const REGIAO_OPTIONS = comTodas(REGIOES)
const UF_OPTIONS = comTodas(UFS)
const FORMACAO_OPTIONS = comTodas(NIVEIS_FORMACAO)

interface FiltroSelectProps {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function FiltroSelect({ id, label, options, value, onChange, disabled }: FiltroSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select items={options} value={value} onValueChange={(next) => next && onChange(next)} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

/** Quantos pesquisadores aparecem em cada página da tabela. */
const POR_PAGINA = 20

const TIPO_PADRAO: TipoPesquisa = "artigos"

/** Busca enviada pelo formulário; `envio` muda a cada clique, para repetir a mesma busca. */
interface Busca {
  tipo: TipoPesquisa
  termo: string
  envio: number
}

/**
 * Números de página mostrados na paginação: todos quando são poucos; senão a
 * primeira, a última e as vizinhas da atual, com "…" nos saltos.
 */
function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const inicio = Math.max(2, atual - 1)
  const fim = Math.min(total - 1, atual + 1)
  return [
    1,
    ...(inicio > 2 ? ["…" as const] : []),
    ...Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i),
    ...(fim < total - 1 ? ["…" as const] : []),
    total,
  ]
}

interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

function Paginacao({ pagina, totalPaginas, onChange }: PaginacaoProps) {
  return (
    <nav aria-label="Paginação dos resultados" className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={pagina === 1}
        onClick={() => onChange(pagina - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      {paginasVisiveis(pagina, totalPaginas).map((item, index) =>
        item === "…" ? (
          <span key={`salto-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === pagina ? "default" : "ghost"}
            size="icon"
            aria-current={item === pagina ? "page" : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={pagina === totalPaginas}
        onClick={() => onChange(pagina + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  )
}

const COLUNAS_PESQUISADORES = ["Nome", "Região", "UF", "Formação", "Instituição", "Curso", "Conceito do curso"]

/** A busca por artigos lista os próprios artigos, com o que a API devolve deles. */
const COLUNAS_ARTIGOS = ["Título", "Autores", "Ano", "Fonte", "Citações"]

function LinhaMensagem({ colunas, children }: { colunas: number; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <td colSpan={colunas} className="px-4 py-8 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  )
}

interface LinhaResultadoProps {
  titulo: string
  onAbrir: () => void
  children: React.ReactNode
}

/** Linha clicável; a primeira célula é um botão para abrir pelo teclado também. */
function LinhaResultado({ titulo, onAbrir, children }: LinhaResultadoProps) {
  return (
    <tr onClick={onAbrir} className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAbrir()
          }}
          className="text-left font-semibold text-piera-blue underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          {titulo}
        </button>
      </td>
      {children}
    </tr>
  )
}

/** Até três autores; o resto vira "et al.". */
function resumirAutores(autores: string[]): string | null {
  if (autores.length === 0) return null
  if (autores.length <= 3) return autores.join(", ")
  return `${autores.slice(0, 3).join(", ")} et al.`
}

type Selecionado = { tipo: "pesquisador"; pesquisador: Pesquisador } | { tipo: "artigo"; artigo: Artigo }

export function PesquisaPage() {
  const [tipo, setTipo] = useState<TipoPesquisa>(TIPO_PADRAO)
  const [termo, setTermo] = useState("")
  // Muda a chave da consulta para refazer a mesma busca depois de um erro.
  const [tentativa, setTentativa] = useState(0)

  // A API só é chamada ao enviar o formulário (botão Pesquisar ou Enter), nunca
  // a cada tecla: a busca de artigos tem cota de uso no OpenAlex.
  const [busca, setBusca] = useState<Busca | null>(null)
  const tipoBuscado = busca?.tipo ?? tipo
  const termoBuscado = busca?.termo ?? ""

  const termoValido = termo.trim() !== ""

  const pesquisar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!termoValido) return
    setBusca((atual) => ({ tipo, termo: termo.trim(), envio: (atual?.envio ?? 0) + 1 }))
  }

  const opcaoTipo = TIPO_PESQUISA_OPTIONS.find((option) => option.value === tipo)!

  const alterarTipo = (proximo: TipoPesquisa) => {
    setTipo(proximo)
    // Nome aceita menos caracteres que artigos; o excedente daria 422 na API.
    const limite = TIPO_PESQUISA_OPTIONS.find((option) => option.value === proximo)!.maxLength
    setTermo((atual) => atual.slice(0, limite))
  }

  // `selecionado` continua preenchido enquanto o painel fecha, para o conteúdo
  // não sumir durante a animação de saída.
  const [selecionado, setSelecionado] = useState<Selecionado | null>(null)
  const [painelAberto, setPainelAberto] = useState(false)

  // Volta para a página 1 sempre que a busca muda.
  const [pagina, setPagina] = useState(1)
  const chaveBusca = busca ? `${busca.tipo}|${busca.termo}|${busca.envio}` : ""
  const [chavePaginada, setChavePaginada] = useState(chaveBusca)
  if (chavePaginada !== chaveBusca) {
    setChavePaginada(chaveBusca)
    setPagina(1)
  }

  // Por nome, a API pagina; os artigos vêm todos de uma vez (os mais
  // relevantes) e paginam aqui, então trocar de página não refaz a busca.
  const porNome = useConsulta(
    busca?.tipo === "nome" ? `${chaveBusca}|${pagina}|${tentativa}` : null,
    (signal) => buscarPesquisadoresPorNome({ nome: termoBuscado, pagina, porPagina: POR_PAGINA }, signal),
  )
  const porArtigos = useConsulta(busca?.tipo === "artigos" ? `${chaveBusca}|${tentativa}` : null, (signal) =>
    buscarArtigos(termoBuscado, signal),
  )
  const estado: EstadoConsulta<unknown> = tipoBuscado === "nome" ? porNome : porArtigos

  // Guarda o total da busca para a paginação não sumir enquanto a próxima página carrega.
  const [totalConhecido, setTotalConhecido] = useState({ chave: "", total: 0 })
  if (porNome.status === "sucesso" && (totalConhecido.chave !== chaveBusca || totalConhecido.total !== porNome.dados.total)) {
    setTotalConhecido({ chave: chaveBusca, total: porNome.dados.total })
  }

  let total = 0
  if (tipoBuscado === "nome") {
    total = totalConhecido.chave === chaveBusca ? totalConhecido.total : 0
  } else if (porArtigos.status === "sucesso") {
    total = porArtigos.dados.length
  }

  // O OpenAlex só pagina até o 10.000º resultado de uma busca.
  const totalPaginavel = tipoBuscado === "nome" ? Math.min(total, MAX_RESULTADOS_PAGINADOS) : total
  const totalPaginas = Math.max(1, Math.ceil(totalPaginavel / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const primeiro = (paginaAtual - 1) * POR_PAGINA

  const pesquisadoresDaPagina = tipoBuscado === "nome" && porNome.status === "sucesso" ? porNome.dados.resultados : []
  const artigosDaPagina =
    tipoBuscado === "artigos" && porArtigos.status === "sucesso"
      ? porArtigos.dados.slice(primeiro, primeiro + POR_PAGINA)
      : []
  const linhasNaPagina = tipoBuscado === "artigos" ? artigosDaPagina.length : pesquisadoresDaPagina.length
  const colunas = tipoBuscado === "artigos" ? COLUNAS_ARTIGOS : COLUNAS_PESQUISADORES

  const filtrosAtivos = termo !== "" || tipo !== TIPO_PADRAO || busca !== null

  const limparFiltros = () => {
    setTipo(TIPO_PADRAO)
    setTermo("")
    setBusca(null)
  }

  const abrir = (item: Selecionado) => {
    setSelecionado(item)
    setPainelAberto(true)
  }

  let descricao = "Digite um termo e clique em Pesquisar."
  if (tipoBuscado === "instituicoes") {
    descricao = "A busca por instituição ainda não está disponível."
  } else if (estado.status === "carregando") {
    descricao = "Buscando…"
  } else if (estado.status === "erro") {
    descricao = "A busca não pôde ser concluída."
  } else if (estado.status === "sucesso" && tipoBuscado === "nome") {
    descricao = `${total === 1 ? "1 pesquisador encontrado" : `${formatNumber(total)} pesquisadores encontrados`}. Clique em um nome para ver os detalhes.`
  } else if (estado.status === "sucesso") {
    descricao = `${total === 1 ? "1 artigo" : `${total} artigos`} mais próximos do tema, do mais ao menos relevante. Clique em um título para ver os detalhes.`
  }

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros de busca</CardTitle>
          <CardDescription>
            Escolha o tipo de busca e digite o termo. Os filtros de região, UF e formação serão liberados quando a base
            tiver esses dados.
          </CardDescription>
          <CardAction>
            <Button variant="outline" onClick={limparFiltros} disabled={!filtrosAtivos}>
              <XIcon />
              Limpar filtros
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={pesquisar} className="flex flex-col gap-6">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr_auto]">
              <FiltroSelect
                id="tipoPesquisa"
                label="Pesquisar por"
                options={TIPO_PESQUISA_OPTIONS}
                value={tipo}
                onChange={(value) => alterarTipo(value as TipoPesquisa)}
              />
              <Field>
                <FieldLabel htmlFor="termo">Termo</FieldLabel>
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="termo"
                    type="search"
                    className="pl-8"
                    placeholder={opcaoTipo.placeholder}
                    maxLength={opcaoTipo.maxLength}
                    value={termo}
                    onChange={(event) => setTermo(event.target.value)}
                  />
                </div>
              </Field>
              {/* Travado enquanto busca, para não empilhar requisições no limite do OpenAlex. */}
              <Button type="submit" className="self-end" disabled={!termoValido || estado.status === "carregando"}>
                <SearchIcon />
                Pesquisar
              </Button>
            </FieldGroup>

            {/* A API ainda não tem região, UF nem formação: os filtros ficam à mostra, mas travados em "Todas". */}
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FiltroSelect id="regiao" label="Região" options={REGIAO_OPTIONS} value={TODAS} onChange={() => {}} disabled />
              <FiltroSelect id="uf" label="UF" options={UF_OPTIONS} value={TODAS} onChange={() => {}} disabled />
              <FiltroSelect
                id="formacao"
                label="Formação"
                options={FORMACAO_OPTIONS}
                value={TODAS}
                onChange={() => {}}
                disabled
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription aria-live="polite">{descricao}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs font-semibold text-night-blue/75">
                <tr>
                  {colunas.map((coluna) => (
                    <th key={coluna} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody aria-busy={estado.status === "carregando"}>
                {tipoBuscado === "instituicoes" ? (
                  <LinhaMensagem colunas={colunas.length}>
                    A busca por instituição ainda não está disponível. Use Nome ou Artigos.
                  </LinhaMensagem>
                ) : (
                  <>
                    {estado.status === "ocioso" && (
                      <LinhaMensagem colunas={colunas.length}>Digite um termo e clique em Pesquisar.</LinhaMensagem>
                    )}
                    {estado.status === "carregando" &&
                      Array.from({ length: 5 }, (_, linha) => (
                        <tr key={linha} className="border-t border-border">
                          {colunas.map((coluna) => (
                            <td key={coluna} className="px-4 py-3">
                              <Skeleton className="h-4 w-full min-w-12" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    {estado.status === "erro" && (
                      <LinhaMensagem colunas={colunas.length}>
                        <div role="alert" className="flex flex-col items-center gap-3">
                          {estado.mensagem}
                          <Button variant="outline" onClick={() => setTentativa((atual) => atual + 1)}>
                            <RotateCwIcon />
                            Tentar de novo
                          </Button>
                        </div>
                      </LinhaMensagem>
                    )}
                    {estado.status === "sucesso" && linhasNaPagina === 0 && (
                      <LinhaMensagem colunas={colunas.length}>Nenhum resultado encontrado para esse termo.</LinhaMensagem>
                    )}
                  </>
                )}
                {pesquisadoresDaPagina.map((p) => (
                  <LinhaResultado key={p.id} titulo={p.nome} onAbrir={() => abrir({ tipo: "pesquisador", pesquisador: p })}>
                    <td className="px-4 py-3">{ouSemInformacao(p.regiao)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(p.uf)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(p.formacao)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(p.instituicao)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(p.curso)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(rotuloConceito(p.conceitoCurso))}</td>
                  </LinhaResultado>
                ))}
                {artigosDaPagina.map((a) => (
                  <LinhaResultado
                    key={a.id}
                    titulo={a.titulo ?? "Sem título"}
                    onAbrir={() => abrir({ tipo: "artigo", artigo: a })}
                  >
                    <td className="px-4 py-3">{ouSemInformacao(resumirAutores(a.autores))}</td>
                    <td className="px-4 py-3 tabular-nums">{ouSemInformacao(a.ano)}</td>
                    <td className="px-4 py-3">{ouSemInformacao(a.fonte)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(a.citacoes)}</td>
                  </LinhaResultado>
                ))}
              </tbody>
            </table>
          </div>

          {(linhasNaPagina > 0 || (estado.status === "carregando" && totalPaginas > 1)) && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {linhasNaPagina > 0 &&
                  `Mostrando ${formatNumber(primeiro + 1)}–${formatNumber(primeiro + linhasNaPagina)} de ${formatNumber(total)}`}
                {totalPaginavel < total && " (a navegação vai até o 10.000º resultado)"}
              </p>
              {totalPaginas > 1 && <Paginacao pagina={paginaAtual} totalPaginas={totalPaginas} onChange={setPagina} />}
            </div>
          )}
        </CardContent>
      </Card>

      <PesquisadorSheet
        pesquisador={selecionado?.tipo === "pesquisador" ? selecionado.pesquisador : null}
        open={painelAberto && selecionado?.tipo === "pesquisador"}
        onOpenChange={setPainelAberto}
      />
      <ArtigoSheet
        artigo={selecionado?.tipo === "artigo" ? selecionado.artigo : null}
        open={painelAberto && selecionado?.tipo === "artigo"}
        onOpenChange={setPainelAberto}
      />
    </div>
  )
}
