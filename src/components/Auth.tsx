import type { AuthUser, Worker } from '../types'
import { Icon } from './Icon'
import { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Login({ team: _team, onLogin }: { team: Worker[]; onLogin: (user: AuthUser) => void }) {
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim().toLowerCase()
    const password = String(formData.get('password'))
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase environment variables are not configured.')
      return
    }
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      return
    }
    if (!authData.user) {
      setError('Unable to start the session.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, role')
      .eq('id', authData.user.id)
      .single()

    const user: AuthUser = {
      role: profile?.role === 'owner' ? 'owner' : 'worker',
      name: profile?.name || authData.user.email?.split('@')[0] || 'Team member',
      email: profile?.email || authData.user.email || email,
    }
    onLogin(user)
  }

  return <main className="grid min-h-screen place-items-center bg-[#f4f7f3] p-6">
    <section className="w-full max-w-[420px] rounded-2xl border border-[#e5ebe5] bg-white p-8 shadow-[0_18px_50px_rgba(43,68,67,.08)]">
      <div className="mb-8 flex items-center gap-2 text-[22px] font-extrabold"><span className="grid size-8 place-items-center rounded-xl bg-parcel text-white"><Icon name="package" size={20}/></span>parcel<span className="-ml-1 text-[#82a78d]">.</span></div>
      <p className="mb-2 text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">WELCOME BACK</p>
      <h1 className="font-heading text-[26px] font-bold tracking-[-.8px] text-[#28332d]">Sign in to your workspace</h1>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-xs font-bold text-[#69736c]">Email address<input className="h-11 rounded-lg border border-[#dde5de] px-3 text-sm" name="email" type="email" required placeholder="you@parcel.co"/></label>
        <label className="grid gap-2 text-xs font-bold text-[#69736c]">Password<input className="h-11 rounded-lg border border-[#dde5de] px-3 text-sm" name="password" type="password" required placeholder="Enter your password"/></label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
        <button className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-parcel text-sm font-semibold text-white" type="submit">Sign in <Icon name="arrow" size={16}/></button>
      </form>
    </section>
  </main>
}
