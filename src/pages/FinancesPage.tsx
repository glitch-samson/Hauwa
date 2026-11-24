import type { Order } from '../types'
import { PageHeading } from '../components/ui/PageHeading'
import { StatCard } from '../components/ui/StatCard'
import { StatusPill } from '../components/OrdersPage'
import { formatNaira } from '../utils'

export function FinancesPage({ orders, onExport, onSelect }: { orders: Order[]; onExport: () => void; onSelect: (order: Order) => void }) {
  const total = orders.reduce((sum, order) => sum + order.amount, 0)
  const delivered = orders.filter((order) => order.status === 'Delivered').reduce((sum, order) => sum + order.amount, 0)
  const pipeline = total - delivered
  return <section>
    <PageHeading eyebrow="BUSINESS OVERVIEW" title="Finances." subtitle="Track order value, delivered revenue, and expected income." action={{ label: 'Export report', onClick: onExport }}/>
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard label="Total order value" value={formatNaira(total)} detail={`Across ${orders.length} orders`}/>
      <StatCard label="Delivered revenue" value={formatNaira(delivered)} detail="Confirmed deliveries"/>
      <StatCard label="Pipeline value" value={formatNaira(pipeline)} detail="Not yet delivered"/>
    </div>
    <div className="mt-5 overflow-x-auto rounded-xl border border-[#eaede9] bg-white">
      <table className="w-full text-left text-xs"><thead className="border-b border-[#ecefeb] text-[9px] text-[#9da59f]"><tr><th className="p-4">ORDER</th><th>CUSTOMER</th><th>STATUS</th><th>VALUE</th><th>DISPATCHER</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[#f0f2ef]"><td className="p-4"><button className="font-bold text-parcel" onClick={() => onSelect(order)}>{order.id}</button></td><td>{order.customer}</td><td><StatusPill status={order.status} history/></td><td><strong>{formatNaira(order.amount)}</strong></td><td>{order.worker}</td></tr>)}</tbody></table>
    </div>
  </section>
}
