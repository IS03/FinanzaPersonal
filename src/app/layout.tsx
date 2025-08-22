import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/ui/nav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { GastoModal } from "@/components/GastoModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeNotification } from "@/components/ui/theme-notification";
import { Logo } from "@/components/ui/logo";
import { GastoModalProvider } from "./context/GastoModalContext";
import { TarjetasProvider } from "./context/TarjetasContext";
import { CategoriasProvider } from "./context/CategoriasContext";
import { ThemeProvider } from "./context/ThemeContext";
import { APP_CONFIG } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
  description: APP_CONFIG.description,
  keywords: ['finanzas', 'personal', 'gastos', 'ingresos', 'ahorro', 'presupuesto'],
      authors: [{ name: 'Findly Team' }],
    creator: 'Findly Team',
    publisher: 'Findly Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon-180x180.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_CONFIG.name,
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://finanza-personal.vercel.app',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Findly - Sistema de control de finanzas personales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: ['/twitter-image.png'],
    creator: '@finanzapersonal',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TarjetasProvider>
            <CategoriasProvider>
              <GastoModalProvider>
                <div className="border-b">
                  <div className="flex h-16 items-center justify-between px-4">
                    <div className="logo-container">
                      <Logo />
                    </div>
                    <div className="header-buttons">
                      <ThemeToggle />
                      <MainNav />
                    </div>
                  </div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                  {children}
                </div>
                <FloatingActionButton />
                <GastoModal />
                <ThemeNotification />
              </GastoModalProvider>
            </CategoriasProvider>
          </TarjetasProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
