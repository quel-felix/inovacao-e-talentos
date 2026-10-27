const numberFormatter = new Intl.NumberFormat("pt-BR")

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
