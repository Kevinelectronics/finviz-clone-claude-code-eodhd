import { useEffect, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { getIndicesPrices, getIntradayData } from '../api/eodhd'

const INDICES = [
  { code: 'GSPC.INDX', label: 'S&P 500' },
  { code: 'DJI.INDX', label: 'DOW' },
  { code: 'IXIC.INDX', label: 'NASDAQ' },
  { code: 'RUT.INDX', label: 'RUSSELL 2000' },
]

function fmt(n) {
  if (!n || n === 'NA') return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function MiniChart({ data, color }) {
  if (!data?.length) {
    return (
      <div style={{ width: '100%', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#30363d', fontSize: 10 }}>No intraday data</span>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', height: 70 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 11, padding: '4px 8px' }}
            itemStyle={{ color: '#e6edf3' }}
            formatter={(v) => [fmt(v), 'Price']}
            labelFormatter={(l) => l || ''}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${color.replace('#', '')})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function IndexCard({ info, price, chart, loading }) {
  const change = price?.change
  const changeP = price?.change_p
  const close = price?.close
  const isUp = Number(change) >= 0
  const color = change && change !== 'NA' ? (isUp ? '#3fb950' : '#f85149') : '#58a6ff'
  const hasPrice = close && close !== 'NA'

  return (
    <div style={{ flex: 1, background: '#0d1117', border: '1px solid #21262d', padding: '8px 10px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ color: '#e6edf3', fontWeight: 'bold', fontSize: 13 }}>{info.label}</span>
        <span style={{ color, fontSize: 12 }}>
          {loading ? <span style={{ color: '#30363d' }}>...</span>
            : hasPrice ? `${isUp ? '+' : ''}${fmt(change)} (${fmt(changeP)}%)` : '—'}
        </span>
      </div>
      <div style={{ color: '#e6edf3', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
        {loading ? <span style={{ color: '#30363d', fontSize: 14 }}>Loading…</span>
          : hasPrice ? fmt(close) : '—'}
      </div>
      <MiniChart data={chart} color={color} />
    </div>
  )
}

export default function MarketOverview() {
  const [prices, setPrices] = useState({})
  const [charts, setCharts] = useState({})
  const [loadingPrices, setLoadingPrices] = useState(true)

  useEffect(() => {
    getIndicesPrices()
      .then(data => {
        const map = {}
        const arr = Array.isArray(data) ? data : [data]
        arr.forEach(d => { map[d.code] = d })
        setPrices(map)
      })
      .catch(err => console.error('Prices error:', err))
      .finally(() => setLoadingPrices(false))

    INDICES.forEach(idx => {
      getIntradayData(idx.code)
        .then(data => setCharts(prev => ({ ...prev, [idx.code]: data })))
        .catch(() => setCharts(prev => ({ ...prev, [idx.code]: [] })))
    })
  }, [])

  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 4px' }}>
      {INDICES.map(idx => (
        <IndexCard
          key={idx.code}
          info={idx}
          price={prices[idx.code]}
          chart={charts[idx.code]}
          loading={loadingPrices && !prices[idx.code]}
        />
      ))}
    </div>
  )
}
