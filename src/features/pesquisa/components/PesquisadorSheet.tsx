import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Info, LinkExterno, Secao } from "@/features/pesquisa/components/Detalhes"
import { ouSemInformacao, SemInformacao } from "@/features/pesquisa/components/SemInformacao"
import type { Pesquisador, SituacaoAcademica } from "@/lib/pesquisa/pesquisadores"

interface PesquisadorSheetProps {
  pesquisador: Pesquisador | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** A maior formação segue a situação acadêmica; as anteriores já foram concluídas. */
function rotuloAno(ano: number, situacao: SituacaoAcademica | null) {
  if (situacao === "Matriculado") return `em andamento (previsão ${ano})`
  if (situacao === "Desligado") return `desligado em ${ano}`
  return ano
}

/** Tela de detalhes aberta ao clicar em um pesquisador na tabela da Pesquisa. */
export function PesquisadorSheet({ pesquisador, open, onOpenChange }: PesquisadorSheetProps) {
  const temLinks = pesquisador && (pesquisador.curriculoUrl || pesquisador.orcidUrl || pesquisador.openAlexUrl)
  const local = pesquisador && [pesquisador.municipio, pesquisador.uf].filter(Boolean).join(" – ")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md!">
        {pesquisador && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle className="text-xl font-extrabold">{pesquisador.nome}</SheetTitle>
              <SheetDescription>
                {pesquisador.formacao ?? "Formação sem informação"} ·{" "}
                {pesquisador.instituicao ?? "Instituição sem informação"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">
              <dl className="grid grid-cols-2 gap-4">
                <Info rotulo="Município">{ouSemInformacao(local)}</Info>
                <Info rotulo="Região">{ouSemInformacao(pesquisador.regiao)}</Info>
                <Info rotulo="Nacionalidade">{ouSemInformacao(pesquisador.nacionalidade)}</Info>
                <Info rotulo="Situação acadêmica">{ouSemInformacao(pesquisador.situacaoAcademica)}</Info>
              </dl>

              <Secao titulo="Formações">
                {pesquisador.formacoes.length === 0 ? (
                  <SemInformacao />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {[...pesquisador.formacoes].reverse().map((f, index) => (
                      <li key={`${f.nivel}-${f.ano}`} className="rounded-lg border border-border p-3">
                        <p className="font-medium">
                          {f.nivel} em {f.curso}
                        </p>
                        <p className="text-muted-foreground">
                          {f.instituicao} · {rotuloAno(f.ano, index === 0 ? pesquisador.situacaoAcademica : "Titulado")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Secao>

              <Secao titulo={`Artigos (${pesquisador.artigos.length})`}>
                {pesquisador.artigos.length === 0 ? (
                  <SemInformacao />
                ) : (
                  <ul className="flex list-disc flex-col gap-1.5 pl-5">
                    {pesquisador.artigos.map((artigo) => (
                      <li key={artigo}>{artigo}</li>
                    ))}
                  </ul>
                )}
              </Secao>

              <Secao titulo="Currículo">
                {temLinks ? (
                  <div className="flex flex-col gap-2">
                    {pesquisador.curriculoUrl && (
                      <LinkExterno href={pesquisador.curriculoUrl}>Abrir currículo Lattes</LinkExterno>
                    )}
                    {pesquisador.orcidUrl && <LinkExterno href={pesquisador.orcidUrl}>Abrir ORCID</LinkExterno>}
                    {pesquisador.openAlexUrl && (
                      <LinkExterno href={pesquisador.openAlexUrl}>Abrir perfil no OpenAlex</LinkExterno>
                    )}
                  </div>
                ) : (
                  <SemInformacao />
                )}
              </Secao>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
