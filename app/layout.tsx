import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import BottomTabBar from "./components/BottomTabBar"
import { ProductProvider } from "./context/ProductContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fashnary - AI Fashion Stylist",
  description: "Your personal AI-powered fashion stylist",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black text-white overflow-x-hidden`}>
        <ProductProvider>
          <div className="min-h-screen max-w-[480px] mx-auto relative">
            {children}
            <BottomTabBar />
          </div>
        </ProductProvider>
      </body>
    </html>
  )
}
