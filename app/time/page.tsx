'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
}

interface TimeEntry {
  id: string
  description: string
  client_name: string
  start_time: string
  end_time: string | null
  duration: number
}

export default function TimePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [form, setForm] = useState({ client_id: '', description: '' })
  const [startTime, setStartTime] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    Promise.all([
      fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/time-entries', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([clientsData, entriesData]) => {
      setClients(clientsData.clients || [])
      setEntries(entriesData.entries || [])
      setLoading(false)
    })
  }, [])

  const startTimer = async () => {
    const token = localStorage.getItem('token')!
    const now = new Date().toISOString()
    const res = await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        client_id: form.client_id || null,
        description: form.description,
        start_time: now
      })
    })
    const data = await res.json()
    setActiveTimer(data.entry.id)
    setStartTime(now)
  }

  const stopTimer = async () => {
    if (!activeTimer) return
    const token = localStorage.getItem('token')!
    await fetch(`/api/time-entries/${activeTimer}/stop`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    setActiveTimer(null)
    setStartTime(null)
    
    // Refresh entries
    const res = await fetch('/api/time-entries', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setEntries(data.entries || [])
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Time Tracking</h1>

        <div className="bg-white rounded-xl p-6 card-shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">{activeTimer ? 'Timer Running' : 'Start Timer'}</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1.5">Client (optional)</label>
              <select
                value={form.client_id}
                onChange={e => setForm({...form, client_id: e.target.value})}
                className="w-full"
                disabled={!!activeTimer}
              >
                <option value="">No client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full"
                placeholder="What are you working on?"
                disabled={!!activeTimer}
              />
            </div>
            {activeTimer ? (
              <button onClick={stopTimer} className="btn btn-primary">
                ⏹ Stop Timer
              </button>
            ) : (
              <button onClick={startTimer} className="btn btn-primary">
                ▶ Start Timer
              </button>
            )}
          </div>
          {startTime && (
            <div className="mt-4 text-[#6b6b6b]">
              Started at {new Date(startTime).toLocaleTimeString()}
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4">Recent Time Entries</h2>
        
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center card-shadow">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold mb-2">No time entries yet</h3>
            <p className="text-[#6b6b6b]">Start your first timer to track your work</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f0ede8]">
                <tr>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-right p-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-t border-[#e0ddd5]">
                    <td className="p-4">{new Date(entry.start_time).toLocaleDateString()}</td>
                    <td className="p-4 text-[#6b6b6b]">{entry.client_name || '-'}</td>
                    <td className="p-4">{entry.description || '-'}</td>
                    <td className="p-4 text-right font-medium">
                      {entry.end_time ? formatDuration(entry.duration) : 'Running...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
