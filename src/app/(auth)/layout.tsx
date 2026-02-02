import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="p-6 border-b-2 border-foreground">
                <Link href="/" className="flex items-center gap-3 w-fit">
                    <Image
                        src="/logo.jpg"
                        alt="RunCoach.AI"
                        width={40}
                        height={40}
                    />
                    <span className="font-bold text-xl">RunCoach<span className="font-normal">.AI</span></span>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="p-6 border-t-2 border-foreground text-center text-sm text-foreground/70">
                © 2024 RunCoach.AI
            </footer>
        </div>
    )
}
