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
    href: 'https://www.instagram.com/mazeps',
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
    href: 'https://open.spotify.com/user/mazeps',
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
    href: 'https://www.youtube.com/@mazeps',
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
          Coloque aqui a historia da empresa. Como tudo comecou, qual e a missao
          e o que move a Mazeps.
        </p>
      </section>

      <Spacer size="lg" />

      <section>
        <h2 className="text-base font-semibold">Time</h2>
        <Spacer size="sm" />
        <ul className="flex flex-col gap-3">
          {TEAM.map((member, index) => (
            <li key={index} className="flex flex-col">
              <span className="font-medium">{member.name}</span>
              <span className="text-sm opacity-60">{member.role}</span>
            </li>
          ))}
        </ul>
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
