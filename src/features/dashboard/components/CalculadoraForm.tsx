import { useState, type FormEvent } from "react"
import { MinusIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { calcularCLT, type CalculadoraCLTResultado } from "@/lib/calculadora/calculateCLT"
import { calcularIncentivo, type CalculadoraResultado } from "@/lib/calculadora/calculateUser"
import { getDataFromForm } from "@/lib/calculadora/getDataForms"
import { findFaixa, findTitulacao, TITULACOES, type FaixaBolsa } from "@/lib/calculadora/tabelaBolsas"
import { formatCurrency } from "@/lib/currency"
import { ComparativoLeiDoBem } from "@/features/dashboard/components/ComparativoLeiDoBem"

const TITULO_OPTIONS = TITULACOES.map(({ value, label }) => ({ value, label }))

interface PesquisadorItem {
  id: number
  titulo: string
  faixaId: string
  bolsaMensal: number
  quantidade: number
}

function faixaLabel(faixa: FaixaBolsa) {
  return faixa.faixa ? `${faixa.categoria} — ${faixa.faixa}` : faixa.categoria
}

function faixaOptions(titulo: string) {
  return (findTitulacao(titulo)?.faixas ?? []).map((faixa) => ({
    value: faixa.id,
    label: `${faixaLabel(faixa)} (${formatCurrency(faixa.bolsaMensal)})`,
  }))
}

/**
 * Calculadora Lei do Bem. Cada perfil de pesquisador (titulação → nível de
 * experiência da tabela de bolsas) entra numa lista com quantidade, como um
 * carrinho. Ao calcular, os dados passam por getDataForms.ts e pelos cálculos
 * CLT, pesquisador e Lei do Bem — tudo em TypeScript, direto no front.
 */
export function CalculadoraForm() {
  const [titulo, setTitulo] = useState("")
  const [faixaId, setFaixaId] = useState("")
  const [bolsaMensal, setBolsaMensal] = useState("")

  const [lista, setLista] = useState<PesquisadorItem[]>([])
  const [proximoId, setProximoId] = useState(1)
  const [formAberto, setFormAberto] = useState(true)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [alocacaoExclusiva, setAlocacaoExclusiva] = useState(true)
  const [incremento, setIncremento] = useState(false)
  const [havePatente, setHavePatente] = useState(false)
  const [cofinanciamento, setCofinanciamento] = useState(false)
  const [subvencao, setSubvencao] = useState("0")
  const [periodo, setPeriodo] = useState("0")

  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<CalculadoraResultado | null>(null)
  const [resultadoCLT, setResultadoCLT] = useState<CalculadoraCLTResultado | null>(null)

  const limparPerfil = () => {
    setTitulo("")
    setFaixaId("")
    setBolsaMensal("")
    setEditandoId(null)
  }

  const handleTituloChange = (value: string) => {
    setTitulo(value)
    setFaixaId("")
    setBolsaMensal("")
  }

  const handleFaixaChange = (value: string) => {
    setFaixaId(value)
    const faixa = findFaixa(value)
    if (faixa) setBolsaMensal(String(faixa.bolsaMensal))
  }

  const perfilVazio = !titulo && !faixaId && !bolsaMensal

  /** Lê o perfil preenchido no formulário; lança erro se estiver incompleto. */
  const lerPerfil = () => {
    if (!titulo) throw new Error("Selecione o nível de titulação.")
    if (!faixaId) throw new Error("Selecione o nível de experiência.")
    const bolsa = Number(bolsaMensal)
    if (!bolsaMensal || Number.isNaN(bolsa) || bolsa < 0) throw new Error("Informe uma bolsa mensal válida.")
    return { titulo, faixaId, bolsaMensal: bolsa }
  }

  /** Lista + o perfil aberto no formulário (se preenchido), sem duplicar. */
  const incluirPerfil = (atual: PesquisadorItem[], perfil: ReturnType<typeof lerPerfil>) => {
    if (editandoId !== null) {
      return atual.map((item) => (item.id === editandoId ? { ...item, ...perfil } : item))
    }
    const existente = atual.find(
      (item) => item.faixaId === perfil.faixaId && item.bolsaMensal === perfil.bolsaMensal,
    )
    if (existente) {
      return atual.map((item) => (item === existente ? { ...item, quantidade: item.quantidade + 1 } : item))
    }
    setProximoId((id) => id + 1)
    return [...atual, { id: proximoId, ...perfil, quantidade: 1 }]
  }

  const handleAdicionar = () => {
    setError(null)
    try {
      const perfil = lerPerfil()
      setLista(incluirPerfil(lista, perfil))
      limparPerfil()
      setFormAberto(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar o pesquisador.")
    }
  }

  const handleNovoPerfil = () => {
    limparPerfil()
    setFormAberto(true)
  }

  const handleEditar = (item: PesquisadorItem) => {
    setTitulo(item.titulo)
    setFaixaId(item.faixaId)
    setBolsaMensal(String(item.bolsaMensal))
    setEditandoId(item.id)
    setFormAberto(true)
  }

  const handleExcluir = (id: number) => {
    setLista((atual) => atual.filter((item) => item.id !== id))
    if (editandoId === id) {
      limparPerfil()
    }
  }

  const handleQuantidade = (id: number, delta: number) => {
    setLista((atual) =>
      atual.map((item) => (item.id === id ? { ...item, quantidade: Math.max(1, item.quantidade + delta) } : item)),
    )
  }

  const handleCancelar = () => {
    limparPerfil()
    setFormAberto(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResultado(null)
    setResultadoCLT(null)

    try {
      // O perfil aberto no formulário entra no cálculo se estiver preenchido.
      let itens = lista
      if (formAberto && !perfilVazio) {
        itens = incluirPerfil(lista, lerPerfil())
        setLista(itens)
        limparPerfil()
        setFormAberto(false)
      }

      const dados = getDataFromForm({
        pesquisadores: itens.map((item) => ({
          categoria: findFaixa(item.faixaId)?.categoria ?? "",
          bolsaMensal: item.bolsaMensal,
          quantidade: item.quantidade,
        })),
        alocacaoExclusiva,
        incremento,
        havePatente,
        cofinanciamento,
        // Só valem com cofinanciamento marcado.
        subvencao: cofinanciamento ? Number(subvencao) : 0,
        periodo: cofinanciamento ? Number(periodo) : 0,
      })
      setResultado(calcularIncentivo(dados))
      setResultadoCLT(calcularCLT(dados))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível calcular o incentivo.")
    }
  }

  const faixaSelecionada = findFaixa(faixaId)
  const opcoesFaixa = faixaOptions(titulo)
  const gruposFaixa = (findTitulacao(titulo)?.faixas ?? []).reduce<Record<string, FaixaBolsa[]>>(
    (grupos, faixa) => {
      ;(grupos[faixa.categoria] ??= []).push(faixa)
      return grupos
    },
    {},
  )

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da simulação</CardTitle>
          <CardDescription>
            Adicione os perfis de pesquisador e as condições do projeto. Regime fiscal: Lucro real; alíquota
            IRPJ/CSLL: 34%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">1. Perfil do talento</FieldLegend>

              {lista.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {lista.map((item) => {
                    const faixa = findFaixa(item.faixaId)
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted p-4"
                      >
                        <div className="min-w-0">
                          <p className="font-heading font-semibold">{faixa?.categoria ?? item.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {faixa?.faixa ? `${faixa.faixa} · ` : ""}Bolsa {formatCurrency(item.bolsaMensal)}/mês
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Diminuir quantidade"
                            disabled={item.quantidade <= 1}
                            onClick={() => handleQuantidade(item.id, -1)}
                          >
                            <MinusIcon />
                          </Button>
                          <span className="w-8 text-center font-heading font-semibold" aria-live="polite">
                            {item.quantidade}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Aumentar quantidade"
                            onClick={() => handleQuantidade(item.id, 1)}
                          >
                            <PlusIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Editar pesquisador"
                            onClick={() => handleEditar(item)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            aria-label="Excluir pesquisador"
                            onClick={() => handleExcluir(item.id)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {formAberto || lista.length === 0 ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="titulo">Nível de titulação</FieldLabel>
                    <Select items={TITULO_OPTIONS} value={titulo} onValueChange={(value) => handleTituloChange(value ?? "")}>
                      <SelectTrigger id="titulo" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {TITULO_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  {titulo && (
                    <Field>
                      <FieldLabel htmlFor="faixa">Nível de experiência</FieldLabel>
                      <Select items={opcoesFaixa} value={faixaId} onValueChange={(value) => handleFaixaChange(value ?? "")}>
                        <SelectTrigger id="faixa" className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(gruposFaixa).map(([categoria, faixas]) => (
                            <SelectGroup key={categoria}>
                              <SelectLabel>{categoria}</SelectLabel>
                              {faixas.map((faixa) => (
                                <SelectItem key={faixa.id} value={faixa.id}>
                                  {faixaLabel(faixa)} ({formatCurrency(faixa.bolsaMensal)})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      {faixaSelecionada && <FieldDescription>{faixaSelecionada.perfil}</FieldDescription>}
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="bolsaMensal">Bolsa mensal (R$)</FieldLabel>
                    <Input
                      id="bolsaMensal"
                      type="number"
                      min={0}
                      step={0.01}
                      value={bolsaMensal}
                      onChange={(event) => setBolsaMensal(event.target.value)}
                    />
                    <FieldDescription>Preenchida pela tabela de bolsas ao escolher o nível de experiência.</FieldDescription>
                  </Field>

                  {lista.length > 0 && (
                    <Button type="button" variant="ghost" className="self-start" onClick={handleCancelar}>
                      Cancelar
                    </Button>
                  )}
                </FieldGroup>
              ) : (
                <Button type="button" variant="outline" className="self-start" onClick={handleNovoPerfil}>
                  <PlusIcon />
                  Adicionar outro perfil de pesquisador
                </Button>
              )}
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">2. Variáveis da Lei do Bem</FieldLegend>
              <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field orientation="horizontal" className="rounded-xl border border-border bg-muted p-4">
                  <FieldContent>
                    <FieldTitle>Alocação exclusiva em P&D</FieldTitle>
                    <FieldDescription>
                      100% do tempo dedicado ao projeto.
                    </FieldDescription>
                  </FieldContent>
                  <Switch checked={alocacaoExclusiva} onCheckedChange={setAlocacaoExclusiva} />
                </Field>

                <Field orientation="horizontal" className="rounded-xl border border-border bg-muted p-4">
                  <FieldContent>
                    <FieldTitle>Incremento de equipe de P&D</FieldTitle>
                    <FieldDescription>
                      Aumento de contratados no período (+20% na dedução).
                    </FieldDescription>
                  </FieldContent>
                  <Switch checked={incremento} onCheckedChange={setIncremento} />
                </Field>

                <Field orientation="horizontal" className="rounded-xl border border-border bg-muted p-4">
                  <FieldContent>
                    <FieldTitle>Registro de patente no ano</FieldTitle>
                    <FieldDescription>
                      Concessão ou depósito de patente no período (+20% na exclusão).
                    </FieldDescription>
                  </FieldContent>
                  <Switch checked={havePatente} onCheckedChange={setHavePatente} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">3. Fomento &amp; subvenção</FieldLegend>
              <FieldGroup>
                <Field orientation="horizontal" className="rounded-xl border border-border p-4">
                  <FieldContent>
                    <FieldTitle>Utiliza programa de cofinanciamento</FieldTitle>
                    <FieldDescription>
                      Subvenção de transição ao custeio da bolsa nos primeiros 12 meses.
                    </FieldDescription>
                  </FieldContent>
                  <Switch checked={cofinanciamento} onCheckedChange={setCofinanciamento} />
                </Field>

                {cofinanciamento && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="subvencao">Subvenção de transição (% do custeio da bolsa)</FieldLabel>
                      <Input
                        id="subvencao"
                        type="number"
                        min={0}
                        max={50}
                        step={0.01}
                        value={subvencao}
                        onChange={(event) => setSubvencao(event.target.value)}
                        required
                      />
                      <FieldDescription>0% a 50% — obrigatório só com cofinanciamento.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="periodo">Período de subvenção (meses)</FieldLabel>
                      <Input
                        id="periodo"
                        type="number"
                        min={0}
                        max={12}
                        step={1}
                        value={periodo}
                        onChange={(event) => setPeriodo(event.target.value)}
                        required
                      />
                      <FieldDescription>0 a 12 meses cobertos por edital.</FieldDescription>
                    </Field>
                  </>
                )}
              </FieldGroup>
            </FieldSet>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
              {(formAberto || lista.length === 0) && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl px-8 text-base"
                  onClick={handleAdicionar}
                >
                  {editandoId !== null ? "Salvar pesquisador" : "Adicionar pesquisador"}
                </Button>
              )}
              <Button type="submit" size="lg" className="h-12 rounded-xl px-8 text-base">
                Calcular
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {resultado && resultadoCLT && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>CLT</CardTitle>
              <CardDescription>Bolsa como salário, com 13º, 1/3 de férias e 70% de encargos, sem a Lei do Bem.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-muted p-4">
                <p className="text-xs font-medium text-muted-foreground">Custo anual (sem incentivo)</p>
                <p className="font-heading text-2xl font-bold">{formatCurrency(resultadoCLT.custoBruto)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesquisador</CardTitle>
              <CardDescription>Bolsa anual mais taxas e custos fixos do projeto, sem a Lei do Bem.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Bolsa anual</dt>
                  <dd className="font-heading text-lg font-semibold">{formatCurrency(resultado.bolsaAnual)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Taxa adm (5%)</dt>
                  <dd className="font-heading text-lg font-semibold">{formatCurrency(resultado.taxaAdm)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Análise de projeto</dt>
                  <dd className="font-heading text-lg font-semibold">{formatCurrency(resultado.analiseProjeto)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Gestão operacional</dt>
                  <dd className="font-heading text-lg font-semibold">{formatCurrency(resultado.gestaoOperacional)}</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl border border-border bg-muted p-4">
                <p className="text-xs font-medium text-muted-foreground">Investimento total</p>
                <p className="font-heading text-2xl font-bold">{formatCurrency(resultado.investimentoTotal)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesquisador Lei do Bem</CardTitle>
              <CardDescription>Investimento total após a economia de IRPJ/CSLL com a Lei do Bem.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Exclusão adicional Lei do Bem</dt>
                  <dd className="font-heading text-lg font-semibold">{(resultado.leidobem * 100).toLocaleString("pt-BR")}%</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Economia com a Lei do Bem</dt>
                  <dd className="font-heading text-lg font-semibold text-pierx-green">{formatCurrency(resultado.incentivo)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Economia sobre o investimento total</dt>
                  <dd className="font-heading text-lg font-semibold text-pierx-green">
                    {resultado.percentualEconomia.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-pierx-green p-4 text-off-white">
                <p className="text-xs font-medium text-off-white/80">Custo líquido (após a Lei do Bem)</p>
                <p className="font-heading text-2xl font-extrabold">
                  {formatCurrency(resultado.custoLiquido)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {resultado && resultadoCLT && <ComparativoLeiDoBem clt={resultadoCLT} leiDoBem={resultado} />}
    </div>
  )
}
