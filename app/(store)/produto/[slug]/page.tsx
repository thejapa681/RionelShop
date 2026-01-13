import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductDetails } from "@/components/product/product-details"
import { ProductReviews } from "@/components/product/product-reviews"
import { ProductCarousel } from "@/components/ui/product-carousel"
import type { Product, Review } from "@/lib/types"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase.from("products").select("name, short_description").eq("slug", slug).single()

  if (!product) {
    return {
      title: "Produto não encontrado",
    }
  }

  return {
    title: product.name,
    description: product.short_description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product with images
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(*),
      variants:product_variants(*),
      category:categories(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("products")
    .update({ views: (product.views || 0) + 1 })
    .eq("id", product.id)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profile:profiles(full_name, avatar_url)
    `,
    )
    .eq("product_id", product.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(8)

  return (
    <div className="min-h-screen">
      <ProductDetails product={product as Product} />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <ProductReviews
          productId={product.id}
          reviews={(reviews as Review[]) || []}
          rating={product.rating}
          reviewCount={product.review_count}
        />
      </section>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <ProductCarousel title="Produtos Relacionados" products={relatedProducts as Product[]} />
        </section>
      )}
    </div>
  )
}
