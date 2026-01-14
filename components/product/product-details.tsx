"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  ShoppingCart,
  Share2,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { formatCurrency, calculateDiscount } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || []
  const discount = product.compare_price
    ? calculateDiscount(product.price, product.compare_price)
    : 0

  const handleAddToCart = async () => {
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
        router.push("/entrar?redirect=" + encodeURIComponent(window.location.pathname))
        return false
      }

      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!cart) {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single()
        cart = newCart
      }

      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (existingItem) {
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
      } else {
        await supabase.from("cart_items").insert({
          cart_id: cart.id,
          product_id: product.id,
          quantity,
        })
      }

      toast({
        title: "Adicionado ao carrinho!",
        description: `${quantity}x ${product.name}`,
      })

      return true
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    const added = await handleAddToCart()
    if (added) router.push("/carrinho")
  }

  const handleToggleFavorite = async () => {
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
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id)
      setIsFavorite(false)
      toast({ title: "Removido dos favoritos" })
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: product.id })
      setIsFavorite(true)
      toast({ title: "Adicionado aos favoritos" })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={
                images[selectedImage]?.url ||
                `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
            />
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {product.is_new && (
              <Badge className="absolute left-4 top-12 bg-primary text-primary-foreground">
                Novo
              </Badge>
            )}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80"
                  onClick={() =>
                    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80"
                  onClick={() =>
                    setSelectedImage((prev) => (prev + 1) % images.length)
                  }
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt_text || product.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}

          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">
              {product.review_count} avaliações
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">
              {product.sold_count} vendidos
            </span>
          </div>

          <div className="space-y-2">
            {product.compare_price && (
              <p className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compare_price)}
              </p>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleBuyNow}
              disabled={isLoading || product.stock === 0}
            >
              Comprar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
              onClick={handleAddToCart}
              disabled={isLoading || product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleToggleFavorite}>
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-destructive text-destructive" : ""
                }`}
              />
              {isFavorite ? "Favoritado" : "Favoritar"}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Frete Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de R$ 199</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Compra Segura</p>
                <p className="text-xs text-muted-foreground">Site protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Troca Grátis</p>
                <p className="text-xs text-muted-foreground">Até 30 dias</p>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="space-y-3">
              <h3 className="font-semibold">Descrição</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  )
}