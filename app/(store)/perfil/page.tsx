"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  Heart,
  Ticket,
  Bell,
  Settings,
  Loader2,
  Trash2,
  Plus,
  Edit,
} from "lucide-react"
import { formatDate, formatPhone, formatCEP } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { Profile, Address } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    cpf: "",
    birth_date: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/entrar?redirect=/perfil")
      return
    }

    setEmail(user.email || "")

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profileData) {
      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        cpf: profileData.cpf || "",
        birth_date: profileData.birth_date || "",
      })
    }

    const { data: userAddresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })

    if (userAddresses) {
      setAddresses(userAddresses)
    }

    setIsLoading(false)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Não autenticado")

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          cpf: formData.cpf,
          birth_date: formData.birth_date || null,
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, ...formData } : null))
      setEditMode(false)
      toast({ title: "Perfil atualizado com sucesso!" })
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    const supabase = createClient()
    await supabase.from("addresses").delete().eq("id", addressId)
    setAddresses((prev) => prev.filter((a) => a.id !== addressId))
    toast({ title: "Endereço removido" })
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Remove default from all
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)

    // Set new default
    await supabase.from("addresses").update({ is_default: true }).eq("id", addressId)

    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === addressId,
      })),
    )

    toast({ title: "Endereço padrão atualizado" })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">Minha Conta</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Endereços</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-lg">{profile?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile?.full_name || "Usuário"}</CardTitle>
                    <CardDescription>{email}</CardDescription>
                  </div>
                </div>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome completo</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="font-medium">{profile?.full_name || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="font-medium">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium">{profile?.phone ? formatPhone(profile.phone) : "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data de nascimento</p>
                      <p className="font-medium">
                        {profile?.birth_date ? formatDate(profile.birth_date) : "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Quick Links */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
                  <a href="/pedidos">
                    <Package className="h-5 w-5 text-primary" />
                    <span>Meus Pedidos</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
                  <a href="/favoritos">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>Favoritos</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
                  <a href="/cupons">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span>Cupons</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
                  <a href="/notificacoes">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>Notificações</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Meus Endereços</CardTitle>
                <Button size="sm" asChild>
                  <a href="/checkout">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`rounded-lg border p-4 ${address.is_default ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-medium">{address.name}</p>
                          {address.is_default && <Badge variant="secondary">Padrão</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.number}
                          {address.complement && `, ${address.complement}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.neighborhood} - {address.city}/{address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">CEP: {formatCEP(address.cep)}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.recipient_name} - {address.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!address.is_default && (
                          <Button variant="ghost" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>
                            Definir padrão
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">Nenhum endereço cadastrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie suas configurações de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-secondary p-4">
                <h4 className="mb-2 font-medium">Alterar senha</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Recomendamos alterar sua senha regularmente para manter sua conta segura.
                </p>
                <Button variant="outline">Alterar Senha</Button>
              </div>

              <Separator />

              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <h4 className="mb-2 font-medium text-destructive">Excluir conta</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                </p>
                <Button variant="destructive">Excluir Conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
