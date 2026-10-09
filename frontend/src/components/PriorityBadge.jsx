const styles = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-orange-50 text-orange-800 border-orange-200',
  high: 'bg-red-50 text-red-800 border-red-200',
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[priority] || ''}`}
    >
      {priority}
    </span>
  );
}
