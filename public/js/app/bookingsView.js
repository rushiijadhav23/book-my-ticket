import { getMyBookings } from "../seats.js";
import { escapeHtml } from "./utils.js";

export function createBookingsView({ dom, toast }) {
  const { bookingsWrap, bookingsEmpty, bookingsMeta } = dom;

  async function loadMyBookings() {
    const bookings = await getMyBookings();
    if (bookings?.error) {
      toast(bookings.error, "error");
      return;
    }

    const items = Array.isArray(bookings) ? bookings : [];
    bookingsWrap.innerHTML = "";
    bookingsMeta.textContent = items.length ? `${items.length} total` : "";

    bookingsEmpty.classList.toggle("hidden", items.length > 0);
    if (!items.length) return;

    for (const b of items) {
      const div = document.createElement("div");
      div.className =
        "bg-slate-800/40 border border-slate-700/60 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2";

      const left = document.createElement("div");
      left.className = "text-slate-100 font-semibold";
      left.textContent = b.movie_name;

      const right = document.createElement("div");
      right.className = "text-sm text-slate-300 flex flex-wrap gap-x-3 gap-y-1";
      const seat = document.createElement("span");
      seat.innerHTML = `<span class="text-slate-400">Seat</span> <span class="font-semibold text-white">${escapeHtml(
        b.seat_number
      )}</span>`;
      const time = document.createElement("span");
      time.className = "text-slate-400";
      time.textContent = b.created_at ? new Date(b.created_at).toLocaleString() : "";

      right.appendChild(seat);
      right.appendChild(time);

      div.appendChild(left);
      div.appendChild(right);
      bookingsWrap.appendChild(div);
    }
  }

  function clear() {
    bookingsWrap.innerHTML = "";
    bookingsEmpty.classList.remove("hidden");
    bookingsMeta.textContent = "";
  }

  return { loadMyBookings, clear };
}

