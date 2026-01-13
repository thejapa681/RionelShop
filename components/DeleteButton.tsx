"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteButtonProps {
  id: string
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  async function handleDelete() {
    const confirmed = confirm("Tem certeza que deseja excluir este produto?")
    if (!confirmed) return

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      alert("Produto excluído com sucesso!")
      location.reload()
    } else {
      alert("Erro ao excluir produto.")
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