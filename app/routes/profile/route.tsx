import { useState } from 'react'
import { Form, redirect } from 'react-router'
import type { Route } from './+types/route'
import { formatEventDate } from '~/lib/date'
import BackButtonPortal from '~/components/back-button-portal/back-button-portal.component'
import Button from '~/components/button/button.component'
import Center from '~/components/center/center.component'
import Link from '~/components/link/link.component'
import LinkButton from '~/components/link-button/link-button.component'
import { getAvatarUrl } from '~/lib/avatar'
import { EventType } from '~/generated/prisma/enums'
import SupporterNameDisplay from '~/components/supporter-name-display/supporter-name-display.component'

const ICON_CLASS = 'h-5 w-5 shrink-0 text-foreground/50'

function MailIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <path d="M17.91 5H6.09a2 2 0 0 0-1.82 2.7l1.82 4.36A2 2 0 0 0 6.91 12H8" />
      <path d="M17.91 5h1.18a2 2 0 0 1 1.82 2.7l-1.82 4.36A2 2 0 0 1 17.09 12H16" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg className={ICON_CLASS} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function TrophyMedalHeroIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-trophy-outline
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

/** Estrela preenchida — identidade “celebração / evento”, distinta do troféu de pódio. */
function ChampionStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

type TrophyEvent = { id: number; name: string; date: Date | null }

