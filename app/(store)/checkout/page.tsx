"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Truck,
  Package,
  Loader2,
  CheckCircle,
  Plus,
  ChevronRight,
} from "lucide-react"
import { formatCurrency, formatCEP } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { CartItem, Product, Address, Coupon } from "@/lib/types"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [notes, setNotes] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    recipient_name: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/entrar?redirect=/checkout")
      return
    }

    // Fetch cart
    const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

    if (cart) {
      const { data: items } = await supabase
        .from("cart_items")
        .select("*, product:products(*, images:product_images(*))")
        .eq("cart_id", cart.id)

      if (items && items.length > 0) {
        setCartItems(items as CartItemWithProduct[])
      } else {
        router.push("/carrinho")
        return
      }
    } else {
      router.push("/carrinho")
      return
    }

    // Fetch addresses
    const { data: userAddresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })

    if (userAddresses) {
      setAddresses(userAddresses)
      const defaultAddr = userAddresses.find((a) => a.is_default) || userAddresses[0]
      if (defaultAddr) setSelectedAddress(defaultAddr.id)
    }

    setIsLoading(false)
  }

  const handleCEPSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setNewAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }))
      }
    } catch (error) {
      console.error("Error fetching CEP:", error)
    }
  }

  const handleSaveAddress = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: newAddr, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao salvar endereço",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setAddresses((prev) => [...prev, newAddr])
    setSelectedAddress(newAddr.id)
    setShowAddressForm(false)
    setNewAddress({
      name: "",
      recipient_name: "",
      phone: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    })
    toast({ title: "Endereço salvo com sucesso!" })
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Selecione um endereço",
        description: "Você precisa selecionar um endereço de entrega",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Usuário não autenticado")

      const address = addresses.find((a) => a.id === selectedAddress)
      if (!address) throw new Error("Endereço não encontrado")

      const orderNumber = `RIO${Date.now().toString(36).toUpperCase()}`

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: "pending",
          payment_status: paymentMethod === "pix" ? "pending" : "pending",
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shippingCost,
          discount: discountAmount,
          total,
          coupon_id: appliedCoupon?.id || null,
          coupon_code: appliedCoupon?.code || null,
          shipping_address: address,
          notes: notes || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant_id,
        product_name: item.product.name,
        product_image: item.product.images?.[0]?.url || null,
        variant_name: null,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      await supabase.from("order_items").insert(orderItems)

      // Clear cart
      const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id)
      }

      // Update product stock and sold count
      for (const item of cartItems) {
        await supabase
          .from("products")
          .update({
            stock: item.product.stock - item.quantity,
            sold_count: (item.product.sold_count || 0) + item.quantity,
          })
          .eq("id", item.product.id)
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "order",
        title: "Pedido realizado com sucesso!",
        message: `Seu pedido #${orderNumber} foi recebido e está sendo processado.`,
        link_url: `/pedidos/${order.id}`,
      })

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Número do pedido: ${orderNumber}`,
      })

      router.push(`/pedidos/${order.id}`)
    } catch (error) {
      toast({
        title: "Erro ao finalizar pedido",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.min(
          (subtotal * appliedCoupon.discount_value) / 100,
          appliedCoupon.max_discount || Number.POSITIVE_INFINITY,
        )
      : appliedCoupon.discount_value
    : 0
  const shippingCost = subtotal >= 199 ? 0 : 15.9
  const total = subtotal - discountAmount + shippingCost

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">Finalizar Compra</h1>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[
          { num: 1, label: "Endereço" },
          { num: 2, label: "Pagamento" },
          { num: 3, label: "Confirmação" },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= num ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > num ? <CheckCircle className="h-5 w-5" /> : num}
            </div>
            <span className={`hidden sm:inline ${step >= num ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {num < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                          selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <label htmlFor={addr.id} className="flex-1 cursor-pointer">
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.street}, {addr.number}
                            {addr.complement && `, ${addr.complement}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.neighborhood} - {addr.city}/{addr.state}
                          </p>
                          <p className="text-sm text-muted-foreground">CEP: {formatCEP(addr.cep)}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.recipient_name} - {addr.phone}
                          </p>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {!showAddressForm ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-transparent"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Novo Endereço
                  </Button>
                ) : (
                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <h4 className="font-medium">Novo Endereço</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome do endereço</Label>
                        <Input
                          placeholder="Ex: Casa, Trabalho"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome do destinatário</Label>
                        <Input
                          placeholder="Nome completo"
                          value={newAddress.recipient_name}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, recipient_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input
                          placeholder="00000-000"
                          value={newAddress.cep}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 8)
                            setNewAddress((prev) => ({ ...prev, cep: value }))
                            if (value.length === 8) handleCEPSearch(value)
                          }}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Rua</Label>
                        <Input
                          placeholder="Nome da rua"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input
                          placeholder="123"
                          value={newAddress.number}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          placeholder="Apto, Bloco, etc."
                          value={newAddress.complement}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, complement: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input
                          placeholder="Bairro"
                          value={newAddress.neighborhood}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, neighborhood: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          placeholder="Cidade"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input
                          placeholder="UF"
                          maxLength={2}
                          value={newAddress.state}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveAddress}>Salvar Endereço</Button>
                      <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => setStep(2)} disabled={!selectedAddress}>
                  Continuar para Pagamento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div
                    className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="pix" id="pix" />
                    <label htmlFor="pix" className="flex flex-1 cursor-pointer items-center gap-3">
                      <QrCode className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-muted-foreground">Aprovação imediata - 5% de desconto</p>
                      </div>
                    </label>
                    <span className="font-bold text-primary">{formatCurrency(total * 0.95)}</span>
                  </div>

                  <div
                    className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <label htmlFor="credit_card" className="flex flex-1 cursor-pointer items-center gap-3">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Em até 12x sem juros</p>
                      </div>
                    </label>
                  </div>

                  <div
                    className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "boleto" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="boleto" id="boleto" />
                    <label htmlFor="boleto" className="flex flex-1 cursor-pointer items-center gap-3">
                      <Banknote className="h-6 w-6" />
                      <div>
                        <p className="font-medium">Boleto Bancário</p>
                        <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    placeholder="Alguma observação sobre o pedido?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Revisar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.images?.[0]?.url || "/placeholder.svg"}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.find((a) => a.id === selectedAddress) && (
                    <div>
                      <p className="font-medium">{addresses.find((a) => a.id === selectedAddress)?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {addresses.find((a) => a.id === selectedAddress)?.street},{" "}
                        {addresses.find((a) => a.id === selectedAddress)?.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addresses.find((a) => a.id === selectedAddress)?.city}/
                        {addresses.find((a) => a.id === selectedAddress)?.state}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button className="flex-1 gap-2" onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Pedido
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{item.quantity}x</span>
                    <span className="flex-1 truncate">{item.product.name}</span>
                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shippingCost === 0 ? "text-primary" : ""}>
                    {shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              {paymentMethod === "pix" && (
                <p className="text-center text-sm text-primary">Com PIX: {formatCurrency(total * 0.95)}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
