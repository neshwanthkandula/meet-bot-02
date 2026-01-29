"use client"

import { usePathname } from "next/navigation"
import { Home, Calendar, Plug, MessageSquare } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const sidebarItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Meetings", href: "/meetings", icon: Calendar },
  { title: "Integrations", href: "/integrations", icon: Plug },
  { title: "Chat with AI", href: "/chat", icon: MessageSquare },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="text-sidebar-foreground">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 pt-10">
              {sidebarItems.map((item) => {
                const Icon = item.icon

                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="
                        text-lg font-semibold gap-3
                        hover:bg-sidebar-accent
                        hover:text-sidebar-accent-foreground
                        data-[active=true]:bg-sidebar-primary
                        data-[active=true]:text-sidebar-primary-foreground
                        transition-colors
                      "
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
