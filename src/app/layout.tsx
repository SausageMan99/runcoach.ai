import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-dm-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joggeur — Ton Programme Running Sur-Mesure en 2 Minutes",
  description: "IA coach running qui génère un programme personnalisé basé sur ton niveau, ton objectif course et ton emploi du temps. Gratuit pour commencer.",
  keywords: ["running", "course à pied", "programme entraînement", "IA", "coach running", "marathon", "10K", "semi-marathon"],
  authors: [{ name: "Joggeur" }],
  openGraph: {
    title: "Joggeur — Ton Programme Running Sur-Mesure en 2 Minutes",
    description: "IA coach running qui génère un programme personnalisé. Gratuit pour commencer.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joggeur — Programme Running Personnalisé",
    description: "IA coach qui s'adapte à ton niveau et ton objectif.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
