const STYLES = {
  active: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  inactive: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
  suspended: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.inactive;
  return (
    <span className={`badge ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
