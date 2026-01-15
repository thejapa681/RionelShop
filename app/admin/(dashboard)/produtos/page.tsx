"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"

interface Product {
  Teste: string
  name?: string
  slug?: string
  sku?: string
  price?: number
  compare_price?: number | null
  stock?: number
  is_active?: boolean
  category?: { name?: string }
  product_images?: { url: string; is_primary?: boolean }[]
}

export default function ProductsTable() {
  const { toast } = useToast()
  const [items, setItems] = useState<Product[]>([])
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select(`
      Teste,
      name,
      slug,
      sku,
      price,
      compare_price,
      stock,
      is_active,
      category:categories(name),
      product_images(url,is_primary)
    `)
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } else if (data) {
      setItems(data)
    }
    setLoading(false)
  }

  const safeCurrency = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "-"
    return formatCurrency(value)
  }

  const handleDelete = async (id: string) => {
  if (!window.confirm("Tem certeza que deseja excluir este produto?")) return

  setLoadingIds((prev) => [...prev, id])

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("Teste", id) // <- importante usar Teste que é o UUID correto

    if (error) throw error

    toast({
      title: "Produto excluído",
      description: "O produto foi removido com sucesso",
      variant: "destructive",
    })

    setItems((prev) => prev.filter((p) => p.Teste !== id))
  } catch (err: any) {
    toast({
      title: "Erro",
      description: err.message || "Erro ao excluir o produto",
      variant: "destructive",
    })
  } finally {
    setLoadingIds((prev) => prev.filter((i) => i !== id))
  }
}

  if (loading) return <p>Carregando produtos...</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar produtos..." className="pl-10" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Preço</TableHead>
                  <TableHead className="hidden md:table-cell">Estoque</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((product) => {
                  const primaryImage =
                    product.product_images?.find((img) => img.is_primary)?.url ||
                    product.product_images?.[0]?.url
                  return (
                    <TableRow key={product.Teste}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={product.name || "Produto"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Sem foto
                              </div>
                            )}
                          </div>
                       <div className="min-w-0 max-w-[20ch]">
  <p className="font-medium leading-tight break-all">
    {product?.name ?? "-"}
  </p>

  <p className="text-xs text-muted-foreground break-all">
    SKU: {product?.sku ?? "-"}
  </p>
</div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">{product.category?.name || "-"}</TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <p className="font-medium">{safeCurrency(product.price)}</p>
                        {typeof product.compare_price === "number" && (
                          <p className="text-xs text-muted-foreground line-through">
                            {safeCurrency(product.compare_price)}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            (product.stock ?? 0) > 10
                              ? "default"
                              : (product.stock ?? 0) > 0
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {product.stock ?? 0} un.
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={product.slug ? `/produto/${product.slug}` : "#"}
                                target="_blank"
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" /> Ver
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/produtos/editar/${product.Teste}`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>

                          <DropdownMenuItem
  onSelect={(e) => {
    e.preventDefault()
    handleDelete(product.Teste) // <- usar Teste
  }}
  disabled={loadingIds.includes(product.Teste)}
  className="text-destructive"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Excluir
</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}