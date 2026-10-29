import { useMemo } from "react"
import type { EChartsOption } from "echarts"

import { EChart } from "@/components/shared/EChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CalculadoraCLTResultado } from "@/lib/calculadora/calculateCLT"
import type { CalculadoraResultado } from "@/lib/calculadora/calculateUser"
import { getChartTheme } from "@/lib/chartTheme"
import { formatCurrency } from "@/lib/currency"

interface ComparativoLeiDoBemProps {
  clt: CalculadoraCLTResultado
  leiDoBem: CalculadoraResultado
}

/**
 * Três perfis sobre o total de pesquisadores: CLT (salário + 13º + férias +
 * encargos), pesquisador bolsista sem incentivo e pesquisador com a Lei do
 * Bem — quanto (em R$ e em %) a Lei do Bem economiza frente ao CLT.
 */
export function ComparativoLeiDoBem({ clt, leiDoBem }: ComparativoLeiDoBemProps) {
  const valorEconomizado = clt.custoBruto - leiDoBem.custoLiquido
  const percentualEconomizado = clt.custoBruto > 0 ? (valorEconomizado / clt.custoBruto) * 100 : 0

  const barOption = useMemo<EChartsOption>(() => {
    const theme = getChartTheme()
    const axisLabel = { color: theme.mutedForeground, fontSize: 12 }

    return {
      grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        borderWidth: 0,
        extraCssText: "border-radius:12px;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1)",
        // Só as séries com valor na barra: CLT e Pesquisador mostram apenas o custo líquido.
        formatter: (params) => {
          const itens = (Array.isArray(params) ? params : [params]).filter(
            (item) => typeof item.value === "number",
          )
          const linhas = itens.map(
            (item) => `${item.marker} ${item.seriesName}: <b>${formatCurrency(item.value as number)}</b>`,
          )
          return [String(itens[0]?.name ?? "").replace("\n", " "), ...linhas].join("<br/>")
        },
      },
      xAxis: {
        type: "category",
        data: ["CLT", "Pesquisador", "Pesquisador\nLei do Bem"],
        axisLine: { show: false },
        axisTick: { show: false },
        // interval 0: mostra todos os rótulos, sem o ECharts ocultar algum por falta de espaço.
        axisLabel: { ...axisLabel, interval: 0 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel,
        splitLine: { lineStyle: { color: theme.border, type: "dashed" } },
      },
      series: [
        {
          name: "Custo líquido",
          type: "bar",
          stack: "custo",
          barMaxWidth: 72,
          data: [
            { value: clt.custoBruto, itemStyle: { color: theme.status.neutral } },
            { value: leiDoBem.investimentoTotal, itemStyle: { color: theme.status.warning } },
            { value: leiDoBem.custoLiquido, itemStyle: { color: theme.status.good } },
          ],
        },
        {
          name: "Economia Lei do Bem",
          type: "bar",
          stack: "custo",
          barMaxWidth: 72,
          itemStyle: { color: theme.status.good, opacity: 0.3, borderRadius: [4, 4, 0, 0] },
          data: ["-", "-", leiDoBem.incentivo],
        },
      ],
    }
  }, [clt.custoBruto, leiDoBem.investimentoTotal, leiDoBem.custoLiquido, leiDoBem.incentivo])

  const gaugeOption = useMemo<EChartsOption>(() => {
    const theme = getChartTheme()
    const valor = Math.max(0, Math.min(percentualEconomizado, 100))

    return {
      series: [
        {
          type: "gauge",
          min: 0,
          max: 100,
          startAngle: 210,
          endAngle: -30,
          data: [{ value: valor }],
          axisLine: { lineStyle: { width: 16, color: [[1, theme.border]] } },
          progress: { show: true, width: 16, roundCap: true, itemStyle: { color: theme.status.good } },
          pointer: { show: false },
          anchor: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            offsetCenter: [0, "-6%"],
            formatter: `${percentualEconomizado.toFixed(2).replace(".", ",")}%`,
            color: theme.status.good,
            fontSize: 30,
            fontWeight: "bold",
          },
          title: { show: true, offsetCenter: [0, "28%"], color: theme.mutedForeground, fontSize: 12 },
        },
      ],
    }
  }, [percentualEconomizado])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo CLT × Pesquisador × Lei do Bem</CardTitle>
        <CardDescription>Custo anual de todos os pesquisadores adicionados, nos três perfis</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Valor total economizado frente ao CLT</p>
          <p className="font-heading text-2xl font-extrabold text-pierx-green">
            {formatCurrency(Math.max(0, valorEconomizado))}
          </p>
          <EChart option={barOption} className="mt-4 h-56 w-full" />
        </div>

        <div className="flex flex-col items-center justify-center">
          <EChart option={gaugeOption} className="h-56 w-full" />
          <p className="text-center text-sm text-muted-foreground">economia usando a Lei do Bem frente ao CLT</p>
        </div>
      </CardContent>
    </Card>
  )
}
