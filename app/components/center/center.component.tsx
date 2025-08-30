interface CenterProps {
  children: React.ReactNode
}

const Center = ({ children }: CenterProps): React.ReactElement => (
  <div className="align-center relative grid h-full place-content-center">
    {children}
  </div>
)

export default Center
