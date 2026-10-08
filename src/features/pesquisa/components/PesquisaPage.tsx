import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  FAIXA_CONCEITO_PADRAO,
  FAIXAS_CONCEITO,
  filtrarPesquisadores,
  rotuloConceito,
  type FaixaConceito,
  type TipoPesquisa,
} from "@/lib/pesquisa/filtrarPesquisadores"
import {
  NIVEIS_FORMACAO,
  PESQUISADORES,
  REGIOES,
  type NivelFormacao,
  type Pesquisador,
  type Regiao,
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
const INSTITUICAO_OPTIONS = comTodas(
  [...new Set(PESQUISADORES.map((p) => p.instituicao))].sort((a, b) => a.localeCompare(b, "pt-BR")),
)

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

const COLUNAS = ["Nome", "Região", "Formação", "Instituição", "Curso", "Conceito do curso"]

export function PesquisaPage() {
  const [tipo, setTipo] = useState<TipoPesquisa>("artigos")
  const [termo, setTermo] = useState("")
  const [regiao, setRegiao] = useState(TODAS)
  const [formacao, setFormacao] = useState(TODAS)
  const [instituicao, setInstituicao] = useState(TODAS)
  const [conceito, setConceito] = useState<FaixaConceito>(FAIXA_CONCEITO_PADRAO)

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
        formacao: formacao === TODAS ? null : (formacao as NivelFormacao),
        instituicao: instituicao === TODAS ? null : instituicao,
        conceito,
      }),
    [tipo, termo, regiao, formacao, instituicao, conceito],
  )

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

          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FiltroSelect id="regiao" label="Região" options={REGIAO_OPTIONS} value={regiao} onChange={setRegiao} />
            <FiltroSelect
              id="formacao"
              label="Formação"
              options={FORMACAO_OPTIONS}
              value={formacao}
              onChange={setFormacao}
            />
            <FiltroSelect
              id="instituicao"
              label="Instituição"
              options={INSTITUICAO_OPTIONS}
              value={instituicao}
              onChange={setInstituicao}
            />
            <FiltroSelect
              id="conceito"
              label="Conceito do curso (a partir de)"
              options={FAIXAS_CONCEITO}
              value={conceito}
              onChange={(value) => setConceito(value as FaixaConceito)}
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
                {resultados.map((p) => (
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
        </CardContent>
      </Card>

      <PesquisadorSheet pesquisador={selecionado} open={painelAberto} onOpenChange={setPainelAberto} />
    </div>
  )
}
