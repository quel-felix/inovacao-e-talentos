import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
  /** Nível do título; a seção inicial usa h1, as demais h2. */
  as?: "h1" | "h2"
}

/** Sobretítulo espaçado em azul + título extra-negrito, como nas seções do site institucional. */
export function SectionHeading({ eyebrow, title, description, className, as: Titulo = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <p className="text-xs font-extrabold tracking-[0.2em] text-piera-blue uppercase sm:text-sm">{eyebrow}</p>
      <Titulo
        className={cn(
          "font-heading font-extrabold tracking-tight text-night-blue text-balance",
          Titulo === "h1" ? "text-4xl leading-[1.08] sm:text-5xl lg:text-6xl" : "text-3xl leading-tight sm:text-4xl",
        )}
      >
        {title}
      </Titulo>
      {description && <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  )
}
