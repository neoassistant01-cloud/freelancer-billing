'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({ name: '', email: '', company: '', address: '', phone: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch(`/api/clients/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.client) {
          setForm({
            name: data.client.name || '',
            email: data.client.email || '',
            company: data.client.company || '',
            address: data.client.address || '',
            phone: data.client.phone || '',
            notes: data.client.notes || ''
          })
        }
        setLoading(false)
      })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const token = localStorage.getItem('token')!
    const res = await fetch(`/api/clients/${params.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to update client')
      setSaving(false)
      return
    }

    router.push('/clients')
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/clients" className="text-[#6b6b6b] hover:text-[#2d5a27]">← Back</Link>
            <h1 className="text-2xl font-bold">Edit Client</h1>
          </div>

          <div className="bg-white rounded-xl p-6 card-shadow">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <Link href="/clients" className="btn btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
