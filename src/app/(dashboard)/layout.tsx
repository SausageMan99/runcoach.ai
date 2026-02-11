'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Calendar, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/program', label: 'Programme', icon: Calendar },
    { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarExpanded, setSidebarExpanded] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar - Collapsed by default, expandable */}
            <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col lg:bg-card lg:border-r lg:border-border/50 lg:shadow-sm transition-all duration-300 ${sidebarExpanded ? 'lg:w-56' : 'lg:w-[72px]'
                }`}>
                {/* Logo area */}
                <div className={`flex h-16 items-center ${sidebarExpanded ? 'px-5 gap-3' : 'justify-center'} border-b border-border/50`}>
                    {sidebarExpanded
                        ? <img src="/logo-name.svg" alt="Joggeur" className="h-12 w-auto" />
                        : <img src="/logo-full.svg" alt="Joggeur" className="h-11 w-auto" />
                    }
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center ${sidebarExpanded ? 'gap-3 px-3' : 'justify-center'} py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarExpanded && <span className="text-sm font-medium">{item.label}</span>}
                                {/* Tooltip on collapsed */}
                                {!sidebarExpanded && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Expand/Collapse toggle */}
                <div className="px-2 py-2 border-t border-border/50">
                    <button
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Logout */}
                <div className={`px-2 pb-4 ${sidebarExpanded ? '' : ''}`}>
                    <Button
                        variant="ghost"
                        className={`w-full ${sidebarExpanded ? 'justify-start gap-3 px-3' : 'justify-center px-0'} text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl`}
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarExpanded && <span className="text-sm">Déconnexion</span>}
                    </Button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 shadow-lg">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarExpanded ? 'lg:pl-56' : 'lg:pl-[72px]'} pb-20 lg:pb-0 min-h-screen`}>
                {children}
            </main>
        </div>
    )
}
