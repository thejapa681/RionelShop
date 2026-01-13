'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, ShoppingCart, User, Heart, Bell, Menu, Package, LogOut, HelpCircle, ChevronDown } from 'lucide-react'
import type { Category, Profile, Notification } from '@/lib/types'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        if (profile) setUser(profile)

        const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(5)
        if (notifs) {
          setNotifications(notifs)
          setUnreadCount(notifs.filter((n) => !n.is_read).length)
        }

        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', authUser.id).single()
        if (cart) {
          const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('cart_id', cart.id)
          setCartCount(count || 0)
        }
      }

      const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      if (cats) setCategories(cats)
    }

    fetchData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCartCount(0)
        setNotifications([])
      } else if (event === 'SIGNED_IN') {
        fetchData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden border-b border-border bg-primary/10 md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4">
          <p className="text-xs text-muted-foreground">Frete grátis em compras acima de R$ 199</p>
          <div className="flex items-center gap-4">
            <Link href="/suporte" className="text-xs text-muted-foreground hover:text-foreground">Central de Ajuda</Link>
            <Link href="/rastreio" className="text-xs text-muted-foreground hover:text-foreground">Rastrear Pedido</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:max-w-sm bg-card">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Rionel</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-text text-2xl font-bold">Rionel</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos, marcas e muito mais..."
                className="w-full bg-secondary pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-card">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold">Notificações</span>
                    <Link href="/notificacoes" className="text-xs text-primary hover:underline">Ver todas</Link>
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <DropdownMenuItem key={notif.id} className={`flex flex-col items-start gap-1 p-3 ${!notif.is_read ? 'bg-primary/5' : ''}`}>
                      <span className="font-medium">{notif.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                    </DropdownMenuItem>
                  )) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="icon" asChild>
              <Link href="/favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/carrinho">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{cartCount}</Badge>}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{user.full_name?.split(' ')[0] || 'Conta'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <div className="p-3">
                    <p className="font-medium">{user.full_name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">Minha conta</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2"><User className="h-4 w-4" />Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pedidos" className="flex items-center gap-2"><Package className="h-4 w-4" />Meus Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="flex items-center gap-2"><Heart className="h-4 w-4" />Favoritos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/suporte" className="flex items-center gap-2"><HelpCircle className="h-4 w-4" />Suporte</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link href="/entrar">Entrar</Link>
              </Button>
            )}
          </div>
        </div>

        <nav className="hidden h-10 items-center gap-6 overflow-x-auto md:flex">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/categoria/${category.slug}`} className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="w-full bg-secondary pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  )
}