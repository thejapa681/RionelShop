"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, User, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminSupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    const supabase = createClient()

    const { data: ticketData } = await supabase
      .from("support_tickets")
      .select(`
        *,
        profile:profiles(full_name, email)
      `)
      .eq("id", id)
      .single()

    if (ticketData) {
      setTicket(ticketData)
    }

    const { data: messagesData } = await supabase
      .from("support_messages")
      .select(`
        *,
        sender:profiles(full_name, role)
      `)
      .eq("ticket_id", id)
      .order("created_at", { ascending: true })

    if (messagesData) {
      setMessages(messagesData)
    }

    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: message, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: id,
        sender_id: user.id,
        message: newMessage,
        is_admin: true,
      })
      .select(`*, sender:profiles(full_name, role)`)
      .single()

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive",
      })
    } else {
      setMessages([...messages, message])
      setNewMessage("")

      // Update ticket status if it's open
      if (ticket.status === "open") {
        await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", id)
        setTicket({ ...ticket, status: "in_progress" })
      }
    }

    setIsSending(false)
  }

  const updateStatus = async (status: string) => {
    const supabase = createClient()
    await supabase.from("support_tickets").update({ status }).eq("id", id)
    setTicket({ ...ticket, status })
    toast({ title: "Status atualizado" })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ticket) {
    return <div>Ticket não encontrado</div>
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-yellow-500/10 text-yellow-500",
      in_progress: "bg-blue-500/10 text-blue-500",
      closed: "bg-green-500/10 text-green-500",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/suporte">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            {ticket.profile?.full_name || ticket.profile?.email} - {formatDate(ticket.created_at)}
          </p>
        </div>
        <Select value={ticket.status} onValueChange={updateStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Conversa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            {/* Original message */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{ticket.profile?.full_name || "Cliente"}</span>
                <Badge variant="secondary">Cliente</Badge>
              </div>
              <p className="text-sm">{ticket.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`rounded-lg p-4 ${msg.is_admin ? "ml-8 bg-primary/10" : "bg-secondary"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      msg.is_admin ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{msg.sender?.full_name || "Usuário"}</span>
                  <Badge variant={msg.is_admin ? "default" : "secondary"}>{msg.is_admin ? "Admin" : "Cliente"}</Badge>
                </div>
                <p className="text-sm">{msg.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(msg.created_at)}</p>
              </div>
            ))}
          </div>

          {ticket.status !== "closed" && (
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua resposta..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
