import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const dbPath = path.join(process.cwd(), 'data.json')

interface Database {
  users: any[]
  clients: any[]
  invoices: any[]
  lineItems: any[]
  timeEntries: any[]
}

function loadDb(): Database {
  if (fs.existsSync(dbPath)) {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  }
  return { users: [], clients: [], invoices: [], lineItems: [], timeEntries: [] }
}

function saveDb(data: Database) {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function getDb() {
  return loadDb()
}

// User operations
export function createUser(email: string, password: string) {
  const db = loadDb()
  if (db.users.find(u => u.email === email)) {
    throw new Error('EMAIL_EXISTS')
  }
  const user = {
    id: uuidv4(),
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  }
  db.users.push(user)
  saveDb(db)
  return { id: user.id, email: user.email }
}

export function verifyUser(email: string, password: string) {
  const db = loadDb()
  const user = db.users.find(u => u.email === email)
  if (!user) throw new Error('INVALID_CREDENTIALS')
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    throw new Error('INVALID_CREDENTIALS')
  }
  return { id: user.id, email: user.email }
}

export function getUserById(id: string) {
  const db = loadDb()
  const user = db.users.find(u => u.id === id)
  return user ? { id: user.id, email: user.email } : null
}

// Client operations
export function getClients(userId: string) {
  const db = loadDb()
  return db.clients.filter(c => c.userId === userId).sort((a, b) => a.name.localeCompare(b.name))
}

export function getClient(userId: string, clientId: string) {
  const db = loadDb()
  return db.clients.find(c => c.id === clientId && c.userId === userId) || null
}

