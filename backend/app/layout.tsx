import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/components/sidebar"
import NavBar from "./components/landing/navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Meeting Bot",
  description: "AI meeting assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <div className="flex h-[calc(100vh-4rem)] w-full bg-background">

                <AppSidebar />
                <SidebarInset className="flex-1 p-6">
                  <NavBar />
                  {children}
                </SidebarInset>
              </div>
            </SidebarProvider>

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
