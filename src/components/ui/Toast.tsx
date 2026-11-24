import { Icon } from '../Icon'

export function Toast({ message }: { message: string }) {
  return <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-lg border border-[#e1e9e1] bg-white px-4 py-3 text-xs text-[#4a5b4d] shadow-xl">
    <span className="grid size-6 place-items-center rounded-full bg-[#79a080] text-white"><Icon name="check" size={15}/></span>{message}
  </div>
}
