import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/App'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Map, LogOut, Sprout } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fields', label: 'Fields', icon: Map },
]

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">SmartSeason</span>
          </div>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              {user?.role}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}