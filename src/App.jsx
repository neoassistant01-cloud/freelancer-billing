import { useState, useEffect } from 'react'

const STORAGE_KEY = 'freelancer-revenue-data'
const SOURCES = ['Upwork', 'Fiverr', 'Direct', 'Other']
const TAX_RATE = 0.25

function App() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ source: 'Upwork', amount: '', client: '', project: '', date: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = (e) => {
    e.preventDefault()
    if (!form.amount || !form.client || !form.date) return
    const entry = { ...form, amount: parseFloat(form.amount), id: Date.now() }
    setEntries([...entries, entry])
    setForm({ source: 'Upwork', amount: '', client: '', project: '', date: '' })
    setShowForm(false)
  }

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const getCurrentMonthRevenue = () => {
    const now = new Date()
    return entries
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const getLastMonthRevenue = () => {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return entries
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const getMonthlyData = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEntries = entries.filter(e => {
        const ed = new Date(e.date)
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
      })
      months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), revenue: monthEntries.reduce((s, e) => s + e.amount, 0) })
    }
    return months
  }

  const getClientBreakdown = () => {
    const breakdown = {}
    entries.forEach(e => {
      breakdown[e.client] = (breakdown[e.client] || 0) + e.amount
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }

  const getQuarterlyRevenue = () => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    const quarterEntries = entries.filter(e => {
      const d = new Date(e.date)
      return Math.floor(d.getMonth() / 3) === quarter && d.getFullYear() === now.getFullYear()
    })
    return quarterEntries.reduce((s, e) => s + e.amount, 0)
  }

  const currentMonth = getCurrentMonthRevenue()
  const lastMonth = getLastMonthRevenue()
  const percentChange = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth * 100).toFixed(1) : currentMonth > 0 ? 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Freelancer Revenue Tracker</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            {showForm ? 'Cancel' : '+ Add Income'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={addEntry} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="border rounded-lg p-3">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="border rounded-lg p-3" step="0.01" />
              <input type="text" placeholder="Client name" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="border rounded-lg p-3" />
              <input type="text" placeholder="Project name" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} className="border rounded-lg p-3" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded-lg p-3" />
            </div>
            <button type="submit" className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">Save Entry</button>
          </form>
        )}

        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-800">${currentMonth.toLocaleString()}</p>
            <p className={`text-sm mt-2 ${percentChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}% vs last month
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm mb-1">Quarterly Revenue</p>
            <p className="text-3xl font-bold text-gray-800">${getQuarterlyRevenue().toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">Est. taxes (25%): ${(getQuarterlyRevenue() * TAX_RATE).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-gray-800">${entries.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">{entries.length} projects</p>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-48">
            {getMonthlyData().map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${Math.max((m.revenue / Math.max(...getMonthlyData().map(d => d.revenue), 1)) * 100, 2)}%` }}></div>
                <p className="text-xs text-gray-500 mt-2">{m.month}</p>
                <p className="text-xs font-medium">${m.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h2>
            {getClientBreakdown().length === 0 ? (
              <p className="text-gray-500">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {getClientBreakdown().map(([client, total], i) => (
                  <div key={client} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium">{i + 1}</span>
                      <span className="font-medium text-gray-700">{client}</span>
                    </div>
                    <span className="text-gray-800 font-semibold">${total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Entries */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h2>
            {entries.length === 0 ? (
              <p className="text-gray-500">No entries yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...entries].reverse().slice(0, 10).map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">{e.client}</p>
                      <p className="text-xs text-gray-500">{e.project} • {e.source} • {new Date(e.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${e.amount.toLocaleString()}</p>
                      <button onClick={() => deleteEntry(e.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
