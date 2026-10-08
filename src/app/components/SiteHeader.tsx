import { useEffect, useState } from "react"
import { LogOutIcon } from "lucide-react"

import logo from "@/assets/logo-inovacao-talentos.png"
import { Button } from "@/components/ui/button"
import { SECOES, type SecaoId } from "@/app/lib/siteNav"
import { cn } from "@/lib/utils"

/** Marca no menu a seção que está ocupando o meio da tela. */
function useSecaoAtiva(): SecaoId {
  const [ativa, setAtiva] = useState<SecaoId>("inicio")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries.find((entry) => entry.isIntersecting)
        if (visivel) setAtiva(visivel.target.id as SecaoId)
      },
      // Faixa fina no meio da viewport: só uma seção a cruza por vez.
      { rootMargin: "-45% 0px -55% 0px" },
    )
    for (const secao of SECOES) {
      const el = document.getElementById(secao.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return ativa
}

interface SiteHeaderProps {
  onLogout: () => void
}

/** Topo fixo no estilo do site institucional: logo à esquerda, menu de âncoras à direita. */
export function SiteHeader({ onLogout }: SiteHeaderProps) {
  const ativa = useSecaoAtiva()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-off-white/90 backdrop-blur supports-backdrop-filter:bg-off-white/75">
      <div className="mx-auto flex max-w-(--container-content) flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#inicio" className="shrink-0" aria-label="Inovação & Talentos — início">
          <img src={logo} alt="Inovação & Talentos" className="h-9 w-auto sm:h-10" />
        </a>

        <nav aria-label="Seções" className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
          {SECOES.map((secao) => (
            <a
              key={secao.id}
              href={`#${secao.id}`}
              aria-current={ativa === secao.id ? "location" : undefined}
              className={cn(
                "rounded-xl px-4 py-2 text-[0.95rem] font-medium whitespace-nowrap text-night-blue/85 transition-colors hover:bg-muted hover:text-night-blue",
                ativa === secao.id && "bg-muted font-semibold text-night-blue",
              )}
            >
              {secao.label}
            </a>
          ))}
        </nav>

        <Button variant="outline" size="lg" onClick={onLogout} className="rounded-xl px-4">
          <LogOutIcon data-icon="inline-start" />
          Sair
        </Button>
      </div>
    </header>
  )
}
