/**
 * Base de pesquisadores da aba Pesquisa. Ainda não existe fonte real (API,
 * Lattes, Sucupira...), então estes registros são só de exemplo — trocar por
 * uma chamada de dados quando ela existir, mantendo o formato `Pesquisador`.
 */

export type Regiao = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul"

export type NivelFormacao = "Mestrado" | "Doutorado" | "Pós-Doutorado"

export interface Formacao {
  nivel: NivelFormacao
  curso: string
  instituicao: string
  ano: number
}

export interface Pesquisador {
  id: string
  nome: string
  regiao: Regiao
  /** Maior titulação; é a que aparece na tabela. */
  formacao: NivelFormacao
  instituicao: string
  curso: string
  /** Conceito CAPES do curso (1 a 7). Na tela aparece só o rótulo, nunca o número. */
  conceitoCurso: number
  formacoes: Formacao[]
  artigos: string[]
  curriculoUrl?: string
}

export const REGIOES: Regiao[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]

export const NIVEIS_FORMACAO: NivelFormacao[] = ["Mestrado", "Doutorado", "Pós-Doutorado"]

export const PESQUISADORES: Pesquisador[] = [
  {
    id: "1",
    nome: "Ana Beatriz Moreira",
    regiao: "Sudeste",
    formacao: "Doutorado",
    instituicao: "USP",
    curso: "Engenharia Química",
    conceitoCurso: 7,
    formacoes: [
      { nivel: "Mestrado", curso: "Engenharia Química", instituicao: "UNICAMP", ano: 2014 },
      { nivel: "Doutorado", curso: "Engenharia Química", instituicao: "USP", ano: 2018 },
    ],
    artigos: [
      "Catalisadores heterogêneos para produção de biodiesel",
      "Modelagem de reatores de leito fixo em escala piloto",
    ],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000001",
  },
  {
    id: "2",
    nome: "Carlos Eduardo Lima",
    regiao: "Nordeste",
    formacao: "Mestrado",
    instituicao: "UFPE",
    curso: "Ciência da Computação",
    conceitoCurso: 5,
    formacoes: [{ nivel: "Mestrado", curso: "Ciência da Computação", instituicao: "UFPE", ano: 2020 }],
    artigos: ["Aprendizado de máquina para detecção de fraudes em pagamentos instantâneos"],
  },
  {
    id: "3",
    nome: "Fernanda Souza Rocha",
    regiao: "Sul",
    formacao: "Pós-Doutorado",
    instituicao: "UFRGS",
    curso: "Biotecnologia",
    conceitoCurso: 6,
    formacoes: [
      { nivel: "Mestrado", curso: "Biologia Molecular", instituicao: "UFSC", ano: 2010 },
      { nivel: "Doutorado", curso: "Biotecnologia", instituicao: "UFRGS", ano: 2014 },
      { nivel: "Pós-Doutorado", curso: "Biotecnologia", instituicao: "UFRGS", ano: 2017 },
    ],
    artigos: [
      "Enzimas recombinantes aplicadas à indústria de alimentos",
      "Bioprocessos para valorização de resíduos agroindustriais",
      "Edição gênica em leveduras industriais",
    ],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000003",
  },
  {
    id: "4",
    nome: "João Pedro Almeida",
    regiao: "Centro-Oeste",
    formacao: "Doutorado",
    instituicao: "UnB",
    curso: "Engenharia Elétrica",
    conceitoCurso: 4,
    formacoes: [
      { nivel: "Mestrado", curso: "Engenharia Elétrica", instituicao: "UFG", ano: 2015 },
      { nivel: "Doutorado", curso: "Engenharia Elétrica", instituicao: "UnB", ano: 2019 },
    ],
    artigos: ["Integração de geração solar distribuída em redes de baixa tensão"],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000004",
  },
  {
    id: "5",
    nome: "Mariana Costa Ferreira",
    regiao: "Norte",
    formacao: "Mestrado",
    instituicao: "UFPA",
    curso: "Ciências Ambientais",
    conceitoCurso: 3,
    formacoes: [{ nivel: "Mestrado", curso: "Ciências Ambientais", instituicao: "UFPA", ano: 2021 }],
    artigos: ["Monitoramento de qualidade da água na bacia amazônica por sensoriamento remoto"],
  },
  {
    id: "6",
    nome: "Rafael Gomes Teixeira",
    regiao: "Sudeste",
    formacao: "Mestrado",
    instituicao: "UFMG",
    curso: "Engenharia de Materiais",
    conceitoCurso: 2,
    formacoes: [{ nivel: "Mestrado", curso: "Engenharia de Materiais", instituicao: "UFMG", ano: 2022 }],
    artigos: ["Compósitos poliméricos reforçados com fibras naturais"],
  },
  {
    id: "7",
    nome: "Juliana Martins Ribeiro",
    regiao: "Nordeste",
    formacao: "Doutorado",
    instituicao: "UFC",
    curso: "Engenharia Química",
    conceitoCurso: 5,
    formacoes: [
      { nivel: "Mestrado", curso: "Química", instituicao: "UFC", ano: 2013 },
      { nivel: "Doutorado", curso: "Engenharia Química", instituicao: "UFC", ano: 2017 },
    ],
    artigos: [
      "Catalisadores heterogêneos para produção de biodiesel",
      "Dessalinização por membranas em regiões semiáridas",
    ],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000007",
  },
  {
    id: "8",
    nome: "Lucas Henrique Barbosa",
    regiao: "Sul",
    formacao: "Doutorado",
    instituicao: "UFPR",
    curso: "Ciência da Computação",
    conceitoCurso: 3,
    formacoes: [
      { nivel: "Mestrado", curso: "Informática", instituicao: "UTFPR", ano: 2016 },
      { nivel: "Doutorado", curso: "Ciência da Computação", instituicao: "UFPR", ano: 2021 },
    ],
    artigos: ["Visão computacional para inspeção de qualidade em linhas de produção"],
  },
  {
    id: "9",
    nome: "Patrícia Nunes Carvalho",
    regiao: "Sudeste",
    formacao: "Pós-Doutorado",
    instituicao: "UNICAMP",
    curso: "Física",
    conceitoCurso: 7,
    formacoes: [
      { nivel: "Mestrado", curso: "Física", instituicao: "UFRJ", ano: 2008 },
      { nivel: "Doutorado", curso: "Física", instituicao: "UNICAMP", ano: 2012 },
      { nivel: "Pós-Doutorado", curso: "Física", instituicao: "UNICAMP", ano: 2015 },
    ],
    artigos: [
      "Sensores ópticos baseados em grafeno",
      "Fotônica integrada para telecomunicações",
    ],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000009",
  },
  {
    id: "10",
    nome: "Thiago Oliveira Santos",
    regiao: "Centro-Oeste",
    formacao: "Mestrado",
    instituicao: "UFMT",
    curso: "Agronomia",
    conceitoCurso: 4,
    formacoes: [{ nivel: "Mestrado", curso: "Agronomia", instituicao: "UFMT", ano: 2019 }],
    artigos: ["Agricultura de precisão com drones no cultivo de soja"],
    curriculoUrl: "http://lattes.cnpq.br/0000000000000010",
  },
]
