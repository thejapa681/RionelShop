"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductCarouselProps {
  title: string
  products: Product[]
  viewAllLink?: string
}

export function ProductCarousel({ title, products, viewAllLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (products.length === 0) return null

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Button variant="link" className="text-primary" asChild>
              <a href={viewAllLink}>Ver todos</a>
            </Button>
          )}
          <div className="hidden gap-2 md:flex">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-transparent"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-transparent"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
        {products.map((product) => (
          <div key={product.id} className="w-[200px] flex-shrink-0 md:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
