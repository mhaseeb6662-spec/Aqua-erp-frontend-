export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm animate-rise border border-slate-200 shadow-xl">
        <h3 className="text-lg font-bold text-marine">{title}</h3>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
