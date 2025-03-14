import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";
import { DateRangeProvider } from "@/contexts/DateRangeContext";

// Load fonts
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apo Data | Analyse de données pharmaceutiques",
  description: "Plateforme d'analyse de données pour pharmacies développée par Phardev.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <DateRangeProvider>
            {/* Global header */}
            <Header />
            
            {/* Main content */}
            {children}

            {/* Global footer */}
            <Footer />
          </DateRangeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}