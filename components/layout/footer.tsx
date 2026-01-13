import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Shield, Truck } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Features */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Frete Grátis</p>
                <p className="text-sm text-muted-foreground">Acima de R$ 199</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Compra Segura</p>
                <p className="text-sm text-muted-foreground">Site protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Parcele em até 12x</p>
                <p className="text-sm text-muted-foreground">Sem juros</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Suporte 24h</p>
                <p className="text-sm text-muted-foreground">Estamos aqui para ajudar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="gradient-text mb-4 text-xl font-bold">Rionel</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Sua loja online favorita com os melhores produtos e preços. Entrega rápida e pagamento seguro.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" className="text-muted-foreground hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/trocas" className="text-muted-foreground hover:text-foreground">
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-4 font-semibold">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/suporte" className="text-muted-foreground hover:text-foreground">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/rastreio" className="text-muted-foreground hover:text-foreground">
                  Rastrear Pedido
                </Link>
              </li>
              <li>
                <Link href="/como-comprar" className="text-muted-foreground hover:text-foreground">
                  Como Comprar
                </Link>
              </li>
              <li>
                <Link href="/formas-pagamento" className="text-muted-foreground hover:text-foreground">
                  Formas de Pagamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="mb-4 font-semibold">Contato</h4>
            <ul className="mb-6 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@rionel.com.br
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                Av. Paulista, 1000 - São Paulo/SP
              </li>
            </ul>

            <h4 className="mb-3 font-semibold">Newsletter</h4>
            <form className="flex gap-2">
              <Input type="email" placeholder="Seu e-mail" className="bg-secondary" />
              <Button type="submit" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground">© 2026 Rionel. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2">
              <img src="/visa-card-logo.png" alt="Visa" className="h-6" />
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-6" />
              <img src="/abstract-geometric-logo.png" alt="Pix" className="h-6" />
              <img src="/generic-payment-slip-logo.png" alt="Boleto" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
