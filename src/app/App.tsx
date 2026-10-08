import { useState } from "react"

import logo from "@/assets/logo-inovacao-talentos.png"
import { BrandPatternStrip } from "@/components/shared/BrandPattern"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HeroSection } from "@/app/components/HeroSection"
import { SectionHeading } from "@/app/components/SectionHeading"
import { SiteHeader } from "@/app/components/SiteHeader"
import { LoginPage } from "@/features/auth/components/LoginPage"
import { DashboardPage } from "@/features/dashboard/components/DashboardPage"
import { PesquisaPage } from "@/features/pesquisa/components/PesquisaPage"

/**
 * Página única: Início, Calculadora e Pesquisa ficam uma embaixo da outra e o
 * menu do topo leva a cada uma por âncora (#inicio, #calculadora, #pesquisa).
 */
function AppShell({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader onLogout={onLogout} />

      <main>
        <HeroSection />

        <BrandPatternStrip />

        <section id="calculadora" className="scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            className="mx-auto mb-10 max-w-(--container-content)"
            eyebrow="Calculadora"
            title="Calculadora Lei do Bem"
            description="Estime o custo anual do pesquisador e o incentivo fiscal da Lei do Bem sobre a folha de P&D."
          />
          <DashboardPage />
        </section>

        <BrandPatternStrip className="rotate-180" />

        <section id="pesquisa" className="scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            className="mx-auto mb-10 max-w-(--container-content)"
            eyebrow="Pesquisa"
            title="Encontre talentos para o seu projeto"
            description="Busque pesquisadores por nome, artigos ou instituições e refine por região, formação e conceito do curso."
          />
          <PesquisaPage />
        </section>
      </main>

      <footer className="border-t border-border bg-off-white">
        <div className="mx-auto flex max-w-(--container-content) flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <img src={logo} alt="Inovação & Talentos" className="h-8 w-auto" />
          <p className="text-sm text-muted-foreground">Calculadora Lei do Bem e pesquisa de talentos</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  // Esqueleto de autenticação: sem token nem back-end, só o estado local que
  // decide entre a tela de login e o resto do app — mesmo papel do `user` do
  // projeto ANP (ver AuthGate), só que sem useAuth/useGoogleIdentity por trás.
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <TooltipProvider>
      {isAuthenticated ? (
        <AppShell onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </TooltipProvider>
  )
}

export default App
