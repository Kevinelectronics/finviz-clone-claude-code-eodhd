import { useEffect, useState } from 'react'
import { getSectorPrices } from '../api/eodhd'

const SECTORS = [
  { code: 'XLK.US', name: 'TECHNOLOGY', weight: 28 },
  { code: 'XLF.US', name: 'FINANCIAL', weight: 13 },
  { code: 'XLV.US', name: 'HEALTHCARE', weight: 13 },
  { code: 'XLY.US', name: 'CONSUMER DISC', weight: 10 },
  { code: 'XLC.US', name: 'COMMUNICATION', weight: 9 },
  { code: 'XLI.US', name: 'INDUSTRIALS', weight: 9 },
  { code: 'XLP.US', name: 'CONS STAPLES', weight: 6 },
  { code: 'XLE.US', name: 'ENERGY', weight: 4 },
  { code: 'XLB.US', name: 'MATERIALS', weight: 3 },
  { code: 'XLRE.US', name: 'REAL ESTATE', weight: 2.5 },
  { code: 'XLU.US', name: 'UTILITIES', weight: 2.5 },
]

function getColor(changeP) {
  const p = Number(changeP)
  if (isNaN(p)) return '#21262d'
  if (p >= 3) return '#116329'
  if (p >= 1.5) return '#196127'
  if (p >= 0.5) return '#1a7f37'
  if (p > 0) return '#2ea043'
  if (p === 0) return '#21262d'
  if (p > -0.5) return '#b91c1c'
  if (p > -1.5) return '#991b1b'
  if (p > -3) return '#7f1d1d'
  return '#6b0000'
}

export default function SectorHeatmap() {
  const [prices, setPrices] = useState({})

  useEffect(() => {
    getSectorPrices().then(data => {
      const arr = Array.isArray(data) ? data : [data]
      const map = {}
      arr.forEach(d => { map[d.code] = d })
      setPrices(map)
    }).catch(console.error)
  }, [])

  return (
    <div style={{ padding: '4px 4px 0' }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#e6edf3', fontWeight: 'bold', fontSize: 13 }}>S&P 500 — Sector Performance</span>
          <div style={{ display: 'flex', gap: 4, fontSize: 10, color: '#8b949e' }}>
            {[[-3,'darkred'],[-1.5,'red'],[-0.5,'lightred'],[0,'gray'],[0.5,'lightgreen'],[1.5,'green'],[3,'darkgreen']].map(([v,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 12, height: 12, background: getColor(v), display: 'inline-block', borderRadius: 2 }} />
                {v > 0 ? `+${v}%` : `${v}%`}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', height: 160, gap: 3 }}>
          {SECTORS.map(s => {
            const p = prices[s.code]
            const changeP = p?.change_p
            const close = p?.close
            return (
              <div
                key={s.code}
                style={{
                  flex: s.weight,
                  background: getColor(changeP),
                  border: '1px solid #0d1117',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'opacity 0.15s',
                  minWidth: 0,
                  overflow: 'hidden',
                  padding: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                title={`${s.name}\n${s.code}: ${close ? Number(close).toFixed(2) : '—'} (${changeP ? (Number(changeP) > 0 ? '+' : '') + Number(changeP).toFixed(2) + '%' : '—'})`}
              >
                <div style={{ color: '#e6edf3', fontSize: 10, fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlignLast: 'center' }}>
                  {s.name}
                </div>
                <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                  {s.code.replace('.US', '')}
                </div>
                <div style={{ color: '#e6edf3', fontSize: 11 }}>
                  {changeP ? `${Number(changeP) > 0 ? '+' : ''}${Number(changeP).toFixed(2)}%` : '…'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
