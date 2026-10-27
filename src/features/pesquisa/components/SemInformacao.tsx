/** Dado que a API ainda não fornece (região, UF, formação, curso…). */
export function SemInformacao() {
  return <span className="text-muted-foreground">Sem informação</span>
}

export function ouSemInformacao(valor: React.ReactNode) {
  return valor === null || valor === undefined || valor === "" ? <SemInformacao /> : valor
}
