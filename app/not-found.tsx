import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="gradient-text mb-4 text-9xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-bold">Página não encontrada</h2>
        <p className="mb-8 text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/busca">
              <Search className="mr-2 h-4 w-4" />
              Buscar Produtos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
