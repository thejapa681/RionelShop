"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [settings, setSettings] = useState({
    store_name: "",
    store_description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    free_shipping_min: "",
    allow_guest_checkout: false,
    maintenance_mode: false,
    pix_enabled: false,
    credit_card_enabled: false,
    boleto_enabled: false,
  })

  // -----------------------------
  // LOAD SETTINGS FROM SUPABASE
  // -----------------------------
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("site_settings").select("*")

        if (error) throw error

        const loaded: any = {}
        data.forEach((row) => {
          loaded[row.key] = row.value === "true" ? true :
                           row.value === "false" ? false :
                           row.value
        })

        setSettings((prev) => ({ ...prev, ...loaded }))
      } catch (err: any) {
        toast({
          title: "Erro ao carregar",
          description: err.message || "Não foi possível carregar as configurações",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    loadSettings()
  }, [])

  // -----------------------------
  // SAVE SETTINGS
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }))

      const { error } = await supabase.from("site_settings").upsert(payload)

      if (error) throw error

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso!",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da loja</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="shipping">Frete</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* ----------------------- */}
          {/* GENERAL */}
          {/* ----------------------- */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Loja</CardTitle>
                <CardDescription>Dados básicos da sua loja</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Nome da Loja</Label>
                    <Input
                      id="store_name"
                      value={settings.store_name}
                      onChange={(e) =>
                        setSettings({ ...settings, store_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) =>
                        setSettings({ ...settings, contact_email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_description">Descrição da Loja</Label>
                  <Textarea
                    id="store_description"
                    value={settings.store_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store_description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone</Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone}
                      onChange={(e) =>
                        setSettings({ ...settings, contact_phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={settings.address}
                      onChange={(e) =>
                        setSettings({ ...settings, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----------------------- */}
          {/* SHIPPING */}
          {/* ----------------------- */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Frete</CardTitle>
                <CardDescription>Defina as regras de frete</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Label htmlFor="free_shipping_min">
                  Valor mínimo para frete grátis (R$)
                </Label>
                <Input
                  id="free_shipping_min"
                  type="number"
                  value={settings.free_shipping_min}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_shipping_min: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para desativar o frete grátis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----------------------- */}
          {/* PAYMENTS */}
          {/* ----------------------- */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Ative ou desative métodos</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {[
                  ["pix_enabled", "PIX", "Pagamento instantâneo"],
                  [
                    "credit_card_enabled",
                    "Cartão de Crédito",
                    "Parcelamento em até 12x",
                  ],
                  [
                    "boleto_enabled",
                    "Boleto Bancário",
                    "Vencimento em 3 dias úteis",
                  ],
                ].map(([key, title, desc]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{title}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----------------------- */}
          {/* ADVANCED */}
          {/* ----------------------- */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>Opções adicionais</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {[
                  [
                    "allow_guest_checkout",
                    "Checkout sem login",
                    "Permitir compras sem cadastro",
                  ],
                  [
                    "maintenance_mode",
                    "Modo de Manutenção",
                    "Desativa o acesso público à loja",
                  ],
                ].map(([key, title, desc]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{title}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}