import { useState, type FormEvent } from "react"

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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { calcularCLT, type CalculadoraCLTResultado } from "@/lib/calculadora/calculateCLT"
import { calcularIncentivo, type CalculadoraResultado } from "@/lib/calculadora/calculateUser"
import { getDataFromForm } from "@/lib/calculadora/getDataForms"
import { formatCurrency } from "@/lib/currency"
import { ComparativoLeiDoBem } from "@/features/dashboard/components/ComparativoLeiDoBem"

const TITULO_OPTIONS = [
  { value: "Mestre", label: "Mestre" },
  { value: "Doutor", label: "Doutor" },
  { value: "Pós-Doutor", label: "Pós-Doutor" },
]

const REGIME_OPTIONS = [
  { value: "Lucro real", label: "Lucro real" },
  { value: "Lucro presumido", label: "Lucro presumido" },
  { value: "Simples Nacional", label: "Simples Nacional" },
]

/**
 * Mesmos campos de formulario.html (a versão HTML pura da calculadora), só que
 * no formato de tela do projeto ANP. Ao enviar, os dados passam por
 * getDataForms.ts (variáveis) e calculateUser.ts (o cálculo de
 * calculadora.py) — tudo em TypeScript, direto no front, sem back-end.
 */
export function CalculadoraForm() {
  const [titulo, setTitulo] = useState("")
  const [salBrutoMensal, setSalBrutoMensal] = useState("")
  const [pesquisadores, setPesquisadores] = useState("1")
  const [regime, setRegime] = useState("Lucro real")
  const [aliquota, setAliquota] = useState("34")
  const [alocacaoExclusiva, setAlocacaoExclusiva] = useState(true)
  const [incremento, setIncremento] = useState(true)
  const [havePatente, setHavePatente] = useState(false)
  const [cofinanciamento, setCofinanciamento] = useState(false)
  const [subvencao, setSubvencao] = useState("0")
  const [periodo, setPeriodo] = useState("0")

  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<CalculadoraResultado | null>(null)
  const [resultadoCLT, setResultadoCLT] = useState<CalculadoraCLTResultado | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResultado(null)
    setResultadoCLT(null)

    try {
      const dados = getDataFromForm({
        titulo,
        salBrutoMensal: Number(salBrutoMensal),
        pesquisadores: Number(pesquisadores),
        regime,
        aliquota: Number(aliquota),
        alocacaoExclusiva,
        incremento,
        havePatente,
        cofinanciamento,
        // Espelha o required condicional de formulario.html: só valem com
        // cofinanciamento marcado.
        subvencao: cofinanciamento ? Number(subvencao) : 0,
        periodo: cofinanciamento ? Number(periodo) : 0,
      })
      setResultado(calcularIncentivo(dados))
      setResultadoCLT(calcularCLT(dados))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível calcular o incentivo.")
    }
  }

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da simulação</CardTitle>
          <CardDescription>Preencha o perfil, o regime tributário e as condições do projeto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">1. Perfil do talento</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="titulo">Nível de titulação</FieldLabel>
                  <Select items={TITULO_OPTIONS} value={titulo} onValueChange={(value) => setTitulo(value ?? "")}>
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

                <Field>
                  <FieldLabel htmlFor="salBrutoMensal">Salário bruto mensal (R$)</FieldLabel>
                  <Input
                    id="salBrutoMensal"
                    type="number"
                    min={0}
                    step={0.01}
                    value={salBrutoMensal}
                    onChange={(event) => setSalBrutoMensal(event.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="pesquisadores">Quantidade de pesquisadores</FieldLabel>
                  <Input
                    id="pesquisadores"
                    type="number"
                    min={1}
                    step={1}
                    value={pesquisadores}
                    onChange={(event) => setPesquisadores(event.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">2. Regime tributário</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="regime">Regime fiscal da empresa</FieldLabel>
                  <Select items={REGIME_OPTIONS} value={regime} onValueChange={(value) => value && setRegime(value)}>
                    <SelectTrigger id="regime" className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {REGIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="aliquota">Alíquota combinada IRPJ/CSLL (%)</FieldLabel>
                  <Input
                    id="aliquota"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={aliquota}
                    onChange={(event) => setAliquota(event.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading font-extrabold text-night-blue">3. Variáveis da Lei do Bem</FieldLegend>
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
              <FieldLegend className="font-heading font-extrabold text-night-blue">4. Fomento &amp; subvenção</FieldLegend>
              <FieldGroup>
                <Field orientation="horizontal" className="rounded-xl border border-border p-4">
                  <FieldContent>
                    <FieldTitle>Utiliza programa de cofinanciamento</FieldTitle>
                    <FieldDescription>
                      Subvenção de transição ao custeio salarial nos primeiros 12 meses.
                    </FieldDescription>
                  </FieldContent>
                  <Switch checked={cofinanciamento} onCheckedChange={setCofinanciamento} />
                </Field>

                {cofinanciamento && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="subvencao">Subvenção de transição (% do custeio salarial)</FieldLabel>
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

            <Button type="submit" size="lg" className="h-12 self-start rounded-xl px-8 text-base">
              Calcular
            </Button>
          </form>
        </CardContent>
      </Card>

      {resultado && resultadoCLT && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resultado pesquisador CLT</CardTitle>
              <CardDescription>Custo do pesquisador contratado em regime CLT, sem o incentivo da Lei do Bem.</CardDescription>
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
              <CardTitle>Resultado pesquisador Lei do Bem</CardTitle>
              <CardDescription>Custo líquido após a economia de IRPJ/CSLL com a Lei do Bem.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Custo bruto</dt>
                  <dd className="font-heading text-lg font-semibold">{formatCurrency(resultado.custoBruto)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Exclusão adicional Lei do Bem</dt>
                  <dd className="font-heading text-lg font-semibold">{(resultado.leidobem * 100).toLocaleString("pt-BR")}%</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Economia com a Lei do Bem</dt>
                  <dd className="font-heading text-lg font-semibold text-pierx-green">{formatCurrency(resultado.incentivo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Economia sobre o custo bruto</dt>
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
