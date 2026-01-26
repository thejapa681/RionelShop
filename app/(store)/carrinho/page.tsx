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
    router.refresh()
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
      .maybeSingle()

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
        product:product_id(
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const shippingCost = subtotal >= 199 ? 0 : 15.9
  const total = subtotal + shippingCost

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
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(item.product.price)}
                        </p>
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
      </div>
    </div>
  )
}