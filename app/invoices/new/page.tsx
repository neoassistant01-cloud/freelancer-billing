'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
}

interface LineItem {
  description: string
  quantity: number
  rate: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({ client_id: '', tax_rate: 0 })
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, rate: 0 }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setClients(data.clients || [])
        setLoading(false)
      })
  }, [])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }])
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = subtotal * (form.tax_rate / 100)
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!form.client_id) {
      setError('Please select a client')
      setSaving(false)
      return
    }

    const validItems = lineItems.filter(item => item.description.trim() !== '')
    if (validItems.length === 0) {
      setError('Please add at least one line item')
      setSaving(false)
      return
    }

    const token = localStorage.getItem('token')!
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        client_id: form.client_id,
        line_items: validItems,
        tax_rate: form.tax_rate
      })
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create invoice')
      setSaving(false)
      return
    }

    router.push('/invoices')
  }

  if (loading) return <div className="p-8">Loading...</div>

  if (clients.length === 0) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/invoices" className="text-[#6b6b6b] hover:text-[#2d5a27]">← Back</Link>
            <h1 className="text-2xl font-bold">Create Invoice</h1>
          </div>
          <div className="bg-white rounded-xl p-8 card-shadow text-center">
            <p className="mb-4">You need at least one client to create an invoice.</p>
            <Link href="/clients/new" className="btn btn-primary">Add Client First</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/invoices" className="text-[#6b6b6b] hover:text-[#2d5a27]">← Back</Link>
            <h1 className="text-2xl font-bold">Create Invoice</h1>
          </div>

          <div className="bg-white rounded-xl p-6 card-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium mb-1.5">Client *</label>
                <select
                  value={form.client_id}
                  onChange={e => setForm({...form, client_id: e.target.value})}
                  className="w-full"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Line Items</label>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[#6b6b6b]">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 w-24">Qty</th>
                      <th className="pb-2 w-32">Rate</th>
                      <th className="pb-2 w-32">Amount</th>
                      <th className="pb-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={index} className="border-t border-[#e0ddd5]">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateLineItem(index, 'description', e.target.value)}
                            className="w-full"
                            placeholder="Service description"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={e => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 font-medium">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={lineItems.length === 1}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="mt-3 text-[#2d5a27] font-medium text-sm hover:underline"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#6b6b6b]">Tax Rate (%)</span>
                    <input
                      type="number"
                      value={form.tax_rate}
                      onChange={e => setForm({...form, tax_rate: parseFloat(e.target.value) || 0})}
                      className="w-20 text-right"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Tax</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-[#e0ddd5] pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
                <Link href="/invoices" className="btn btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
