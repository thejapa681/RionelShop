"use client"

import type React from "react"

import { useState } from "react"
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

  const [settings, setSettings] = useState({
    store_name: "Rionel",
    store_description: "Sua loja online favorita",
    contact_email: "contato@rionel.com",
    contact_phone: "(11) 99999-9999",
    address: "",
    free_shipping_min: "199",
    allow_guest_checkout: true,
    maintenance_mode: false,
    pix_enabled: true,
    credit_card_enabled: true,
    boleto_enabled: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Save settings to database
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from("site_settings").upsert({
          key,
          value: String(value),
        })
      }

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
                      onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_description">Descrição da Loja</Label>
                  <Textarea
                    id="store_description"
                    value={settings.store_description}
                    onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone</Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Frete</CardTitle>
                <CardDescription>Defina as regras de frete da loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="free_shipping_min">Valor mínimo para frete grátis (R$)</Label>
                  <Input
                    id="free_shipping_min"
                    type="number"
                    value={settings.free_shipping_min}
                    onChange={(e) => setSettings({ ...settings, free_shipping_min: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco para desativar o frete grátis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Ative ou desative métodos de pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PIX</Label>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                  <Switch
                    checked={settings.pix_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, pix_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cartão de Crédito</Label>
                    <p className="text-sm text-muted-foreground">Parcelamento em até 12x</p>
                  </div>
                  <Switch
                    checked={settings.credit_card_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, credit_card_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Boleto Bancário</Label>
                    <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                  </div>
                  <Switch
                    checked={settings.boleto_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, boleto_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>Opções avançadas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Checkout sem login</Label>
                    <p className="text-sm text-muted-foreground">Permitir compras sem cadastro</p>
                  </div>
                  <Switch
                    checked={settings.allow_guest_checkout}
                    onCheckedChange={(checked) => setSettings({ ...settings, allow_guest_checkout: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Desativa o acesso público à loja</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                  />
                </div>
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
