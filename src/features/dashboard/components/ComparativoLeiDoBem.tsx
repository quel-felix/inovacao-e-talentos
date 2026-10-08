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
 * Resultado pesquisador CLT - Resultado pesquisador Lei do Bem: quanto (em R$
 * e em %) a Lei do Bem economiza frente ao custo sem incentivo.
 */
export function ComparativoLeiDoBem({ clt, leiDoBem }: ComparativoLeiDoBemProps) {
  const valorEconomizado = clt.custoBruto - leiDoBem.incentivo
  const percentualEconomizado = clt.custoBruto > 0 ? (valorEconomizado / clt.custoBruto) * 100 : 0

  const barOption = useMemo<EChartsOption>(() => {
    const theme = getChartTheme()
    const axisLabel = { color: theme.mutedForeground, fontSize: 12 }

    return {
      grid: { left: 8, right: 8, top: 16, bottom: 28, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        borderWidth: 0,
        extraCssText: "border-radius:12px;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1)",
        valueFormatter: (value) => formatCurrency(Number(value)),
      },
      xAxis: {
        type: "category",
        data: ["Pesquisador CLT", "Pesquisador Lei do Bem"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel,
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
          name: "Custo anual",
          type: "bar",
          barMaxWidth: 72,
          data: [
            { value: clt.custoBruto, itemStyle: { color: theme.status.neutral, borderRadius: [4, 4, 0, 0] } },
            { value: leiDoBem.incentivo, itemStyle: { color: theme.status.good, borderRadius: [4, 4, 0, 0] } },
          ],
        },
      ],
    }
  }, [clt.custoBruto, leiDoBem.incentivo])

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
            formatter: `${percentualEconomizado.toFixed(1)}%`,
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
        <CardTitle>Comparativo CLT × Lei do Bem</CardTitle>
        <CardDescription>Resultado pesquisador CLT − Resultado pesquisador Lei do Bem</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Valor total economizado</p>
          <p className="font-heading text-2xl font-extrabold text-pierx-green">
            {formatCurrency(Math.max(0, valorEconomizado))}
          </p>
          <EChart option={barOption} className="mt-4 h-56 w-full" />
        </div>

        <div className="flex flex-col items-center justify-center">
          <EChart option={gaugeOption} className="h-56 w-full" />
          <p className="text-center text-sm text-muted-foreground">economia usando a Lei do Bem</p>
        </div>
      </CardContent>
    </Card>
  )
}
