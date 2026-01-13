import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package } from "lucide-react"
import type { Product } from "@/lib/types"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const sort = params.sort || "newest"
  const page = Number.parseInt(params.page || "1")
  const perPage = 20

  let query = supabase.from("products").select("*, images:product_images(*)", { count: "exact" }).eq("is_active", true)

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "popular":
      query = query.order("sold_count", { ascending: false })
      break
    case "rating":
      query = query.order("rating", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products, count } = await query.range((page - 1) * perPage, page * perPage - 1)

  const totalPages = Math.ceil((count || 0) / perPage)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Todos os Produtos</h1>
          <span className="text-muted-foreground">({count} produtos)</span>
        </div>

        <Select defaultValue={sort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="popular">Mais vendidos</SelectItem>
            <SelectItem value="rating">Melhor avaliados</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
        {(products as Product[])?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? "default" : "outline"} size="sm" asChild>
              <a href={`/produtos?sort=${sort}&page=${p}`}>{p}</a>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
