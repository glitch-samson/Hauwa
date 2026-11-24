import type { AuthUser, Order, OrderStatus, Worker } from '../types'
import { PageHeading } from '../components/ui/PageHeading'
import { OrdersTable } from '../components/OrdersPage'

export function OrdersPage({ orders, team, authUser, filter, setFilter, onNewOrder, onSelect, onStatus, onWorker }: {
  orders: Order[]
  team: Worker[]
  authUser: AuthUser
  filter: string
  setFilter: (filter: string) => void
  onNewOrder: () => void
  onSelect: (order: Order) => void
  onStatus: (id: string, status: OrderStatus) => void
  onWorker: (id: string, worker: string) => void
}) {
  const tabs = ['All orders','Delivery accepted','Delivery processing','Shipped','Delivered']
  return <section>
    <PageHeading eyebrow="YOUR STORE" title="All orders." subtitle="Search, assign, and update your order milestones." action={authUser.role === 'owner' ? { label: 'New order', onClick: onNewOrder } : undefined}/>
    <div className="overflow-hidden rounded-xl border border-[#eaede9] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[#ecefeb] p-3">{tabs.map((tab) => <button key={tab} onClick={() => setFilter(tab)} className={`rounded-md px-3 py-2 text-[10px] font-semibold ${filter === tab ? 'bg-[#edf4ef] text-parcel' : 'text-[#89928c] hover:bg-[#f5f8f5]'}`}>{tab}</button>)}</div>
      <OrdersTable orders={orders} team={team} role={authUser.role} onSelect={onSelect} onStatus={onStatus} onWorker={onWorker}/>
    </div>
  </section>
}
