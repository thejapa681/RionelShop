"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TermsOfUsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Termos de Uso - RionelShop</h1>
        <p className="text-muted-foreground">Leia atentamente os termos antes de utilizar nossa loja</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Introdução</CardTitle>
          <CardDescription>Este documento estabelece os termos de uso do site RionelShop.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Ao acessar ou utilizar os serviços da RionelShop, você concorda com estes termos de uso. Caso não concorde, não utilize nossa plataforma.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Cadastro de Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Para realizar compras, o usuário deve criar uma conta fornecendo informações corretas, incluindo nome, e-mail válido e senha.</p>
          <p>O usuário é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Compras e Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Ao finalizar uma compra, o usuário concorda em pagar o valor total do pedido, incluindo impostos e taxas de entrega, quando aplicável.</p>
          <p>A RionelShop utiliza meios de pagamento seguros, mas não se responsabiliza por informações incorretas fornecidas pelo usuário.</p>
          <p>Pagamentos podem ser realizados via cartão de crédito, boleto, PIX ou outros métodos disponíveis no site.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Entrega e Frete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>A RionelShop se compromete a enviar os produtos conforme informado no momento da compra.</p>
          <p>O prazo de entrega pode variar de acordo com a região, transportadora e disponibilidade do estoque.</p>
          <p>O usuário deve fornecer um endereço válido. A RionelShop não se responsabiliza por endereços incorretos ou alterações não comunicadas.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Cancelamento e Devoluções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>O usuário pode solicitar cancelamento antes do envio do pedido. Após o envio, aplica-se a política de devolução.</p>
          <p>Produtos com defeito podem ser devolvidos ou trocados conforme as condições previstas em lei.</p>
          <p>Custos de devolução podem ser responsabilidade do usuário, salvo quando comprovado defeito do produto.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Responsabilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>A RionelShop não se responsabiliza por danos diretos ou indiretos decorrentes do uso do site ou de produtos adquiridos.</p>
          <p>Não garantimos que o site estará livre de erros ou interrupções, embora façamos esforços para manter a plataforma funcional.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Privacidade e Proteção de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Ao se cadastrar e utilizar a RionelShop, o usuário concorda com nossa Política de Privacidade.</p>
          <p>Coletamos dados pessoais como nome, e-mail, endereço e informações de pagamento apenas para processar pedidos e melhorar sua experiência.</p>
          <p>Não compartilhamos dados pessoais com terceiros sem consentimento, exceto para processamento de pagamentos ou envio de produtos.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Propriedade Intelectual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Todo o conteúdo do site, incluindo imagens, textos, logotipos e códigos, é propriedade da RionelShop ou de seus licenciadores.</p>
          <p>É proibido reproduzir, distribuir ou usar qualquer conteúdo sem autorização expressa da RionelShop.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Alterações nos Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>A RionelShop pode alterar estes termos a qualquer momento, sendo as alterações publicadas nesta página.</p>
          <p>O uso contínuo do site após alterações constitui aceitação dos novos termos.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Em caso de dúvidas sobre os termos de uso, entre em contato pelo e-mail: <strong>rionelshopsuporte@gmail.com</strong>.</p>
        </CardContent>
      </Card>
    </div>
  )
}