import { getMovies } from "../movies.js";

export function createMoviesView({ dom, state, toast, onSelectMovie }) {
  const { moviesDiv, moviesMeta } = dom;

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
        onSelectMovie?.(movie.id);
      };

      moviesDiv.appendChild(btn);
    });

    renderMovieButtons();
  }

  function clear() {
    state.movies = [];
    state.movieId = null;
    moviesDiv.innerHTML = "";
    moviesMeta.textContent = "";
  }

  return { loadMovies, clear };
}

