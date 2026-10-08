import { cn } from "@/lib/utils"

/**
 * Pattern da marca Inovação & Talentos: quartos de círculo, cheios ou só no
 * contorno, girados em 4 direções. Desenhado em SVG (em vez dos PNGs do
 * pattern) para ficar nítido em qualquer tamanho e herdar as cores do tema.
 */

type Cor = "sand" | "flag-yellow" | "water-blue" | "pierx-green" | "night-blue"

interface Tile {
  /** Quantos quartos de volta girar (0 a 3). */
  giro: 0 | 1 | 2 | 3
  cor: Cor
  contorno?: boolean
}

const FILL: Record<Cor, string> = {
  sand: "fill-sand",
  "flag-yellow": "fill-flag-yellow",
  "water-blue": "fill-water-blue",
  "pierx-green": "fill-pierx-green",
  "night-blue": "fill-night-blue",
}

const STROKE: Record<Cor, string> = {
  sand: "stroke-[#d9d4c9]",
  "flag-yellow": "stroke-flag-yellow",
  "water-blue": "stroke-water-blue",
  "pierx-green": "stroke-pierx-green",
  "night-blue": "stroke-night-blue",
}

// Canto reto embaixo à esquerda, arco do canto de cima à esquerda até o de baixo à direita.
const QUARTO = "M0 100 V0 A100 100 0 0 1 100 100 Z"

function QuartoDeCirculo({ giro, cor, contorno, className }: Tile & { className?: string }) {
  return (
    <svg viewBox="-4 -4 108 108" aria-hidden className={cn("shrink-0", className)}>
      <path
        d={QUARTO}
        transform={`rotate(${giro * 90} 50 50)`}
        className={contorno ? cn("fill-none", STROKE[cor]) : FILL[cor]}
        strokeWidth={contorno ? 6 : 0}
      />
    </svg>
  )
}

// Sequência da faixa divisória do site: maioria areia, com poucas cores de destaque.
const FAIXA: Tile[] = [
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "sand" },
  { giro: 1, cor: "flag-yellow" },
  { giro: 0, cor: "sand", contorno: true },
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "sand" },
  { giro: 1, cor: "sand", contorno: true },
  { giro: 0, cor: "water-blue" },
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "sand", contorno: true },
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "pierx-green" },
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "sand" },
  { giro: 1, cor: "night-blue" },
  { giro: 0, cor: "sand", contorno: true },
]

/** Faixa horizontal que separa as seções, como a do site institucional. */
export function BrandPatternStrip({ className }: { className?: string }) {
  // Repete a sequência o bastante para cobrir telas largas; o excesso é cortado.
  const tiles = [...FAIXA, ...FAIXA, ...FAIXA]
  return (
    <div aria-hidden className={cn("flex h-12 gap-1.5 overflow-hidden", className)}>
      {tiles.map((tile, i) => (
        <QuartoDeCirculo key={i} {...tile} className="h-12 w-12 sm:h-14 sm:w-14" />
      ))}
    </div>
  )
}

// Mosaico 3×3 do canto da seção inicial, em tons claros.
const MOSAICO: Tile[] = [
  { giro: 3, cor: "sand" },
  { giro: 2, cor: "water-blue" },
  { giro: 3, cor: "sand", contorno: true },
  { giro: 0, cor: "sand", contorno: true },
  { giro: 1, cor: "sand" },
  { giro: 2, cor: "flag-yellow" },
  { giro: 1, cor: "sand" },
  { giro: 0, cor: "sand", contorno: true },
  { giro: 3, cor: "sand" },
]

export function BrandPatternMosaic({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("grid grid-cols-3 gap-2", className)}>
      {MOSAICO.map((tile, i) => (
        <QuartoDeCirculo key={i} {...tile} className="size-full" />
      ))}
    </div>
  )
}
