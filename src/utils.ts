import type { OrderStatus } from './types'

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function historyStatus(status: OrderStatus) {
  if (status === 'Delivered') return 'Delivered'
  if (status === 'Shipped') return 'Not delivered'
  return 'Pending'
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount)
}
