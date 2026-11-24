import type { AuthUser, Order, Worker } from '../types'
import { initials } from '../utils'
import { PageHeading } from '../components/ui/PageHeading'

export function TeamPage({ team, orders, authUser, onAdd }: { team: Worker[]; orders: Order[]; authUser: AuthUser; onAdd: () => void }) {
  return <section>
    <PageHeading eyebrow="YOUR PEOPLE" title="Meet the team." subtitle="Manage the people who make every delivery happen." action={authUser.role === 'owner' ? { label: 'Add team member', onClick: onAdd } : undefined}/>
    <div className="grid gap-4 md:grid-cols-3">{team.map((worker) => {
      const assigned = orders.filter((order) => order.worker === worker.name && order.status !== 'Delivered').length
      const delivered = orders.filter((order) => order.worker === worker.name && order.status === 'Delivered').length
      return <article key={worker.email} className="rounded-xl border border-[#eaede9] bg-white p-5">
        <span className={`grid size-10 place-items-center rounded-full text-xs font-bold ${worker.color}`}>{initials(worker.name)}</span>
        <h3 className="mt-4 font-bold">{worker.name}</h3>
        <p className="text-xs text-[#89928c]">{worker.email}</p>
        <div className="mt-5 grid grid-cols-2 border-t border-[#edf0ed] pt-4"><div><strong>{assigned}</strong><small className="block text-[#89928c]">Active orders</small></div><div><strong>{delivered}</strong><small className="block text-[#89928c]">Delivered</small></div></div>
      </article>
    })}</div>
  </section>
}
