import type { Route } from './+types/route'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: 'HIVE | Mazeps' }]
}

export default function Route({}: Route.ComponentProps) {
  return (
    <>
      <BackButtonPortal to="/games" />
      <Center>
        <div className="mx-auto max-w-lg px-6 py-10 text-center">
          <h1 className="font-brand text-3xl tracking-wide">HIVE</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-foreground/50">
            Hive Pocket · 2 jogadores · ~20 min
          </p>
          <p className="mt-6 text-base leading-relaxed text-foreground/75">
            Tabuleiro que se constrói à medida que joga: cada peça é um inseto com movimentos próprios.
            Ganha quem rodear completamente a abelha rainha do oponente. A versão Pocket traz o mesmo
            jogo numa caixa pequena. Versão online no Mazeps em breve.
          </p>
          <p className="mt-8 text-sm text-foreground/50">
            Site oficial do jogo:
          </p>
          <a
            href="https://www.gen42.com/hive.php"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center rounded-lg border border-foreground/15 px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-foreground/5"
          >
            Gen42 — HIVE
          </a>
          <p className="mt-8">
            <Link to="/games" viewTransition className="text-sm text-primary underline-offset-4 hover:underline">
              ← Voltar aos jogos
            </Link>
          </p>
        </div>
      </Center>
    </>
  )
}
