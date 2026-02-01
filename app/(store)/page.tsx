"use server"

import { createClient } from "@/lib/supabase/server"
import { BannerCarousel } from "@/components/ui/banner-carousel"
import { CategoryGrid } from "@/components/ui/category-grid"
import { ProductCarousel } from "@/components/ui/product-carousel"
import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Sparkles, TrendingUp, Clock, Gift } from "lucide-react"
import Link from "next/link"
import type { Product, Category, Banner } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  // Banners
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .eq("position", "home")
    .order("sort_order")

  // Categorias
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  // Produtos em destaque
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sold_count", { ascending: false })
    .limit(10)

  // Produtos novos
  const { data: newProducts } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Mais vendidos
  const { data: bestSellers } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .order("sold_count", { ascending: false })
    .limit(10)

  // Ofertas (compare_price != null)
  const { data: deals } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .not("compare_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen">

      {/* Banner principal */}
      <section className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <BannerCarousel banners={(banners as Banner[]) || []} />
      </section>

      {/* Ofertas Relâmpago */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold md:text-xl">Ofertas Relâmpago</h2>
                <p className="text-xs text-muted-foreground md:text-sm">Termina em 02:34:56</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ofertas">Ver mais</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {(deals as Product[])?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <CategoryGrid categories={(categories as Category[]) || []} />
      </section>

      {/* Destaques */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold md:text-2xl">Destaques</h2>
        </div>
        <ProductCarousel
          title=""
          products={(featuredProducts as Product[]) || []}
          viewAllLink="/destaques"
        />
      </section>

      {/* Novidades */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold md:text-2xl">Novidades</h2>
          <Badge variant="secondary" className="ml-2">
            Recém chegados
          </Badge>
        </div>
        <ProductCarousel
          title=""
          products={(newProducts as Product[]) || []}
          viewAllLink="/novidades"
        />
      </section>

      {/* Banner promocional */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-6 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-4 bg-background/20 text-foreground">
              <Gift className="mr-1 h-3 w-3" />
              Oferta Especial
            </Badge>

            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-4xl">
              Cupom de Boas-Vindas
            </h2>

            <p className="mb-4 text-foreground/80 md:text-lg">
              Use o cupom BEMVINDO10 e ganhe 10% OFF na primeira compra!
            </p>

            <Button variant="secondary" size="lg" asChild>
              <Link href="/cupons">Resgatar Cupom</Link>
            </Button>
          </div>

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
        </div>
      </section>

      {/* Mais vendidos */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold md:text-2xl">Mais Vendidos</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
          {(bestSellers as Product[])?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Todos os produtos */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold md:text-2xl">Todos os Produtos</h2>

          <Button variant="outline" asChild>
            <Link href="/produtos">Ver todos</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
          {(featuredProducts as Product[])?.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}