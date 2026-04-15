import { createState } from "./app/state.js";
import { createToaster } from "./app/toast.js";
import { bindAuthView } from "./app/authView.js";
import { createMoviesView } from "./app/moviesView.js";
import { createSeatsView } from "./app/seatsView.js";
import { createBookingsView } from "./app/bookingsView.js";

const dom = {
  // layout
  authCard: document.getElementById("authCard"),
  app: document.getElementById("app"),
  authStatus: document.getElementById("authStatus"),
  welcomeName: document.getElementById("welcomeName"),
  myBookingsBtn: document.getElementById("myBookingsBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  // auth
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginBtn: document.getElementById("loginBtn"),
  signInPanel: document.getElementById("signInPanel"),
  registerPanel: document.getElementById("registerPanel"),
  showRegisterBtn: document.getElementById("showRegisterBtn"),
  showSignInBtn: document.getElementById("showSignInBtn"),
  firstNameInput: document.getElementById("firstName"),
  lastNameInput: document.getElementById("lastName"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  registerBtn: document.getElementById("registerBtn"),

  // movies
  moviesDiv: document.getElementById("movies"),
  moviesMeta: document.getElementById("moviesMeta"),

  // seats
  seatSub: document.getElementById("seatSub"),
  seatGrid: document.getElementById("seatGrid"),
  seatEmpty: document.getElementById("seatEmpty"),
  seatLoading: document.getElementById("seatLoading"),
  refreshSeatsBtn: document.getElementById("refreshSeatsBtn"),

  // bookings
  bookingsWrap: document.getElementById("bookings"),
  bookingsEmpty: document.getElementById("bookingsEmpty"),
  bookingsMeta: document.getElementById("bookingsMeta"),

  // toast
  toastHost: document.getElementById("toastHost"),
};

const state = createState();
const toast = createToaster(dom.toastHost);

function setBusy(isBusy) {
  state.busy = isBusy;
  dom.loginBtn.disabled = isBusy;
  dom.registerBtn.disabled = isBusy;
  dom.refreshSeatsBtn.disabled = isBusy;
  dom.myBookingsBtn.disabled = isBusy;

  [dom.loginBtn, dom.registerBtn, dom.refreshSeatsBtn, dom.myBookingsBtn].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("opacity-60", isBusy);
    btn.classList.toggle("cursor-not-allowed", isBusy);
  });
}

const bookingsView = createBookingsView({ dom, toast });
const seatsView = createSeatsView({
  dom,
  state,
  toast,
  setBusy,
  onBooked: () => bookingsView.loadMyBookings(),
});
const moviesView = createMoviesView({
  dom,
  state,
  toast,
  onSelectMovie: (movieId) => seatsView.loadSeats(movieId),
});

function clearApp() {
  moviesView.clear();
  seatsView.clear();
  bookingsView.clear();
}

window.onload = () => {
  dom.myBookingsBtn.addEventListener("click", () => bookingsView.loadMyBookings());
  dom.refreshSeatsBtn.addEventListener("click", () => state.movieId && seatsView.loadSeats(state.movieId));

  bindAuthView({
    dom,
    toast,
    setBusy,
    onAuthed: async () => {
      await moviesView.loadMovies();
      await bookingsView.loadMyBookings();
    },
    onLoggedOut: () => clearApp(),
  });
};