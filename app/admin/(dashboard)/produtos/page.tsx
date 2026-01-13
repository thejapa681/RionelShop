import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"
import { revalidatePath } from "next/cache"

async function deleteProduct(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("products").delete().eq("id", id)
  revalidatePath("/admin/produtos")
}

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
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar produtos..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
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
                            <p className="text-xs text-muted-foreground truncate">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          {product.compare_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compare_price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
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
                              <Link href={`/produto/${product.slug}`} target="_blank" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/produtos/editar/${product.id}`} className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <form action={deleteProduct.bind(null, product.id)}>
                                <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </button>
                              </form>
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