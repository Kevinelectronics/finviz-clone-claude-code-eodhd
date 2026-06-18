# FinView — Open-Source Finviz Clone Built with Claude Code & EODHD APIs

> A full-featured **stock market dashboard** inspired by Finviz, built entirely with **Claude Code** and powered by real-time financial data from the **EODHD API**. Features a stock screener, live market indices, sector heatmap, and interactive company detail modals — all in a dark, professional UI.

<img width="1320" height="915" alt="image" src="https://github.com/user-attachments/assets/2e59ac60-335f-4eec-868d-7492554d7088" />
---

## 🚀 Live Features

| Feature | Description |
|---|---|
| **Market Overview** | Real-time S&P 500, DOW, NASDAQ & Russell 2000 mini-charts with 5-minute intraday data |
| **Market Breadth** | Advancing/Declining stocks, New High/Low counts, Bull/Bear sentiment indicator |
| **Signal Tables** | Top Gainers, Top Losers, New Highs, New Lows, Unusual Volume & Most Active |
| **Sector Heatmap** | Color-coded S&P 500 sector performance (XLK, XLF, XLV, XLY…) |
| **Stock Screener** | Filter by sector, market cap, daily change — sortable results with 100 stocks |
| **Stock Detail Modal** | Click any ticker for 1Y price chart, fundamentals, analyst ratings & company description |

---

## 📸 Screenshots

<img width="1314" height="928" alt="image" src="https://github.com/user-attachments/assets/76ead906-6d35-4a10-b9b0-be6636ee45f1" />

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Kevinelectronics/finviz-clone-claude-code-eodhd.git
cd finviz-clone-claude-code-eodhd
```

### 2. Get your EODHD API Key (Free tier available)

This project is powered by **[EODHD](https://eodhd.com/?via=kmg&ref1=Meneses&utm_source=medium&utm_medium=post&utm_campaign=finviz-clone&utm_content=Meneses)** — one of the most comprehensive financial data APIs available, covering:

- ✅ Real-time & historical stock prices (70+ exchanges)
- ✅ Fundamentals: income statements, balance sheets, cash flows
- ✅ Intraday data (1m, 5m, 1h intervals)
- ✅ Stock screener with 50+ filter fields
- ✅ Sector ETF data, insider transactions, analyst ratings

👉 **[Sign up for a free EODHD account here](https://eodhd.com/?via=kmg&ref1=Meneses&utm_source=medium&utm_medium=post&utm_campaign=finviz-clone&utm_content=Meneses)**

### 3. Configure your environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
VITE_EODHD_API_KEY=your_eodhd_api_key_here
```

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 5** | Build tool & dev server (with CORS proxy for EODHD) |
| **Tailwind CSS v4** | Styling |
| **Recharts** | Interactive price charts |
| **EODHD API** | Real-time prices, fundamentals, screener, intraday data |

---

## 🔌 EODHD API Endpoints Used

```
GET /api/real-time/{ticker}         → Live prices for indices & ETFs
GET /api/intraday/{ticker}          → 5-minute intraday candles
GET /api/screener                   → Stock screener with filters & signals
GET /api/fundamentals/{ticker}      → Company fundamentals & analyst ratings
GET /api/eod/{ticker}               → 1-year daily historical prices
```

---

## 📁 Project Structure

```
src/
├── api/
│   └── eodhd.js          # All EODHD API calls (proxied via Vite)
├── components/
│   ├── Navbar.jsx         # Top navigation bar
│   ├── MarketOverview.jsx # 4 index mini-charts
│   ├── MarketBreadth.jsx  # Advancing/Declining breadth bars
│   ├── SignalTables.jsx   # Gainers, Losers, New High/Low, Volume
│   ├── SectorHeatmap.jsx  # S&P 500 sector ETF heatmap
│   ├── Screener.jsx       # Full stock screener with filters
│   └── StockModal.jsx     # Stock detail modal with chart & metrics
└── App.jsx                # Root component with tab navigation
```

---

## 🤖 Built with Claude Code

This entire application was built using **[Claude Code](https://claude.ai/code)** — Anthropic's AI-powered CLI for software development. The full dashboard, API integration, and UI components were designed and implemented in a single session using Claude's agentic coding capabilities alongside the EODHD MCP server.

**Key Claude Code features used:**
- EODHD MCP server for live API exploration
- Parallel tool calls for faster development
- Automatic CORS proxy configuration
- Multi-component React architecture

---

## 📊 Why EODHD?

EODHD (End of Day Historical Data) is the financial data backbone of this project. With coverage of **70+ stock exchanges**, **100,000+ tickers**, and a **generous free tier**, it's one of the best choices for building financial applications.

| Plan | Requests/Day | Features |
|---|---|---|
| Free | 20 | EOD data, limited exchanges |
| All-World | 100,000 | Real-time, fundamentals, screener, intraday |
| All-In-One | Unlimited | Everything + WebSocket, options, macro data |

👉 **[Get your EODHD API key →](https://eodhd.com/?via=kmg&ref1=Meneses&utm_source=medium&utm_medium=post&utm_campaign=finviz-clone&utm_content=Meneses)**

---

## 🚧 Roadmap

- [ ] News feed with sentiment analysis
- [ ] Crypto & Forex dashboards
- [ ] Portfolio tracker
- [ ] Earnings calendar
- [ ] Insider trading tracker
- [ ] WebSocket real-time price updates

---

## 📄 License

MIT — free to use, fork, and build upon.

---

## 🙏 Credits

- Inspired by [Finviz](https://finviz.com)
- Financial data by [EODHD](https://eodhd.com/?ref=finviz-clone)
- Built with [Claude Code](https://claude.ai/code) by Anthropic
