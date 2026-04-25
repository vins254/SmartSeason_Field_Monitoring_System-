import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/App'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Map, LogOut, Sprout, Menu, X } from 'lucide-react'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight text-secondary">SmartSeason</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-slate-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user?.name}</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground mt-1 tracking-wider">
                  {user?.role}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t animate-in slide-in-from-top-4 duration-200">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-4 pt-4 border-t px-3 sm:hidden">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}