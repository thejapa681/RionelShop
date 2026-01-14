"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Tag,
  ArrowRight,
  Loader2,
  ShoppingBag,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { CartItem, Product, Coupon } from "@/lib/types"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCartItems([])
      setIsLoading(false)
      return
    }

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!cart) {
      setCartItems([])
      setIsLoading(false)
      return
    }

    const { data: items, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        product:products(
          *,
          images:product_images(*)
        )
      `)
      .eq("cart_id", cart.id)

    if (error) {
      toast({
        title: "Erro ao carregar carrinho",
        variant: "destructive",
      })
      setCartItems([])
    } else {
      setCartItems((items as CartItemWithProduct[]) || [])
    }

    setIsLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const item = cartItems.find((i) => i.id === itemId)
    if (!item) return

    if (newQuantity > item.product.stock) {
      toast({
        title: "Quantidade indisponível",
        description: `Máximo disponível: ${item.product.stock}`,
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId)

    if (error) {
      toast({
        title: "Erro ao atualizar quantidade",
        variant: "destructive",
      })
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    )
  }

  const removeItem = async (itemId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)

    if (error) {
      toast({
        title: "Erro ao remover item",
        variant: "destructive",
      })
      return
    }

    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
    toast({ title: "Item removido do carrinho" })
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplyingCoupon(true)
    const supabase = createClient()

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !coupon) {
      toast({
        title: "Cupom inválido",
        description: "O cupom informado não existe ou expirou",
        variant: "destructive",
      })
      setIsApplyingCoupon(false)
      return
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast({
        title: "Cupom expirado",
        description: "Este cupom não é mais válido",
        variant: "destructive",
      })
      setIsApplyingCoupon(false)
      return
    }

    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      toast({
        title: "Valor mínimo não atingido",
        description: `Este cupom requer compra mínima de ${formatCurrency(coupon.min_purchase)}`,
        variant: "destructive",
      })
      setIsApplyingCoupon(false)
      return
    }

    setAppliedCoupon(coupon)
    toast({
      title: "Cupom aplicado!",
      description: coupon.description,
    })
    setIsApplyingCoupon(false)
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

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

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mb-6 text-center text-muted-foreground">
          Explore nossa loja e encontre produtos incríveis!
        </p>
        <Button asChild size="lg">
          <Link href="/">Explorar Produtos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 flex items-center gap-3 text-2xl font-bold md:text-3xl">
        <ShoppingCart className="h-7 w-7 text-primary" />
        Meu Carrinho
        <span className="text-lg font-normal text-muted-foreground">
          ({cartItems.length} itens)
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => {
            const image =
              item.product.images?.find((img) => img.is_primary)?.url ||
              item.product.images?.[0]?.url ||
              "/placeholder.svg"

            return (
              <Card key={item.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link
                      href={`/produto/${item.product.slug}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={image}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-lg object-cover md:h-32 md:w-32"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/produto/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.compare_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.product.compare_price)}
                          </p>
                        )}
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="hidden text-right md:block">
                      <p className="font-bold">
                        {formatCurrency(
                          item.product.price * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="bg-secondary pl-10 uppercase"
                    disabled={!!appliedCoupon}
                  />
                </div>
                {appliedCoupon ? (
                  <Button
                    variant="outline"
                    onClick={() => setAppliedCoupon(null)}
                  >
                    Remover
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon}
                  >
                    Aplicar
                  </Button>
                )}
              </div>

              {appliedCoupon && (
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <p className="font-medium text-primary">
                    Cupom {appliedCoupon.code} aplicado!
                  </p>
                  <p className="text-muted-foreground">
                    {appliedCoupon.description}
                  </p>
                </div>
              )}

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
                  <span
                    className={shippingCost === 0 ? "text-primary" : ""}
                  >
                    {shippingCost === 0
                      ? "Grátis"
                      : formatCurrency(shippingCost)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                em até 12x de {formatCurrency(total / 12)} sem juros
              </p>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => router.push("/checkout")}
              >
                Finalizar Compra
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                asChild
              >
                <Link href="/">Continuar Comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}