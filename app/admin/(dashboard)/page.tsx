import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")

  const { data: revenueData } = await supabase.from("orders").select("total").eq("status", "delivered")

  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      profile:profiles(full_name, email),
      items:order_items(
        quantity,
        product:products(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Pending support tickets
  const { count: pendingTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")

  const stats = [
    {
      title: "Receita Total",
      value: formatCurrency(totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Pedidos",
      value: totalOrders || 0,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Produtos",
      value: totalProducts || 0,
      change: "+3",
      trend: "up",
      icon: Package,
    },
    {
      title: "Clientes",
      value: totalUsers || 0,
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500",
      processing: "bg-blue-500/10 text-blue-500",
      shipped: "bg-purple-500/10 text-purple-500",
      delivered: "bg-green-500/10 text-green-500",
      cancelled: "bg-red-500/10 text-red-500",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua loja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stat.change}</span>
                  </>
                )}
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos 5 pedidos realizados</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.profile?.full_name || order.profile?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <p className="text-center text-sm text-muted-foreground">Nenhum pedido recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Tarefas comuns de administração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/produtos/novo">
                <Package className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/cupons/novo">
                <DollarSign className="mr-2 h-4 w-4" />
                Criar Cupom
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/banners/novo">
                <TrendingUp className="mr-2 h-4 w-4" />
                Novo Banner
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/notificacoes/nova">
                <Users className="mr-2 h-4 w-4" />
                Enviar Notificação
              </Link>
            </Button>

            {pendingTickets && pendingTickets > 0 && (
              <Button className="w-full justify-start" variant="destructive" asChild>
                <Link href="/admin/suporte">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  {pendingTickets} Ticket(s) Pendente(s)
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
