import { ExternalLinkIcon } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Pesquisador } from "@/lib/pesquisa/pesquisadores"

interface PesquisadorSheetProps {
  pesquisador: Pesquisador | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-extrabold tracking-[0.15em] text-piera-blue uppercase">{titulo}</h3>
      {children}
    </section>
  )
}

/** Tela de detalhes aberta ao clicar em um pesquisador na tabela da Pesquisa. */
export function PesquisadorSheet({ pesquisador, open, onOpenChange }: PesquisadorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md!">
        {pesquisador && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle className="text-xl font-extrabold">{pesquisador.nome}</SheetTitle>
              <SheetDescription>
                {pesquisador.formacao} · {pesquisador.instituicao}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">
              <Secao titulo="Região">
                <p>{pesquisador.regiao}</p>
              </Secao>

              <Secao titulo="Formações">
                <ul className="flex flex-col gap-2">
                  {[...pesquisador.formacoes].reverse().map((f) => (
                    <li key={`${f.nivel}-${f.ano}`} className="rounded-lg border border-border p-3">
                      <p className="font-medium">
                        {f.nivel} em {f.curso}
                      </p>
                      <p className="text-muted-foreground">
                        {f.instituicao} · {f.ano}
                      </p>
                    </li>
                  ))}
                </ul>
              </Secao>

              <Secao titulo={`Artigos (${pesquisador.artigos.length})`}>
                <ul className="flex list-disc flex-col gap-1.5 pl-5">
                  {pesquisador.artigos.map((artigo) => (
                    <li key={artigo}>{artigo}</li>
                  ))}
                </ul>
              </Secao>

              {pesquisador.curriculoUrl && (
                <Secao titulo="Currículo">
                  <a
                    href={pesquisador.curriculoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-piera-blue underline-offset-4 hover:underline"
                  >
                    Abrir currículo Lattes
                    <ExternalLinkIcon className="size-4" />
                  </a>
                </Secao>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
