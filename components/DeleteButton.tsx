import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const productId = params.id

  try {
    await supabase.from("product_images").delete().eq("product_id", productId)
    const { error: productError } = await supabase.from("products").delete().eq("id", productId)

    if (productError) throw productError

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao excluir produto" },
      { status: 500 }
    )
  }
}