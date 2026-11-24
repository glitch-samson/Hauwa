import type { AuthUser, Page } from '../types'
import { Icon } from './Icon'
import { initials } from '../utils'

export function Sidebar({ page, setPage, authUser, orderCount, logout, toast }: {
  page: Page
  setPage: (page: Page) => void
  authUser: AuthUser
  orderCount: number
  logout: () => void
  toast: (message: string) => void
}) {
  const links: [Page, string][] = authUser.role === 'owner'
    ? [['Overview', 'grid'], ['Orders', 'box'], ['History', 'clock'], ['Finances', 'wallet'], ['Team', 'users']]
    : [['Orders', 'box'], ['History', 'clock']]

  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#ecefeb] bg-white px-[18px] py-[27px] md:flex">
    <button className="mb-12 ml-2 flex items-center gap-2.5 text-[24px] font-extrabold tracking-[-1.2px]" onClick={() => setPage(authUser.role === 'owner' ? 'Overview' : 'Orders')}>
      <span className="grid size-[34px] place-items-center rounded-[11px] bg-parcel text-white"><Icon name="package" size={22}/></span>
      <span>parcel<span className="text-[#82a78d]">.</span></span>
    </button>
    <p className="mb-3 ml-3 text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">WORKSPACE</p>
    <nav className="grid gap-1">
      {links.map(([label, icon]) => <button key={label} onClick={() => setPage(label)} className={`flex h-[43px] items-center gap-3 rounded-lg px-3 text-left text-[13px] ${page === label ? 'bg-[#edf4ef] font-bold text-[#194733]' : 'text-[#777f79] hover:bg-[#f5f8f5] hover:text-parcel'}`}>
        <Icon name={icon} size={19}/><span>{label}</span>
        {label === 'Orders' && <span className="ml-auto grid size-6 place-items-center rounded-md bg-white text-[10px] font-bold text-[#728078]">{orderCount}</span>}
      </button>)}
    </nav>
    <div className="mt-auto">
      {authUser.role === 'owner' && <div className="mb-4 rounded-[10px] border border-[#edf0ec] bg-[#fbfcfa] p-3">
        <div className="mb-2 grid size-7 place-items-center rounded-lg bg-[#edf4ee] text-[#527b62]"><Icon name="mail" size={17}/></div>
        <p className="text-xs font-bold">Need a hand?</p>
        <button className="mt-3 flex items-center gap-1 text-[10px] font-bold text-parcel" onClick={() => toast('Help center is coming soon')}>Visit help center <Icon name="arrow" size={14}/></button>
      </div>}
      <button className="flex w-full items-center gap-2.5 border-t border-[#edf0ec] px-1 pt-3 text-left" onClick={logout} title="Sign out">
        <span className="grid size-[34px] place-items-center rounded-full bg-[#738774] text-[10px] font-bold text-[#f7f4ed]">{initials(authUser.name)}</span>
        <span className="flex-1"><strong className="block text-[11px]">{authUser.name}</strong><small className="text-[10px] text-[#999f9b]">{authUser.role === 'owner' ? 'Store owner' : 'Team member · Sign out'}</small></span>
        <Icon name="close" size={16}/>
      </button>
    </div>
  </aside>
}