/** Pódio: barra lateral metálica, troféu, colocação (1º–3º), nome do evento. */
function TournamentPodiumMedal({
  event,
  place,
}: {
  event: TrophyEvent
  place: 1 | 2 | 3
}) {
  const shineDuration =
    place === 1 ? '2s' : place === 2 ? '2.8s' : '2.4s'

  const meta =
    place === 1
      ? {
          sideBar:
            'bg-gradient-to-b from-[#FFD700] via-[#F59E0B] to-[#B45309] shadow-[6px_0_28px_rgba(251,191,36,0.85)]',
          card: [
            'rounded-xl border-[5px] border-[#EAB308]',
            'outline outline-2 outline-[#FEF08A]/90 dark:outline-amber-400/40',
            'shadow-[0_6px_0_0_#B45309,0_0_0_1px_rgba(250,204,21,0.5),0_12px_48px_-4px_rgba(251,191,36,0.75),0_28px_64px_-8px_rgba(245,158,11,0.5)]',
            'hover:shadow-[0_6px_0_0_#92400E,0_0_0_2px_rgba(253,224,71,0.6),0_16px_56px_-4px_rgba(252,211,77,0.85),0_36px_72px_-8px_rgba(217,119,6,0.55)]',
            'hover:border-[#FACC15]',
            'focus-visible:ring-[3px] focus-visible:ring-yellow-300',
            'dark:border-[#FBBF24]',
            'dark:shadow-[0_6px_0_0_#78350F,0_0_48px_-4px_rgba(251,191,36,0.35),0_24px_56px_-8px_rgba(180,83,9,0.45)]',
          ].join(' '),
          headerBand:
            'bg-gradient-to-br from-[#92400E] via-[#F59E0B] to-[#FDE047]',
          radialGlow:
            'bg-[radial-gradient(ellipse_100%_90%_at_50%_0%,rgba(255,237,120,0.95),rgba(251,191,36,0.35)_40%,transparent_58%)]',
          pulseClass: 'podium-pulse-gold',
          shineHighlight: 'rgba(255,255,255,0.95)',
          iconWrap:
            'bg-gradient-to-br from-[#FFFACD] via-[#FFE066] to-[#F59E0B] shadow-[inset_0_3px_12px_rgba(255,255,255,0.95),0_0_0_2px_rgba(180,83,9,0.5),0_10px_36px_rgba(251,191,36,0.75)] ring-[3px] ring-[#FDE047]/90 dark:from-amber-950 dark:via-amber-800 dark:to-yellow-900 dark:ring-amber-300/60',
          icon:
            'text-[#92400E] drop-shadow-[0_2px_0_rgba(255,255,255,0.5)] dark:text-amber-100',
          headerFg:
            'text-[#1a0a00] dark:text-amber-50 [text-shadow:_0_1px_0_rgba(255,255,255,0.95),0_0_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.35)]',
          footer:
            'bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] dark:from-zinc-950 dark:to-amber-950/40 dark:ring-1 dark:ring-amber-500/25',
          bodyPanel:
            'rounded-xl border-2 border-amber-900/25 bg-white px-3 py-3 shadow-md sm:px-4 sm:py-4 dark:border-amber-400/35 dark:bg-zinc-950',
          bodyTitle:
            'text-[#0a0a0a] dark:text-white [text-shadow:_0_1px_0_rgba(255,255,255,0.8)] dark:[text-shadow:none]',
          bodyDate:
            'text-[#262626] dark:text-zinc-200',
          link: 'text-[#713f12] font-bold underline-offset-2 group-hover:text-[#451a03] group-hover:underline dark:text-amber-200 dark:group-hover:text-amber-100',
        }
      : place === 2
        ? {
            sideBar:
              'bg-gradient-to-b from-[#F8FAFC] via-[#CBD5E1] to-[#64748B] shadow-[6px_0_28px_rgba(148,163,184,0.9)]',
            card: [
              'rounded-xl border-[5px] border-[#94A3B8]',
              'outline outline-2 outline-white/80 dark:outline-slate-400/35',
              'shadow-[0_6px_0_0_#475569,0_0_0_1px_rgba(226,232,240,0.8),0_12px_48px_-4px_rgba(148,163,184,0.65),0_28px_64px_-8px_rgba(100,116,139,0.45)]',
              'hover:shadow-[0_6px_0_0_#334155,0_0_0_2px_rgba(241,245,249,0.9),0_16px_56px_-4px_rgba(203,213,225,0.8),0_36px_72px_-8px_rgba(71,85,105,0.5)]',
              'hover:border-[#CBD5E1]',
              'focus-visible:ring-[3px] focus-visible:ring-slate-300',
              'dark:border-slate-400',
              'dark:shadow-[0_6px_0_0_#1e293b,0_0_40px_-4px_rgba(148,163,184,0.25),0_24px_56px_-8px_rgba(51,65,85,0.5)]',
            ].join(' '),
            headerBand:
              'bg-gradient-to-br from-[#475569] via-[#CBD5E1] to-[#E2E8F0]',
            radialGlow:
              'bg-[radial-gradient(ellipse_100%_90%_at_50%_0%,rgba(255,255,255,0.9),rgba(203,213,225,0.5)_42%,transparent_60%)]',
            pulseClass: 'podium-pulse-silver',
            shineHighlight: 'rgba(255,255,255,0.98)',
            iconWrap:
              'bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[inset_0_3px_12px_rgba(255,255,255,1),0_0_0_2px_rgba(100,116,139,0.35),0_10px_32px_rgba(148,163,184,0.65)] ring-[3px] ring-slate-300/80 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 dark:ring-slate-500/50',
            icon:
              '!text-black [filter:drop-shadow(0_0_1px_rgba(255,255,255,1))_drop-shadow(0_1px_0_rgba(255,255,255,0.9))]',
            headerFg:
              '!text-black [text-shadow:_0_0_6px_rgba(255,255,255,1),0_0_2px_rgba(255,255,255,1),0_1px_0_#fff]',
            footer:
              'bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] dark:from-[#F1F5F9] dark:to-[#E2E8F0] dark:ring-1 dark:ring-slate-400/40',
            bodyPanel:
              'rounded-xl border-2 border-slate-800/25 bg-white px-3 py-3 shadow-md sm:px-4 sm:py-4 dark:border-slate-800/30 dark:bg-white',
            bodyTitle: '!text-black [text-shadow:none]',
            bodyDate: '!text-black',
            link: '!text-black font-bold underline-offset-2 visited:!text-black hover:!text-black focus-visible:!text-black active:!text-black',
          }
        : {
            sideBar:
              'bg-gradient-to-b from-[#CD7F32] via-[#B45309] to-[#5C2E0A] shadow-[6px_0_28px_rgba(205,127,50,0.85)]',
            card: [
              'rounded-xl border-[5px] border-[#CD7F32]',
              'outline outline-2 outline-[#FDBA74]/60 dark:outline-orange-700/40',
              'shadow-[0_6px_0_0_#5C2E0A,0_0_0_1px_rgba(251,146,60,0.45),0_12px_48px_-4px_rgba(180,83,9,0.55),0_28px_64px_-8px_rgba(124,45,18,0.45)]',
              'hover:shadow-[0_6px_0_0_#431407,0_0_0_2px_rgba(253,186,116,0.5),0_16px_56px_-4px_rgba(234,88,12,0.5),0_36px_72px_-8px_rgba(154,52,18,0.5)]',
              'hover:border-[#E8A060]',
              'focus-visible:ring-[3px] focus-visible:ring-orange-400',
              'dark:border-[#C2410C]',
              'dark:shadow-[0_6px_0_0_#431407,0_0_40px_-4px_rgba(234,88,12,0.2),0_24px_56px_-8px_rgba(67,20,7,0.55)]',
            ].join(' '),
            headerBand:
              'bg-gradient-to-br from-[#3D2314] via-[#B45309] to-[#EA580C]',
            radialGlow:
              'bg-[radial-gradient(ellipse_100%_90%_at_50%_0%,rgba(253,186,116,0.75),rgba(180,83,9,0.45)_42%,transparent_60%)]',
            pulseClass: 'podium-pulse-bronze',
            shineHighlight: 'rgba(255,235,200,0.85)',
            iconWrap:
              'bg-gradient-to-br from-[#FFEDD5] via-[#D97706] to-[#9A3412] shadow-[inset_0_3px_10px_rgba(255,255,255,0.4),0_0_0_2px_rgba(124,45,18,0.45),0_10px_32px_rgba(154,52,18,0.5)] ring-[3px] ring-[#CD7F32]/80 dark:from-orange-950 dark:via-orange-900 dark:to-[#431407] dark:ring-orange-600/40',
            icon:
              'text-[#431407] drop-shadow-[0_1px_0_rgba(255,255,255,0.25)] dark:text-orange-100',
            headerFg:
              'text-[#1c0a02] dark:text-orange-50 [text-shadow:_0_1px_0_rgba(255,237,213,0.9),0_0_12px_rgba(255,255,255,0.45),0_2px_10px_rgba(0,0,0,0.5)]',
            footer:
              'bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5] dark:from-zinc-950 dark:to-orange-950/50 dark:ring-1 dark:ring-orange-900/35',
            bodyPanel:
              'rounded-xl border-2 border-orange-900/25 bg-white px-3 py-3 shadow-md sm:px-4 sm:py-4 dark:border-orange-400/35 dark:bg-zinc-950',
            bodyTitle:
              'text-[#0a0a0a] dark:text-white [text-shadow:_0_1px_0_rgba(255,255,255,0.85)] dark:[text-shadow:none]',
            bodyDate:
              'text-[#262626] dark:text-zinc-200',
            link: 'text-[#7c2d12] font-bold underline-offset-2 group-hover:text-[#431407] group-hover:underline dark:text-orange-200 dark:group-hover:text-orange-100',
          }

  const isSilver = place === 2

  return (
    <Link
      to={`/events/${event.id}`}
      viewTransition
      data-profile-trophy
      {...(isSilver ? { 'data-trophy-podium-silver': '' } : {})}
      style={isSilver ? ({ color: '#000000' } as const) : undefined}
      className={`group relative flex h-full min-h-[188px] w-full min-w-0 flex-col overflow-hidden bg-white text-center transition-all hover:-translate-y-1 focus-visible:outline-none dark:bg-zinc-950 ${meta.card}${
        isSilver
          ? ' !text-black visited:!text-black hover:!text-black focus-visible:!text-black active:!text-black dark:!text-black'
          : ''
      }`}
    >
      {/* Barra lateral metálica + brilho — identidade “pódio” */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 top-0 z-0 w-3 sm:w-3.5 ${meta.sideBar}`}
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden pl-3 sm:pl-4">
        {/* Faixa colorida baixa — só decoração (efeitos como no torneio) */}
        <div
          className={`relative h-8 shrink-0 overflow-hidden sm:h-9 ${meta.headerBand}`}
        >
          <div
            className={`pointer-events-none absolute inset-0 opacity-80 motion-reduce:opacity-50 ${meta.radialGlow} ${meta.pulseClass}`}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 motion-reduce:opacity-0"
            style={{
              background: `linear-gradient(105deg, transparent 32%, ${meta.shineHighlight} 50%, transparent 68%)`,
              backgroundSize: '220% 100%',
              animation: `trophy-shine ${shineDuration} ease-in-out infinite`,
              opacity: 0.72,
            }}
          />
        </div>

        {/* Área clara: ícone menor, colocação, nome e data */}
        <div
          className={`relative flex flex-1 flex-col items-center gap-2 px-3 py-2 text-center sm:gap-2.5 sm:px-4 sm:py-3 ${meta.footer}`}
        >
          <div
            className={`relative mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-[3.25rem] sm:w-[3.25rem] ${meta.iconWrap}`}
          >
            <TrophyMedalHeroIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${meta.icon}`} />
          </div>
          <p
            className={`font-black uppercase tracking-[0.18em] sm:text-base ${meta.headerFg}`}
          >
            {place}º lugar
          </p>
          <div
            className={`w-full max-w-full space-y-1.5 text-center ${meta.bodyPanel}`}
          >
            <p
              className={`font-brand line-clamp-5 text-balance text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl sm:leading-tight ${meta.bodyTitle}`}
            >
              {event.name}
            </p>
            {event.date && (
              <p
                className={`text-lg font-bold leading-snug sm:text-xl ${meta.bodyDate}`}
              >
                {formatEventDate(event.date)}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center justify-center gap-1 text-sm leading-none ${meta.link}`}
          >
            Ver evento
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Campeão (evento GENERAL): mesma lógica visual dos cartões de torneio (borda, barra, faixa com brilho + pulso),
 * paleta platina + turquesa (sem ouro/prata/bronze de pódio).
 */
function ChampionTrophyMedal({
  event,
}: {
  event: TrophyEvent
}) {
  const shineDuration = '2.6s'
  const shineHighlight = 'rgba(236,254,255,0.92)'

  const cardShell = [
    'rounded-xl border-[5px] border-teal-400',
    'outline outline-2 outline-cyan-100/90 dark:outline-teal-500/35',
    'shadow-[0_6px_0_0_#0f766e,0_0_0_1px_rgba(45,212,191,0.45),0_12px_44px_-4px_rgba(34,211,238,0.4),0_26px_60px_-8px_rgba(13,148,136,0.28)]',
    'hover:shadow-[0_6px_0_0_#115e59,0_0_0_2px_rgba(165,243,252,0.5),0_16px_52px_-4px_rgba(103,232,249,0.45),0_32px_64px_-8px_rgba(15,118,110,0.35)]',
    'hover:border-cyan-300',
    'focus-visible:ring-[3px] focus-visible:ring-cyan-400/60',
    'dark:border-teal-500',
    'dark:shadow-[0_6px_0_0_#042f2e,0_0_48px_-4px_rgba(45,212,191,0.22),0_22px_56px_-8px_rgba(13,148,136,0.35)]',
  ].join(' ')

  const sideBar =
    'bg-gradient-to-b from-[#e2e8f0] via-[#2dd4bf] to-[#0f766e] shadow-[6px_0_28px_rgba(45,212,191,0.55)] dark:from-slate-600 dark:via-teal-600 dark:to-teal-950 dark:shadow-[6px_0_28px_rgba(20,184,166,0.35)]'

  const headerBand =
    'bg-gradient-to-br from-[#1e3a5f] via-[#2dd4bf] to-[#a5f3fc] dark:from-[#0c4a6e] dark:via-teal-700 dark:to-teal-900'

  const radialGlow =
    'bg-[radial-gradient(ellipse_100%_90%_at_50%_0%,rgba(207,250,254,0.95),rgba(45,212,191,0.4)_42%,transparent_60%)]'

  const iconWrap =
    'bg-gradient-to-br from-white via-cyan-50 to-teal-200 shadow-[inset_0_3px_12px_rgba(255,255,255,0.95),0_0_0_2px_rgba(13,148,136,0.35),0_10px_32px_rgba(34,211,238,0.45)] ring-[3px] ring-cyan-200/90 dark:from-slate-800 dark:via-teal-900 dark:to-cyan-950 dark:ring-teal-500/45 dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.35),0_0_24px_rgba(45,212,191,0.2)]'

  const footer =
    'bg-gradient-to-b from-[#f0fdfa] to-[#ccfbf1] dark:from-teal-950 dark:to-slate-950 dark:ring-1 dark:ring-teal-800/35'

  const bodyPanel =
    'rounded-xl border-2 border-teal-800/20 bg-white px-3 py-3 shadow-md sm:px-4 sm:py-4 dark:border-teal-500/30 dark:bg-zinc-950'

  return (
    <Link
      to={`/events/${event.id}`}
      viewTransition
      data-profile-trophy
      className={`group relative flex h-full min-h-[188px] w-full min-w-0 flex-col overflow-hidden bg-white text-center transition-all hover:-translate-y-1 focus-visible:outline-none dark:bg-zinc-950 ${cardShell}`}
    >
      <div
        className={`pointer-events-none absolute bottom-0 left-0 top-0 z-0 w-3 sm:w-3.5 ${sideBar}`}
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden pl-3 sm:pl-4">
        <div
          className={`relative h-8 shrink-0 overflow-hidden sm:h-9 ${headerBand}`}
        >
          <div
            className={`pointer-events-none absolute inset-0 opacity-80 motion-reduce:opacity-50 ${radialGlow} champion-pulse-platina`}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 motion-reduce:opacity-0"
            style={{
              background: `linear-gradient(105deg, transparent 32%, ${shineHighlight} 50%, transparent 68%)`,
              backgroundSize: '220% 100%',
              animation: `trophy-shine ${shineDuration} ease-in-out infinite`,
              opacity: 0.68,
            }}
          />
        </div>

        <div
          className={`relative flex flex-1 flex-col items-center gap-2 px-3 py-2 text-center sm:gap-2.5 sm:px-4 sm:py-3 ${footer}`}
        >
          <div
            className={`relative mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-[3.25rem] sm:w-[3.25rem] ${iconWrap}`}
          >
            <ChampionStarIcon className="relative h-6 w-6 text-black sm:h-7 sm:w-7 dark:text-white" />
          </div>
          <p className="font-black uppercase tracking-[0.18em] text-black sm:text-base dark:text-white">
            Campeão
          </p>
          <div className={`w-full max-w-full space-y-1.5 text-center ${bodyPanel}`}>
            <p className="font-brand line-clamp-5 text-balance text-2xl font-extrabold leading-snug tracking-tight text-black sm:text-3xl sm:leading-tight dark:text-white">
              {event.name}
            </p>
            {event.date && (
              <p className="text-lg font-bold leading-snug text-black sm:text-xl dark:text-zinc-300">
                {formatEventDate(event.date)}
              </p>
            )}
          </div>
          <span className="inline-flex items-center justify-center gap-1 text-sm font-bold leading-none text-black underline-offset-2 group-hover:underline dark:text-zinc-200">
            Ver evento
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.currentUser) return redirect('/login')

  const [user, eventParticipants] = await Promise.all([
    context.prisma.user.findUnique({
      where: { id: context.currentUser.id },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        role: true,
        instagram: true,
        avatarUrl: true,
        ludopediaUrl: true,
        birthday: true,
        favoriteGame: true,
        favoriteEvent: true,
        isSupporter: true,
      },
    }),
    context.prisma.eventParticipant.findMany({
      where: { userId: context.currentUser.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            badgeFile: true,
            type: true,
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    }),
  ])

  if (!user) return redirect('/login')

  const championTrophies = eventParticipants
    .filter(
      (ep) => ep.isChampion && ep.event.type === EventType.GENERAL,
    )
    .map((ep) => ({
      key: ep.id,
      event: {
        id: ep.event.id,
        name: ep.event.name,
        date: ep.event.date,
      },
    }))

  const tournamentTrophies = eventParticipants
    .filter(
      (ep) =>
        ep.event.type === EventType.TOURNAMENT &&
        ep.tournamentPlace != null &&
        ep.tournamentPlace >= 1 &&
        ep.tournamentPlace <= 3,
    )
    .map((ep) => ({
      key: `podium-${ep.id}`,
      place: ep.tournamentPlace as 1 | 2 | 3,
      event: {
        id: ep.event.id,
        name: ep.event.name,
        date: ep.event.date,
      },
    }))
    .sort((a, b) => {
      if (a.place !== b.place) return a.place - b.place
      const da = a.event.date ? new Date(a.event.date).getTime() : 0
      const db = b.event.date ? new Date(b.event.date).getTime() : 0
      return db - da
    })

  return {
    currentUser: {
      ...user,
      avatarUrl: getAvatarUrl(user.avatarUrl, user.email, 96),
    },
    eventParticipants,
    championTrophies,
    tournamentTrophies,
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Formata data de aniversário sem deslocamento de timezone. */
function formatBirthday(date: Date | string): string {
  const d =
    date instanceof Date
      ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      : new Date(date + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  href?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm ${href ? 'text-primary hover:underline' : 'text-foreground/90'}`}
        >
          {value}
        </p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg p-3 transition-colors hover:bg-foreground/5"
      >
        {content}
      </a>
    )
  }
  return <div className="rounded-lg p-3">{content}</div>
}

