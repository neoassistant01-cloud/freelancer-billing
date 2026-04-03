'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id: string
  invoice_number: string
  status: string
  client_name: string
  client_email: string
  client_company: string
  client_address: string
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
  created_at: string
  line_items: LineItem[]
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch(`/api/invoices/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setInvoice(data.invoice)
        setLoading(false)
      })
  }, [params.id])

  const updateStatus = async (newStatus: string) => {
    const token = localStorage.getItem('token')!
    setUpdating(true)
    const res = await fetch(`/api/invoices/${params.id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
    
    if (res.ok) {
      const data = await res.json()
      setInvoice(data.invoice)
    }
    setUpdating(false)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'sent': return 'status-sent'
      case 'paid': return 'status-paid'
      default: return ''
    }
  }

  const downloadPDF = async () => {
    const token = localStorage.getItem('token')!
    const res = await fetch(`/api/invoices/${params.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.invoice_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!invoice) return <div className="p-8">Invoice not found</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/invoices" className="text-[#6b6b6b] hover:text-[#2d5a27]">← Back</Link>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h2 className="text-lg font-semibold mb-4">Client</h2>
              <div className="space-y-1">
                <div className="font-medium">{invoice.client_name}</div>
                {invoice.client_company && <div className="text-[#6b6b6b]">{invoice.client_company}</div>}
                {invoice.client_email && <div className="text-[#6b6b6b]">{invoice.client_email}</div>}
                {invoice.client_address && <div className="text-[#6b6b6b] whitespace-pre-line">{invoice.client_address}</div>}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 card-shadow">
              <h2 className="text-lg font-semibold mb-4">Line Items</h2>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6b6b6b] border-b border-[#e0ddd5]">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map(item => (
                    <tr key={item.id} className="border-b border-[#e0ddd5]">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Subtotal</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Tax ({invoice.tax_rate}%)</span>
                  <span>${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl border-t border-[#e0ddd5] pt-3">
                  <span>Total</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 card-shadow">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => updateStatus('sent')}
                    disabled={updating}
                    className="btn btn-primary w-full"
                  >
                    Mark as Sent
                  </button>
                )}
                {invoice.status === 'sent' && (
                  <button
                    onClick={() => updateStatus('paid')}
                    disabled={updating}
                    className="btn btn-primary w-full"
                  >
                    Mark as Paid
                  </button>
                )}
                {(invoice.status === 'draft' || invoice.status === 'sent') && (
                  <button
                    onClick={() => updateStatus('paid')}
                    disabled={updating}
                    className="btn btn-secondary w-full"
                  >
                    Mark as Paid Directly
                  </button>
                )}
                <button
                  onClick={downloadPDF}
                  className="btn btn-secondary w-full"
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div className="text-sm text-[#6b6b6b]">
              Created: {new Date(invoice.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
