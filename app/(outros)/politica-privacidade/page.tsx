"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Política de Privacidade - RionelShop</h1>
        <p className="text-muted-foreground">Como coletamos, usamos e protegemos suas informações</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Introdução</CardTitle>
          <CardDescription>A RionelShop valoriza a sua privacidade e se compromete a proteger seus dados pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Esta política descreve como coletamos, usamos, armazenamos e compartilhamos as informações que você fornece ao utilizar nosso site e serviços.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Informações Coletadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Coletamos informações que você fornece diretamente, como:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Nome completo, e-mail e telefone</li>
            <li>Endereço de entrega e faturamento</li>
            <li>Informações de pagamento, como cartão de crédito ou PIX</li>
            <li>Preferências de produtos, cores e tamanhos</li>
          </ul>
          <p>Também coletamos informações automaticamente, como:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Endereço IP, navegador e sistema operacional</li>
            <li>Dados de navegação, cliques e tempo de permanência</li>
            <li>Cookies e tecnologias similares</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Uso das Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Processar e gerenciar pedidos</li>
            <li>Fornecer suporte ao cliente</li>
            <li>Personalizar sua experiência de compra</li>
            <li>Enviar comunicações promocionais e informativas, caso autorizado</li>
            <li>Prevenir fraudes e atividades suspeitas</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Compartilhamento de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Podemos compartilhar informações com:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Transportadoras e serviços de entrega</li>
            <li>Processadores de pagamento e instituições financeiras</li>
            <li>Autoridades legais quando exigido por lei</li>
            <li>Fornecedores terceirizados que auxiliam na operação da loja</li>
          </ul>
          <p>Não vendemos suas informações pessoais para terceiros.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Adotamos medidas de segurança técnicas e administrativas para proteger suas informações contra acesso não autorizado, perda, alteração ou divulgação indevida.</p>
          <p>No entanto, nenhum método de transmissão ou armazenamento digital é 100% seguro, portanto não podemos garantir total segurança.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Cookies e Tecnologias Semelhantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Usamos cookies para:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Lembrar preferências do usuário</li>
            <li>Melhorar a experiência de navegação</li>
            <li>Rastreamento de visitas e desempenho do site</li>
          </ul>
          <p>Você pode desativar cookies no navegador, mas isso pode afetar funcionalidades do site.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Direitos do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Você tem direito a:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Acessar, corrigir ou excluir seus dados pessoais</li>
            <li>Solicitar portabilidade das informações</li>
            <li>Revogar consentimentos fornecidos</li>
            <li>Opor-se ao processamento de dados para fins de marketing</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato com suporte@rionelshop.com.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Alterações na Política</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>A RionelShop pode atualizar esta política periodicamente, sendo as alterações publicadas nesta página.</p>
          <p>O uso contínuo do site após alterações constitui aceitação da nova política.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Em caso de dúvidas sobre a política de privacidade, entre em contato pelo e-mail: <strong>rionelshopsuporte@gmail.com</strong>.</p>
        </CardContent>
      </Card>
    </div>
  )
}