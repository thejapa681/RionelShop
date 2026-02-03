"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface EditProductProps {
  params: { id: string }
}

export default function EditProductPage({ params }: EditProductProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    product_link: "",
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

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("name")
    if (data) setCategories(data)
  }

  const fetchProduct = async () => {
console.log("ID recebido:", params.id)
    const { data, error } = await supabase.from("products").select("*").eq("Teste", params.id).maybeSingle()
    if (error || !data) {
      toast({ title: "Erro", description: "Produto não encontrado", variant: "destructive" })
      return
    }
    setFormData({
      name: data.name,
      slug: data.slug,
      product_link: data.product_link || "",
      description: data.description,
      short_description: data.short_description,
      sku: data.sku,
      price: data.price?.toString() || "",
      compare_price: data.compare_price?.toString() || "",
      cost_price: data.cost_price?.toString() || "",
      stock: data.stock?.toString() || "0",
      category_id: data.category_id || "",
      brand: data.brand || "",
      weight: data.weight?.toString() || "",
      is_active: data.is_active,
      is_featured: data.is_featured,
      is_new: data.is_new,
    })
    if (data.colors) setColors(data.colors)
    if (data.sizes) setSizes(data.sizes)
    const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", data.Teste).order("sort_order")
    if (imgs) setImages(imgs.map((i: any) => i.url))
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) })
  }

  const addImage = () => { if (newImageUrl && !images.includes(newImageUrl)) { setImages([...images, newImageUrl]); setNewImageUrl("") } }
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index))
  const addColor = () => { if (newColor && !colors.includes(newColor)) { setColors([...colors, newColor]); setNewColor("") } }
  const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index))
  const addSize = () => { if (newSize && !sizes.includes(newSize)) { setSizes([...sizes, newSize]); setNewSize("") } }
  const removeSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await supabase.from("products").update({
  ...formData,
  product_link: `/produto/${formData.slug}`,
        price: Number.parseFloat(formData.price) || 0,
        compare_price: formData.compare_price ? Number.parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null,
        stock: Number.parseInt(formData.stock) || 0,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        colors: colors.length > 0 ? colors : null,
        sizes: sizes.length > 0 ? sizes : null,
      }).eq("Teste", params.id)

      if (images.length > 0) {
        await supabase.from("product_images").delete().eq("product_id", params.id)
        const inserts = images.map((url, i) => ({ product_id: params.id, url, is_primary: i === 0, sort_order: i }))
        await supabase.from("product_images").insert(inserts)
      }

      toast({ title: "Produto atualizado", description: "Alterações salvas com sucesso!" })
      router.push("/admin/produtos")
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao atualizar produto", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/produtos"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Produto</h1>
          <p className="text-muted-foreground">Altere os detalhes do produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_description">Descrição Curta</Label>
                  <Textarea id="short_description" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} />
                </div>
<div className="space-y-2">
  <Label htmlFor="product_link">Link do Produto</Label>
  <Input
    id="product_link"
    type="url"
    placeholder="https://exemplo.com/produto"
    value={formData.product_link}
    onChange={(e) =>
      setFormData({ ...formData, product_link: e.target.value })
    }
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
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      const ext = file.name.split(".").pop()
                      const fileName = `${crypto.randomUUID()}.${ext}`
                      const { error: uploadError } = await supabase.storage.from("products").upload(fileName, file, { upsert: true, contentType: file.type })
                      if (uploadError) return toast({ title: "Erro", description: uploadError.message, variant: "destructive" })
                      const { data } = supabase.storage.from("products").getPublicUrl(fileName)
                      if (!data?.publicUrl) return toast({ title: "Erro", description: "Erro ao gerar URL da imagem", variant: "destructive" })
                      setImages((prev) => [...prev, data.publicUrl])
                      e.currentTarget.value = ""
                    }}
                  />
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => removeImage(index)}><X className="h-3 w-3" /></Button>
                      {index === 0 && <span className="absolute bottom-1 left-1 rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white">Principal</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Organização</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="brand">Marca</Label><Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="sku">SKU</Label><Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Preços</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="price">Preço de Venda *</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="compare_price">Preço Original (riscado)</Label><Input id="compare_price" type="number" step="0.01" value={formData.compare_price} onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="cost_price">Preço de Custo</Label><Input id="cost_price" type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Variações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cores</Label>
                  <div className="flex gap-2"><Input placeholder="Nome da cor" value={newColor} onChange={(e) => setNewColor(e.target.value)} /><Button type="button" onClick={addColor}><Plus className="h-4 w-4" /></Button></div>
                  <div className="flex flex-wrap gap-2">{colors.map((color, i) => <span key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">{color}<button type="button" onClick={() => removeColor(i)}><X className="h-3 w-3" /></button></span>)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Tamanhos</Label>
                  <div className="flex gap-2"><Input placeholder="Tamanho (P, M, G, etc.)" value={newSize} onChange={(e) => setNewSize(e.target.value)} /><Button type="button" onClick={addSize}><Plus className="h-4 w-4" /></Button></div>
                  <div className="flex flex-wrap gap-2">{sizes.map((size, i) => <span key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">{size}<button type="button" onClick={() => removeSize(i)}><X className="h-3 w-3" /></button></span>)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Inventário</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="stock">Estoque</Label><Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="weight">Peso (kg)</Label><Input id="weight" type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><Label htmlFor="is_active">Ativo</Label><Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="is_featured">Destaque</Label><Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="is_new">Novidade</Label><Switch id="is_new" checked={formData.is_new} onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })} /></div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  )
}