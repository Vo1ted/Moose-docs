import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { UserProvider } from "@/contexts/user-context"
import { DocumentProvider } from "@/contexts/document-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moose Docs",
  description: "A simple document editor inspired by Google Docs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <DocumentProvider>{children}</DocumentProvider>
        </UserProvider>
      </body>
    </html>
  )
}
