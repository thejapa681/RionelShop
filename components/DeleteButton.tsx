"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeleteButtonProps {
  id: string
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Não foi possível excluir o produto")

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso!",
        variant: "destructive",
      })

      setIsOpen(false)
      location.reload()
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Botão de deletar */}
      <Button
        variant="ghost"
        size="icon"
        className="flex items-center gap-2 text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>

      {/* Modal Pop-up */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-purple-900 text-white rounded-3xl shadow-2xl w-96 p-6 relative transform transition-all duration-300 scale-100">
            
            {/* Botão de fechar */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Título e mensagem */}
            <h2 className="text-xl font-bold mb-3">Confirmar exclusão</h2>
            <p className="mb-6 text-sm">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </p>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                className={`bg-purple-600 hover:bg-purple-700 text-white ${
                  isDeleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}