"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, MessageSquare, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { Review } from "@/lib/types"

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  rating: number
  reviewCount: number
}

export function ProductReviews({ productId, reviews, rating, reviewCount }: ProductReviewsProps) {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    percentage: reviewCount > 0 ? (reviews.filter((r) => Math.round(r.rating) === star).length / reviewCount) * 100 : 0,
  }))

  const handleSubmitReview = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para avaliar",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        product_id: productId,
        rating: newReview.rating,
        title: newReview.title || null,
        comment: newReview.comment || null,
      })

      if (error) throw error

      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação será analisada antes de ser publicada.",
      })

      setShowForm(false)
      setNewReview({ rating: 5, title: "", comment: "" })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Avaliações dos Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-6">
            <div className="text-5xl font-bold text-primary">{rating.toFixed(1)}</div>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{reviewCount} avaliações</p>
          </div>

          <div className="space-y-2">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 text-sm">{star}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="w-8 text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review */}
        <div className="rounded-lg bg-secondary p-4">
          {!showForm ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Comprou este produto? Deixe sua avaliação!</p>
              <Button onClick={() => setShowForm(true)}>Avaliar Produto</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sua nota:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}>
                    <Star
                      className={`h-6 w-6 transition-colors ${star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted hover:fill-yellow-200 hover:text-yellow-200"}`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Título da avaliação (opcional)"
                value={newReview.title}
                onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              />
              <Textarea
                placeholder="Conte sua experiência com o produto..."
                value={newReview.comment}
                onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Avaliação"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.profile?.avatar_url || ""} />
                      <AvatarFallback>{review.profile?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.profile?.full_name || "Usuário"}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {review.is_verified && (
                    <span className="rounded bg-primary/20 px-2 py-1 text-xs text-primary">Compra Verificada</span>
                  )}
                </div>

                {review.title && <p className="mb-1 font-medium">{review.title}</p>}
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

                <div className="mt-3 flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    Útil ({review.helpful_count})
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
