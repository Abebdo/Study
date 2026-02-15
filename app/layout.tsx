import React from "react"
import type { Metadata, Viewport } from "next"
import { PlatformProvider } from "@/lib/auth-context"

import "./globals.css"

export const metadata: Metadata = {
  title: "EduPlatform - Learn Without Limits",
  description:
    "A modern educational platform to learn new skills, track progress, and achieve your goals.",
}

export const viewport: Viewport = {
  themeColor: "#F5E6D3",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <PlatformProvider>{children}</PlatformProvider>
      </body>
    </html>
  )
}
