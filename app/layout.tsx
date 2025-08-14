import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import MainLayout from "@/components/layout/main-layout"
import { Web3Provider } from "@/contexts/web3-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VestoLink - Decentralized Token Vesting Platform",
  description: "Deploy secure, gas-optimized vesting contracts with branded claim pages",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <MainLayout>{children}</MainLayout>
        </Web3Provider>
      </body>
    </html>
  )
}
