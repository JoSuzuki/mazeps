interface CenterProps {
  className?: string
  children: React.ReactNode
}

const Center = ({
  children,
  className = '',
}: CenterProps): React.ReactElement => (
  <div className={`relative mr-auto ml-auto h-full px-6 py-2 ${className}`}>
    {children}
  </div>
)

export default Center
