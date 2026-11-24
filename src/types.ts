export type OrderStatus = 'Delivery accepted' | 'Delivery processing' | 'Shipped' | 'Delivered'

export type OrderEvent = { label: string; date: string; detail: string }

export type Order = {
  id: string
  trackingToken?: string
  customer: string
  email: string
  location: string
  product: string
  amount: number
  date: string
  status: OrderStatus
  worker: string
  events: OrderEvent[]
}

export type Worker = { name: string; email: string; password: string; color: string }
export type Page = 'Overview' | 'Orders' | 'History' | 'Finances' | 'Team'
export type AuthUser = { role: 'owner' | 'worker'; name: string; email: string }
