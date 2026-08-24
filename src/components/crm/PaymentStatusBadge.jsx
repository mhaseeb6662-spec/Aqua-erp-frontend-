import { PAYMENT_STATUS_STYLES } from '../../constants/crm';

export default function PaymentStatusBadge({ status }) {
  const style = PAYMENT_STATUS_STYLES[status] || PAYMENT_STATUS_STYLES.pending;
  return (
    <span className={`badge ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
