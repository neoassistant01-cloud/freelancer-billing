'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Stats {
  totalClients: number
  totalInvoices: number
  totalRevenue: number
  outstandingAmount: number
  totalHours: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.clear()
          window.location.href = '/login'
          return
        }
        return res.json()
      })
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Clients" value={stats?.totalClients || 0} icon="👥" />
          <StatCard label="Total Invoices" value={stats?.totalInvoices || 0} icon="📄" />
          <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} icon="💰" />
          <StatCard label="Outstanding" value={`$${(stats?.outstandingAmount || 0).toFixed(2)}`} icon="⏳" />
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <a href="/clients/new" className="btn btn-primary">Add Client</a>
            <a href="/invoices/new" className="btn btn-secondary">Create Invoice</a>
            <a href="/time" className="btn btn-secondary">Track Time</a>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-6 card-shadow hover-lift">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-[#6b6b6b] text-sm">{label}</div>
    </div>
  )
}
