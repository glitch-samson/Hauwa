import type { ReactNode, RefObject } from 'react'
import type { AuthUser, Page } from '../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './ui/TopBar'

export function AppShell({ children, page, setPage, authUser, orderCount, logout, toast, query, setQuery, searchRef }: {
  children: ReactNode
  page: Page
  setPage: (page: Page) => void
  authUser: AuthUser
  orderCount: number
  logout: () => void
  toast: (message: string) => void
  query: string
  setQuery: (query: string) => void
  searchRef: RefObject<HTMLInputElement | null>
}) {
  return <div className="min-h-screen bg-[#f7f8f6] text-[#242a27]">
    <Sidebar page={page} setPage={setPage} authUser={authUser} orderCount={orderCount} logout={logout} toast={toast}/>
    <main className="min-h-screen md:ml-[248px]">
      <TopBar page={page} authUser={authUser} query={query} setQuery={setQuery} searchRef={searchRef} toast={toast}/>
      <div className="mx-auto max-w-[1120px] px-5 py-8 md:px-[4.3%]">{children}</div>
    </main>
  </div>
}
