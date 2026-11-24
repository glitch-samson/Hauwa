import { useEffect, useMemo, useRef, useState } from 'react'
import { initialOrders, initialWorkers } from './data'
import type { AuthUser, Order, OrderStatus, Page, Worker } from './types'
import { AppShell } from './components/AppShell'
import { Login } from './components/Auth'
import { ActivityModal, FormModal } from './components/Modals'
import { TrackingPage } from './components/TrackingPage'
import { Toast } from './components/ui/Toast'
import { OverviewPage } from './pages/OverviewPage'
import { OrdersPage } from './pages/OrdersPage'
import { HistoryPage } from './pages/HistoryPage'
import { FinancesPage } from './pages/FinancesPage'
import { TeamPage } from './pages/TeamPage'
import { formatNaira, historyStatus } from './utils'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function normalizeStatus(status: string): OrderStatus {
  if (status === 'Processing' || status === 'Delivery accepted') return 'Delivery accepted'
  if (status === 'Arrived' || status === 'Delivery processing') return 'Delivery processing'
  if (status === 'Out for delivery' || status === 'Shipped') return 'Shipped'
  return 'Delivered'
}

export default function App() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [team, setTeam] = useState<Worker[]>(initialWorkers)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('parcel-auth')
      return saved ? JSON.parse(saved) as AuthUser : null
    } catch {
      sessionStorage.removeItem('parcel-auth')
      return null
    }
  })
  const [page, setPage] = useState<Page>(() => {
    try {
      const saved = sessionStorage.getItem('parcel-auth')
      return saved ? (JSON.parse(saved) as AuthUser).role === 'worker' ? 'Orders' : 'Overview' : 'Overview'
    } catch {
      return 'Overview'
    }
  })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All orders')
  const [modal, setModal] = useState<'order' | 'worker' | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [toast, setToast] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setModal(null)
        setSelectedOrder(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    let active = true
    const loadBackend = async () => {
      const { data: sessionData } = await supabase!.auth.getSession()
      if (!active) return

      if (!sessionData.session?.user) {
        setAuthUser(null)
        setOrders(initialOrders)
        setTeam(initialWorkers)
        return
      }

      const userId = sessionData.session.user.id
      const { data: profile } = await supabase!
        .from('profiles')
        .select('name,email,role')
        .eq('id', userId)
        .single()

      if (active && profile) {
        setAuthUser({
          role: profile.role === 'owner' ? 'owner' : 'worker',
          name: profile.name,
          email: profile.email,
        })
      }

      const [{ data: teamRows }, { data: orderRows }] = await Promise.all([
        supabase!.from('team_members').select('id,name,email,color'),
        supabase!.from('orders').select('id,reference_code,tracking_token,customer_name,customer_email,delivery_location,product,amount,status,created_at,assigned_worker_id,team_members(name),order_events(label,detail,created_at)').order('created_at', { ascending: false }),
      ])

      if (!active) return

      if (teamRows) {
        setTeam(teamRows.map((worker) => ({
          name: worker.name,
          email: worker.email,
          password: '',
          color: worker.color,
        })))
      }
      if (orderRows) {
        setOrders(orderRows.map((order) => {
          const workerRelation = order.team_members as { name?: string } | { name?: string }[] | null
          const workerName = Array.isArray(workerRelation)
            ? workerRelation[0]?.name
            : workerRelation?.name
          return {
          id: order.reference_code,
          trackingToken: order.tracking_token,
          customer: order.customer_name,
          email: order.customer_email,
          location: order.delivery_location,
          product: order.product,
          amount: Number(order.amount),
          date: order.created_at,
          status: normalizeStatus(order.status),
          worker: workerName || 'Unassigned',
          events: (order.order_events || []).map((event: { label: string; detail: string; created_at: string }) => ({
            label: event.label,
            date: event.created_at,
            detail: event.detail,
          })),
          }
        }))
      }
    }

    void loadBackend()
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthUser(null)
        setOrders(initialOrders)
        setTeam(initialWorkers)
        setPage('Overview')
      } else {
        void loadBackend()
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }
  const updateStatus = (orderId: string, status: OrderStatus) => {
    setOrders((current) => current.map((order) => order.id === orderId
      ? { ...order, status, events: [...order.events, { label: status, date: new Date().toISOString(), detail: 'Customer tracking update prepared' }] }
      : order))
    if (isSupabaseConfigured && supabase) {
      void supabase.rpc('update_order_status', { p_order_id: orderId, p_status: status })
    }
  }
  const updateWorker = (orderId: string, worker: string) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, worker } : order))
    if (isSupabaseConfigured && supabase) {
      void (async () => {
        const member = team.find((item) => item.name === worker)
        if (!member) return
        const { data: memberRow } = await supabase.from('team_members').select('id').eq('email', member.email).single()
        if (memberRow) {
          await supabase.from('orders').update({ assigned_worker_id: memberRow.id }).eq('reference_code', orderId)
        }
      })()
    }
  }
  const addOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const workerName = String(data.get('worker'))
    const worker = team.find((member) => member.name === workerName)
    if (isSupabaseConfigured && supabase) {
      void (async () => {
        const workerRow = worker
          ? await supabase.from('team_members').select('id').eq('email', worker.email).maybeSingle()
          : null
        await supabase.rpc('create_order', {
          p_customer_name: String(data.get('customer')),
          p_customer_email: String(data.get('email')),
          p_delivery_location: String(data.get('location')).trim(),
          p_product: String(data.get('product')),
          p_amount: Number(data.get('amount')),
          p_assigned_worker_id: workerRow?.data?.id ?? null,
        })
        showToast('Order created')
        setModal(null)
        setPage('Orders')
      })()
      return
    }
    const highest = orders.reduce((max, order) => Math.max(max, Number(order.id.replace('ORD-', '')) || 0), 2840)
    const order: Order = {
      id: `ORD-${highest + 1}`,
      customer: String(data.get('customer')),
      email: String(data.get('email')),
      location: String(data.get('location')).trim(),
      product: String(data.get('product')),
      amount: Number(data.get('amount')),
      date: new Date().toISOString(),
      status: 'Delivery accepted',
      worker: String(data.get('worker')),
      events: [{ label: 'Order confirmed', date: new Date().toISOString(), detail: 'Customer email update prepared' }],
    }
    setOrders((current) => [order, ...current])
    setModal(null)
    setPage('Orders')
  }
  const addWorker = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const worker = {
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      password: String(data.get('password')),
      color: 'bg-[#e5edf2] text-[#537087]',
    }
    if (isSupabaseConfigured && supabase) {
      void supabase.from('team_members').insert({
        name: worker.name,
        email: worker.email,
        color: worker.color,
      })
    }
    setTeam((current) => [...current, {
      ...worker,
    }])
    setModal(null)
  }
  const exportHistory = () => {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const rows = [
      ['Order', 'Customer', 'Email', 'Delivery location', 'Product', 'Amount', 'Status', 'Dispatcher', 'Date'],
      ...orders.map((order) => [order.id, order.customer, order.email, order.location, order.product, formatNaira(order.amount), historyStatus(order.status), order.worker, new Date(order.date).toISOString()]),
    ]
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `parcel-order-history-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Order history exported')
  }
  const copyTracking = async (orderId: string) => {
    const order = orders.find((item) => item.id === orderId)
    const trackingValue = order?.trackingToken || orderId
    const url = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(trackingValue)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Customer tracking link copied')
    } catch {
      showToast(url)
    }
  }
  const logout = () => {
    sessionStorage.removeItem('parcel-auth')
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut()
    }
    setAuthUser(null)
    setPage('Overview')
  }

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.product} ${order.email} ${order.location}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (filter === 'All orders' || order.status === filter)
  }), [orders, query, filter])

  const trackingId = new URLSearchParams(window.location.search).get('track')
  if (trackingId) return <TrackingPage
    trackingToken={trackingId}
    order={orders.find((order) => order.id === trackingId || order.trackingToken === trackingId) ?? null}
  />
  if (!authUser) return <Login team={team} onLogin={(user) => {
    sessionStorage.setItem('parcel-auth', JSON.stringify(user))
    setAuthUser(user)
    setPage(user.role === 'worker' ? 'Orders' : 'Overview')
  }}/>

  return <>
    <AppShell page={page} setPage={setPage} authUser={authUser} orderCount={orders.length} logout={logout} toast={showToast} query={query} setQuery={setQuery} searchRef={searchRef}>
      {page === 'Overview' && <OverviewPage orders={orders} team={team} authUser={authUser} onNewOrder={() => setModal('order')}/>}
      {page === 'Orders' && <OrdersPage orders={filteredOrders} team={team} authUser={authUser} filter={filter} setFilter={setFilter} onNewOrder={() => setModal('order')} onSelect={setSelectedOrder} onStatus={updateStatus} onWorker={updateWorker}/>}
      {page === 'History' && <HistoryPage orders={orders} onExport={exportHistory} onSelect={setSelectedOrder}/>}
      {page === 'Finances' && authUser.role === 'owner' && <FinancesPage orders={orders} onExport={exportHistory} onSelect={setSelectedOrder}/>}
      {page === 'Team' && authUser.role === 'owner' && <TeamPage team={team} orders={orders} authUser={authUser} onAdd={() => setModal('worker')}/>}
    </AppShell>
    {modal && <FormModal kind={modal} team={team} onClose={() => setModal(null)} onOrder={addOrder} onWorker={addWorker}/>}
    {selectedOrder && <ActivityModal order={selectedOrder} team={team} role={authUser.role} onClose={() => setSelectedOrder(null)} onStatus={(status) => updateStatus(selectedOrder.id, status)} onWorker={(worker) => updateWorker(selectedOrder.id, worker)} onCopy={() => copyTracking(selectedOrder.id)}/>}
    {toast && <Toast message={toast}/>}
  </>
}
