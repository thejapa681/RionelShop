"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

export interface CartItem {
  id: string
  product_id: string
  product: Product
  quantity: number
  selected_color?: string
  selected_size?: string
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isOpen: boolean
}

type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_CART"; payload?: boolean }

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: (open?: boolean) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload, isLoading: false }
    case "ADD_ITEM":
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product_id === action.payload.product_id &&
          item.selected_color === action.payload.selected_color &&
          item.selected_size === action.payload.selected_size,
      )
      if (existingIndex > -1) {
        const newItems = [...state.items]
        newItems[existingIndex].quantity += action.payload.quantity
        return { ...state, items: newItems }
      }
      return { ...state, items: [...state.items, action.payload] }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "TOGGLE_CART":
      return { ...state, isOpen: action.payload ?? !state.isOpen }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
    isOpen: false,
  })

  const supabase = createClient()

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    dispatch({ type: "SET_LOADING", payload: true })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: cartItems } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", user.id)

      if (cartItems) {
        dispatch({ type: "SET_ITEMS", payload: cartItems as CartItem[] })
        return
      }
    }

    // Load from localStorage for guests
    const localCart = localStorage.getItem("rionel_cart")
    if (localCart) {
      dispatch({ type: "SET_ITEMS", payload: JSON.parse(localCart) })
    } else {
      dispatch({ type: "SET_ITEMS", payload: [] })
    }
  }

  async function addItem(product: Product, quantity = 1, color?: string, size?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product,
      quantity,
      selected_color: color,
      selected_size: size,
    }

    if (user) {
      const { data } = await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          selected_color: color,
          selected_size: size,
        })
        .select(`*, product:products(*)`)
        .single()

      if (data) {
        newItem.id = data.id
      }
    }

    dispatch({ type: "ADD_ITEM", payload: newItem })

    if (!user) {
      const updatedItems = [...state.items, newItem]
      localStorage.setItem("rionel_cart", JSON.stringify(updatedItems))
    }
  }

  async function removeItem(itemId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("cart_items").delete().eq("id", itemId)
    }

    dispatch({ type: "REMOVE_ITEM", payload: itemId })

    if (!user) {
      const updatedItems = state.items.filter((item) => item.id !== itemId)
      localStorage.setItem("rionel_cart", JSON.stringify(updatedItems))
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("cart_items").update({ quantity }).eq("id", itemId)
    }

    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } })

    if (!user) {
      const updatedItems = state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      localStorage.setItem("rionel_cart", JSON.stringify(updatedItems))
    }
  }

  async function clearCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id)
    }

    dispatch({ type: "CLEAR_CART" })
    localStorage.removeItem("rionel_cart")
  }

  function toggleCart(open?: boolean) {
    dispatch({ type: "TOGGLE_CART", payload: open })
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price
    return sum + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
