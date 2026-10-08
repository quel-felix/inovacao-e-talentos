// ECharts' internal color math (used to derive hover/emphasis shades) only understands
// legacy sRGB formats — feeding it an oklch() string straight from a CSS var makes it fail
// silently and drop the fill on hover. Round-tripping through canvas normalizes any CSS
// color (oklch, lab, hsl, ...) into a concrete "rgb()" string it can safely manipulate.
function toRgb(color: string): string {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
}

export function getChartTheme() {
  const root = getComputedStyle(document.documentElement)
  const read = (name: string) => toRgb(root.getPropertyValue(name).trim())

  return {
    palette: [1, 2, 3, 4, 5, 6].map((n) => read(`--chart-${n}`)),
    // Paleta categórica: uma cor por entidade, em ordem fixa. Distinta de
    // `palette`, que é a rampa de dois tons do planejado x realizado.
    series: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => read(`--series-${n}`)),
    // Faixas de situação. Separadas de `series` de propósito: cor de estado
    // nunca é cor de identidade, e vice-versa.
    status: {
      neutral: read("--status-neutral"),
      good: read("--status-good"),
      warning: read("--status-warning"),
      critical: read("--status-critical"),
    },
    border: read("--border"),
    foreground: read("--foreground"),
    mutedForeground: read("--muted-foreground"),
    destructive: read("--destructive"),
  }
}
