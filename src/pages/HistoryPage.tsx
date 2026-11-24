import type { Order } from '../types'
import { PageHeading } from '../components/ui/PageHeading'
import { StatusPill } from '../components/OrdersPage'
import { formatNaira } from '../utils'

export function HistoryPage({ orders, onExport, onSelect }: { orders: Order[]; onExport: () => void; onSelect: (order: Order) => void }) {
  return <section>
    <PageHeading eyebrow="COMPLETE RECORD" title="Order history." subtitle="Review every order and export the full record." action={{ label: 'Export CSV', onClick: onExport }}/>
    <div className="overflow-x-auto rounded-xl border border-[#eaede9] bg-white">
      <table className="w-full min-w-[800px] text-left text-xs"><thead className="border-b border-[#ecefeb] text-[9px] text-[#9da59f]"><tr><th className="p-4">ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>LOCATION</th><th>VALUE</th><th>STATUS</th><th>DISPATCHER</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[#f0f2ef]"><td className="p-4"><button className="font-bold text-parcel" onClick={() => onSelect(order)}>{order.id}</button></td><td><strong>{order.customer}</strong><br/><small className="text-[#89928c]">{order.email}</small></td><td>{order.product}</td><td>{order.location}</td><td><strong>{formatNaira(order.amount)}</strong></td><td><StatusPill status={order.status} history/></td><td>{order.worker}</td></tr>)}</tbody></table>
    </div>
  </section>
}
