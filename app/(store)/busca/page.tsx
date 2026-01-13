import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/ui/product-card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import type { Product } from "@/lib/types"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  return {
    title: q ? `Busca: ${q}` : "Buscar Produtos",
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const supabase = await createClient()

  let products: Product[] = []

  if (q) {
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*)")
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,short_description.ilike.%${q}%`)
      .order("sold_count", { ascending: false })
      .limit(50)

    if (data) {
      products = data as Product[]
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold md:text-3xl">{q ? `Resultados para "${q}"` : "Buscar Produtos"}</h1>
        </div>
        {q && (
          <Badge variant="secondary" className="mt-2">
            {products.length} resultados encontrados
          </Badge>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          {q ? (
            <>
              <p className="mb-2 text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-muted-foreground">Tente buscar por outros termos.</p>
            </>
          ) : (
            <p className="text-muted-foreground">Digite algo para buscar produtos.</p>
          )}
        </div>
      )}
    </div>
  )
}
