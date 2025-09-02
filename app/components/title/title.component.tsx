interface TitleProps {
  size?: 'navbar' | 'home'
}

const MAP_SIZES = {
  home: {
    title: 'text-9xl',
    cmbg: 'text-5xl p-2 -right-10 -bottom-5',
  },
  navbar: {
    title: 'text-4xl',
    cmbg: 'text-lg p-0.5 -right-3 -bottom-5',
  },
}

const Title = ({ size = 'home' }: TitleProps) => {
  return (
    <div className="relative [view-transition-name:mazeps-title]">
      <h1 className={`${MAP_SIZES[size].title} font-brand tracking-wide`}>
        Mazeps
      </h1>
      <h2
        className={`${MAP_SIZES[size].cmbg} show-if-pegasus bg-background font-brand absolute hidden -rotate-12 rounded-md border-2 tracking-wide`}
      >
        CMBG
      </h2>
    </div>
  )
}

export default Title
