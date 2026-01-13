export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  cpf: string | null
  birth_date: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  name: string
  recipient_name: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  stock: number
  low_stock_alert: number
  weight: number | null
  width: number | null
  height: number | null
  length: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  rating: number
  review_count: number
  sold_count: number
  views: number
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  price: number | null
  stock: number
  attributes: Record<string, string>
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  variant?: ProductVariant
}

export interface Cart {
  id: string
  user_id: string | null
  session_id: string | null
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method: string | null
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  coupon_id: string | null
  coupon_code: string | null
  shipping_address: Address
  tracking_code: string | null
  tracking_url: string | null
  notes: string | null
  admin_notes: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  product_image: string | null
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_purchase: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id: string | null
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  is_verified: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  image_mobile_url: string | null
  link_url: string | null
  button_text: string | null
  position: "home" | "category" | "product" | "checkout"
  sort_order: number
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "order" | "promo" | "system" | "support"
  title: string
  message: string
  link_url: string | null
  is_read: boolean
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  user_id: string
  subject: string
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  category: "general" | "order" | "payment" | "shipping" | "product" | "account" | "other"
  order_id: string | null
  created_at: string
  updated_at: string
  messages?: SupportMessage[]
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  attachments: string[]
  is_from_admin: boolean
  is_read: boolean
  created_at: string
  profile?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}