export default function Route({ loaderData }: Route.ComponentProps) {
  const [avatarError, setAvatarError] = useState(false)
  const { currentUser, eventParticipants, championTrophies, tournamentTrophies } =
    loaderData
  const showAvatar = currentUser.avatarUrl && !avatarError

  return (
    <>
      <BackButtonPortal to="/" />
      <Center>
        <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:max-w-6xl">
          {/* Header: avatar + nome + editar (sempre no topo) */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start lg:mb-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {showAvatar ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={`Avatar de ${currentUser.name}`}
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-foreground/10"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-foreground/10 text-2xl font-semibold">
                  {getInitials(currentUser.name)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight">
                  <SupporterNameDisplay
                    name={currentUser.name}
                    isSupporter={currentUser.isSupporter}
                  />
                </h1>
                <p className="mt-1 text-foreground/60">@{currentUser.nickname}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
            <LinkButton
              styleType="primary"
              to="/profile/edit"
              viewTransition
              className="flex shrink-0 items-center justify-center gap-2 self-center sm:ml-auto"
            >
              <PencilIcon />
              Editar perfil
            </LinkButton>
          </div>

          {/* Mobile: Informações → Troféus → Participações. lg: col1 L1/L2 = Info + Participações; col2 = troféus row-span-2 */}
          <div className="mb-8 flex flex-col gap-8 lg:mb-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
            {/* Informações — lg: col1 L1 (Participações fica L2 na mesma coluna; troféus ocupam a direita em 2 linhas) */}
            <section className="min-w-0 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm lg:col-start-1 lg:row-start-1 lg:self-start">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                <UserIcon />
                Informações
              </h2>
              <div className="space-y-1">
                <InfoRow
                  icon={<MailIcon />}
                  label="E-mail"
                  value={currentUser.email}
                />
                {currentUser.instagram && (
                  <InfoRow
                    icon={<LinkIcon />}
                    label="Instagram"
                    value={
                      currentUser.instagram.startsWith('@')
                        ? currentUser.instagram
                        : `@${currentUser.instagram}`
                    }
                    href={`https://instagram.com/${currentUser.instagram.replace(/^@/, '')}`}
                  />
                )}
                {currentUser.ludopediaUrl && (
                  <InfoRow
                    icon={<LinkIcon />}
                    label="Ludopedia"
                    value="Ver perfil na Ludopedia"
                    href={
                      currentUser.ludopediaUrl.startsWith('http')
                        ? currentUser.ludopediaUrl
                        : `https://${currentUser.ludopediaUrl}`
                    }
                  />
                )}
                {currentUser.birthday && (
                  <InfoRow
                    icon={<CalendarIcon />}
                    label="Aniversário"
                    value={formatBirthday(currentUser.birthday)}
                  />
                )}
                {currentUser.favoriteGame && (
                  <InfoRow
                    icon={<GamepadIcon />}
                    label="Jogo favorito"
                    value={currentUser.favoriteGame}
                  />
                )}
                {currentUser.favoriteEvent && (
                  <InfoRow
                    icon={<EventIcon />}
                    label="Evento favorito"
                    value={currentUser.favoriteEvent}
                  />
                )}
              </div>
            </section>

            {/* Prateleira — lg: col2 com row-span-2 para não esticar só a linha 1 e atrasar Participações */}
            <section className="min-w-0 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:self-start">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                <TrophyIcon />
                Prateleira de Troféus
              </h2>
              {championTrophies.length === 0 &&
              tournamentTrophies.length === 0 ? (
                <p className="text-sm text-foreground/50">
                  Medalhas de campeão e colocações em torneios (1º, 2º e 3º lugar)
                  aparecem aqui quando um admin te marcar no evento.
                </p>
              ) : (
                <>
                  <style>{`
                  @keyframes trophy-shine {
                    0%, 100% { background-position: 100% 0; }
                    50% { background-position: -100% 0; }
                  }
                  @keyframes podium-pulse-gold {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.04); }
                  }
                  @keyframes podium-pulse-silver {
                    0%, 100% { opacity: 0.45; transform: scale(1); }
                    50% { opacity: 0.95; transform: scale(1.035); }
                  }
                  @keyframes podium-pulse-bronze {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.98; transform: scale(1.035); }
                  }
                  .podium-pulse-gold {
                    animation: podium-pulse-gold 3s ease-in-out infinite;
                  }
                  .podium-pulse-silver {
                    animation: podium-pulse-silver 3.6s ease-in-out infinite;
                  }
                  .podium-pulse-bronze {
                    animation: podium-pulse-bronze 3.3s ease-in-out infinite;
                  }
                  @keyframes champion-pulse-platina {
                    0%, 100% { opacity: 0.48; transform: scale(1); }
                    50% { opacity: 0.92; transform: scale(1.035); }
                  }
                  .champion-pulse-platina {
                    animation: champion-pulse-platina 3.2s ease-in-out infinite;
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .podium-pulse-gold,
                    .podium-pulse-silver,
                    .podium-pulse-bronze,
                    .champion-pulse-platina {
                      animation: none;
                      opacity: 0.45;
                      transform: none;
                    }
                  }
                  /* Troféus: tema usa primária rosa em links — no modo claro força preto */
                  html:not(.dark) a[data-profile-trophy],
                  html:not(.dark) a[data-profile-trophy] p,
                  html:not(.dark) a[data-profile-trophy] span {
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000;
                  }
                  /* Troféu (só traço): não usar fill — a estrela do campeão continua preenchida */
                  html:not(.dark) a[data-profile-trophy] svg[data-trophy-outline] {
                    fill: none !important;
                    stroke: #000000 !important;
                    color: #000000 !important;
                  }
                  html:not(.dark) a[data-profile-trophy] svg:not([data-trophy-outline]) {
                    color: #000000 !important;
                  }
                  /* 2º lugar (prata): preto também no escuro */
                  a[data-trophy-podium-silver],
                  a[data-trophy-podium-silver] p,
                  a[data-trophy-podium-silver] span {
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000;
                  }
                  a[data-trophy-podium-silver] svg[data-trophy-outline] {
                    fill: none !important;
                    stroke: #000000 !important;
                    color: #000000 !important;
                  }
                  `}</style>
                  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-1 xl:grid-cols-2 xl:auto-rows-fr">
                    {championTrophies.map((trophy) => (
                      <li key={trophy.key} className="flex min-h-0 h-full">
                        <ChampionTrophyMedal event={trophy.event} />
                      </li>
                    ))}
                    {tournamentTrophies.map((trophy) => (
                      <li key={trophy.key} className="flex min-h-0 h-full">
                        <TournamentPodiumMedal
                          event={trophy.event}
                          place={trophy.place}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Participações — lg: col1 L2, logo abaixo de Informações, independente da altura da prateleira */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm lg:col-start-1 lg:row-start-2 lg:self-start">
              <div className="flex items-center gap-2 border-b border-foreground/10 bg-foreground/5 px-6 py-4">
                <EventIcon />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Participações ({eventParticipants.length})
                </h2>
              </div>
              <div>
                {eventParticipants.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-foreground/50">
                    Nenhum evento ainda.
                  </p>
                ) : (
                  <ul className="divide-y divide-foreground/10">
                    {eventParticipants.map((ep) => (
                      <li key={ep.id}>
                        <Link
                          to={`/events/${ep.event.id}`}
                          viewTransition
                          className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-foreground/5"
                        >
                          {ep.event.badgeFile ? (
                            <img
                              src={ep.event.badgeFile}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
                              <EventIcon />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{ep.event.name}</p>
                            {ep.event.date && (
                              <p className="text-sm text-foreground/50">
                                {formatEventDate(ep.event.date)}
                              </p>
                            )}
                          </div>
                          <ChevronRightIcon />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* Sair — centralizado por último */}
          <div className="mx-auto flex w-full max-w-sm justify-center px-2 pb-2">
            <Form method="post" action="/logout" className="w-full sm:w-auto">
              <Button
                type="submit"
                className="flex w-full min-w-[12rem] items-center justify-center gap-2 sm:w-auto"
              >
                <LogoutIcon />
                Sair
              </Button>
            </Form>
          </div>
        </div>
      </Center>
    </>
  )
}
