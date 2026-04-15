import { register, login } from "./auth.js";
import { getMovies } from "./movies.js";
import { getSeats, bookSeat } from "./seats.js";

// DOM
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const moviesDiv = document.getElementById("movies");
const table = document.getElementById("tbl");

window.onload = () => {
  if (localStorage.getItem("token")) {
    loadMovies();
  }
};

// AUTH
window.register = async () => {
  const res = await register(emailInput.value, passwordInput.value);
  alert(res.message || res.error);
};

window.login = async () => {
  const res = await login(emailInput.value, passwordInput.value);

  if (res.token) {
    alert("Login success");
    loadMovies();
  } else {
    alert(res.error);
  }
};

// MOVIES
async function loadMovies() {
  const movies = await getMovies();
  moviesDiv.innerHTML = "";

  movies.forEach((movie) => {
    const btn = document.createElement("button");
    btn.innerText = movie.name;
    btn.className = "bg-purple-500 px-4 py-2 m-2 rounded";

    btn.onclick = () => loadSeats(movie.id);

    moviesDiv.appendChild(btn);
  });
}

// SEATS
async function loadSeats(movieId) {
  const seats = await getSeats(movieId);
  table.innerHTML = "";

  let tr;

  for (let i = 0; i < seats.length; i++) {
    if (i % 8 === 0) tr = document.createElement("tr");

    const td = document.createElement("td");

    if (seats[i].isbooked) {
      td.className = "bg-red-300 p-6 cursor-not-allowed";
      td.innerText = seats[i].seat_number; 
    } else {
      td.className = "bg-green-400 p-6 cursor-pointer";
      td.innerText = seats[i].seat_number;

      td.onclick = async () => {
        const res = await bookSeat(seats[i].id); // keep id for API

        if (res.error) {
          alert(res.error);
        } else {
          alert("Booked!");
          loadSeats(movieId);
        }
      };
    }

    tr.appendChild(td);
    table.appendChild(tr);
  }
}