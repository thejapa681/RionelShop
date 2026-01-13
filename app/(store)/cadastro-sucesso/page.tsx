import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
          <CardDescription>Enviamos um e-mail de confirmação para você</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-secondary p-4">
            <div className="mb-2 flex items-center justify-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Verifique sua caixa de entrada</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Clique no link enviado para seu e-mail para ativar sua conta e começar a fazer compras.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Ir para a loja</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/entrar">Fazer login</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Não recebeu o e-mail? Verifique sua pasta de spam ou{" "}
            <Link href="/reenviar-email" className="text-primary hover:underline">
              clique aqui para reenviar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
