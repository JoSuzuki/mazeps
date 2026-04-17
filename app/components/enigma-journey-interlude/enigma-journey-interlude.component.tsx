import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import Spacer from '~/components/spacer/spacer.component'

export default function EnigmaJourneyInterlude({
  enigmaName,
  customBody,
}: {
  enigmaName: string
  /** Se definido, substitui os dois parágrafos narrativos abaixo do título principal (várias linhas). */
  customBody?: string | null
}) {
  return (
    <>
      <BackButtonPortal to="/enigmas" />
      <div className="relative min-h-[60vh] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, var(--color-primary), transparent 70%)',
          }}
          aria-hidden
        />
        <style>{`
          @keyframes enigma-fade {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <Center>
          <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
            <h1
              className="text-balance font-brand text-2xl font-semibold tracking-wide text-foreground/90 sm:text-3xl md:text-4xl"
              style={{ animation: 'enigma-fade 0.9s ease-out both' }}
            >
              Você chegou até aqui, mas este não é o fim...
            </h1>
            <Spacer size="md" />
            {customBody?.trim() ? (
              <p
                className="whitespace-pre-line text-lg leading-relaxed text-foreground/70"
                style={{ animation: 'enigma-fade 0.9s ease-out 0.3s both' }}
              >
                {customBody.trim()}
              </p>
            ) : (
              <>
                <p
                  className="text-lg leading-relaxed text-foreground/70"
                  style={{ animation: 'enigma-fade 0.9s ease-out 0.3s both' }}
                >
                  Algo em ti desvendou o trecho que estava ao alcance de todos em{' '}
                  <strong className="font-medium text-foreground/85">{enigmaName}</strong>.
                </p>
                <Spacer size="sm" />
                <p
                  className="text-base leading-relaxed text-foreground/55"
                  style={{ animation: 'enigma-fade 0.9s ease-out 0.45s both' }}
                >
                  Ainda há caminhos por abrir. Esta jornada não terminou — volta mais tarde.
                </p>
              </>
            )}
            <Spacer size="lg" />
            <Link
              to="/enigmas"
              viewTransition
              className="inline-flex items-center gap-2 rounded-xl border border-foreground/25 bg-foreground/[0.04] px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              style={{ animation: 'enigma-fade 0.9s ease-out 0.55s both' }}
            >
              ← Voltar aos enigmas
            </Link>
          </div>
        </Center>
      </div>
    </>
  )
}
