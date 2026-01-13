import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Package, Truck, MapPin, CreditCard, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/entrar?redirect=/pedidos")
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    notFound()
  }

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
      processing: { label: "Processando", color: "bg-blue-500/10 text-blue-500", icon: Package },
      shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-500", icon: Truck },
      delivered: { label: "Entregue", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500", icon: XCircle },
    }
    return statuses[status] || statuses.pending
  }

  const getPaymentLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      boleto: "Boleto Bancário",
    }
    return methods[method] || method
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/pedidos">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Meus Pedidos
        </Link>
      </Button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.order_number}</h1>
          <p className="text-muted-foreground">Realizado em {formatDate(order.created_at)}</p>
        </div>
        <Badge className={`${statusInfo.color} gap-2 px-4 py-2 text-sm`} variant="secondary">
          <StatusIcon className="h-4 w-4" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Progress Tracker */}
      {order.status !== "cancelled" && (
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {["pending", "processing", "shipped", "delivered"].map((step, index) => {
                const stepStatuses = ["pending", "processing", "shipped", "delivered"]
                const currentIndex = stepStatuses.indexOf(order.status)
                const isActive = index <= currentIndex
                const stepInfo = getStatusInfo(step)
                const Icon = stepInfo.icon

                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`mt-2 text-xs ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {stepInfo.label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className={`h-1 flex-1 ${index < currentIndex ? "bg-primary" : "bg-secondary"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-lg bg-secondary">
                      <img
                        src={item.product_image || "/placeholder.svg?height=80&width=80"}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      {item.variant_name && <p className="text-sm text-muted-foreground">{item.variant_name}</p>}
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.total_price)}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.unit_price)} cada</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address && (
                <div>
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.street}, {order.shipping_address.number}
                    {order.shipping_address.complement && `, ${order.shipping_address.complement}`}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
                  </p>
                  <p className="text-muted-foreground">CEP: {order.shipping_address.cep}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {order.shipping_address.recipient_name} - {order.shipping_address.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={order.shipping_cost === 0 ? "text-primary" : ""}>
                    {order.shipping_cost === 0 ? "Grátis" : formatCurrency(order.shipping_cost)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{getPaymentLabel(order.payment_method)}</p>
              <Badge
                className={`mt-2 ${
                  order.payment_status === "paid"
                    ? "bg-green-500/10 text-green-500"
                    : order.payment_status === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                }`}
                variant="secondary"
              >
                {order.payment_status === "paid" ? "Pago" : order.payment_status === "failed" ? "Falhou" : "Aguardando"}
              </Badge>
            </CardContent>
          </Card>

          {order.tracking_number && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm">{order.tracking_number}</p>
                <Button variant="outline" className="mt-3 w-full bg-transparent" asChild>
                  <a
                    href={`https://www.linkcorreios.com.br/?id=${order.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rastrear Pedido
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href="/suporte">Preciso de Ajuda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
