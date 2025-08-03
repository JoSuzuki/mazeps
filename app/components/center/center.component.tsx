interface CenterProps {
  children: React.ReactNode;
}

const Center = ({ children }: CenterProps): React.ReactElement => <div className="grid align-center place-content-center h-full relative">
  {children}
</div>

export default Center;