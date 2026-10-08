import { useEffect, useRef } from "react"
import * as echarts from "echarts"
import type { EChartsOption } from "echarts"

interface EChartProps {
  option: EChartsOption
  className?: string
  onChartClick?: (params: echarts.ECElementEvent) => void
}

export function EChart({ option, className, onChartClick }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container)
    chart.setOption(option)
    if (onChartClick) chart.on("click", onChartClick)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [option, onChartClick])

  return <div ref={containerRef} className={className} />
}
