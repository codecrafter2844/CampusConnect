import { useState } from "react";
import Modal from "./Modal";

const CATEGORIES = ["Technical", "Workshop", "Cultural", "Sports", "Seminar", "Other"];

// Create or edit an event. `organizers` is only passed for the admin.
function EventFormModal({ event, organizers, onSave, onClose }) {
  const editing = Boolean(event);

  const [form, setForm] = useState({
    title: event?.title || "",
    category: event?.category || "Technical",
    date: event?.date || "",
    time: event?.time || "",
    location: event?.location || "",
    seats: event?.seats ?? 100,
    price: event?.price ?? 0,
    description: event?.description || "",
    icon: event?.icon || "",
    organizerId: event?.organizerId ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      seats: Number(form.seats),
      price: Number(form.price || 0),
      description: form.description.trim(),
      icon: form.icon.trim(),
    };

    if (organizers) {
      payload.organizerId = form.organizerId === "" ? null : Number(form.organizerId);
    }

    if (!Number.isInteger(payload.seats) || payload.seats < 1) {
      setError("Seats must be a whole number of at least 1.");
      return;
    }
    if (!Number.isInteger(payload.price) || payload.price < 0) {
      setError("Price must be a whole number of rupees (0 for a free event).");
      return;
    }

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? "Edit event" : "Create event"} onClose={onClose} wide>
      <form className="st-form" onSubmit={submit}>
        <label className="st-field span-2">
          <span>Event title</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={150} />
        </label>

        <label className="st-field">
          <span>Category</span>
          <select value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label className="st-field">
          <span>Location</span>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} required />
        </label>

        <label className="st-field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </label>

        <label className="st-field">
          <span>Time</span>
          <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} required />
        </label>

        <label className="st-field">
          <span>Total seats</span>
          <input type="number" min="1" value={form.seats} onChange={(e) => set("seats", e.target.value)} required />
        </label>

        <label className="st-field">
          <span>Ticket price (₹, 0 = free)</span>
          <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </label>

        {organizers && (
          <label className="st-field span-2">
            <span>Hosted by</span>
            <select value={form.organizerId} onChange={(e) => set("organizerId", e.target.value)}>
              <option value="">College (admin)</option>
              {organizers.filter((o) => o.active || o.id === event?.organizerId).map((o) => (
                <option key={o.id} value={o.id}>{o.clubName}</option>
              ))}
            </select>
          </label>
        )}

        <label className="st-field span-2">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
        </label>

        <label className="st-field">
          <span>Icon (optional emoji)</span>
          <input value={form.icon} onChange={(e) => set("icon", e.target.value)} maxLength={4} placeholder="🎤" />
        </label>

        {error && <p className="st-error span-2" role="alert">{error}</p>}

        <div className="st-actions span-2">
          <button type="button" className="st-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="st-primary" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save changes" : "Create event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EventFormModal;
