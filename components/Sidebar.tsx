'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/invoices', label: 'Invoices', icon: '📄' },
  { href: '/time', label: 'Time Tracking', icon: '⏱️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-[#e0ddd5] min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#2d5a27]">FreelancerFlow</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#2d5a27] text-white' 
                  : 'text-[#6b6b6b] hover:bg-[#f0ede8]'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4">
        <button
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
          className="text-sm text-[#6b6b6b] hover:text-[#2d5a27]"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
