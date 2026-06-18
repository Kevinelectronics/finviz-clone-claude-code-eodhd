const API_KEY = import.meta.env.VITE_EODHD_API_KEY
// Use Vite proxy in dev to avoid CORS; use direct URL in production
const BASE = import.meta.env.DEV ? '/eodhd/api' : 'https://eodhd.com/api'

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  url.searchParams.set('api_token', API_KEY)
  url.searchParams.set('fmt', 'json')
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`EODHD ${res.status}: ${path}`)
  return res.json()
}

export const getIndicesPrices = () =>
  get('/real-time/GSPC.INDX', { s: 'DJI.INDX,IXIC.INDX,RUT.INDX' })

export async function getIntradayData(ticker) {
  // Go back 5 days to handle weekends, holidays, pre-market
  const d = new Date()
  d.setDate(d.getDate() - 5)
  d.setHours(0, 0, 0, 0)
  const data = await get(`/intraday/${ticker}`, {
    interval: '5m',
    from: Math.floor(d.getTime() / 1000),
  })
  if (!Array.isArray(data) || data.length === 0) return []
  // Return only the most recent trading day
  const lastDate = data[data.length - 1]?.datetime?.split(' ')[0]
  return lastDate ? data.filter(d => d.datetime?.startsWith(lastDate)) : data
}

export const getSectorPrices = () =>
  get('/real-time/XLK.US', {
    s: 'XLF.US,XLV.US,XLY.US,XLC.US,XLI.US,XLP.US,XLE.US,XLB.US,XLRE.US,XLU.US',
  })

export async function getScreener({ filters = [], signals, limit = 15 } = {}) {
  const url = new URL(`${BASE}/screener`, window.location.origin)
  url.searchParams.set('api_token', API_KEY)
  url.searchParams.set('fmt', 'json')
  if (filters.length) url.searchParams.set('filters', JSON.stringify(filters))
  if (signals) url.searchParams.set('signals', signals)
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Screener ${res.status}`)
  const json = await res.json()
  return { data: json.data || [], total: json.total ?? json.data?.length ?? 0 }
}

export async function getFundamentals(ticker) {
  return get(`/fundamentals/${ticker}`)
}

export async function getHistoricalPrices(ticker, fromDate) {
  return get(`/eod/${ticker}`, { period: 'd', from: fromDate, order: 'a' })
}

export async function getTopMovers() {
  const usLarge = [['market_capitalization', '>', '200000000']]
  const [gainers, losers, newHigh, newLow, unusual, active] = await Promise.allSettled([
    getScreener({ filters: [...usLarge, ['refund_1d_p', '>', '2']], limit: 15 }),
    getScreener({ filters: [...usLarge, ['refund_1d_p', '<', '-2']], limit: 15 }),
    getScreener({ filters: usLarge, signals: '200d_new_hi', limit: 15 }),
    getScreener({ filters: usLarge, signals: '200d_new_lo', limit: 15 }),
    getScreener({ filters: [...usLarge, ['avgvol_1d', '>', '2000000']], limit: 15 }),
    getScreener({ filters: [...usLarge, ['avgvol_1d', '>', '5000000']], limit: 15 }),
  ])

  const safe = (r) => (r.status === 'fulfilled' ? r.value.data : [])
  const sort = (arr, field, dir) =>
    [...arr].sort((a, b) => (dir === 'desc' ? b[field] - a[field] : a[field] - b[field]))

  return {
    gainers: sort(safe(gainers), 'refund_1d_p', 'desc'),
    losers: sort(safe(losers), 'refund_1d_p', 'asc'),
    newHigh: safe(newHigh),
    newLow: safe(newLow),
    unusual: sort(safe(unusual), 'avgvol_1d', 'desc'),
    active: sort(safe(active), 'avgvol_1d', 'desc'),
  }
}
