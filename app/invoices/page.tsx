'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  total: number
  status: string
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setInvoices(data.invoices || [])
        setLoading(false)
      })
  }, [])

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(i => i.status === filter)

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'sent': return 'status-sent'
      case 'paid': return 'status-paid'
      default: return ''
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Link href="/invoices/new" className="btn btn-primary">Create Invoice</Link>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'draft', 'sent', 'paid'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-[#2d5a27] text-white' : 'bg-white text-[#6b6b6b] hover:bg-[#f0ede8]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center card-shadow">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-[#6b6b6b] mb-4">Create your first invoice to get started</p>
            <Link href="/invoices/new" className="btn btn-primary">Create Invoice</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f0ede8]">
                <tr>
                  <th className="text-left p-4 font-medium">Invoice #</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-t border-[#e0ddd5]">
                    <td className="p-4 font-medium">{invoice.invoice_number}</td>
                    <td className="p-4 text-[#6b6b6b]">{invoice.client_name}</td>
                    <td className="p-4 text-[#6b6b6b]">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-medium">${invoice.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/invoices/${invoice.id}`} className="text-[#2d5a27] hover:underline">View</Link>
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
