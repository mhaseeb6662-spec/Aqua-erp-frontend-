import React from 'react';
import AcademyLogo from '../common/AcademyLogo';
import { formatAED } from '../../utils/currency';

/**
 * Format date in standard reference format: "Sep 02, 2026"
 */
function formatReceiptDate(dateVal) {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Cleanly format payment method name matching client standards
 */
function formatPaymentMethodName(method, provider) {
  const m = (method || '').trim();
  const p = (provider || '').trim();
  const lower = `${m} ${p}`.toLowerCase();

  if (lower.includes('totalpay') || lower.includes('total pay')) return 'Total Pay';
  if (lower.includes('paytabs')) return 'PayTabs';
  if (lower.includes('tabby')) return 'Tabby';
  if (lower.includes('pos') || lower.includes('physical') || lower.includes('card machine')) {
    return 'Physical Card / POS Machine';
  }
  if (lower.includes('cash')) return 'Cash';
  if (lower.includes('bank') || lower.includes('wire')) return 'Bank Transfer';
  if (lower.includes('online')) return 'Online Payment Gateway';

  return m || p || 'Direct Payment';
}

/**
 * Exact Client-Provided Receipt Document
 * Matches client WhatsApp reference (media_1788766163022.jpg)
 */
export default function ReceiptDocument({ receipt, id = 'printable-receipt' }) {
  if (!receipt) return null;

  const invoice = receipt.invoice || {};
  const customer = receipt.customer || invoice.customer || invoice.student || {};
  const student = invoice.student || customer;

  const receiptNum = receipt.receiptNumber || 'RCT-000000';
  const invoiceNum = invoice.invoiceNumber ? (invoice.invoiceNumber.startsWith('AFA-') ? invoice.invoiceNumber : `AFA-${invoice.invoiceNumber}`) : 'AFA-INV';
  const datePaid = formatReceiptDate(receipt.paidAt || receipt.issuedAt || receipt.createdAt);
  const paymentMethodStr = formatPaymentMethodName(receipt.paymentMethod, receipt.payment?.provider);
  const amountPaid = Number(receipt.amountPaid ?? receipt.payment?.amount ?? 0);

  // Line items extraction
  const rawLineItems = invoice.lineItems && invoice.lineItems.length > 0
    ? invoice.lineItems
    : [
        {
          item: invoice.program?.title || 'Aqua Fishing Academy Course / Program',
          description: invoice.notes || 'Maritime Angling Instruction & Training Session',
          quantity: 1,
          unitPrice: amountPaid,
          discount: { amount: 0 },
          amount: amountPaid,
          validity: null,
        },
      ];

  const subtotal = invoice.subtotal !== undefined && invoice.subtotal !== null
    ? Number(invoice.subtotal)
    : amountPaid;

  const roundingAdjustment = invoice.roundingAdjustment !== undefined && invoice.roundingAdjustment !== null
    ? Number(invoice.roundingAdjustment)
    : 0;

  const totalInvoice = invoice.totalAmount !== undefined && invoice.totalAmount !== null
    ? Number(invoice.totalAmount)
    : amountPaid;

  return (
    <div
      id={id}
      className="printable-document receipt-document w-full max-w-3xl mx-auto bg-white p-8 sm:p-10 text-slate-800 shadow-sm border border-slate-200 rounded-2xl font-sans print:shadow-none print:border-none print:p-0"
      style={{ minHeight: '840px' }}
    >
      {/* 1. HEADER: Bold "Receipt" on Left, Official Academy Logo on Right */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Receipt
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
            Aqua Fishing Academy
          </p>
        </div>
        <div className="flex items-center">
          <AcademyLogo variant="invoice" className="h-14 sm:h-16 w-auto object-contain" />
        </div>
      </div>

      {/* 2. RECEIPT METADATA (2 COLUMNS) */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs sm:text-sm">
        <div className="space-y-3">
          <div>
            <div className="text-slate-500 font-medium">Receipt number</div>
            <div className="font-bold text-slate-900 font-mono text-sm sm:text-base mt-0.5">
              {receiptNum}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Date paid</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {datePaid}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-slate-500 font-medium">Invoice number</div>
            <div className="font-bold text-slate-900 font-mono text-sm sm:text-base mt-0.5">
              {invoiceNum}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Payment method</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {paymentMethodStr}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BILLING INFO (BILL FROM / BILL TO) */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs sm:text-sm">
        {/* BILL FROM */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            BILL FROM
          </div>
          <div className="font-bold text-slate-900 text-sm">
            Aqua Fishing Academy
          </div>
          <div className="text-slate-600">
            Dubai Marina / United Arab Emirates
          </div>
          <div className="text-slate-600">
            +971 56 990 5688
          </div>
          <div className="text-slate-600">
            info@aquafishingacademy.com
          </div>
          <div className="text-slate-600">
            www.aquafishingacademy.com
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            TRN: 100482910400003
          </div>
        </div>

        {/* BILL TO */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            BILL TO
          </div>
          <div className="font-bold text-slate-900 text-sm">
            {customer.fullName || 'Valued Customer'}
          </div>
          {student && student.fullName && student.fullName !== customer.fullName && (
            <div className="text-xs text-tide font-medium">
              Student: {student.fullName}
              {student.studentCode ? ` (ID: ${student.studentCode})` : ''}
            </div>
          )}
          {customer.phone && (
            <div className="text-slate-600">
              {customer.phone}
            </div>
          )}
          {customer.email ? (
            <div className="text-slate-600">
              {customer.email}
            </div>
          ) : (
            <div className="text-slate-400 italic text-[11px]">
              No email registered
            </div>
          )}
          {customer.address && (
            <div className="text-slate-600 text-[11px]">
              {customer.address}
            </div>
          )}
        </div>
      </div>

      {/* 4. PROMINENT LARGE HEADLINE: AED [amount] Paid via [paymentMethod] on [date] */}
      <div className="py-6 border-b border-slate-200">
        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatAED(amountPaid)} Paid via {paymentMethodStr} on {datePaid}
        </h2>
      </div>

      {/* 5. ITEMS TABLE */}
      <div className="py-4 border-b border-slate-200">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              <th className="py-2.5 pr-4">DESCRIPTION</th>
              <th className="py-2.5 px-2 text-center w-14">QTY</th>
              <th className="py-2.5 px-2 text-right w-24">UNIT PRICE</th>
              <th className="py-2.5 px-2 text-right w-20">DISCOUNT</th>
              <th className="py-2.5 pl-2 text-right w-24">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rawLineItems.map((item, idx) => {
              const itemTitle = item.item || item.description || 'Program Session';
              const itemSubtitle = item.description && item.item && item.description !== item.item
                ? item.description
                : null;
              const discAmt = item.discount?.amount || 0;

              return (
                <tr key={idx} className="align-top">
                  <td className="py-3.5 pr-4 space-y-1">
                    <div className="font-bold text-slate-900">
                      {itemTitle}
                    </div>
                    {itemSubtitle && (
                      <div className="text-xs text-slate-500">
                        {itemSubtitle}
                      </div>
                    )}
                    {item.validity && (
                      <div className="text-xs text-slate-500 font-medium">
                        Validity {formatReceiptDate(item.validity)}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-center text-slate-700 font-medium">
                    {item.quantity || 1}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-700 font-mono">
                    {formatAED(item.unitPrice || item.amount || 0)}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-500 font-mono">
                    {discAmt > 0 ? `-${formatAED(discAmt)}` : '0.00'}
                  </td>
                  <td className="py-3.5 pl-2 text-right font-bold text-slate-900 font-mono">
                    {formatAED(item.amount || ((item.unitPrice || 0) * (item.quantity || 1) - discAmt))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. TOTALS BLOCK & 7. PAYMENTS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 pb-4 border-b border-slate-200">
        {/* BOTTOM LEFT: PAYMENTS SECTION */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Payments
          </h3>
          <div className="text-xs sm:text-sm text-slate-700 font-medium space-y-1">
            <div>
              {formatAED(amountPaid)} payment via {paymentMethodStr} on {datePaid}
            </div>
            {receipt.payment?.transactionId && (
              <div className="text-[11px] text-slate-400 font-mono">
                Transaction ID: {receipt.payment.transactionId}
              </div>
            )}
            {receipt.payment?.cardLast4 && (
              <div className="text-[11px] text-slate-500">
                Card ending in **** {receipt.payment.cardLast4}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM RIGHT: TOTALS BREAKDOWN */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatAED(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Rounded off</span>
            <span className="font-semibold text-slate-900 font-mono">
              {roundingAdjustment !== 0 ? formatAED(roundingAdjustment) : '0.00'}
            </span>
          </div>

          <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-2 text-sm sm:text-base">
            <span>Total</span>
            <span className="font-mono">
              {formatAED(totalInvoice)}
            </span>
          </div>

          {/* Paid line matching client screenshot: "Paid  - AED [amount]" */}
          <div className="flex justify-between text-slate-900 font-bold text-sm sm:text-base pt-1">
            <span>Paid</span>
            <span className="font-mono text-slate-900">
              - {formatAED(amountPaid)}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <p>Thank you for choosing Aqua Fishing Academy.</p>
        <p className="font-mono">Aqua Fishing Academy ERP &bull; Official Payment Receipt</p>
      </div>
    </div>
  );
}
