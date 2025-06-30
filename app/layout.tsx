import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WorldChainProvider } from "@/components/worldchain-provider"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
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
        <WorldChainProvider>{children}</WorldChainProvider>
      </body>
    </html>
  )
}
