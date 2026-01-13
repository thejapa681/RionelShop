"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Bell, Users } from "lucide-react"

export default function AdminNotificationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userCount, setUserCount] = useState(0)

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    target: "all",
  })

  useEffect(() => {
    fetchUserCount()
  }, [])

  const fetchUserCount = async () => {
    const supabase = createClient()
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer")
    setUserCount(count || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get all users
      const { data: users } = await supabase.from("profiles").select("id").eq("role", "customer")

      if (!users || users.length === 0) {
        throw new Error("Nenhum usuário encontrado")
      }

      // Create notifications for all users
      const notifications = users.map((user) => ({
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      }))

      const { error } = await supabase.from("notifications").insert(notifications)

      if (error) throw error

      toast({
        title: "Notificações enviadas",
        description: `Notificação enviada para ${users.length} usuários`,
      })

      setFormData({
        title: "",
        message: "",
        type: "info",
        target: "all",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar notificações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="text-muted-foreground">Envie notificações para os usuários</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Notificação</CardTitle>
            <CardDescription>Envie uma notificação para todos os usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Nova promoção disponível!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Digite a mensagem da notificação..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="promo">Promoção</SelectItem>
                    <SelectItem value="order">Pedido</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">usuários receberão a notificação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4" />
                <p>Use notificações de promoção para divulgar ofertas especiais</p>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4" />
                <p>Mantenha os títulos curtos e diretos</p>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4" />
                <p>Evite enviar muitas notificações em um curto período</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
