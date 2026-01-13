import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Category } from "@/lib/types"

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Categorias</h2>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-8 md:gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/categoria/${category.slug}`}>
            <Card className="group overflow-hidden rounded-2xl border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="flex flex-col items-center p-3 md:p-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 md:h-16 md:w-16">
                  <img
                    src={
                      category.image_url ||
                      `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(category.name)}`
                    }
                    alt={category.name}
                    className="h-8 w-8 object-contain md:h-10 md:w-10"
                  />
                </div>
                <span className="text-center text-xs font-medium line-clamp-2 md:text-sm">{category.name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
