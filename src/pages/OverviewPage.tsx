import type { AuthUser, Order, Worker } from '../types'
import { PageHeading } from '../components/ui/PageHeading'
import { StatCard } from '../components/ui/StatCard'

export function OverviewPage({ orders, team, authUser, onNewOrder }: {
  orders: Order[]
  team: Worker[]
  authUser: AuthUser
  onNewOrder: () => void
}) {
  const counts = {
    total: orders.length,
    accepted: orders.filter((order) => order.status === 'Delivery accepted').length,
    processing: orders.filter((order) => order.status === 'Delivery processing').length,
    shipped: orders.filter((order) => order.status === 'Shipped').length,
  }
  return <section>
    <PageHeading eyebrow="DASHBOARD" title="Good morning, Jamie." subtitle="Here's what's happening with your orders today." action={authUser.role === 'owner' ? { label: 'New order', onClick: onNewOrder } : undefined}/>
    <div className="grid gap-3 md:grid-cols-4">
      <StatCard label="Total orders" value={counts.total} detail="Across all time"/>
      <StatCard label="In progress" value={counts.accepted + counts.processing} detail="Accepted or processing"/>
      <StatCard label="Shipped" value={counts.shipped} detail="With your team"/>
      <StatCard label="Team members" value={team.length} detail="Ready to deliver"/>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-xl border border-[#eaede9] bg-white p-5"><h2 className="font-bold">Order journey</h2><div className="mt-5 grid grid-cols-4 gap-2 text-center text-[10px]">{['Order placed','Processing','Shipped','Delivered'].map((stage, index) => <div key={stage}><span className="mx-auto grid size-9 place-items-center rounded-full bg-[#edf4ef] text-parcel">{index + 1}</span><strong className="mt-2 block">{stage}</strong></div>)}</div></section>
      <section className="rounded-xl border border-[#eaede9] bg-white p-5"><h2 className="font-bold">Ready to send</h2><p className="mt-2 text-xs text-[#89928c]">{counts.processing} processing</p></section>
    </div>
  </section>
}
