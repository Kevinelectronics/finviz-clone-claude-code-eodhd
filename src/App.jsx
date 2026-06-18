import { useState } from 'react'
import Navbar from './components/Navbar'
import MarketOverview from './components/MarketOverview'
import MarketBreadth from './components/MarketBreadth'
import SignalTables from './components/SignalTables'
import SectorHeatmap from './components/SectorHeatmap'
import Screener from './components/Screener'
import StockModal from './components/StockModal'

function PlaceholderPage({ name }) {
  return (
    <div style={{ padding: 60, textAlign: 'center', color: '#8b949e' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
      <div style={{ fontSize: 18, marginBottom: 4, color: '#e6edf3' }}>{name}</div>
      <div style={{ fontSize: 13 }}>Coming soon — powered by EODHD</div>
    </div>
  )
}

function HomePage({ onTickerSelect }) {
  return (
    <div style={{ minWidth: 900 }}>
      <MarketOverview />
      <MarketBreadth />
      <div style={{ display: 'flex', gap: 4, padding: '4px 4px 0' }}>
        <div style={{ flex: 2 }}>
          <SignalTables onTickerSelect={onTickerSelect} />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <SectorHeatmap />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('Home')
  const [selectedTicker, setSelectedTicker] = useState(null)

  const handleTickerSelect = (ticker) => setSelectedTicker(ticker)
  const handleClose = () => setSelectedTicker(null)

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh' }}>
      <Navbar activeTab={tab} onTabChange={setTab} />
      <div style={{ overflowX: 'auto' }}>
        {tab === 'Home' && <HomePage onTickerSelect={handleTickerSelect} />}
        {tab === 'Screener' && <Screener onTickerSelect={handleTickerSelect} />}
        {tab === 'News' && <PlaceholderPage name="Market News" />}
        {tab === 'Charts' && <PlaceholderPage name="Charts" />}
        {tab === 'Groups' && <div style={{ padding: 4 }}><SectorHeatmap /></div>}
        {tab === 'Insider' && <PlaceholderPage name="Insider Trading" />}
        {tab === 'Futures' && <PlaceholderPage name="Futures" />}
        {tab === 'Forex' && <PlaceholderPage name="Forex" />}
        {tab === 'Crypto' && <PlaceholderPage name="Crypto" />}
        {tab === 'Calendar' && <PlaceholderPage name="Earnings Calendar" />}
        {tab === 'Portfolio' && <PlaceholderPage name="Portfolio" />}
      </div>

      {selectedTicker && (
        <StockModal ticker={selectedTicker} onClose={handleClose} />
      )}
    </div>
  )
}
