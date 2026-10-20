import { useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"

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
import { PesquisadorSheet } from "@/features/pesquisa/components/PesquisadorSheet"
import { filtrarPesquisadores, rotuloConceito, type TipoPesquisa } from "@/lib/pesquisa/filtrarPesquisadores"
import {
  NIVEIS_FORMACAO,
  PESQUISADORES,
  REGIOES,
  UFS,
  UFS_POR_REGIAO,
  type NivelFormacao,
  type Pesquisador,
  type Regiao,
  type UF,
} from "@/lib/pesquisa/pesquisadores"

const TIPO_PESQUISA_OPTIONS: { value: TipoPesquisa; label: string; placeholder: string }[] = [
  { value: "nome", label: "Nome", placeholder: "Buscar por nome do pesquisador" },
  { value: "artigos", label: "Artigos", placeholder: "Buscar por título de artigo" },
  { value: "instituicoes", label: "Instituições", placeholder: "Buscar por instituição" },
]

/** Valor do item "Todas" nos selects de filtro; vira `null` no estado. */
const TODAS = "todas"

const comTodas = (valores: string[]) => [
  { value: TODAS, label: "Todas" },
  ...valores.map((valor) => ({ value: valor, label: valor })),
]

const REGIAO_OPTIONS = comTodas(REGIOES)
const FORMACAO_OPTIONS = comTodas(NIVEIS_FORMACAO)

interface FiltroSelectProps {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function FiltroSelect({ id, label, options, value, onChange }: FiltroSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select items={options} value={value} onValueChange={(next) => next && onChange(next)}>
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

const COLUNAS = ["Nome", "Região", "UF", "Formação", "Instituição", "Curso", "Conceito do curso"]

export function PesquisaPage() {
  const [tipo, setTipo] = useState<TipoPesquisa>(TIPO_PADRAO)
  const [termo, setTermo] = useState("")
  const [regiao, setRegiao] = useState(TODAS)
  const [uf, setUf] = useState(TODAS)
  const [formacao, setFormacao] = useState(TODAS)

  // O select de UF só lista os estados da região escolhida.
  const ufOptions = useMemo(() => comTodas(regiao === TODAS ? UFS : UFS_POR_REGIAO[regiao as Regiao]), [regiao])

  const alterarRegiao = (proxima: string) => {
    setRegiao(proxima)
    if (proxima !== TODAS && uf !== TODAS && !UFS_POR_REGIAO[proxima as Regiao].includes(uf as UF)) {
      setUf(TODAS)
    }
  }

  // `selecionado` continua preenchido enquanto o painel fecha, para o conteúdo
  // não sumir durante a animação de saída.
  const [selecionado, setSelecionado] = useState<Pesquisador | null>(null)
  const [painelAberto, setPainelAberto] = useState(false)

  const resultados = useMemo(
    () =>
      filtrarPesquisadores(PESQUISADORES, {
        tipo,
        termo,
        regiao: regiao === TODAS ? null : (regiao as Regiao),
        uf: uf === TODAS ? null : (uf as UF),
        formacao: formacao === TODAS ? null : (formacao as NivelFormacao),
      }),
    [tipo, termo, regiao, uf, formacao],
  )

  const filtrosAtivos = termo !== "" || regiao !== TODAS || uf !== TODAS || formacao !== TODAS

  const limparFiltros = () => {
    setTipo(TIPO_PADRAO)
    setTermo("")
    setRegiao(TODAS)
    setUf(TODAS)
    setFormacao(TODAS)
  }

  // Volta para a página 1 sempre que algum filtro muda.
  const [pagina, setPagina] = useState(1)
  const chaveFiltros = [tipo, termo, regiao, uf, formacao].join("|")
  const [chavePaginada, setChavePaginada] = useState(chaveFiltros)
  if (chavePaginada !== chaveFiltros) {
    setChavePaginada(chaveFiltros)
    setPagina(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const primeiro = (paginaAtual - 1) * POR_PAGINA
  const resultadosDaPagina = resultados.slice(primeiro, primeiro + POR_PAGINA)

  const abrirPesquisador = (pesquisador: Pesquisador) => {
    setSelecionado(pesquisador)
    setPainelAberto(true)
  }

  const placeholder = TIPO_PESQUISA_OPTIONS.find((option) => option.value === tipo)?.placeholder

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros de busca</CardTitle>
          <CardDescription>Escolha o tipo de busca, digite o termo e refine com os filtros.</CardDescription>
          <CardAction>
            <Button variant="outline" onClick={limparFiltros} disabled={!filtrosAtivos}>
              <XIcon />
              Limpar filtros
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr]">
            <FiltroSelect
              id="tipoPesquisa"
              label="Pesquisar por"
              options={TIPO_PESQUISA_OPTIONS}
              value={tipo}
              onChange={(value) => setTipo(value as TipoPesquisa)}
            />
            <Field>
              <FieldLabel htmlFor="termo">Termo</FieldLabel>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="termo"
                  type="search"
                  className="pl-8"
                  placeholder={placeholder}
                  value={termo}
                  onChange={(event) => setTermo(event.target.value)}
                />
              </div>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FiltroSelect id="regiao" label="Região" options={REGIAO_OPTIONS} value={regiao} onChange={alterarRegiao} />
            <FiltroSelect id="uf" label="UF" options={ufOptions} value={uf} onChange={setUf} />
            <FiltroSelect
              id="formacao"
              label="Formação"
              options={FORMACAO_OPTIONS}
              value={formacao}
              onChange={setFormacao}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {resultados.length === 1 ? "1 pesquisador encontrado" : `${resultados.length} pesquisadores encontrados`}
            . Clique em um nome para ver os detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs font-semibold text-night-blue/75">
                <tr>
                  {COLUNAS.map((coluna) => (
                    <th key={coluna} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultadosDaPagina.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => abrirPesquisador(p)}
                    className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          abrirPesquisador(p)
                        }}
                        className="text-left font-semibold text-piera-blue underline-offset-4 outline-none hover:underline focus-visible:underline"
                      >
                        {p.nome}
                      </button>
                    </td>
                    <td className="px-4 py-3">{p.regiao}</td>
                    <td className="px-4 py-3">{p.uf}</td>
                    <td className="px-4 py-3">{p.formacao}</td>
                    <td className="px-4 py-3">{p.instituicao}</td>
                    <td className="px-4 py-3">{p.curso}</td>
                    <td className="px-4 py-3">{rotuloConceito(p.conceitoCurso)}</td>
                  </tr>
                ))}
                {resultados.length === 0 && (
                  <tr className="border-t border-border">
                    <td colSpan={COLUNAS.length} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pesquisador encontrado com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {resultados.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Mostrando {primeiro + 1}–{primeiro + resultadosDaPagina.length} de {resultados.length}
              </p>
              {totalPaginas > 1 && (
                <Paginacao pagina={paginaAtual} totalPaginas={totalPaginas} onChange={setPagina} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PesquisadorSheet pesquisador={selecionado} open={painelAberto} onOpenChange={setPainelAberto} />
    </div>
  )
}
