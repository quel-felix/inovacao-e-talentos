import { useState } from "react"

import logo from "@/assets/logo-inovacao-talentos.png"
import { BrandPatternMosaic } from "@/components/shared/BrandPattern"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GoogleIcon } from "@/features/auth/components/GoogleIcon"

interface LoginPageProps {
  onLogin: () => void
}

/**
 * Esqueleto de tela de login: sem back-end, sem Google Identity Services de
 * verdade — só o estado visual do fluxo real do projeto ANP (AuthGate →
 * LoginPage), com o botão "Continuar com Google" simulando o login local.
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = () => {
    setIsLoggingIn(true)
    // Sem back-end: aqui entraria a troca do id_token do Google Identity
    // Services por uma sessão. O atraso só mantém o estado "Entrando..."
    // visível, como no botão de fallback do projeto ANP.
    window.setTimeout(() => {
      setIsLoggingIn(false)
      onLogin()
    }, 500)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-off-white px-4 py-12">
      <BrandPatternMosaic className="pointer-events-none absolute -top-8 -left-12 w-80 opacity-70 sm:w-[28rem]" />
      <BrandPatternMosaic className="pointer-events-none absolute -right-12 -bottom-8 w-80 rotate-180 opacity-70 sm:w-[28rem]" />

      <Card className="relative z-10 w-full max-w-md animate-in rounded-3xl p-2 shadow-xl fade-in-0 zoom-in-95 duration-500">
        <CardContent className="flex flex-col items-center gap-8 px-8 py-10 sm:px-10">
          <div className="flex flex-col items-center gap-3">
            <img src={logo} alt="Inovação & Talentos" className="h-12 w-auto" />

            <div className="text-center">
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-night-blue">
                Bem-vindo(a)
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Entre com sua conta para continuar
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="h-14 w-full rounded-2xl text-base font-bold shadow-sm transition-transform active:scale-[0.98]"
            >
              <GoogleIcon data-icon="inline-start" />
              {isLoggingIn ? "Entrando..." : "Continuar com Google"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Esqueleto de autenticação — sem back-end por enquanto.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        Calculadora Lei do Bem — sandbox
      </p>
    </div>
  )
}
