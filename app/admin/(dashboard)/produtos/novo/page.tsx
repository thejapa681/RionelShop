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
is_active: true,
is_featured: false,
is_new: true,
})

const [images, setImages] = useState<string[]>([])
const [newImageUrl, setNewImageUrl] = useState("")
const [colors, setColors] = useState<string[]>([])
const [newColor, setNewColor] = useState("")
const [sizes, setSizes] = useState<string[]>([])
const [newSize, setNewSize] = useState("")

useEffect(() => {
fetchCategories()
}, [])

const fetchCategories = async () => {
const supabase = createClient()
const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("name")
if (data) setCategories(data)
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

const addImage = () => {
if (newImageUrl && !images.includes(newImageUrl)) {
setImages([...images, newImageUrl])
setNewImageUrl("")
}
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

    // Garantir slug único
    let slug = formData.slug || generateSlug(formData.name)
    let counter = 1
    let exists = true

    while (exists) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .limit(1)

      if (existing && existing.length > 0) {
        slug = `${generateSlug(formData.name)}-${counter}`
        counter++
      } else {
        exists = false
      }
    }

   // Inserir produto
const { data: product, error: productError } = await supabase
  .from("products")
  .insert({
    name: formData.name,
    slug: formData.slug || `produto-${Date.now()}`, // garante slug único
    description: formData.description,
    short_description: formData.short_description,
    sku: formData.sku || `SKU-${Date.now()}`,
    price: Number.parseFloat(formData.price) || 0,
    compare_price: formData.compare_price ? Number.parseFloat(formData.compare_price) : null,
    cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null,
    stock: Number.parseInt(formData.stock) || 0,
    category_id: formData.category_id || null,
    brand: formData.brand || null,
    weight: formData.weight ? Number.parseFloat(formData.weight) : null,
    is_active: formData.is_active,
    is_featured: formData.is_featured,
    is_new: formData.is_new,
    colors: colors.length > 0 ? colors : null,
    sizes: sizes.length > 0 ? sizes : null,
  })
  .select("*")
  .single()

if (productError || !product?.id) throw productError || new Error("Erro ao criar produto")

// Inserir imagens apenas se houver produto e imagens
if (images.length > 0) {
  const imageInserts = images.map((url, index) => ({
    product_id: product.id,
    url,
    is_primary: index === 0,
    sort_order: index,
  }))

  const { error: imageError } = await supabase
    .from("product_images")
    .insert(imageInserts)

  if (imageError) throw imageError
}

    toast({
      title: "Produto criado",
      description: "O produto foi criado com sucesso!",
    })

    router.push("/admin/produtos")
  } catch (error: any) {
    toast({
      title: "Erro",
      description: error.message || "Erro ao criar produto",
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
<p className="text-muted-foreground">Adicione um novo produto ao catálogo</p>
</div>
</div>

<form onSubmit={handleSubmit} className="space-y-6">  
    <div className="grid gap-6 lg:grid-cols-3">  
      {/* Main Info */}  
      <div className="space-y-6 lg:col-span-2">  
        <Card>  
          <CardHeader>  
            <CardTitle>Informações Básicas</CardTitle>  
          </CardHeader>  
          <CardContent className="space-y-4">  
            <div className="grid gap-4 md:grid-cols-2">  
              <div className="space-y-2">  
                <Label htmlFor="name">Nome do Produto *</Label>  
                <Input  
                  id="name"  
                  value={formData.name}  
                  onChange={(e) => handleNameChange(e.target.value)}  
                  required  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="slug">Slug</Label>  
                <Input  
                  id="slug"  
                  value={formData.slug}  
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}  
                />  
              </div>  
            </div>  

            <div className="space-y-2">  
              <Label htmlFor="short_description">Descrição Curta</Label>  
              <Textarea  
                id="short_description"  
                value={formData.short_description}  
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}  
                rows={2}  
              />  
            </div>  

            <div className="space-y-2">  
              <Label htmlFor="description">Descrição Completa</Label>  
              <Textarea  
                id="description"  
                value={formData.description}  
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}  
                rows={5}  
              />  
            </div>  
          </CardContent>  
        </Card>  
<Card>
  <CardHeader>
    <CardTitle>Imagens</CardTitle>
    <CardDescription>Adicione imagens do produto</CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-purple-500 bg-purple-50 px-4 py-6 text-purple-700 transition hover:bg-purple-100">
      <Plus className="mr-2 h-5 w-5" />
      <span className="font-medium">Adicionar imagem</span>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const supabase = createClient()

  const ext = file.name.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    toast({
      title: "Erro",
      description: uploadError.message,
      variant: "destructive",
    })
    return
  }

  const { data } = supabase.storage
  .from("products")
  .getPublicUrl(fileName)

if (!data?.publicUrl) {
  toast({
    title: "Erro",
    description: "Erro ao gerar URL da imagem",
    variant: "destructive",
  })
  return
}

