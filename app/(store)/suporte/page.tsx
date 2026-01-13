"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageSquare, Send, Loader2, Plus, Clock } from "lucide-react"
import { formatDateTime, getTicketStatusLabel } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { SupportTicket, SupportMessage } from "@/lib/types"

interface TicketWithMessages extends SupportTicket {
  messages: SupportMessage[]
}

export default function SupportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<TicketWithMessages[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  // New ticket form
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "general",
    message: "",
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/entrar?redirect=/suporte")
      return
    }

    const { data } = await supabase
      .from("support_tickets")
      .select(
        `
        *,
        messages:support_messages(*, profile:profiles(full_name, avatar_url))
      `,
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (data) {
      setTickets(data as TicketWithMessages[])
    }

    setIsLoading(false)
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Não autenticado")

      const ticketNumber = `TKT${Date.now().toString(36).toUpperCase()}`

      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          subject: newTicket.subject,
          category: newTicket.category,
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Add first message
      await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        message: newTicket.message,
        is_from_admin: false,
      })

      toast({ title: "Chamado criado com sucesso!" })
      setShowNewTicket(false)
      setNewTicket({ subject: "", category: "general", message: "" })
      fetchTickets()
    } catch (error) {
      toast({
        title: "Erro ao criar chamado",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    setIsSending(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Não autenticado")

      await supabase.from("support_messages").insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        message: newMessage,
        is_from_admin: false,
      })

      // Update ticket status if waiting for customer
      if (selectedTicket.status === "waiting_customer") {
        await supabase.from("support_tickets").update({ status: "open" }).eq("id", selectedTicket.id)
      }

      setNewMessage("")
      fetchTickets()
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const statusColors: Record<string, string> = {
    open: "bg-green-500/20 text-green-500",
    in_progress: "bg-blue-500/20 text-blue-500",
    waiting_customer: "bg-yellow-500/20 text-yellow-500",
    resolved: "bg-purple-500/20 text-purple-500",
    closed: "bg-gray-500/20 text-gray-500",
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
          <HelpCircle className="h-7 w-7 text-primary" />
          Central de Suporte
        </h1>
        <Button onClick={() => setShowNewTicket(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <Card className="mb-8 border-border bg-card">
          <CardHeader>
            <CardTitle>Novo Chamado</CardTitle>
            <CardDescription>Descreva seu problema e nossa equipe responderá em breve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input
                  placeholder="Ex: Problema com pedido"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="order">Pedido</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                    <SelectItem value="shipping">Entrega</SelectItem>
                    <SelectItem value="product">Produto</SelectItem>
                    <SelectItem value="account">Conta</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Descreva seu problema em detalhes..."
                rows={4}
                value={newTicket.message}
                onChange={(e) => setNewTicket((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTicket} disabled={isSending}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Chamado
              </Button>
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets List */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="font-semibold">Meus Chamados</h2>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`cursor-pointer border-border bg-card transition-colors hover:border-primary/50 ${
                  selectedTicket?.id === ticket.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-mono text-xs text-muted-foreground">#{ticket.ticket_number}</span>
                    <Badge className={statusColors[ticket.status]}>{getTicketStatusLabel(ticket.status)}</Badge>
                  </div>
                  <p className="mb-1 font-medium line-clamp-1">{ticket.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(ticket.updated_at)}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">Nenhum chamado</p>
          )}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="flex h-[600px] flex-col border-border bg-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <CardDescription>#{selectedTicket.ticket_number}</CardDescription>
                  </div>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {getTicketStatusLabel(selectedTicket.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedTicket.messages?.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.is_from_admin
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`mt-1 text-xs ${msg.is_from_admin ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                        >
                          {formatDateTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex h-[600px] items-center justify-center border-border bg-card">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Selecione um chamado para ver as mensagens</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
