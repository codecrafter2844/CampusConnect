import { useMemo, useState } from "react";
import { formatDateTime, money } from "./api";

const STATUS_TEXT = { CONFIRMED: "Confirmed", PENDING_PAYMENT: "Awaiting payment", CANCELLED: "Cancelled" };
const PAY_TEXT = {
  NOT_REQUIRED: "Free",
  PENDING: "Unpaid",
  PAID: "Paid",
  REFUND_PENDING: "Refund due",
  REFUNDED: "Refunded",
  VOID: "-",
};
const PAY_CLASS = { PAID: "green", PENDING: "amber", REFUND_PENDING: "red", REFUNDED: "grey", NOT_REQUIRED: "grey" };

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Registered students with payment status. Used by admin and organizer.
function RegistrationsTable({ rows, loading, events, eventId, setEventId, showClub, allowAll, onRefunded }) {
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("ALL");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (payment !== "ALL" && r.paymentStatus !== payment) return false;
      if (!term) return true;
      return [r.studentName, r.studentEmail, r.eventTitle, r.razorpayPaymentId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [rows, search, payment]);

  const collected = filtered
    .filter((r) => r.paymentStatus === "PAID")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  function downloadCsv() {
    const header = ["Student", "Email", "Event", ...(showClub ? ["Club"] : []), "Status", "Payment", "Amount", "Razorpay payment ID", "Registered at"];
    const lines = filtered.map((r) => [
      r.studentName, r.studentEmail, r.eventTitle, ...(showClub ? [r.clubName] : []),
      STATUS_TEXT[r.status] || r.status, PAY_TEXT[r.paymentStatus] || r.paymentStatus,
      r.amount, r.razorpayPaymentId || "", r.registeredAt || "",
    ]);
    const csv = [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "registrations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="st-toolbar wrap">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event">
          <option value="">{events.length ? "Choose an event" : "No events"}</option>
          {allowAll && <option value="ALL">All events</option>}
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <input
          type="search"
          placeholder="Search name, email or payment ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Payment status">
          <option value="ALL">All payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Unpaid</option>
          <option value="NOT_REQUIRED">Free</option>
          <option value="REFUND_PENDING">Refund due</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <button type="button" className="st-ghost" onClick={downloadCsv} disabled={filtered.length === 0}>
          Download CSV
        </button>
      </div>

      <div className="st-card st-table-wrap">
        {!eventId ? (
          <p className="st-empty">Choose an event to see who registered.</p>
        ) : loading ? (
          <p className="st-empty">Loading registrations...</p>
        ) : filtered.length === 0 ? (
          <p className="st-empty">No registrations match.</p>
        ) : (
          <>
            <table className="st-table">
              <thead>
                <tr>
                  <th>Student</th>
                  {showClub && <th>Event</th>}
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Registered</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.registrationId}>
                    <td>
                      <strong>{r.studentName}</strong>
                      <span className="st-sub">{r.studentEmail}</span>
                    </td>
                    {showClub && <td>{r.eventTitle}<span className="st-sub">{r.clubName}</span></td>}
                    <td>
                      <span className={`st-pill ${r.status === "CONFIRMED" ? "green" : r.status === "CANCELLED" ? "red" : "amber"}`}>
                        {STATUS_TEXT[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      <span className={`st-pill ${PAY_CLASS[r.paymentStatus] || "grey"}`}>
                        {PAY_TEXT[r.paymentStatus] || r.paymentStatus}
                      </span>
                      {r.razorpayPaymentId && <span className="st-sub mono">{r.razorpayPaymentId}</span>}
                    </td>
                    <td>{r.amount > 0 ? money(r.amount) : "-"}</td>
                    <td>{formatDateTime(r.registeredAt)}</td>
                    <td className="st-row-actions">
                      {r.paymentStatus === "REFUND_PENDING" && (
                        <button type="button" className="st-link" onClick={() => onRefunded(r)}>
                          Mark refunded
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="st-table-foot">
              {filtered.length} shown · {money(collected)} collected
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default RegistrationsTable;
