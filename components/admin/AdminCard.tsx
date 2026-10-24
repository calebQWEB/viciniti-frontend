// A titled white card used across the admin detail pages
export default function AdminCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-earth-200 bg-white">
      <div className="flex items-center justify-between border-b border-earth-100 px-4 py-3">
        <h2 className="text-[13.5px] font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
