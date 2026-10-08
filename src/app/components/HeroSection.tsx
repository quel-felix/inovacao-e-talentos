import { ArrowRightIcon, CalculatorIcon, ScaleIcon, SearchIcon, type LucideIcon } from "lucide-react"

import { BrandPatternMosaic } from "@/components/shared/BrandPattern"
import { buttonVariants } from "@/components/ui/button"
import { SectionHeading } from "@/app/components/SectionHeading"
import { cn } from "@/lib/utils"

interface Passo {
  icon: LucideIcon
  titulo: string
  texto: string
  href?: string
}

const PASSOS: Passo[] = [
  {
    icon: CalculatorIcon,
    titulo: "Calculadora Lei do Bem",
    texto:
      "Informe o perfil do pesquisador, o regime tributário e as condições do projeto para estimar o custo anual e o incentivo fiscal.",
    href: "#calculadora",
  },
  {
    icon: SearchIcon,
    titulo: "Pesquisa de talentos",
    texto: "Encontre mestres, doutores e pós-doutores por nome, artigos ou instituição, com filtros de região e conceito do curso.",
    href: "#pesquisa",
  },
  {
    icon: ScaleIcon,
    titulo: "Como o incentivo é calculado",
    texto:
      "A dedução varia de 60% a 100% do custo com P&D, conforme a alocação exclusiva do pesquisador e o incremento da equipe.",
  },
]

function CartaoPasso({ passo, numero }: { passo: Passo; numero: number }) {
  const conteudo = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-water-blue/15 font-heading text-base font-extrabold text-piera-blue">
        {numero}
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold text-night-blue">
          {passo.titulo}
          {passo.href && (
            <ArrowRightIcon className="size-4 text-piera-blue transition-transform group-hover:translate-x-1" />
          )}
        </h3>
        <p className="leading-relaxed text-muted-foreground">{passo.texto}</p>
      </div>
    </>
  )

  const classe =
    "group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_-12px_rgb(15_54_89/0.12)] sm:p-6"

  return passo.href ? (
    <a href={passo.href} className={cn(classe, "transition-colors hover:border-water-blue/60")}>
      {conteudo}
    </a>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}

/** Abertura da página: o que é a ferramenta e atalhos para as duas funções. */
export function HeroSection() {
  return (
    <section id="inicio" className="relative scroll-mt-28 overflow-hidden">
      <BrandPatternMosaic className="pointer-events-none absolute -top-10 -left-14 w-60 opacity-35 sm:w-80" />

      <div className="relative mx-auto grid max-w-(--container-content) items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div className="flex flex-col gap-8">
          <SectionHeading
            as="h1"
            eyebrow="Programa Inovação & Talentos"
            title="Simule incentivos e encontre talentos para P&D"
            description="Calcule quanto sua empresa pode economizar com a Lei do Bem ao contratar pesquisadores e encontre os talentos certos pela produção acadêmica, região e instituição."
          />
          <div className="flex flex-wrap gap-3">
            <a href="#calculadora" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-6 text-base")}>
              Calcular incentivo
              <ArrowRightIcon data-icon="inline-end" />
            </a>
            <a
              href="#pesquisa"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl px-6 text-base font-normal")}
            >
              Pesquisar talentos
            </a>
          </div>
        </div>

        <ol className="flex flex-col gap-4">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo}>
              <CartaoPasso passo={passo} numero={i + 1} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
