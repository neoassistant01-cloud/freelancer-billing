import { NextRequest, NextResponse } from 'next/server'
import { getInvoice } from '@/lib/db'

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = Buffer.from(auth.slice(7), 'base64').toString()
    return payload.split(':')[0]
  } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const invoice = getInvoice(userId, params.id)
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  
  // Generate simple PDF with jspdf
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(24)
  doc.setTextColor(45, 90, 39)
  doc.text('INVOICE', 20, 30)
  
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(invoice.invoiceNumber, 20, 40)
  
  // Client info
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Bill To:', 20, 55)
  doc.setTextColor(0)
  doc.text(invoice.clientName || '', 20, 62)
  if (invoice.clientCompany) doc.text(invoice.clientCompany, 20, 68)
  if (invoice.clientEmail) doc.text(invoice.clientEmail, 20, 74)
  
  // Date
  doc.setTextColor(100)
  doc.text('Date:', 140, 55)
  doc.setTextColor(0)
  doc.text(new Date(invoice.createdAt).toLocaleDateString(), 160, 55)
  
  // Line items header
  let y = 95
  doc.setFillColor(240, 238, 232)
  doc.rect(20, y - 5, 170, 10, 'F')
  doc.setTextColor(0)
  doc.setFontSize(10)
  doc.text('Description', 22, y)
  doc.text('Qty', 110, y)
  doc.text('Rate', 130, y)
  doc.text('Amount', 160, y)
  
  y += 10
  // Line items
  doc.setTextColor(60)
  const items = invoice.lineItems || []
  for (const item of items) {
    doc.text(item.description?.substring(0, 40) || '', 22, y)
    doc.text(String(item.quantity), 110, y)
    doc.text(`$${(item.rate || 0).toFixed(2)}`, 130, y)
    doc.text(`$${(item.amount || 0).toFixed(2)}`, 160, y)
    y += 8
  }
  
  // Totals
  y += 10
  doc.setTextColor(100)
  doc.text('Subtotal:', 130, y)
  doc.setTextColor(0)
  doc.text(`$${(invoice.subtotal || 0).toFixed(2)}`, 160, y)
  
  y += 8
  doc.setTextColor(100)
  doc.text(`Tax (${invoice.taxRate || 0}%):`, 130, y)
  doc.setTextColor(0)
  doc.text(`$${(invoice.taxAmount || 0).toFixed(2)}`, 160, y)
  
  y += 10
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text('Total:', 130, y)
  doc.text(`$${(invoice.total || 0).toFixed(2)}`, 160, y)
  
  // Status
  y += 20
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Status: ${invoice.status}`, 20, y)
  
  const pdfBuffer = doc.output('arraybuffer')
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`
    }
  })
}
