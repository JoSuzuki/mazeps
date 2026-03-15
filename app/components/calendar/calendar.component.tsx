const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Format: 'YYYY-MM-DD' => event label
const EVENTS: Record<string, string> = {
  '2026-03-21': 'CMBG TACTICS',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

function MonthCard({ year, month, today }: { year: number; month: number; today: Date }) {
  const { firstDay, daysInMonth } = getMonthData(year, month)
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const cells = [...blanks, ...days]

  return (
    <div className="bg-background border-foreground/10 w-64 rounded-2xl border p-4 shadow-lg">
      <p className="font-brand mb-3 text-center text-lg tracking-wide">
        {MONTHS_PT[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAYS_PT.map((d) => (
          <span key={d} className="text-foreground/40 pb-1 text-xs font-medium">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />

          const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`
          const event = EVENTS[dateKey]
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day

          return (
            <div key={i} className="group relative flex justify-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${
                  isToday
                    ? 'bg-primary text-on-primary font-bold'
                    : event
                    ? 'bg-accent text-on-accent cursor-pointer font-bold ring-2 ring-offset-1'
                    : 'text-foreground/80'
                }`}
              >
                {day}
              </span>
              {event && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 shadow-lg transition-opacity group-hover:opacity-100 bg-accent text-on-accent">
                  {event}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[currentColor]" style={{ borderTopColor: 'var(--color-accent)' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Calendar = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const prev = { year: month === 0 ? year - 1 : year, month: month === 0 ? 11 : month - 1 }
  const next = { year: month === 11 ? year + 1 : year, month: month === 11 ? 0 : month + 1 }

  return (
    <div className="mx-auto max-w-2xl px-6 mt-12">
      <h2 className="font-brand mb-6 text-center text-3xl tracking-wide">
        Próximos Eventos
      </h2>
      <div className="relative flex h-80 items-center justify-center">
        {/* Previous month */}
        <div className="absolute left-4 z-0 -translate-y-2 scale-90 origin-left opacity-40">
          <MonthCard year={prev.year} month={prev.month} today={today} />
        </div>

        {/* Current month */}
        <div className="relative z-10">
          <MonthCard year={year} month={month} today={today} />
        </div>

        {/* Next month */}
        <div className="absolute right-4 z-0 translate-y-2 scale-90 origin-right opacity-40">
          <MonthCard year={next.year} month={next.month} today={today} />
        </div>
      </div>
    </div>
  )
}

export default Calendar
