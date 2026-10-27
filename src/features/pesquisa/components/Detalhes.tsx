import { ExternalLinkIcon } from "lucide-react"

/** Blocos dos painéis de detalhe da Pesquisa (PesquisadorSheet e ArtigoSheet). */

export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-extrabold tracking-[0.15em] text-piera-blue uppercase">{titulo}</h3>
      {children}
    </section>
  )
}

export function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-extrabold tracking-[0.15em] text-piera-blue uppercase">{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export function LinkExterno({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 font-semibold text-piera-blue underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLinkIcon className="size-4" />
    </a>
  )
}
