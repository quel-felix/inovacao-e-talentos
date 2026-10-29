/**
 * Tabela de bolsas da planilha "Projeção Investimento x Incentivo Fiscal.xlsx"
 * (Planilha2): categoria, perfil e requisitos de experiência e bolsa/mês
 * (até 40h semanais). Categorias com mais de uma linha na planilha viram
 * faixas (I, II, III) do mesmo perfil.
 */

export interface FaixaBolsa {
  id: string
  categoria: string
  perfil: string
  /** Rótulo da faixa dentro da categoria (vazio quando há uma só linha). */
  faixa: string
  bolsaMensal: number
}

export interface Titulacao {
  value: string
  label: string
  faixas: FaixaBolsa[]
}

function categoria(nome: string, perfil: string, bolsas: number[]): FaixaBolsa[] {
  return bolsas.map((bolsaMensal, index) => ({
    id: `${nome} #${index + 1}`,
    categoria: nome,
    perfil,
    faixa: bolsas.length > 1 ? `Faixa ${index + 1}` : "",
    bolsaMensal,
  }))
}

export const TITULACOES: Titulacao[] = [
  {
    value: "Técnico",
    label: "Técnico",
    faixas: categoria("Técnico em PD&I", "Profissional com formação técnica concluída.", [2000]),
  },
  {
    value: "Graduação",
    label: "Graduação",
    faixas: [
      ...categoria(
        "Pesquisador de Iniciação Tecnológica",
        "Estudante no penúltimo ou último ano de graduação.",
        [2500],
      ),
      ...categoria("Pesquisador Nível I", "Título de graduação (Recém-formado).", [3500]),
      ...categoria(
        "Pesquisador Nível II",
        "Título de graduação + até 3 anos de experiência em PD&I.",
        [4000, 4500, 5000],
      ),
      ...categoria(
        "Pesquisador Nível III",
        "Título de graduação + Acima de 3 anos de experiência em PD&I.",
        [5500],
      ),
    ],
  },
  {
    value: "Mestre",
    label: "Mestre",
    faixas: [
      ...categoria("Pesquisador Mestre I", "Título de Mestre (Recém-titulado).", [4200, 5100, 6000]),
      ...categoria(
        "Pesquisador Mestre II",
        "Título de Mestre + Mínimo de 2 anos de experiência pós-título.",
        [4900, 6000, 7000],
      ),
      ...categoria(
        "Pesquisador Mestre III",
        "Título de Mestre + Mínimo de 4 anos de experiência pós-título.",
        [5600, 6800, 8000],
      ),
    ],
  },
  {
    value: "Doutor",
    label: "Doutor",
    faixas: [
      ...categoria("Pesquisador Doutor I", "Título de Doutor (Recém-titulado).", [6300, 7400, 8500]),
      ...categoria(
        "Pesquisador Doutor II",
        "Título de Doutor + Mínimo de 2 anos de experiência pós-título.",
        [7000, 8250, 9500],
      ),
      ...categoria(
        "Pesquisador Doutor III",
        "Título de Doutor + Mínimo de 4 anos de experiência pós-título.",
        [8400, 9500, 10500],
      ),
    ],
  },
  {
    value: "Especialista",
    label: "Especialista / Sênior",
    faixas: [
      ...categoria(
        "Especialista Tech I",
        "Graduado ou Mestre em áreas de TI/Tecnologias de ponta com mais de 2 anos de mercado.",
        [5000, 7000, 9000],
      ),
      ...categoria(
        "Especialista Tech II",
        "Mestre ou Doutor em áreas de TI/Tecnologias de ponta com mais de 5 anos de mercado.",
        [10000, 11000, 12000],
      ),
      ...categoria(
        "Especialista Master",
        "Doutor com patente ou mais de 7 anos de experiência comprovada em liderança de PD&I ou com histórico de impacto global/redes internacionais.",
        [15000, 18000, 20000],
      ),
      ...categoria(
        "Pesquisador Senior 50+",
        "Mentoria e Transferência de Saberes, Especialista Prático de Campo/Projeto e Liderança Técnica Sênior até 160 horas mensais.",
        [15000, 21500, 29000],
      ),
    ],
  },
]

export function findTitulacao(value: string): Titulacao | undefined {
  return TITULACOES.find((titulacao) => titulacao.value === value)
}

export function findFaixa(id: string): FaixaBolsa | undefined {
  for (const titulacao of TITULACOES) {
    const faixa = titulacao.faixas.find((item) => item.id === id)
    if (faixa) return faixa
  }
  return undefined
}
