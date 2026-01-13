import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const { data: banners } = await supabase.from("banners").select("*").order("sort_order")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Gerencie os banners promocionais</p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Banner
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {banners?.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />

              <div className="h-20 w-40 overflow-hidden rounded-lg bg-muted">
                {banner.image_url ? (
                  <img
                    src={banner.image_url || "/placeholder.svg"}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{banner.title}</h3>
                <p className="text-sm text-muted-foreground">{banner.subtitle || "Sem subtítulo"}</p>
                <p className="text-xs text-muted-foreground">Posição: {banner.position}</p>
              </div>

              <Badge variant={banner.is_active ? "default" : "secondary"}>
                {banner.is_active ? "Ativo" : "Inativo"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/banners/${banner.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
