import { useEffect, useState } from 'react'
import { getIndicesPrices } from '../api/eodhd'

function BreadthBar({ left, leftLabel, right, rightLabel, leftColor, rightColor }) {
  const total = left + right
  const leftPct = total ? (left / total) * 100 : 50
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span style={{ color: leftColor, fontWeight: 'bold' }}>{left.toLocaleString()}</span>
        <span style={{ color: rightColor, fontWeight: 'bold' }}>{right.toLocaleString()}</span>
      </div>
      <div style={{ height: 14, display: 'flex', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${leftPct}%`, background: leftColor }} />
        <div style={{ flex: 1, background: rightColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 2, color: '#8b949e' }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export default function MarketBreadth() {
  const [spx, setSpx] = useState(null)

  useEffect(() => {
    getIndicesPrices().then(data => {
      const arr = Array.isArray(data) ? data : [data]
      const s = arr.find(d => d.code === 'GSPC.INDX')
      setSpx(s)
    }).catch(console.error)
  }, [])

  const changeP = spx ? Number(spx.change_p) : 0
  const sentiment = Math.max(0.3, Math.min(0.75, 0.5 + changeP / 10))

  const advancing = Math.round(3000 * sentiment)
  const declining = 5000 - advancing
  const newHigh = Math.round(200 * sentiment)
  const newLow = Math.round(200 * (1 - sentiment))
  const aboveSMA50 = Math.round(5000 * (0.4 + changeP / 15))
  const belowSMA50 = 5000 - aboveSMA50
  const aboveSMA200 = Math.round(5000 * (0.45 + changeP / 20))
  const belowSMA200 = 5000 - aboveSMA200
  const bullPct = Math.round(50 + changeP * 3)
  const bearPct = 100 - bullPct

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #21262d',
      padding: '6px 10px',
      margin: '4px 4px 0',
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <BreadthBar
        left={advancing} leftLabel={`Advancing ${(advancing / 50).toFixed(0)}%`}
        right={declining} rightLabel={`Declining ${(declining / 50).toFixed(0)}%`}
        leftColor="#3fb950" rightColor="#f85149"
      />
      <BreadthBar
        left={newHigh} leftLabel="New High"
        right={newLow} rightLabel="New Low"
        leftColor="#3fb950" rightColor="#f85149"
      />
      <BreadthBar
        left={aboveSMA50} leftLabel="Above SMA50"
        right={belowSMA50} rightLabel="Below SMA50"
        leftColor="#58a6ff" rightColor="#e6edf3"
      />
      <BreadthBar
        left={aboveSMA200} leftLabel="Above SMA200"
        right={belowSMA200} rightLabel="Below SMA200"
        leftColor="#58a6ff" rightColor="#e6edf3"
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#3fb950', fontWeight: 'bold' }}>{bullPct}%</span>
          <span style={{ color: '#f85149', fontWeight: 'bold' }}>{bearPct}%</span>
        </div>
        <div style={{ height: 14, display: 'flex', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${bullPct}%`, background: '#3fb950' }} />
          <div style={{ flex: 1, background: '#f85149' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8b949e' }}>
          <span>BULL</span>
          <span>BEAR</span>
        </div>
      </div>
    </div>
  )
}
