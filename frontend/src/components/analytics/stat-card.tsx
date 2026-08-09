import { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        <Icon size={16} className="text-neutral-400" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{value}</p>
    </div>
  );
}