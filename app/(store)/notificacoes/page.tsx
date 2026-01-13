import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Package, Tag, Info, Settings } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/entrar?redirect=/notificacoes")
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Mark all as read
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      order: Package,
      promo: Tag,
      system: Settings,
      info: Info,
    }
    return icons[type] || Bell
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Bell className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Notificações</h1>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type)

            return (
              <Card
                key={notification.id}
                className={`border-border bg-card transition-colors ${
                  !notification.is_read ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardContent className="flex gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      notification.type === "promo"
                        ? "bg-green-500/10 text-green-500"
                        : notification.type === "order"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                    {notification.link_url && (
                      <Link
                        href={notification.link_url}
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-medium">Nenhuma notificação</h2>
            <p className="text-center text-sm text-muted-foreground">
              Você receberá notificações sobre seus pedidos, promoções e muito mais aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
