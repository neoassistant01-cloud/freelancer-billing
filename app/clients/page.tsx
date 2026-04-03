'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
  email: string
  company: string
  phone: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) {
          localStorage.clear()
          window.location.href = '/login'
          return
        }
        return res.json()
      })
      .then(data => {
        setClients(data.clients || [])
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return
    const token = localStorage.getItem('token')!
    await fetch(`/api/clients/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setClients(clients.filter(c => c.id !== id))
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clients</h1>
          <Link href="/clients/new" className="btn btn-primary">Add Client</Link>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center card-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-[#6b6b6b] mb-4">Add your first client to get started</p>
            <Link href="/clients/new" className="btn btn-primary">Add Client</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f0ede8]">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-t border-[#e0ddd5]">
                    <td className="p-4 font-medium">{client.name}</td>
                    <td className="p-4 text-[#6b6b6b]">{client.email || '-'}</td>
                    <td className="p-4 text-[#6b6b6b]">{client.company || '-'}</td>
                    <td className="p-4 text-[#6b6b6b]">{client.phone || '-'}</td>
                    <td className="p-4 text-right">
                      <Link href={`/clients/${client.id}`} className="text-[#2d5a27] hover:underline mr-3">Edit</Link>
                      <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:underline">Delete</button>
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
