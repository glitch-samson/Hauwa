import type { AuthUser } from '../../types'
import { initials } from '../../utils'
import { Icon } from '../Icon'

export function TopBar({ page, authUser, query, setQuery, searchRef, toast }: {
  page: string
  authUser: AuthUser
  query: string
  setQuery: (query: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  toast: (message: string) => void
}) {
  return <header className="flex h-[68px] items-center justify-between border-b border-[#e9ece8] bg-white/90 px-5 md:px-[4.3%]">
    <div className="flex items-center gap-2 text-xs text-[#9aa19c]"><span>Workspace</span><Icon name="chevron" size={15}/><strong className="text-[#4a544e]">{page}</strong></div>
    <div className="flex items-center gap-3">
      <label className="hidden h-9 w-[218px] items-center gap-2 rounded-lg border border-[#eaede9] bg-white px-2 text-[#9aa19c] sm:flex">
        <Icon name="search" size={17}/>
        <input ref={searchRef} className="min-w-0 flex-1 border-0 bg-transparent text-xs outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." aria-label="Search orders"/>
      </label>
      <button className="grid size-8 place-items-center rounded-lg text-[#7f8882]" onClick={() => toast("You're all caught up!")} aria-label="Notifications"><Icon name="bell" size={19}/></button>
      <span className="grid size-8 place-items-center rounded-full bg-[#738774] text-[9px] font-bold text-white">{initials(authUser.name)}</span>
    </div>
  </header>
}
