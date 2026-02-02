'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Calendar, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/program', label: 'Mon Programme', icon: Calendar },
    { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r-2 lg:border-foreground lg:bg-card">
                {/* Logo */}
                <div className="flex h-20 items-center gap-3 px-6 border-b-2 border-foreground">
                    <Image
                        src="/logo.jpg"
                        alt="RunCoach.AI"
                        width={40}
                        height={40}
                    />
                    <span className="font-bold text-xl">RunCoach<span className="font-normal">.AI</span></span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 border-2 transition-all font-medium ${isActive
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'border-transparent hover:border-foreground text-foreground/70 hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t-2 border-foreground">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-foreground/70 hover:text-foreground hover:bg-muted"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b-2 border-foreground flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo.jpg"
                        alt="RunCoach.AI"
                        width={36}
                        height={36}
                    />
                    <span className="font-bold text-lg">RunCoach.AI</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="border-2 border-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed top-16 right-0 bottom-0 w-64 bg-card border-l-2 border-foreground p-4" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 border-2 transition-all font-medium ${isActive
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'border-transparent hover:border-foreground text-foreground/70 hover:text-foreground'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="mt-6 pt-6 border-t-2 border-foreground">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-foreground/70 hover:text-foreground"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Déconnexion</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
                {children}
            </main>
        </div>
    )
}
