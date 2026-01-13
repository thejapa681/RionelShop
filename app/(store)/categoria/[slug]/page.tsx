import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/ui/product-card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from("categories").select("name, description").eq("slug", slug).single()

  if (!category) {
    return { title: "Categoria não encontrada" }
  }

  return {
    title: category.name,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  const { data: products } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("sold_count", { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">{category.name}</h1>
        {category.description && <p className="text-muted-foreground">{category.description}</p>}
        <Badge variant="secondary" className="mt-2">
          {products?.length || 0} produtos
        </Badge>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  )
}
