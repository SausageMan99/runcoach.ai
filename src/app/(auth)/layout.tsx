import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel - Motivation (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-moss-light/5 to-accent-warm/10 relative overflow-hidden items-center justify-center p-12">
                <div className="blob-bg w-[400px] h-[400px] bg-primary/15 top-10 -left-20" />
                <div className="blob-bg w-[300px] h-[300px] bg-accent-warm/15 bottom-20 right-10" style={{ animationDelay: '4s' }} />
                <div className="relative z-10 max-w-md space-y-8">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                    <blockquote className="space-y-4">
                        <p className="font-serif text-3xl leading-relaxed text-foreground/80">
                            &ldquo;La course ne consiste pas à être meilleur que les autres. C&apos;est être meilleur que celui que tu étais hier.&rdquo;
                        </p>
                        <footer className="text-muted-foreground">
                            - Ton futur toi
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right panel - Form */}
            <div className="flex-1 flex flex-col">
                {/* Mobile header */}
                <header className="lg:hidden p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-7 w-auto" />
                    </Link>
                </header>

                {/* Main content */}
                <main className="flex-1 flex items-center justify-center p-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="p-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Joggeur
                </footer>
            </div>
        </div>
    )
}
