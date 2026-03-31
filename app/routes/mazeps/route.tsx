import Center from '~/components/center/center.component'

const ICON_CLASS = 'h-8 w-8 shrink-0 text-foreground/60'

function HistoryIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
}

const TEAM = [
  {
    name: 'Pietro Coelho',
    role: 'CEM — Chief Executive Meeple',
    photo: '/team/pietro-coelho.jpeg',
    bio: 'Fundador #1 do Mazeps',
  },
  {
    name: 'Ivan Cassane',
    role: 'CCM — Chief Creative Meeple',
    photo: '/team/ivan-cassane.png',
    bio: 'Fundador #2 do Mazeps',
  },
  {
    name: 'Thiago Fonseca',
    role: 'CFM — Chief Financial Meeple',
    photo: '/team/thiago-fonseca.jpeg',
    bio: 'Fundador #3 do Mazeps.',
  },
  {
    name: 'Sabujo',
    role: 'CSM — Chief Sabujo Meeple',
    photo: '/team/sabujo.jpeg',
    photoPosition: 'object-[center_15%]',
    photoScale: 'scale-150',
    bio: 'Sabujo',
  },
  {
    name: 'Laura Bobik',
    role: 'CMM — Chief Marketing Meeple',
    photo: '/team/laura-bobik.jpeg',
    bio: '',
  },
  {
    name: 'Pedro Casella',
    role: 'COM — Chief Operations Meeple',
    photo: '/team/pedro-casella.jpeg',
    bio: '',
  },
  {
    name: 'Jonathan Suzuki',
    role: 'CTM — Chief Technology Meeple',
    photo: '/team/jonathan-suzuki.jpeg',
    photoPosition: 'object-[50%_35%]',
    gridClass: 'sm:col-start-2',
    bio: '',
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
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="font-brand mb-3 text-7xl tracking-wide">Mazeps</h1>
        <p className="text-foreground/50 text-base uppercase tracking-widest">
          Sobre nós
        </p>
      </div>

      {/* Nossa Historia */}
      <section className="mb-12">
        <h2 className="font-brand mb-6 flex items-center gap-3 text-3xl tracking-wide">
          <HistoryIcon />
          Nossa História Desde 2020
        </h2>
        <div className="border-foreground/10 space-y-4 border-l-2 pl-5">
          <p className="text-foreground/70 text-base leading-relaxed">
            Seja no tabuleiro, no TCG ou no RPG de mesa, a gente sempre soube:
            se divertir é a melhor forma de conectar as pessoas! O MAZEPS é o
            resultado da mistura de um sonho e de três amigos apaixonados por
            tudo que envolve regras, estratégia e competição, cada um com seu
            tantinho a adicionar. Começamos propondo a visita ao nosso Labirinto
            para desvendar mistérios em um site de enigmas e logo percebemos que
            queríamos expandir algumas de nossas ideias.
          </p>
          <p className="text-foreground/70 text-base leading-relaxed">
            O que era um hobby se transformou em missão em 2023 e criamos a
            CMBG, nosso campeonato de Board Games para ajudar as pessoas a
            conhecerem mais jogos, lembrar de se divertir e provar que a
            atmosfera competitiva tem um valor insubstituível. Organizamos
            campeonatos, criamos comunidades e hoje queremos ser um conjunto de
            experiências: podcasts, blog, conteúdo digital, eventos imersivos de
            RPG e noites de quiz que tiram todo mundo da rotina.
          </p>
          <p className="text-foreground/70 text-base leading-relaxed">
            Nosso objetivo é simples: ser um lembrete diário de que o que você
            gostava quando era criança não precisa ficar para trás e que pra se
            divertir ninguém precisa estar conectado nem em outro plano.
          </p>
        </div>
      </section>

      {/* A Equipe */}
      <section className="mb-12">
        <h2 className="font-brand mb-6 flex items-center gap-3 text-3xl tracking-wide">
          <UsersIcon />
          A Equipe
        </h2>
        <ul className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {TEAM.map((member) => (
            <li
              key={member.name}
              className={`flex w-full flex-col items-center text-center ${'gridClass' in member ? member.gridClass : ''}`}
            >
              <div className="ring-foreground/10 mb-3 h-32 w-32 overflow-hidden rounded-full ring-2 sm:h-40 sm:w-40">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className={`h-full w-full object-cover ${
                      'photoPosition' in member ? `sm:${member.photoPosition}` : ''
                    } ${'photoScale' in member ? `sm:${member.photoScale}` : ''}`}
                  />
                ) : (
                  <div className="bg-foreground/10 flex h-full w-full items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-base font-semibold">{member.name}</p>
              <p className="text-foreground/50 mt-0.5 text-sm">{member.role}</p>
              {member.bio ? (
                <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
                  {member.bio}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Redes Sociais */}
      <section>
        <h2 className="font-brand mb-6 flex items-center gap-3 text-3xl tracking-wide">
          <ShareIcon />
          Redes Sociais
        </h2>
        <div className="flex flex-wrap gap-3">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-foreground/15 hover:border-foreground/40 hover:bg-foreground/5 flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
            >
              {social.icon}
              {social.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
