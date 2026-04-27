export default function MonoLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="mono-label" style={style}>
      {children}
    </div>
  )
}
