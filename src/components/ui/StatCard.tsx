export function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <article className="rounded-xl border border-[#eaede9] bg-white p-5">
    <p className="text-xs text-[#7e8781]">{label}</p>
    <p className="mt-3 text-2xl font-bold">{value}</p>
    <small className="text-[#89928c]">{detail}</small>
  </article>
}
