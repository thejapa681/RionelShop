"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, ShoppingBag } from "lucide-react"
import type { Product, Favorite } from "@/lib/types"

interface FavoriteWithProduct extends Favorite {
  product: Product
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/entrar?redirect=/favoritos")
      return
    }

    const { data } = await supabase
      .from("favorites")
      .select(
        `
        *,
        product:products(*, images:product_images(*))
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setFavorites(data as FavoriteWithProduct[])
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 flex items-center gap-3 text-2xl font-bold md:text-3xl">
        <Heart className="h-7 w-7 text-primary" />
        Meus Favoritos
        <span className="text-lg font-normal text-muted-foreground">({favorites.length} itens)</span>
      </h1>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favorites.map((fav) => (
            <ProductCard key={fav.id} product={fav.product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Nenhum favorito ainda</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Explore nossa loja e adicione produtos aos seus favoritos!
          </p>
          <Button asChild>
            <Link href="/">Explorar Produtos</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
