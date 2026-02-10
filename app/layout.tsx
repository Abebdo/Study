import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { PlatformProvider } from "@/lib/auth-context"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

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
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <PlatformProvider>{children}</PlatformProvider>
      </body>
    </html>
  )
}
