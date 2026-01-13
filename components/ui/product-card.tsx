"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { formatCurrency, calculateDiscount } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
}

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const discount = product.compare_price ? calculateDiscount(product.price, product.compare_price) : 0

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para adicionar ao carrinho",
          variant: "destructive",
        })
        return
      }

      // Get or create cart
      let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single()

      if (!cart) {
        const { data: newCart } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single()
        cart = newCart
      }

      if (!cart) throw new Error("Erro ao criar carrinho")

      // Check if item exists
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", product.id)
        .single()

      if (existingItem) {
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)
      } else {
        await supabase.from("cart_items").insert({
          cart_id: cart.id,
          product_id: product.id,
          quantity: 1,
        })
      }

      toast({
        title: "Adicionado ao carrinho",
        description: product.name,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para favoritar",
        variant: "destructive",
      })
      return
    }

    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product.id)
      setIsFavorite(false)
      toast({ title: "Removido dos favoritos" })
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: product.id })
      setIsFavorite(true)
      toast({ title: "Adicionado aos favoritos" })
    }
  }

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <Link href={`/produto/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={primaryImage || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>}
            {product.is_new && <Badge className="bg-primary text-primary-foreground">Novo</Badge>}
          </div>

          {/* Quick actions */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm"
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to cart overlay */}
          {showQuickAdd && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-card to-transparent p-3 transition-transform group-hover:translate-y-0">
              <Button className="w-full gap-2" onClick={handleAddToCart} disabled={isLoading || product.stock === 0}>
                <ShoppingCart className="h-4 w-4" />
                {product.stock === 0 ? "Esgotado" : "Adicionar"}
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.review_count})</span>
            <span className="ml-auto text-xs text-muted-foreground">{product.sold_count} vendidos</span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight text-foreground">{product.name}</h3>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
            {product.compare_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compare_price)}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">em até 12x de {formatCurrency(product.price / 12)}</p>
        </CardContent>
      </Link>
    </Card>
  )
}
