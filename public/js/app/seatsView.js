import { getSeats, bookSeat } from "../seats.js";

export function createSeatsView({ dom, state, toast, setBusy, onBooked }) {
  const {
    seatSub,
    seatGrid,
    seatEmpty,
    seatLoading,
    refreshSeatsBtn,
  } = dom;

  function renderSeats() {
    seatGrid.innerHTML = "";
    if (!state.seats.length) {
      seatEmpty.classList.remove("hidden");
      seatEmpty.textContent = "No seats found for this movie.";
      return;
    }
    seatEmpty.classList.add("hidden");

    for (const seat of state.seats) {
      const isBooked = Boolean(seat.isbooked);
      const isSelected = state.selectedSeatId === seat.id;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.disabled = isBooked || state.busy;
      btn.title = isBooked ? "Booked" : "Available";
      btn.className =
        "h-10 rounded-xl border text-sm font-bold transition " +
        (isBooked
          ? "bg-rose-500/10 border-rose-400/30 text-rose-200 cursor-not-allowed"
          : isSelected
            ? "bg-slate-500/40 border-slate-300/30 text-white"
            : "bg-pink-500/15 border-pink-400/30 text-pink-100 hover:bg-pink-500/25");

      btn.textContent = seat.seat_number ?? "?";

      btn.addEventListener("click", async () => {
        if (state.busy) return;
        state.selectedSeatId = seat.id;
        renderSeats();
        await confirmAndBook(state.movieId, seat.id, seat.seat_number);
      });

      seatGrid.appendChild(btn);
    }
  }

  async function loadSeats(movieId) {
    seatEmpty.classList.add("hidden");
    seatLoading.classList.remove("hidden");
    seatGrid.innerHTML = "";
    refreshSeatsBtn.classList.remove("hidden");
    seatSub.textContent = "Loading seats…";

    const seats = await getSeats(movieId);
    seatLoading.classList.add("hidden");

    if (seats?.error) {
      toast(seats.error, "error");
      seatSub.textContent = "Failed to load seats.";
      return;
    }

    state.seats = Array.isArray(seats) ? seats : [];
    const movie = state.movies.find((m) => m.id === movieId);
    seatSub.textContent = movie ? `Now viewing: ${movie.name}` : "Seats";

    state.seats.sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0));
    renderSeats();
  }

  async function confirmAndBook(movieId, seatId, seatNumber) {
    if (!movieId) return;
    const movie = state.movies.find((m) => m.id === movieId);
    const ok = window.confirm(`Book seat ${seatNumber} for "${movie?.name ?? "this movie"}"?`);
    if (!ok) {
      state.selectedSeatId = null;
      renderSeats();
      return;
    }

    setBusy(true);
    const res = await bookSeat(movieId, seatId);
    setBusy(false);

    if (res?.error) {
      toast(res.error, "error");
      state.selectedSeatId = null;
      await loadSeats(movieId);
      return;
    }

    toast("Seat booked!", "success");
    state.selectedSeatId = null;
    await loadSeats(movieId);
    onBooked?.();
  }

  function clear() {
    state.seats = [];
    state.selectedSeatId = null;
    seatGrid.innerHTML = "";
    seatSub.textContent = "Select a movie to load seats.";
    seatEmpty.classList.remove("hidden");
    seatEmpty.textContent = "No movie selected.";
    seatLoading.classList.add("hidden");
    refreshSeatsBtn.classList.add("hidden");
  }

  return { loadSeats, clear, renderSeats };
}

