import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Info, LinkExterno, Secao } from "@/features/pesquisa/components/Detalhes"
import { ouSemInformacao, SemInformacao } from "@/features/pesquisa/components/SemInformacao"
import { formatNumber } from "@/lib/number"
import { rotuloTipo, urlOpenAlexArtigo, type Artigo } from "@/lib/pesquisa/artigos"

interface ArtigoSheetProps {
  artigo: Artigo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Tela de detalhes aberta ao clicar em um artigo na tabela da Pesquisa. */
export function ArtigoSheet({ artigo, open, onOpenChange }: ArtigoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md!">
        {artigo && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle className="text-xl font-extrabold">{artigo.titulo ?? "Sem título"}</SheetTitle>
              <SheetDescription>{artigo.fonte ?? "Fonte sem informação"}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6">
              <dl className="grid grid-cols-2 gap-4">
                <Info rotulo="Ano">{ouSemInformacao(artigo.ano)}</Info>
                <Info rotulo="Tipo">{ouSemInformacao(rotuloTipo(artigo.tipo))}</Info>
                <Info rotulo="Citações">{formatNumber(artigo.citacoes)}</Info>
              </dl>

              <Secao titulo={`Autores (${artigo.autores.length})`}>
                {artigo.autores.length === 0 ? (
                  <SemInformacao />
                ) : (
                  <ul className="flex list-disc flex-col gap-1.5 pl-5">
                    {artigo.autores.map((autor, index) => (
                      <li key={`${autor}-${index}`}>{autor}</li>
                    ))}
                  </ul>
                )}
              </Secao>

              <Secao titulo="Acesso">
                <div className="flex flex-col gap-2">
                  {artigo.urlAcessoAberto && <LinkExterno href={artigo.urlAcessoAberto}>Ler em acesso aberto</LinkExterno>}
                  {artigo.doi && <LinkExterno href={artigo.doi}>Abrir pelo DOI</LinkExterno>}
                  <LinkExterno href={urlOpenAlexArtigo(artigo.id)}>Abrir no OpenAlex</LinkExterno>
                </div>
              </Secao>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
