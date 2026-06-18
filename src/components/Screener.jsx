import { useState, useCallback, useEffect } from 'react'
import { getScreener } from '../api/eodhd'

const SECTORS = [
  'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical',
  'Communication Services', 'Industrials', 'Consumer Defensive', 'Energy',
  'Basic Materials', 'Real Estate', 'Utilities',
]
const MARKET_CAPS = [
  { label: 'Any', min: null, max: null },
  { label: 'Micro (<$300M)', min: null, max: '300000000' },
  { label: 'Small ($300M–$2B)', min: '300000000', max: '2000000000' },
  { label: 'Mid ($2B–$10B)', min: '2000000000', max: '10000000000' },
  { label: 'Large ($10B–$200B)', min: '10000000000', max: '200000000000' },
  { label: 'Mega (>$200B)', min: '200000000000', max: null },
]
const CHANGE_FILTERS = [
  { label: 'Any', min: null, max: null },
  { label: 'Up >5%', min: '5', max: null },
  { label: 'Up 2–5%', min: '2', max: '5' },
  { label: 'Up 0–2%', min: '0', max: '2' },
  { label: 'Down 0–2%', min: '-2', max: '0' },
  { label: 'Down 2–5%', min: '-5', max: '-2' },
  { label: 'Down >5%', min: null, max: '-5' },
]

