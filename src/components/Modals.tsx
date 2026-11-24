import type { Order, OrderStatus, Worker } from '../types'
import { Icon } from './Icon'
import { orderStatusLabel } from '../utils'

export function FormModal({ kind, team, onClose, onOrder, onWorker }: {
  kind: 'order' | 'worker'
  team: Worker[]
  onClose: () => void
  onOrder: (event: React.FormEvent<HTMLFormElement>) => void
  onWorker: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#1f3028]/30 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><p className="mb-2 text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">{kind === 'order' ? 'A NEW DELIVERY' : 'GROW YOUR TEAM'}</p><h2 className="font-heading text-2xl font-bold">{kind === 'order' ? 'Create an order' : 'Add a teammate'}</h2></div><button className="grid size-8 place-items-center rounded-lg" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></div>
      {kind === 'order' ? <form onSubmit={onOrder} className="mt-5 grid grid-cols-2 gap-4">
        <label className="grid gap-2 text-xs font-bold">Customer name<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="customer" required placeholder="e.g. Alex Morgan"/></label>
        <label className="grid gap-2 text-xs font-bold">Customer email<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="email" type="email" required placeholder="alex@example.com"/></label>
        <label className="col-span-2 grid gap-2 text-xs font-bold">Product<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="product" required placeholder="What did they order?"/></label>
        <label className="col-span-2 grid gap-2 text-xs font-bold">Delivery location<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="location" required placeholder="Street address, city, area"/></label>
        <label className="grid gap-2 text-xs font-bold">Order value (NGN)<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="amount" type="number" min="0" step="0.01" required placeholder="0.00"/></label>
        <label className="grid gap-2 text-xs font-bold">Assign dispatcher<select className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="worker" required defaultValue={team[0]?.name ?? ''}>{team.map((worker) => <option key={worker.email} value={worker.name}>{worker.name}</option>)}</select></label>
        <div className="col-span-2 mt-2 flex justify-end gap-2"><button type="button" className="h-10 rounded-lg border border-[#e4e9e4] px-4 text-xs" onClick={onClose}>Cancel</button><button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-parcel px-4 text-xs font-semibold text-white" disabled={!team.length}><Icon name="plus" size={16}/>Create order</button></div>
      </form> : <form onSubmit={onWorker} className="mt-5 grid grid-cols-2 gap-4">
        <label className="grid gap-2 text-xs font-bold">Full name<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="name" required placeholder="e.g. Taylor Reed"/></label>
        <label className="grid gap-2 text-xs font-bold">Email address<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="email" type="email" required placeholder="taylor@example.com"/></label>
        <label className="col-span-2 grid gap-2 text-xs font-bold">Password<input className="h-10 rounded-lg border border-[#e4e9e4] px-3" name="password" type="password" minLength={6} required placeholder="Create a login password"/></label>
        <div className="col-span-2 mt-2 flex justify-end gap-2"><button type="button" className="h-10 rounded-lg border border-[#e4e9e4] px-4 text-xs" onClick={onClose}>Cancel</button><button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-parcel px-4 text-xs font-semibold text-white"><Icon name="plus" size={16}/>Add member</button></div>
      </form>}
    </section>
  </div>
}

export function ActivityModal({ order, team, role, onClose, onStatus, onWorker, onCopy }: {
  order: Order
  team: Worker[]
  role: 'owner' | 'worker'
  onClose: () => void
  onStatus: (status: OrderStatus) => void
  onWorker: (worker: string) => void
  onCopy: () => void
}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#1f3028]/30 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex justify-between"><div><p className="text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">ORDER ACTIVITY</p><h2 className="font-heading mt-2 text-2xl font-bold">{order.id}</h2></div><button onClick={onClose} className="grid size-8 place-items-center" aria-label="Close dialog"><Icon name="close"/></button></div>
      <p className="mt-4 text-sm"><strong>{order.customer}</strong><br/><span className="text-xs text-[#89928c]">{order.email}</span></p>
      <p className="mt-3 rounded-lg bg-[#f7faf7] p-3 text-xs"><strong>Delivery location:</strong> {order.location}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {role === 'owner' && <label className="grid gap-2 text-xs font-bold">Assigned dispatcher<select className="h-10 rounded-lg border border-[#e4e9e4] px-3" value={order.worker} onChange={(event) => onWorker(event.target.value)}>{team.map((worker) => <option key={worker.email} value={worker.name}>{worker.name}</option>)}</select></label>}
        <label className="grid gap-2 text-xs font-bold">Delivery status<select className="h-10 rounded-lg border border-[#e4e9e4] px-3" value={order.status} onChange={(event) => onStatus(event.target.value as OrderStatus)}>{(['Delivery accepted','Delivery processing','Shipped','Delivered'] as OrderStatus[]).map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}</select></label>
      </div>
      <button className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-[#dde8df] px-3 text-xs font-bold text-parcel" onClick={onCopy}><Icon name="arrow" size={15}/>Copy customer tracking link</button>
      <div className="mt-5 grid gap-3 border-t border-[#edf0ed] pt-4">{order.events.slice().reverse().map((event) => <div key={`${event.label}-${event.date}`}><strong className="block text-sm">{event.label}</strong><small className="block text-[10px] text-[#89928c]">{event.detail}</small><small className="block text-[9px] text-[#a0a8a2]">{new Date(event.date).toLocaleString()}</small></div>)}</div>
      <div className="mt-5 flex justify-end"><button className="h-10 rounded-lg border border-[#e4e9e4] px-4 text-xs" onClick={onClose}>Close</button></div>
    </section>
  </div>
}
