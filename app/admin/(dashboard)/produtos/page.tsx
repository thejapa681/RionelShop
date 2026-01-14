"use client"

import { useState } from "react"
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
import { formatCurrency } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

interface Product {
  Teste: string | number
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

interface ProductsTableProps {
  products: Product[] | null | undefined
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<Product[]>(Array.isArray(products) ? products : [])
  const [loadingIds, setLoadingIds] = useState<string[]>([])

  const safeCurrency = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "-"
    return formatCurrency(value)
  }

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return

    const idStr = String(id)
    setLoadingIds((prev) => [...prev, idStr])

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Erro ao excluir")

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso",
        variant: "destructive",
      })

      setItems((prev) => prev.filter((p) => String(p.id) !== idStr))
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      })
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== idStr))
    }
  }

  if (!Array.isArray(items)) {
    return <p>Erro ao carregar produtos</p>
  }

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
                    <TableRow key={String(product.id)}>
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
                          <div className="truncate">
                            <p className="font-medium truncate">{product.name || "-"}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              SKU: {product.sku || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        {product.category?.name || "-"}
                      </TableCell>

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
                                href={`/admin/produtos/editar/${product.id}`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleDelete(product.id)
                              }}
                              disabled={loadingIds.includes(String(product.id))}
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