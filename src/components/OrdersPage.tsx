import type { Order, OrderStatus, Worker } from '../types'
import { Icon } from './Icon'
import { formatNaira, historyStatus, orderStatusLabel } from '../utils'

export function StatusPill({ status, history = false }: { status: OrderStatus; history?: boolean }) {
  const label = history ? historyStatus(status) : orderStatusLabel(status)
  const color = label === 'Delivered' ? 'bg-[#edf4f0] text-[#648374]'
    : label === 'Not delivered' ? 'bg-[#fbf0e8] text-[#a36f52]'
    : label === 'Pending' ? 'bg-[#f8f3e8] text-[#8f7a58]'
    : 'bg-[#edf5ec] text-[#668769]'
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[8px] font-semibold ${color}`}><i className="size-1 rounded-full bg-current"/>{label}</span>
}

export function OrdersTable({ orders, team, role, onSelect, onStatus, onWorker, compact = false }: {
  orders: Order[]
  team: Worker[]
  role: 'owner' | 'worker'
  onSelect: (order: Order) => void
  onStatus: (id: string, status: OrderStatus) => void
  onWorker: (id: string, worker: string) => void
  compact?: boolean
}) {
  const rows = compact ? orders.slice(0, 5) : orders
  return <div className="overflow-x-auto"><table className="w-full min-w-[820px] border-collapse text-left">
    <thead><tr className="border-b border-[#ecefeb] text-[9px] font-bold tracking-[.8px] text-[#9da59f]"><th className="px-4 py-3">ORDER</th><th className="px-4 py-3">CUSTOMER</th><th className="px-4 py-3">PRODUCT</th><th className="px-4 py-3">DATE</th><th className="px-4 py-3">STATUS</th><th className="px-4 py-3">DISPATCHER</th><th/></tr></thead>
    <tbody>{rows.map((order) => <tr key={order.id} className="border-b border-[#f0f2ef] text-[11px]">
      <td className="px-4 py-3"><button className="font-bold text-parcel" onClick={() => onSelect(order)}>{order.id}</button></td>
      <td className="px-4 py-3"><strong>{order.customer}</strong><br/><small className="text-[#8e9691]">{order.email}</small></td>
      <td className="px-4 py-3"><strong>{order.product}</strong><br/><small className="text-[#8e9691]">{formatNaira(order.amount)}</small></td>
      <td className="px-4 py-3 text-[#8e9691]">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(order.date))}</td>
      <td className="px-4 py-3"><StatusPill status={order.status}/></td>
      <td className="px-4 py-3">{role === 'owner' ? <select className="h-8 max-w-28 rounded-md border border-[#e4e9e4] px-2 text-[10px]" value={order.worker} onChange={(event) => onWorker(order.id, event.target.value)}>{team.map((worker) => <option key={worker.email} value={worker.name}>{worker.name}</option>)}</select> : <strong>{order.worker}</strong>}</td>
      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><select aria-label={`Change status for ${order.id}`} className="h-8 max-w-36 rounded-md border border-[#e4e9e4] px-2 text-[10px]" value={order.status} onChange={(event) => onStatus(order.id, event.target.value as OrderStatus)}>{(['Delivery accepted','Delivery processing','Shipped','Delivered'] as OrderStatus[]).map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select><button className="grid size-8 place-items-center text-[#7f8882]" onClick={() => onSelect(order)} aria-label={`View ${order.id}`}><Icon name="dots" size={18}/></button></div></td>
    </tr>)}</tbody>
  </table></div>
}
