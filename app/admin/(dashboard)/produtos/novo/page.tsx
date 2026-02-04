"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import type { Category } from "@/lib/types"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    sku: "",
    price: "",
    compare_price: "",
    cost_price: "",
    stock: "0",
    category_id: "",
    brand: "",
    weight: "",
    product_link: "",
    is_active: true,
    is_featured: false,
    is_new: true,
  })

  const [images, setImages] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState("")
  const [sizes, setSizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (data) setCategories(data)
  }

  // ✅ Resize automático
  const resizeImage = (
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return
            resolve(
              new File([blob], `${crypto.randomUUID()}.jpg`, {
                type: "image/jpeg",
              })
            )
          },
          "image/jpeg",
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor])
      setNewColor("")
    }
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize])
      setNewSize("")
    }
  }

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      let baseSlug = formData.slug || generateSlug(formData.name)
      let slug = baseSlug
      let counter = 1

      while (true) {
        const { data: existing } = await supabase
          .from("products")
          .select("Teste")
          .eq("slug", slug)
          .limit(1)

        if (!existing || existing.length === 0) break
        slug = `${baseSlug}-${counter}`
        counter++
      }

      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          slug,
          description: formData.description,
          short_description: formData.short_description,
          sku: formData.sku || `SKU-${Date.now()}`,
          price: Number.parseFloat(formData.price) || 0,
          compare_price: formData.compare_price
            ? Number.parseFloat(formData.compare_price)
            : null,
          cost_price: formData.cost_price
            ? Number.parseFloat(formData.cost_price)
            : null,
          stock: Number.parseInt(formData.stock) || 0,
          category_id: formData.category_id || null,
          brand: formData.brand || null,
          weight: formData.weight
            ? Number.parseFloat(formData.weight)
            : null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          product_link: formData.product_link || null,
          is_new: formData.is_new,
          colors: colors.length ? colors : null,
          sizes: sizes.length ? sizes : null,
        })
        .select("Teste")
        .single()

      if (error || !product?.Teste) throw error

      if (images.length > 0) {
        const imageInserts = images.map((url, index) => ({
          product_id: product.Teste,
          url,
          is_primary: index === 0,
          sort_order: index,
        }))

        await supabase.from("product_images").insert(imageInserts)
      }

      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso!",
      })

      router.push("/admin/produtos")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao criar produto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
          <p className="text-muted-foreground">
            Adicione um novo produto ao catálogo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
            <CardDescription>Adicione imagens do produto</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-purple-500 bg-purple-50 px-4 py-6 text-purple-700 transition hover:bg-purple-100">
              <Plus className="mr-2 h-5 w-5" />
              <span className="font-medium">
                {isLoading ? "Enviando..." : "Adicionar imagens"}
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  if (!files.length) return

                  setIsLoading(true)
                  const supabase = createClient()

                  try {
                    const uploadedUrls: string[] = []

                    for (const file of files) {
                      const resized = await resizeImage(file)
                      const fileName = `products/${crypto.randomUUID()}.jpg`

                      const { error } = await supabase.storage
                        .from("products")
                        .upload(fileName, resized, {
                          upsert: true,
                          contentType: "image/jpeg",
                        })

                      if (error) continue

                      const { data } = supabase.storage
                        .from("products")
                        .getPublicUrl(fileName)

                      if (data?.publicUrl) {
                        uploadedUrls.push(data.publicUrl)
                      }
                    }

                    setImages((prev) => [...prev, ...uploadedUrls])
                  } finally {
                    setIsLoading(false)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </label>

            <div className="grid grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg border"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Produto"
          )}
        </Button>
      </form>
    </div>
  )
}