setImages((prev) => [...prev, data.publicUrl])

  e.currentTarget.value = ""
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
            onClick={() =>
              setImages(images.filter((_, i) => i !== index))
            }
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
       
         <Card>
          <CardHeader>  
            <CardTitle>Preços</CardTitle>  
          </CardHeader>  
          <CardContent>  
            <div className="grid gap-4 md:grid-cols-3">  
              <div className="space-y-2">  
                <Label htmlFor="price">Preço de Venda *</Label>  
                <Input  
                  id="price"  
                  type="number"  
                  step="0.01"  
                  value={formData.price}  
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}  
                  required  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="compare_price">Preço Original (riscado)</Label>  
                <Input  
                  id="compare_price"  
                  type="number"  
                  step="0.01"  
                  value={formData.compare_price}  
                  onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}  
                />  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="cost_price">Preço de Custo</Label>  
                <Input  
                  id="cost_price"  
                  type="number"  
                  step="0.01"  
                  value={formData.cost_price}  
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}  
                />  
              </div>  
            </div>  
          </CardContent>  
        </Card>  

        <Card>  
          <CardHeader>  
            <CardTitle>Variações</CardTitle>  
          </CardHeader>  
          <CardContent className="space-y-4">  
            <div className="space-y-2">  
              <Label>Cores</Label>  
              <div className="flex gap-2">  
                <Input placeholder="Nome da cor" value={newColor} onChange={(e) => setNewColor(e.target.value)} />  
                <Button type="button" onClick={addColor}>  
                  <Plus className="h-4 w-4" />  
                </Button>  
              </div>  
              <div className="flex flex-wrap gap-2">  
                {colors.map((color, index) => (  
                  <span key={index} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">  
                    {color}  
                    <button type="button" onClick={() => removeColor(index)}>  
                      <X className="h-3 w-3" />  
                    </button>  
                  </span>  
                ))}  
              </div>  
            </div>  

            <div className="space-y-2">  
              <Label>Tamanhos</Label>  
              <div className="flex gap-2">  
                <Input  
                  placeholder="Tamanho (P, M, G, etc.)"  
                  value={newSize}  
                  onChange={(e) => setNewSize(e.target.value)}  
                />  
                <Button type="button" onClick={addSize}>  
                  <Plus className="h-4 w-4" />  
                </Button>  
              </div>  
              <div className="flex flex-wrap gap-2">  
                {sizes.map((size, index) => (  
                  <span key={index} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">  
                    {size}  
                    <button type="button" onClick={() => removeSize(index)}>  
                      <X className="h-3 w-3" />  
                    </button>  
                  </span>  
                ))}  
              </div>  
            </div>  
          </CardContent>  
        </Card>  
      </div>  

      {/* Sidebar */}  
      <div className="space-y-6">  
        <Card>  
          <CardHeader>  
            <CardTitle>Organização</CardTitle>  
          </CardHeader>  
          <CardContent className="space-y-4">  
            <div className="space-y-2">  
              <Label htmlFor="category">Categoria</Label>  
              <Select  
                value={formData.category_id}  
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}  
              >  
                <SelectTrigger>  
                  <SelectValue placeholder="Selecione uma categoria" />  
                </SelectTrigger>  
                <SelectContent>  
                  {categories.map((category) => (  
                    <SelectItem key={category.id} value={category.id}>  
                      {category.name}  
                    </SelectItem>  
                  ))}  
                </SelectContent>  
              </Select>  
            </div>  

            <div className="space-y-2">  
              <Label htmlFor="brand">Marca</Label>  
              <Input  
                id="brand"  
                value={formData.brand}  
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}  
              />  
            </div>  

            <div className="space-y-2">  
              <Label htmlFor="sku">SKU</Label>  
              <Input  
                id="sku"  
                value={formData.sku}  
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}  
                placeholder="Gerado automaticamente"  
              />  
            </div>  
          </CardContent>  
        </Card>  

        <Card>  
          <CardHeader>  
            <CardTitle>Inventário</CardTitle>  
          </CardHeader>  
          <CardContent className="space-y-4">  
            <div className="space-y-2">  
              <Label htmlFor="stock">Estoque</Label>  
              <Input  
                id="stock"  
                type="number"  
                value={formData.stock}  
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}  
              />  
            </div>  

            <div className="space-y-2">  
              <Label htmlFor="weight">Peso (kg)</Label>  
              <Input  
                id="weight"  
                type="number"  
                step="0.01"  
                value={formData.weight}  
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}  
              />  
            </div>  
          </CardContent>  
        </Card>  

        <Card>  
          <CardHeader>  
            <CardTitle>Status</CardTitle>  
          </CardHeader>  
          <CardContent className="space-y-4">  
            <div className="flex items-center justify-between">  
              <Label htmlFor="is_active">Ativo</Label>  
              <Switch  
                id="is_active"  
                checked={formData.is_active}  
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}  
              />  
            </div>  

            <div className="flex items-center justify-between">  
              <Label htmlFor="is_featured">Destaque</Label>  
              <Switch  
                id="is_featured"  
                checked={formData.is_featured}  
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}  
              />  
            </div>  

            <div className="flex items-center justify-between">  
              <Label htmlFor="is_new">Novidade</Label>  
              <Switch  
                id="is_new"  
                checked={formData.is_new}  
                onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}  
              />  
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
      </div>  
    </div>  
  </form>  
</div>

)
}