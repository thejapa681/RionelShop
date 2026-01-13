import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight } from "lucide-react"

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // Fetch stats
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")

  const { data: revenueData } = await supabase.from("orders").select("total, status")

  const totalRevenue =
    revenueData?.filter((o) => o.status === "delivered").reduce((sum, o) => sum + (o.total || 0), 0) || 0

  const pendingRevenue =
    revenueData
      ?.filter((o) => o.status === "pending" || o.status === "processing")
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0

  // Top selling products
  const { data: topProducts } = await supabase
    .from("products")
    .select("name, sold_count, price")
    .order("sold_count", { ascending: false })
    .limit(5)

  // Order status breakdown
  const ordersByStatus = {
    pending: revenueData?.filter((o) => o.status === "pending").length || 0,
    processing: revenueData?.filter((o) => o.status === "processing").length || 0,
    shipped: revenueData?.filter((o) => o.status === "shipped").length || 0,
    delivered: revenueData?.filter((o) => o.status === "delivered").length || 0,
    cancelled: revenueData?.filter((o) => o.status === "cancelled").length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Análise de desempenho da loja</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.5% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Pendente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</div>
            <p className="text-xs text-muted-foreground">aguardando pagamento/envio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">todos os pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">clientes cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ordersByStatus).map(([status, count]) => {
                const labels: Record<string, string> = {
                  pending: "Pendentes",
                  processing: "Processando",
                  shipped: "Enviados",
                  delivered: "Entregues",
                  cancelled: "Cancelados",
                }
                const colors: Record<string, string> = {
                  pending: "bg-yellow-500",
                  processing: "bg-blue-500",
                  shipped: "bg-purple-500",
                  delivered: "bg-green-500",
                  cancelled: "bg-red-500",
                }
                const total = Object.values(ordersByStatus).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? (count / total) * 100 : 0

                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{labels[status]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full ${colors[status]}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts?.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.sold_count}</p>
                    <p className="text-xs text-muted-foreground">vendidos</p>
                  </div>
                </div>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <p className="text-center text-sm text-muted-foreground">Nenhum produto vendido</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
