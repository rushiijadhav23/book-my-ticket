import { register, login } from "./auth.js";
import { getMovies } from "./movies.js";
import { getSeats, bookSeat, getMyBookings } from "./seats.js";

// DOM
const authCard = document.getElementById("authCard");
const app = document.getElementById("app");
const authStatus = document.getElementById("authStatus");
const welcomeName = document.getElementById("welcomeName");
const myBookingsBtn = document.getElementById("myBookingsBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const signInPanel = document.getElementById("signInPanel");
const registerPanel = document.getElementById("registerPanel");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showSignInBtn = document.getElementById("showSignInBtn");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerBtn = document.getElementById("registerBtn");

const moviesDiv = document.getElementById("movies");
const moviesMeta = document.getElementById("moviesMeta");

const seatSub = document.getElementById("seatSub");
const seatGrid = document.getElementById("seatGrid");
const seatEmpty = document.getElementById("seatEmpty");
const seatLoading = document.getElementById("seatLoading");
const refreshSeatsBtn = document.getElementById("refreshSeatsBtn");

const bookingsWrap = document.getElementById("bookings");
const bookingsEmpty = document.getElementById("bookingsEmpty");
const bookingsMeta = document.getElementById("bookingsMeta");

const toastHost = document.getElementById("toastHost");

let state = {
  movieId: null,
  movies: [],
  seats: [],
  selectedSeatId: null,
  busy: false,
};

window.onload = () => {
  bindEvents();
  syncAuthUI();
};

function bindEvents() {
  loginBtn.addEventListener("click", onLogin);
  registerBtn.addEventListener("click", onRegister);
  logoutBtn.addEventListener("click", onLogout);
  myBookingsBtn.addEventListener("click", loadMyBookings);
  refreshSeatsBtn.addEventListener("click", () => state.movieId && loadSeats(state.movieId));
  showRegisterBtn?.addEventListener("click", () => setAuthMode("register"));
  showSignInBtn?.addEventListener("click", () => setAuthMode("signin"));

  // Enter key support
  [loginEmail, loginPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onLogin();
    })
  );
  [firstNameInput, lastNameInput, registerEmail, registerPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onRegister();
    })
  );
}

function isAuthed() {
  return Boolean(localStorage.getItem("token"));
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  loginBtn.disabled = isBusy;
  registerBtn.disabled = isBusy;
  refreshSeatsBtn.disabled = isBusy;
  myBookingsBtn.disabled = isBusy;

  const disabledClass = "opacity-60 cursor-not-allowed";
  [loginBtn, registerBtn, refreshSeatsBtn, myBookingsBtn].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("opacity-60", isBusy);
    btn.classList.toggle("cursor-not-allowed", isBusy);
  });
}

function toast(message, type = "info") {
  const el = document.createElement("div");
  const colors =
    type === "success"
      ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-100"
      : type === "error"
        ? "bg-rose-500/15 border-rose-400/40 text-rose-100"
        : "bg-slate-500/15 border-slate-400/40 text-slate-100";

  el.className = `max-w-sm w-[min(420px,90vw)] border ${colors} backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg`;
  el.innerHTML = `<div class="text-sm font-semibold">${escapeHtml(message)}</div>`;

  toastHost.appendChild(el);
  setTimeout(() => el.classList.add("opacity-0", "transition", "duration-300"), 2600);
  setTimeout(() => el.remove(), 3000);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function syncAuthUI() {
  const authed = isAuthed();
  authCard.classList.toggle("hidden", authed);
  app.classList.toggle("hidden", !authed);
  logoutBtn.classList.toggle("hidden", !authed);
  myBookingsBtn.classList.toggle("hidden", !authed);

  authStatus.textContent = authed ? "Logged in" : "Logged out";

  const user = getStoredUser();
  const name =
    user?.firstName || user?.lastName
      ? [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      : null;

  if (authed && name) {
    welcomeName.classList.remove("hidden");
    welcomeName.textContent = ` • Welcome, ${name}`;
  } else {
    welcomeName.classList.add("hidden");
    welcomeName.textContent = "";
  }

  if (authed) {
    loadMovies();
    loadMyBookings();
  } else {
    setAuthMode("signin");
    clearAppData();
  }
}

function setAuthMode(mode) {
  const isRegister = mode === "register";
  signInPanel?.classList.toggle("hidden", isRegister);
  registerPanel?.classList.toggle("hidden", !isRegister);
}

function clearAppData() {
  state = { movieId: null, movies: [], seats: [], selectedSeatId: null, busy: false };
  moviesDiv.innerHTML = "";
  moviesMeta.textContent = "";
  seatGrid.innerHTML = "";
  seatSub.textContent = "Select a movie to load seats.";
  seatEmpty.classList.remove("hidden");
  seatLoading.classList.add("hidden");
  refreshSeatsBtn.classList.add("hidden");
  bookingsWrap.innerHTML = "";
  bookingsEmpty.classList.remove("hidden");
  bookingsMeta.textContent = "";
}

async function onRegister() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  if (!email || !password) return toast("Email and password are required.", "error");
  setBusy(true);

  const res = await register({ firstName, lastName, email, password });
  setBusy(false);

  if (res?.error) return toast(res.error, "error");
  toast(res?.message || "Registered successfully. You can log in now.", "success");
  // Nice UX: move email to login panel.
  loginEmail.value = email;
  loginPassword.value = "";
  setAuthMode("signin");
}

async function onLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) return toast("Email and password are required.", "error");

  setBusy(true);
  const res = await login(email, password);
  setBusy(false);

  if (res?.token) {
    toast("Welcome back!", "success");
    syncAuthUI();
  } else {
    toast(res?.error || "Login failed.", "error");
  }
}

function onLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  toast("Logged out.", "info");
  syncAuthUI();
}

// MOVIES
async function loadMovies() {
  const movies = await getMovies();
  if (movies?.error) {
    toast(movies.error, "error");
    return;
  }
  state.movies = Array.isArray(movies) ? movies : [];
  moviesDiv.innerHTML = "";
  moviesMeta.textContent = `${state.movies.length} available`;

  state.movies.forEach((movie) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = movie.name;
    btn.className =
      "px-4 py-2 rounded-xl text-sm font-semibold border transition " +
      (state.movieId === movie.id
        ? "bg-purple-500/20 border-purple-400/40 text-purple-100"
        : "bg-slate-800/40 border-slate-700/60 text-slate-200 hover:bg-slate-700/50");

    btn.onclick = () => {
      state.movieId = movie.id;
      state.selectedSeatId = null;
      renderMovieButtons();
      loadSeats(movie.id);
    };

    moviesDiv.appendChild(btn);
  });

  renderMovieButtons();
}

function renderMovieButtons() {
  [...moviesDiv.querySelectorAll("button")].forEach((btn) => {
    const movie = state.movies.find((m) => m.name === btn.innerText);
    if (!movie) return;
    const active = state.movieId === movie.id;
    btn.className =
      "px-4 py-2 rounded-xl text-sm font-semibold border transition " +
      (active
        ? "bg-purple-500/20 border-purple-400/40 text-purple-100"
        : "bg-slate-800/40 border-slate-700/60 text-slate-200 hover:bg-slate-700/50");
  });
}

// SEATS
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

  // Sort by seat_number if present.
  state.seats.sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0));
  renderSeats();
}

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
          : "bg-emerald-500/15 border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/25");

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
  await loadMyBookings();
}

// BOOKINGS
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