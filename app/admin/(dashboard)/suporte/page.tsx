import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"

export default async function AdminSupportPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profile:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  const openTickets = tickets?.filter((t) => t.status === "open") || []
  const inProgressTickets = tickets?.filter((t) => t.status === "in_progress") || []
  const closedTickets = tickets?.filter((t) => t.status === "closed") || []

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-yellow-500/10 text-yellow-500",
      in_progress: "bg-blue-500/10 text-blue-500",
      closed: "bg-green-500/10 text-green-500",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-yellow-500/10 text-yellow-500",
      high: "bg-red-500/10 text-red-500",
    }
    return colors[priority] || "bg-muted text-muted-foreground"
  }

  const TicketList = ({ tickets }: { tickets: any[] }) => (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/admin/suporte/${ticket.id}`}>
          <Card className="cursor-pointer transition-colors hover:border-primary/50">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium">{ticket.subject}</h3>
                  <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{ticket.profile?.full_name || ticket.profile?.email}</span>
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
              </div>
              <Badge className={getStatusColor(ticket.status)} variant="secondary">
                {ticket.status === "open" ? "Aberto" : ticket.status === "in_progress" ? "Em andamento" : "Fechado"}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
      {tickets.length === 0 && <div className="py-8 text-center text-muted-foreground">Nenhum ticket encontrado</div>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="text-muted-foreground">Gerencie tickets de suporte</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTickets.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar tickets..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">Abertos ({openTickets.length})</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento ({inProgressTickets.length})</TabsTrigger>
              <TabsTrigger value="closed">Fechados ({closedTickets.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
              <TicketList tickets={openTickets} />
            </TabsContent>
            <TabsContent value="in_progress" className="mt-4">
              <TicketList tickets={inProgressTickets} />
            </TabsContent>
            <TabsContent value="closed" className="mt-4">
              <TicketList tickets={closedTickets} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
