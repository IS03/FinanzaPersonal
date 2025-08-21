import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/ui/nav";
import { TarjetasProvider } from "./context/TarjetasContext";
import { CategoriasProvider } from "./context/CategoriasContext";
import { APP_CONFIG } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <TarjetasProvider>
          <CategoriasProvider>
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <h1 className="text-xl font-bold">{APP_CONFIG.name}</h1>
                <MainNav />
              </div>
            </div>
            <div className="container mx-auto py-6">
              {children}
            </div>
          </CategoriasProvider>
        </TarjetasProvider>
      </body>
    </html>
  );
}
