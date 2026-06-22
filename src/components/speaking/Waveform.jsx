export default function Waveform({ level = 0 }) {
  // Real input level (0-1) drives 5 bars with staggered scaling so quiet input
  // still looks alive but loud input clearly dominates.
  const bars = [0.55, 0.85, 1, 0.85, 0.55]
  return (
    <div className="waveform">
      {bars.map((mult, i) => {
        const h = 6 + level * mult * 28
        return <div key={i} className="waveform-bar" style={{ height: `${h}px` }} />
      })}
    </div>
  )
}
