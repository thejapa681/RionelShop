import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"
import { formatCurrency, formatDate, getOrderStatusLabel, getPaymentStatusLabel } from "@/lib/utils/format"
import type { Order } from "@/lib/types"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/entrar?redirect=/pedidos")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    confirmed: "bg-blue-500/20 text-blue-500",
    processing: "bg-blue-500/20 text-blue-500",
    shipped: "bg-purple-500/20 text-purple-500",
    delivered: "bg-green-500/20 text-green-500",
    cancelled: "bg-red-500/20 text-red-500",
    refunded: "bg-gray-500/20 text-gray-500",
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 flex items-center gap-3 text-2xl font-bold md:text-3xl">
        <Package className="h-7 w-7 text-primary" />
        Meus Pedidos
      </h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {(orders as Order[]).map((order) => (
            <Card key={order.id} className="border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">#{order.order_number}</span>
                      <Badge className={statusColors[order.status]}>{getOrderStatusLabel(order.status)}</Badge>
                      <Badge variant="outline">{getPaymentStatusLabel(order.payment_status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)} • {order.items?.length || 0} itens
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/pedidos/${order.id}`}>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Order items preview */}
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {order.items?.slice(0, 4).map((item) => (
                    <img
                      key={item.id}
                      src={item.product_image || "/placeholder.svg"}
                      alt={item.product_name}
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                  ))}
                  {order.items && order.items.length > 4 && (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Nenhum pedido ainda</h2>
          <p className="mb-6 text-center text-muted-foreground">Explore nossa loja e faça seu primeiro pedido!</p>
          <Button asChild>
            <Link href="/">Explorar Produtos</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
