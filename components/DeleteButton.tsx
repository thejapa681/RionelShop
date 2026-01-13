"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeleteButtonProps {
  id: string
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const { toast } = useToast()

  async function handleDelete() {
    const confirmed = confirm("Tem certeza que deseja excluir este produto?")
    if (!confirmed) return

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso!",
        variant: "destructive",
      })
      location.reload()
    } else {
      const data = await res.json()
      toast({
        title: "Erro",
        description: data.error || "Não foi possível excluir o produto.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex w-full items-center gap-2 text-destructive"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Excluir
    </Button>
  )
}