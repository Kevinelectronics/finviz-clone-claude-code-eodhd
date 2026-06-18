const TABS = ['Home', 'News', 'Screener', 'Charts', 'Groups', 'Portfolio', 'Insider', 'Futures', 'Forex', 'Crypto', 'Calendar']

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', height: 32 }}>
        <span style={{ color: '#58a6ff', fontWeight: 'bold', fontSize: 16, marginRight: 16, letterSpacing: 1 }}>
          FINVIEW
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                background: activeTab === tab ? '#1f6feb' : 'transparent',
                color: activeTab === tab ? '#fff' : '#8b949e',
                border: 'none',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: 12,
                borderRadius: 3,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: 11 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button style={{ background: '#238636', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>
            Login
          </button>
          <button style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>
            Register
          </button>
        </div>
      </div>
    </nav>
  )
}