function fmt(n, d = 2) {
  if (n == null || n === 'NA') return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function fmtMCap(n) {
  if (!n) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n}`
}
function fmtVol(n) {
  if (!n) return '—'
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return String(n)
}

const COLS = [
  { key: 'code', label: 'Ticker', align: 'left' },
  { key: 'name', label: 'Company', align: 'left' },
  { key: 'sector', label: 'Sector', align: 'left' },
  { key: 'adjusted_close', label: 'Price', align: 'right' },
  { key: 'refund_1d_p', label: '1D %', align: 'right' },
  { key: 'refund_5d_p', label: '5D %', align: 'right' },
  { key: 'market_capitalization', label: 'Mkt Cap', align: 'right' },
  { key: 'avgvol_1d', label: 'Volume', align: 'right' },
  { key: 'earnings_share', label: 'EPS', align: 'right' },
  { key: 'dividend_yield', label: 'Div %', align: 'right' },
]

function buildTicker(row) {
  if (!row.exchange || row.exchange === row.code) return `${row.code}.US`
  return `${row.code}.${row.exchange}`
}

export default function Screener({ onTickerSelect }) {
  const [sector, setSector] = useState('')
  const [capIdx, setCapIdx] = useState(0)
  const [changeIdx, setChangeIdx] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('market_capitalization')
  const [sortDir, setSortDir] = useState('desc')

  const runScreen = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = [['market_capitalization', '>', '100000000']]
      if (sector) filters.push(['sector', '=', sector])
      const cap = MARKET_CAPS[capIdx]
      if (cap.min) filters.push(['market_capitalization', '>', cap.min])
      if (cap.max) filters.push(['market_capitalization', '<', cap.max])
      const ch = CHANGE_FILTERS[changeIdx]
      if (ch.min) filters.push(['refund_1d_p', '>', ch.min])
      if (ch.max) filters.push(['refund_1d_p', '<', ch.max])
      const { data } = await getScreener({ filters, limit: 100 })
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sector, capIdx, changeIdx])

  // Auto-run on mount with default (large US stocks)
  useEffect(() => { runScreen() }, [])

  const sorted = [...results].sort((a, b) => {
    const av = a[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const bv = b[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const cmp = sortDir === 'asc' ? av - bv : bv - av
    return isNaN(cmp)
      ? String(av).localeCompare(String(bv)) * (sortDir === 'asc' ? 1 : -1)
      : cmp
  })

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const select = (e) => ({
    background: '#0d1117', color: '#e6edf3',
    border: '1px solid #30363d', padding: '5px 8px',
    borderRadius: 3, fontSize: 12,
  })

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Filter bar */}
      <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '10px 14px', marginBottom: 6, borderRadius: 4 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sector</span>
            <select value={sector} onChange={e => setSector(e.target.value)} style={select()}>
              <option value="">Any Sector</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Market Cap</span>
            <select value={capIdx} onChange={e => setCapIdx(Number(e.target.value))} style={{ ...select(), minWidth: 160 }}>
              {MARKET_CAPS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Daily Change</span>
            <select value={changeIdx} onChange={e => setChangeIdx(Number(e.target.value))} style={select()}>
              {CHANGE_FILTERS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
            </select>
          </label>
          <button onClick={runScreen} disabled={loading}
            style={{ background: loading ? '#21262d' : '#1f6feb', color: '#fff', border: 'none', padding: '7px 20px', borderRadius: 3, cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 'bold', alignSelf: 'flex-end' }}>
            {loading ? 'Screening…' : 'Screen'}
          </button>
          <span style={{ color: '#8b949e', fontSize: 12, alignSelf: 'flex-end', paddingBottom: 6 }}>
            {!loading && `${results.length} results`}
          </span>
        </div>
        {error && (
          <div style={{ marginTop: 8, color: '#f85149', fontSize: 12 }}>Error: {error}</div>
        )}
      </div>

      {/* Results table */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', overflowX: 'auto', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: '#161b22' }}>
              <th style={{ padding: '4px 8px', color: '#8b949e', fontSize: 11, textAlign: 'center', fontWeight: 'normal', borderBottom: '2px solid #30363d', width: 32 }}>#</th>
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '4px 8px', color: sortKey === col.key ? '#58a6ff' : '#8b949e',
                    fontSize: 11, textAlign: col.align, fontWeight: 'bold',
                    cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
                    borderBottom: '2px solid #30363d',
                  }}>
                  {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }, (_, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#0d1117' : '#0a0d12' }}>
                  <td colSpan={COLS.length + 1} style={{ padding: '5px 8px', color: '#21262d', fontSize: 12 }}>
                    &nbsp;
                  </td>
                </tr>
              ))
            ) : sorted.map((r, i) => {
              const isUp = Number(r.refund_1d_p) >= 0
              const chColor = isUp ? '#3fb950' : '#f85149'
              const is5Up = Number(r.refund_5d_p) >= 0
              return (
                <tr key={r.code}
                  onClick={() => onTickerSelect?.(buildTicker(r))}
                  style={{ background: i % 2 === 0 ? '#0d1117' : '#0a0d12', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0d1117' : '#0a0d12'}>
                  <td style={{ padding: '3px 8px', color: '#30363d', fontSize: 11, textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ padding: '3px 8px', color: '#58a6ff', fontSize: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{r.code}</td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || '—'}</td>
                  <td style={{ padding: '3px 8px', color: '#8b949e', fontSize: 11, whiteSpace: 'nowrap' }}>{r.sector || '—'}</td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(r.adjusted_close)}</td>
                  <td style={{ padding: '3px 8px', color: chColor, fontSize: 12, textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {r.refund_1d_p != null ? `${isUp ? '+' : ''}${fmt(r.refund_1d_p)}%` : '—'}
                  </td>
                  <td style={{ padding: '3px 8px', color: is5Up ? '#3fb950' : '#f85149', fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {r.refund_5d_p != null ? `${is5Up ? '+' : ''}${fmt(r.refund_5d_p)}%` : '—'}
                  </td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtMCap(r.market_capitalization)}</td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtVol(r.avgvol_1d)}</td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, textAlign: 'right' }}>{fmt(r.earnings_share)}</td>
                  <td style={{ padding: '3px 8px', color: '#e6edf3', fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {r.dividend_yield ? `${fmt(r.dividend_yield)}%` : '—'}
                  </td>
                </tr>
              )
            })}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={COLS.length + 1} style={{ padding: '30px', color: '#8b949e', textAlign: 'center', fontSize: 13 }}>
                  No results. Try changing filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
