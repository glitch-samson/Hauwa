import type { Order, OrderStatus } from '../types'
import { Icon } from './Icon'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function TrackingPage({ order, trackingToken }: { order: Order | null; trackingToken?: string }) {
  const [publicOrder, setPublicOrder] = useState<Order | null>(order)

  useEffect(() => {
    if (order || !trackingToken || !isSupabaseConfigured || !supabase) return
    void supabase.rpc('get_public_tracking', { p_tracking_token: trackingToken }).then(({ data }) => {
      const row = data?.[0] as {
        reference_code: string
        product: string
        delivery_location: string
        status: OrderStatus
      } | undefined
      if (row) {
        setPublicOrder({
          id: row.reference_code,
          customer: '',
          email: '',
          location: row.delivery_location,
          product: row.product,
          amount: 0,
          date: new Date().toISOString(),
          status: row.status,
          worker: '',
          events: [],
        })
      }
    })
  }, [order, trackingToken])

  const resolvedOrder = publicOrder
  const stages: OrderStatus[] = ['Delivery accepted', 'Delivery processing', 'Shipped', 'Delivered']
  const active = resolvedOrder ? stages.indexOf(resolvedOrder.status) : -1
  return <main className="grid min-h-screen place-items-center bg-[#f4f7f3] p-6">
    <section className="w-full max-w-[620px] rounded-2xl border border-[#e5ebe5] bg-white p-8 shadow-[0_18px_50px_rgba(43,68,67,.08)]">
      <div className="mb-8 flex items-center gap-2 text-[22px] font-extrabold"><span className="grid size-8 place-items-center rounded-xl bg-parcel text-white"><Icon name="package" size={20}/></span>parcel<span className="-ml-1 text-[#82a78d]">.</span></div>
      {resolvedOrder ? <>
        <p className="text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">ORDER TRACKING</p>
        <h1 className="mt-2 font-heading text-[30px] font-bold">{resolvedOrder.id}</h1>
        <p className="mt-1 text-sm text-[#818a84]">{resolvedOrder.product}</p>
        <p className="mt-3 text-xs text-[#5f6962]"><strong>Delivery location:</strong> {resolvedOrder.location}</p>
        <div className="mt-5 inline-flex rounded-full bg-[#edf4ef] px-3 py-2 text-xs font-bold text-[#456352]">{resolvedOrder.status}</div>
        <div className="my-7 grid grid-cols-4 gap-2">{stages.map((stage, index) => <div key={stage} className={`grid justify-items-center gap-2 text-center text-[9px] ${index <= active ? 'text-parcel' : 'text-[#adb4af]'}`}><span className={`grid size-[30px] place-items-center rounded-full border ${index <= active ? 'border-parcel bg-parcel text-white' : 'border-[#dde4de] bg-white'}`}>{index < active ? <Icon name="check" size={16}/> : index + 1}</span><strong>{stage}</strong></div>)}</div>
        <div className="grid gap-3 border-t border-[#edf0ed] pt-5">{resolvedOrder.events.slice().reverse().map((event) => <div key={`${event.label}-${event.date}`}><strong className="block text-sm">{event.label}</strong><small className="block text-[9px] text-[#969e98]">{new Date(event.date).toLocaleString()}</small></div>)}</div>
      </> : <div className="py-8 text-center"><h1 className="text-2xl font-bold">Order not found</h1><p className="mt-2 text-sm text-[#89928c]">Check the tracking link or contact the store.</p></div>}
    </section>
  </main>
}
