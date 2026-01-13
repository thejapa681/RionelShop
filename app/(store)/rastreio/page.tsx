"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Search, Package, MapPin, Clock } from "lucide-react"

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [trackingResult, setTrackingResult] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulated tracking result
    setTimeout(() => {
      setTrackingResult({
        code: trackingNumber,
        status: "Em trânsito",
        events: [
          {
            date: "13/01/2026 14:30",
            location: "São Paulo, SP",
            description: "Objeto saiu para entrega ao destinatário",
          },
          {
            date: "13/01/2026 08:15",
            location: "São Paulo, SP",
            description: "Objeto em trânsito - por favor aguarde",
          },
          {
            date: "12/01/2026 22:00",
            location: "Campinas, SP",
            description: "Objeto encaminhado para São Paulo",
          },
          {
            date: "12/01/2026 15:30",
            location: "Centro de Distribuição",
            description: "Objeto postado",
          },
        ],
      })
      setIsSearching(false)
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Truck className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Rastrear Pedido</h1>
      </div>

      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle>Digite o código de rastreamento</CardTitle>
          <CardDescription>Acompanhe seu pedido em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="tracking" className="sr-only">
                Código de rastreamento
              </Label>
              <Input
                id="tracking"
                placeholder="Ex: AA123456789BR"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
            <Button type="submit" disabled={!trackingNumber || isSearching}>
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Buscando..." : "Rastrear"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {trackingResult && (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Código: {trackingResult.code}</CardTitle>
                <CardDescription>Status: {trackingResult.status}</CardDescription>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {trackingResult.events.map((event: any, index: number) => (
                <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < trackingResult.events.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-full w-0.5 bg-border" />
                  )}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {index === 0 ? <Truck className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {event.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
