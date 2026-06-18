import { useEffect, useState } from 'react'
import { getTopMovers } from '../api/eodhd'

function fmt(n) {
  if (n === null || n === undefined || n === 'NA') return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtVol(n) {
  if (!n) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return String(n)
}

function buildTicker(row) {
  if (!row.exchange || row.exchange === row.code) return `${row.code}.US`
  return `${row.code}.${row.exchange}`
}

function SignalGroup({ title, rows, signalLabel, loading, onTickerSelect }) {
  return (
    <div>
      <div style={{ background: '#1c2128', color: '#8b949e', padding: '4px 8px', fontSize: 11, fontWeight: 'bold', borderTop: '1px solid #30363d', borderBottom: '1px solid #30363d' }}>
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#161b22' }}>
            {['Ticker', 'Last', 'Change', 'Volume', 'Signal'].map(h => (
              <th key={h} style={{ padding: '3px 6px', color: '#8b949e', fontSize: 10, textAlign: h === 'Ticker' || h === 'Signal' ? 'left' : 'right', fontWeight: 'normal', borderBottom: '1px solid #21262d' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ padding: '8px 6px', color: '#30363d', fontSize: 11, textAlign: 'center' }}>Fetching…</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '8px 6px', color: '#8b949e', fontSize: 11, textAlign: 'center' }}>No results</td>
            </tr>
          ) : rows.slice(0, 8).map((r, i) => {
            const isUp = Number(r.refund_1d_p) >= 0
            const color = isUp ? '#3fb950' : '#f85149'
            return (
              <tr key={r.code}
                onClick={() => onTickerSelect(buildTicker(r))}
                style={{ background: i % 2 === 0 ? '#0d1117' : '#0a0d12', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0d1117' : '#0a0d12'}
              >
                <td style={{ padding: '2px 6px', color: '#58a6ff', fontSize: 12, fontWeight: 'bold' }}>{r.code}</td>
                <td style={{ padding: '2px 6px', color: '#e6edf3', fontSize: 12, textAlign: 'right' }}>{fmt(r.adjusted_close)}</td>
                <td style={{ padding: '2px 6px', color, fontSize: 12, textAlign: 'right', fontWeight: 'bold' }}>
                  {r.refund_1d_p != null ? `${isUp ? '+' : ''}${fmt(r.refund_1d_p)}%` : '—'}
                </td>
                <td style={{ padding: '2px 6px', color: '#e6edf3', fontSize: 12, textAlign: 'right' }}>{fmtVol(r.avgvol_1d)}</td>
                <td style={{ padding: '2px 6px', fontSize: 10 }}>
                  <span style={{ background: '#21262d', color: '#8b949e', padding: '1px 5px', borderRadius: 3 }}>{signalLabel}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function SignalTables({ onTickerSelect }) {
  const [movers, setMovers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getTopMovers()
      .then(data => { setMovers(data); setError(null) })
      .catch(err => { console.error(err); setError(err.message) })
      .finally(() => setLoading(false))
  }, [])

  const g = (key) => movers?.[key] ?? []

  if (error) {
    return (
      <div style={{ border: '1px solid #21262d', padding: 20, color: '#f85149', fontSize: 12, textAlign: 'center' }}>
        API Error: {error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 4px 0' }}>
      <div style={{ flex: 1, border: '1px solid #21262d', overflow: 'hidden' }}>
        <SignalGroup title="Top Gainers" rows={g('gainers')} signalLabel="Top Gainers" loading={loading} onTickerSelect={onTickerSelect} />
        <SignalGroup title="New High" rows={g('newHigh')} signalLabel="New High" loading={loading} onTickerSelect={onTickerSelect} />
        <SignalGroup title="Unusual Volume" rows={g('unusual')} signalLabel="Unusual Volume" loading={loading} onTickerSelect={onTickerSelect} />
      </div>
      <div style={{ flex: 1, border: '1px solid #21262d', overflow: 'hidden' }}>
        <SignalGroup title="Top Losers" rows={g('losers')} signalLabel="Top Losers" loading={loading} onTickerSelect={onTickerSelect} />
        <SignalGroup title="New Low" rows={g('newLow')} signalLabel="New Low" loading={loading} onTickerSelect={onTickerSelect} />
        <SignalGroup title="Most Active" rows={g('active')} signalLabel="Most Active" loading={loading} onTickerSelect={onTickerSelect} />
      </div>
    </div>
  )
}
