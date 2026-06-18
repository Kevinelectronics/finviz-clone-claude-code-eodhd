import { useEffect, useState, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { getFundamentals, getHistoricalPrices } from '../api/eodhd'

// ── helpers ──────────────────────────────────────────────────────
function num(n, d = 2) {
  if (n == null || n === 'NA' || n === 0 && d === 0) return '—'
  const v = Number(n)
  if (isNaN(v)) return '—'
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
function large(n) {
  if (!n) return '—'
  const v = Number(n)
  if (isNaN(v) || v === 0) return '—'
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  return `$${v.toLocaleString()}`
}
function pct(n) {
  if (n == null) return '—'
  return `${(Number(n) * 100).toFixed(2)}%`
}
function shortDate(d) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// ── Metric tile ────────────────────────────────────────────────
function Metric({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 }}>
      <span style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ color: color || '#e6edf3', fontSize: 13, fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

// ── Range bar ──────────────────────────────────────────────────
function RangeBar({ low, high, current }) {
  const l = Number(low), h = Number(high), c = Number(current)
  if (!l || !h || !c || h <= l) return null
  const pct = Math.max(0, Math.min(100, ((c - l) / (h - l)) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <span style={{ color: '#f85149' }}>{num(l)}</span>
      <div style={{ flex: 1, position: 'relative', height: 4, background: '#30363d', borderRadius: 2 }}>
        <div style={{ position: 'absolute', left: `${pct}%`, top: -3, width: 10, height: 10, background: '#58a6ff', borderRadius: '50%', transform: 'translateX(-50%)', border: '2px solid #0d1117' }} />
      </div>
      <span style={{ color: '#3fb950' }}>{num(h)}</span>
      <span style={{ color: '#8b949e' }}>52W</span>
    </div>
  )
}

// ── Analyst bar ────────────────────────────────────────────────
function AnalystBar({ ratings }) {
  const sb = Number(ratings.StrongBuy || 0)
  const b = Number(ratings.Buy || 0)
  const h = Number(ratings.Hold || 0)
  const s = Number(ratings.Sell || 0)
  const ss = Number(ratings.StrongSell || 0)
  const total = sb + b + h + s + ss
  if (!total) return null
  const bar = (count, color, label) => {
    const w = (count / total) * 100
    return w > 0 ? (
      <div title={`${label}: ${count}`} style={{ width: `${w}%`, background: color, height: '100%' }} />
    ) : null
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
        <span style={{ color: '#3fb950' }}>Buy {sb + b}</span>
        <span style={{ color: '#8b949e' }}>Hold {h}</span>
        <span style={{ color: '#f85149' }}>Sell {s + ss}</span>
        {ratings.TargetPrice && (
          <span style={{ color: '#58a6ff' }}>Target ${num(ratings.TargetPrice)}</span>
        )}
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        {bar(sb, '#1a7f37', 'Strong Buy')}
        {bar(b, '#3fb950', 'Buy')}
        {bar(h, '#8b949e', 'Hold')}
        {bar(s, '#f85149', 'Sell')}
        {bar(ss, '#7f1d1d', 'Strong Sell')}
      </div>
    </div>
  )
}

// ── Custom tooltip for chart ───────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, padding: '6px 10px', fontSize: 12 }}>
      <div style={{ color: '#8b949e', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#e6edf3', fontWeight: 'bold' }}>${num(payload[0]?.value)}</div>
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────
export default function StockModal({ ticker, onClose }) {
  const [fund, setFund] = useState(null)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [range, setRange] = useState('1Y')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = new Date()
      from.setFullYear(from.getFullYear() - 1)
      const fromStr = from.toISOString().split('T')[0]
      const [f, h] = await Promise.all([
        getFundamentals(ticker),
        getHistoricalPrices(ticker, fromStr),
      ])
      setFund(f)
      setPrices(Array.isArray(h) ? h : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [ticker])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const g = fund?.General || {}
  const h = fund?.Highlights || {}
  const t = fund?.Technicals || {}
  const ar = fund?.AnalystRatings || {}

  // Filter chart by range
  const rangeMap = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
  const filteredPrices = prices.slice(-rangeMap[range])
  const chartData = filteredPrices.map(p => ({
    date: shortDate(p.date),
    close: Number(p.adjusted_close || p.close),
    fullDate: p.date,
  }))

  const latestClose = chartData[chartData.length - 1]?.close
  const firstClose = chartData[0]?.close
  const priceChange = latestClose && firstClose ? latestClose - firstClose : null
  const pctChange = priceChange && firstClose ? (priceChange / firstClose) * 100 : null
  const isUp = pctChange == null ? true : pctChange >= 0
  const chartColor = isUp ? '#3fb950' : '#f85149'

  const ticker_short = ticker.split('.')[0]

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
        width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ color: '#58a6ff', fontSize: 22, fontWeight: 'bold' }}>{ticker_short}</span>
              <span style={{ color: '#e6edf3', fontSize: 16 }}>{g.Name || '—'}</span>
            </div>
            <div style={{ color: '#8b949e', fontSize: 12, display: 'flex', gap: 12 }}>
              {g.Exchange && <span>{g.Exchange}</span>}
              {g.Sector && <span>· {g.Sector}</span>}
              {g.Industry && <span>· {g.Industry}</span>}
              {g.Country && <span>· {g.Country}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Loading {ticker_short}…</div>
            <div style={{ color: '#30363d', fontSize: 11 }}>Fetching fundamentals &amp; price history</div>
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#f85149', fontSize: 13 }}>
            Error: {error}
          </div>
        ) : (
          <>
            {/* ── Price strip ── */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#e6edf3', fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>
                  {latestClose ? `$${num(latestClose)}` : (t['200DayMA'] ? `~$${num(t['200DayMA'])}` : '—')}
                </div>
                {pctChange != null && (
                  <div style={{ color: chartColor, fontSize: 13, marginTop: 4 }}>
                    {isUp ? '+' : ''}{num(priceChange)}&nbsp;
                    ({isUp ? '+' : ''}{num(pctChange)}%)&nbsp;
                    <span style={{ color: '#8b949e' }}>{range} return</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <RangeBar low={t['52WeekLow']} high={t['52WeekHigh']} current={latestClose || t['200DayMA']} />
              </div>
            </div>

            {/* ── Price chart ── */}
            <div style={{ padding: '12px 20px 0', borderBottom: '1px solid #21262d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#8b949e', fontSize: 11 }}>Price History</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['1M', '3M', '6M', '1Y'].map(r => (
                    <button key={r} onClick={() => setRange(r)}
                      style={{
                        background: range === r ? '#1f6feb' : 'transparent',
                        color: range === r ? '#fff' : '#8b949e',
                        border: `1px solid ${range === r ? '#1f6feb' : '#30363d'}`,
                        borderRadius: 3, padding: '2px 8px', fontSize: 11, cursor: 'pointer',
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {chartData.length === 0 ? (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30363d', fontSize: 12 }}>
                  No price data available
                </div>
              ) : (
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false}
                        interval={Math.floor(chartData.length / 6)} />
                      <YAxis domain={['auto', 'auto']} tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false}
                        axisLine={false} tickFormatter={v => `$${v.toFixed(0)}`} width={50} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2}
                        fill="url(#modalGrad)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* ── Key metrics ── */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262d', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <Metric label="Market Cap" value={large(h.MarketCapitalization)} />
              <Metric label="P/E (TTM)" value={num(h.PERatio)} />
              <Metric label="Fwd P/E" value={num(h.ForwardPE)} />
              <Metric label="EPS (TTM)" value={h.EarningsShare ? `$${num(h.EarningsShare)}` : '—'} />
              <Metric label="Revenue (TTM)" value={large(h.RevenueTTM)} />
              <Metric label="EBITDA" value={large(h.EBITDA)} />
              <Metric label="Profit Margin" value={pct(h.ProfitMargin)} />
              <Metric label="52W High" value={`$${num(t['52WeekHigh'])}`} color="#3fb950" />
              <Metric label="52W Low" value={`$${num(t['52WeekLow'])}`} color="#f85149" />
              <Metric label="Beta" value={num(t.Beta)} />
              <Metric label="Div Yield" value={h.DividendYield ? `${(Number(h.DividendYield) * 100).toFixed(2)}%` : '—'} />
              <Metric label="50D MA" value={`$${num(t['50DayMA'])}`} />
              <Metric label="200D MA" value={`$${num(t['200DayMA'])}`} />
              {g.FullTimeEmployees && (
                <Metric label="Employees" value={Number(g.FullTimeEmployees).toLocaleString()} />
              )}
            </div>

            {/* ── Analyst ratings ── */}
            {(ar.StrongBuy || ar.Buy || ar.Hold) && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #21262d' }}>
                <div style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Analyst Ratings
                </div>
                <AnalystBar ratings={ar} />
              </div>
            )}

            {/* ── Description ── */}
            {g.Description && (
              <div style={{ padding: '12px 20px' }}>
                <div style={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>About</div>
                <p style={{ color: '#8b949e', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                  {g.Description.length > 500 ? g.Description.slice(0, 500) + '…' : g.Description}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
