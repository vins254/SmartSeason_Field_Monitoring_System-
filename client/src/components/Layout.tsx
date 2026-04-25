/**
 * SmartSeason Global Layout Component
 * 
 * Purpose:
 * Acts as the "frame" for our entire application, providing consistent navigation, 
 * branding, and user session controls.
 * 
 * How it works:
 * 1. Provides a sticky Header with branding and navigation.
 * 2. Implements responsive Navigation (Desktop horizontal bar & Mobile hamburger menu).
 * 3. Handles user logout and profile display.
 * 4. Wraps all page content in a centered, padded container.
 */


import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/App'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Map, LogOut, Sprout, Menu, X, Users as UsersIcon } from 'lucide-react'

interface LayoutProps {
  children: ReactNode // This is where the specific page content (Dashboard, Fields, etc.) is injected.
}

// Define the navigation structure in one place for easy maintenance
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fields', label: 'Fields', icon: Map },
  { path: '/users', label: 'Users', icon: UsersIcon, adminOnly: true }, // Restricted item
]

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /**
   * Handle user logout
   * Clears the session and redirects to the login gate.
   */
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 
        Sticky Header 
        We use 'sticky top-0' so the navigation stays available even when scrolling long lists.
      */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Branding Logo */}
            <div className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight text-secondary">SmartSeason</span>
            </div>

            {/* Desktop Navigation Links (Hidden on small screens) */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.filter(item => !item.adminOnly || user?.role?.toLowerCase() === 'admin').map((item) => {
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

            {/* User Profile & Actions Section */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold leading-none">{user?.name}</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground mt-1 tracking-widest">
                  {user?.role}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Desktop Logout Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="hidden sm:inline-flex text-slate-500 hover:text-destructive transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

                {/* Mobile Menu Toggle Button */}
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

          {/* Mobile Side Menu (Animated overlay) */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t animate-in slide-in-from-top-4 duration-200">
              <nav className="flex flex-col gap-2">
                {navItems.filter(item => !item.adminOnly || user?.role?.toLowerCase() === 'admin').map((item) => {
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-destructive hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </nav>
              
              {/* User Mobile Footer */}
              <div className="mt-4 pt-4 border-t px-3 sm:hidden">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 
        Main Viewport 
        This is where the magic happens. Any page wrapped in Layout 
        will have its content displayed here.
      */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}