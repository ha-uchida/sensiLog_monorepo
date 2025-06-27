"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  Swords,
  TrendingUp,
  Users,
  Shield,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Performance",
    items: [
      {
        href: "/matches",
        label: "Match History",
        icon: Swords,
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Team",
    items: [
      {
        href: "/team",
        label: "Team Members",
        icon: Users,
      },
      {
        href: "/admin",
        label: "Admin Panel",
        icon: Shield,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border/40 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="space-y-4 py-4">
        {sidebarItems.map((group) => (
          <div key={group.title} className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/10",
                      isActive
                        ? "bg-accent/20 text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-card/50 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Sens</span>
            <span className="font-medium">0.35</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">DPI</span>
            <span className="font-medium">800</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Match</span>
            <span className="font-medium text-green-500">Win</span>
          </div>
        </div>
      </div>
    </aside>
  )
}