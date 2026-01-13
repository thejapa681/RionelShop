import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Copy, Clock, Tag } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"

export default async function CouponsPage() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Ticket className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Cupons Disponíveis</h1>
      </div>

      {coupons && coupons.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="overflow-hidden border-border bg-card">
              <div className="flex">
                <div className="flex w-28 flex-shrink-0 flex-col items-center justify-center bg-primary/10 p-4">
                  <Tag className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : formatCurrency(coupon.discount_value)}
                  </span>
                  <span className="text-xs text-muted-foreground">OFF</span>
                </div>
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <code className="rounded bg-muted px-2 py-1 font-mono text-sm font-bold">{coupon.code}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mb-2 flex-1 text-sm text-muted-foreground">{coupon.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {coupon.min_purchase && (
                      <Badge variant="secondary">Min: {formatCurrency(coupon.min_purchase)}</Badge>
                    )}
                    {coupon.expires_at && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Até {formatDate(coupon.expires_at)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-medium">Nenhum cupom disponível</h2>
            <p className="text-center text-sm text-muted-foreground">
              Fique de olho! Novos cupons podem aparecer a qualquer momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
