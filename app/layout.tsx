import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WorldChainProvider } from "@/components/worldchain-provider"
import { MiniKitProvider } from "@/components/minikit-provider"

export const metadata: Metadata = {
  title: "TPulseFi Wallet - WorldChain DeFi",
  description: "The Future of DeFi on WorldChain - TPulseFi Wallet",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MiniKitProvider>
          <WorldChainProvider>{children}</WorldChainProvider>
        </MiniKitProvider>
      </body>
    </html>
  )
}
