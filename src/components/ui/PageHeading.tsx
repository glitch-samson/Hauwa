import { Icon } from '../Icon'

export type PageAction = { label: string; onClick: () => void }

export function PageHeading({ eyebrow, title, subtitle, action }: {
  eyebrow: string
  title: string
  subtitle: string
  action?: PageAction
}) {
  return <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <p className="mb-2 text-[10px] font-bold tracking-[1.15px] text-[#a0a8a2]">{eyebrow}</p>
      <h1 className="font-heading text-[32px] font-bold tracking-[-1.2px] text-[#28332d]">{title}</h1>
      <p className="mt-2 text-xs text-[#89928c]">{subtitle}</p>
    </div>
    {action && <button className="flex h-10 items-center gap-2 rounded-lg bg-parcel px-4 text-xs font-semibold text-white" onClick={action.onClick}><Icon name="plus" size={17}/>{action.label}</button>}
  </div>
}
