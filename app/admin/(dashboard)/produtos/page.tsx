import { createClient } from "@/lib/supabase/server"
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
import { Plus, Search, MoreHorizontal, Pencil, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      product_images(url, is_primary)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar produtos..." className="pl-10 w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full table-auto">
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
                {products?.map((product: any) => {
                  const primaryImage =
                    product.product_images?.find((img: any) => img.is_primary)?.url ||
                    product.product_images?.[0]?.url
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 min-w-[48px] overflow-hidden rounded-lg bg-muted flex-shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Sem foto
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{product.category?.name || "-"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          {product.compare_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compare_price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            product.stock > 10
                              ? "default"
                              : product.stock > 0
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {product.stock} un.
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
                                href={`/produto/${product.slug}`}
                                target="_blank"
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/produtos/editar/${product.id}`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                           <DropdownMenuItem>
  <button
    className="flex w-full items-center gap-2 text-destructive"
    onClick={async () => {
      if (!confirm("Tem certeza que deseja excluir este produto?")) return

      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "DELETE",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Não foi possível excluir o produto")

        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso!",
          variant: "destructive",
        })

        location.reload()
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message,
          variant: "destructive",
        })
      }
    }}
  >
    <Trash2 className="h-4 w-4" />
    Excluir
  </button>
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