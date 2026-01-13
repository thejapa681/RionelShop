"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ImageIcon,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  Ticket,
  FolderTree,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Produtos", href: "/admin/produtos" },
  { icon: FolderTree, label: "Categorias", href: "/admin/categorias" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/pedidos" },
  { icon: Users, label: "Usuários", href: "/admin/usuarios" },
  { icon: Ticket, label: "Cupons", href: "/admin/cupons" },
  { icon: ImageIcon, label: "Banners", href: "/admin/banners" },
  { icon: MessageSquare, label: "Suporte", href: "/admin/suporte" },
  { icon: Bell, label: "Notificações", href: "/admin/notificacoes" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/relatorios" },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
]

interface AdminSidebarProps {
  isMobile?: boolean // opcional para drawer
}

export function AdminSidebar({ isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card",
        isMobile ? "w-full h-full flex-1" : "hidden w-64 md:flex"
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="gradient-text text-xl font-bold">Rionel</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}