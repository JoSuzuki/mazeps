import Center from '~/components/center/center.component'
import Spacer from '~/components/spacer/spacer.component'

const TEAM = [
  {
    name: 'Nome do Membro',
    role: 'Cargo / Função',
  },
  {
    name: 'Nome do Membro',
    role: 'Cargo / Função',
  },
  {
    name: 'Nome do Membro',
    role: 'Cargo / Função',
  },
]

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mazeps.br/',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/show/4F5XP0krLmZIWJWxO2hftL',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.434-1.494c3.632-1.057 8.147-.545 11.215 1.331a.78.78 0 0 1 .256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.794c3.527-1.07 9.386-.863 13.088 1.329a.937.937 0 0 1-.928 1.622z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@Mazeps-g5s',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export default function Route() {
  return (
    <Center>
      <h1 className="flex justify-center text-lg">Sobre a Mazeps</h1>
      <Spacer size="lg" />

      <section>
        <h2 className="text-base font-semibold">Nossa Historia</h2>
        <Spacer size="sm" />
        <p className="text-sm leading-relaxed opacity-80">
          Seja no tabuleiro, no TCG ou no RPG de mesa, a gente sempre soube: se
          divertir é a melhor forma de conectar as pessoas. O MAZEPS é o
          resultado da mistura de um sonho e de três amigos apaixonados por tudo
          que envolve regras, estratégia e competição, cada um com seu tantinho
          a adicionar. Começamos propondo a visita ao nosso Labirinto para
          desvendar mistérios em um site de enigmas e logo percebemos que
          queríamos expandir algumas de nossas ideias.
        </p>
        <Spacer size="sm" />
        <p className="text-sm leading-relaxed opacity-80">
          O que era um hobby se transformou em missão em 2023 e criamos a CMBG,
          nosso campeonato de Board Games para ajudar as pessoas a conhecerem
          mais jogos, lembrar de se divertir e provar que a atmosfera competitiva
          tem um valor insubstituível. Organizamos campeonatos, criamos
          comunidades e hoje queremos ser um conjunto de experiências: podcasts,
          blog, conteúdo digital, eventos imersivos de RPG e noites de quis que
          tiram todo mundo da rotina.
        </p>
        <Spacer size="sm" />
        <p className="text-sm leading-relaxed opacity-80">
          Nosso objetivo é simples: ser um lembrete diário de que o que você
          gostava quando era criança não precisa ficar para trás e que pra se
          divertir ninguém precisa estar conectado nem em outro plano.
        </p>
      </section>

      <Spacer size="lg" />

      <section>
        <h2 className="text-base font-semibold">Redes Sociais</h2>
        <Spacer size="sm" />
        <ul className="flex flex-col gap-3">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="active:pressed hover:underline flex items-center gap-2"
              >
                {social.icon}
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Spacer size="lg" />
    </Center>
  )
}