export function createClient(userId: string, data: { name: string; email?: string; company?: string; address?: string; phone?: string; notes?: string }) {
  if (!data.name) throw new Error('REQUIRED_NAME')
  const db = loadDb()
  const client = {
    id: uuidv4(),
    userId,
    name: data.name,
    email: data.email || '',
    company: data.company || '',
    address: data.address || '',
    phone: data.phone || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  db.clients.push(client)
  saveDb(db)
  return client
}

export function updateClient(userId: string, clientId: string, data: Partial<{ name: string; email: string; company: string; address: string; phone: string; notes: string }>) {
  const db = loadDb()
  const idx = db.clients.findIndex(c => c.id === clientId && c.userId === userId)
  if (idx === -1) throw new Error('NOT_FOUND')
  
  const client = db.clients[idx]
  const fields = ['name', 'email', 'company', 'address', 'phone', 'notes']
  for (const f of fields) {
    if (data[f as keyof typeof data] !== undefined) {
      client[f] = data[f as keyof typeof data]
    }
  }
  client.updatedAt = new Date().toISOString()
  db.clients[idx] = client
  saveDb(db)
  return client
}

export function deleteClient(userId: string, clientId: string) {
  const db = loadDb()
  const idx = db.clients.findIndex(c => c.id === clientId && c.userId === userId)
  if (idx === -1) return false
  db.clients.splice(idx, 1)
  saveDb(db)
  return true
}

// Invoice operations
function generateInvoiceNumber() {
  const db = loadDb()
  const count = db.invoices.length + 1
  return `INV-${String(count).padStart(4, '0')}`
}

export function getInvoices(userId: string) {
  const db = loadDb()
  return db.invoices
    .filter(i => i.userId === userId)
    .map(i => {
      const client = db.clients.find(c => c.id === i.clientId)
      return { ...i, clientName: client?.name || 'Unknown' }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getInvoice(userId: string, invoiceId: string) {
  const db = loadDb()
  const invoice = db.invoices.find(i => i.id === invoiceId && i.userId === userId)
  if (!invoice) return null
  
  const client = db.clients.find(c => c.id === invoice.clientId)
  const lineItems = db.lineItems.filter(li => li.invoiceId === invoiceId)
  
  return {
    ...invoice,
    clientName: client?.name || '',
    clientEmail: client?.email || '',
    clientCompany: client?.company || '',
    clientAddress: client?.address || '',
    lineItems
  }
}

export function createInvoice(userId: string, data: { client_id: string; line_items: { description: string; quantity: number; rate: number }[]; tax_rate?: number }) {
  if (!data.client_id) throw new Error('REQUIRED_CLIENT')
  if (!data.line_items?.length) throw new Error('NO_LINE_ITEMS')
  
  const client = getClient(userId, data.client_id)
  if (!client) throw new Error('INVALID_CLIENT')
  
  const db = loadDb()
  const invoiceId = uuidv4()
  const invoiceNumber = generateInvoiceNumber()
  const taxRate = data.tax_rate || 0
  
  let subtotal = 0
  const lineItems = data.line_items.map((item, idx) => {
    const amount = item.quantity * item.rate
    subtotal += amount
    return {
      id: uuidv4(),
      invoiceId,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount,
      sortOrder: idx
    }
  })
  
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  
  const invoice = {
    id: invoiceId,
    userId,
    clientId: data.client_id,
    invoiceNumber,
    status: 'draft',
    taxRate,
    subtotal,
    taxAmount,
    total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  db.invoices.push(invoice)
  db.lineItems.push(...lineItems)
  saveDb(db)
  
  return getInvoice(userId, invoiceId)
}

export function updateInvoiceStatus(userId: string, invoiceId: string, status: string) {
  const invoice = getInvoice(userId, invoiceId)
  if (!invoice) throw new Error('NOT_FOUND')
  
  const validTransitions: Record<string, string[]> = {
    draft: ['sent', 'paid'],
    sent: ['paid'],
    paid: []
  }
  
  if (!validTransitions[invoice.status]?.includes(status)) {
    throw new Error('INVALID_STATUS_TRANSITION')
  }
  
  const db = loadDb()
  const idx = db.invoices.findIndex(i => i.id === invoiceId)
  db.invoices[idx].status = status
  db.invoices[idx].updatedAt = new Date().toISOString()
  saveDb(db)
  
  return getInvoice(userId, invoiceId)
}

// Time entry operations
export function getTimeEntries(userId: string) {
  const db = loadDb()
  return db.timeEntries
    .filter(t => t.userId === userId)
    .map(t => {
      const client = db.clients.find(c => c.id === t.clientId)
      return { ...t, clientName: client?.name || null }
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
}

export function createTimeEntry(userId: string, data: { client_id?: string; description?: string; start_time: string; end_time?: string }) {
  const db = loadDb()
  const id = uuidv4()
  let duration = 0
  
  if (data.end_time) {
    duration = Math.floor((new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000)
  }
  
  const entry = {
    id,
    userId,
    clientId: data.client_id || null,
    description: data.description || '',
    startTime: data.start_time,
    endTime: data.end_time || null,
    duration,
    createdAt: new Date().toISOString()
  }
  
  db.timeEntries.push(entry)
  saveDb(db)
  
  const client = db.clients.find(c => c.id === entry.clientId)
  return { ...entry, clientName: client?.name || null }
}

export function stopTimeEntry(userId: string, entryId: string) {
  const db = loadDb()
  const idx = db.timeEntries.findIndex(t => t.id === entryId && t.userId === userId)
  if (idx === -1) throw new Error('NOT_FOUND')
  
  const entry = db.timeEntries[idx]
  const endTime = new Date().toISOString()
  entry.endTime = endTime
  entry.duration = Math.floor((new Date(endTime).getTime() - new Date(entry.startTime).getTime()) / 1000)
  
  db.timeEntries[idx] = entry
  saveDb(db)
  
  const client = db.clients.find(c => c.id === entry.clientId)
  return { ...entry, clientName: client?.name || null }
}

// Dashboard stats
export function getDashboardStats(userId: string) {
  const db = loadDb()
  const clients = db.clients.filter(c => c.userId === userId)
  const invoices = db.invoices.filter(i => i.userId === userId)
  const timeEntries = db.timeEntries.filter(t => t.userId === userId)
  
  const totalClients = clients.length
  const totalInvoices = invoices.length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
  const outstandingAmount = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0)
  const totalSeconds = timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0)
  
  return { totalClients, totalInvoices, totalRevenue, outstandingAmount, totalHours: Math.round(totalSeconds / 3600 * 10) / 10 }
}
