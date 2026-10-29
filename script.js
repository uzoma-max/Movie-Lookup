const API_URL = "https://www.omdbapi.com/";
const CACHE_KEY = "featured-movies-v1";
const CACHE_HOURS = 24;

// IMDb IDs for the homepage rows.
const POPULAR = [
  "tt1375666", // Inception
  "tt0468569", // The Dark Knight
  "tt0816692", // Interstellar
  "tt0133093", // The Matrix
  "tt1745960", // Top Gun: Maverick
  "tt15398776", // Oppenheimer
];
const ANIMATED = [
  "tt0245429", // Spirited Away
  "tt4633694", // Spider-Man: Into the Spider-Verse
  "tt0114709", // Toy Story
  "tt0110357", // The Lion King
  "tt2380307", // Coco
  "tt2948356", // Zootopia
];

const form = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const message = document.getElementById("message");
const home = document.getElementById("home");
const results = document.getElementById("results");
const details = document.getElementById("details");

let lastView = "home";

async function callApi(params) {
  const url = `${API_URL}?${new URLSearchParams({ apikey: OMDB_API_KEY, ...params })}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Movie search is unavailable right now. Please try again later.");
  const data = await response.json();
  if (data.Response === "False") throw new Error(data.Error);
  return data;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function posterOrPlaceholder(poster, title) {
  if (poster && poster !== "N/A") {
    return `<img src="${poster}" alt="Poster for ${escapeHtml(title)}" loading="lazy">`;
  }
  return `<div class="no-poster">No poster</div>`;
}

function card(movie, index) {
  const rating = movie.imdbRating && movie.imdbRating !== "N/A"
    ? `<span class="badge">★ ${movie.imdbRating}</span>` : "";
  return `
    <button class="card" data-id="${movie.imdbID}" style="--delay: ${index * 60}ms">
      <div class="poster">${posterOrPlaceholder(movie.Poster, movie.Title)}${rating}</div>
      <span class="card-title">${escapeHtml(movie.Title)}</span>
      <span class="card-meta">${movie.Year} · ${movie.Type}</span>
    </button>
  `;
}

function skeletons(count) {
  return Array.from({ length: count }, () => `<div class="card skeleton"><div class="poster"></div><span></span><span></span></div>`).join("");
}

function show(view) {
  home.hidden = view !== "home";
  results.hidden = view !== "results";
  details.hidden = view !== "details";
  if (view !== "details") lastView = view;
}

// Homepage rows are cached for a day so each visit doesn't use up API requests.
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_HOURS * 3600 * 1000) return cached.movies;
  } catch {
    // Storage blocked or corrupt: fetch fresh.
  }
  return null;
}

function writeCache(movies) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), movies }));
  } catch {
    // Ignore: caching is only an optimisation.
  }
}

async function loadHome() {
  const popularRow = document.getElementById("popular");
  const animatedRow = document.getElementById("animated");
  popularRow.innerHTML = skeletons(POPULAR.length);
  animatedRow.innerHTML = skeletons(ANIMATED.length);

  let movies = readCache();
  if (!movies) {
    const ids = [...POPULAR, ...ANIMATED];
    const settled = await Promise.allSettled(ids.map((id) => callApi({ i: id })));
    movies = {};
    settled.forEach((result, i) => {
      if (result.status === "fulfilled") movies[ids[i]] = result.value;
    });
    if (Object.keys(movies).length === ids.length) writeCache(movies);
  }

  const render = (ids) => ids.filter((id) => movies[id]).map((id, i) => card(movies[id], i)).join("");
  popularRow.innerHTML = render(POPULAR);
  animatedRow.innerHTML = render(ANIMATED);

  if (!popularRow.innerHTML && !animatedRow.innerHTML) {
    message.textContent = "Couldn't load featured movies. You can still search above.";
  }
}

async function search(query) {
  message.textContent = "Searching...";
  results.innerHTML = skeletons(6);
  show("results");

  try {
    const data = await callApi({ s: query });
    message.textContent = `${data.totalResults} result${data.totalResults === "1" ? "" : "s"} for "${query}"`;
    results.innerHTML = data.Search.map(card).join("");
  } catch (error) {
    results.innerHTML = "";
    message.textContent = error.message;
  }
}

async function showDetails(id) {
  message.textContent = "Loading...";
  try {
    const movie = await callApi({ i: id, plot: "full" });
    message.textContent = "";
    show("details");
    details.innerHTML = `
      <button class="back" id="back">← Back</button>
      <div class="details-body">
        ${posterOrPlaceholder(movie.Poster, movie.Title)}
        <div>
          <h2>${escapeHtml(movie.Title)} <span class="year">(${movie.Year})</span></h2>
          <p class="meta">${[movie.Rated, movie.Runtime, movie.Genre].filter((v) => v && v !== "N/A").join(" · ")}</p>
          ${movie.imdbRating !== "N/A" ? `<p class="rating">★ ${movie.imdbRating}<span>/10 on IMDb</span></p>` : ""}
          <p>${escapeHtml(movie.Plot)}</p>
          <dl>
            <dt>Director</dt><dd>${escapeHtml(movie.Director)}</dd>
            <dt>Cast</dt><dd>${escapeHtml(movie.Actors)}</dd>
            <dt>Released</dt><dd>${escapeHtml(movie.Released)}</dd>
          </dl>
          <a href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank" rel="noopener">View on IMDb</a>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("back").addEventListener("click", () => {
      if (lastView === "results") {
        show("results");
        message.textContent = "";
      } else {
        show("home");
      }
    });
  } catch (error) {
    message.textContent = error.message;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (query) search(query);
});

document.addEventListener("click", (event) => {
  const clicked = event.target.closest(".card[data-id]");
  if (clicked) showDetails(clicked.dataset.id);
});

// Clearing the search box returns to the homepage.
queryInput.addEventListener("input", () => {
  if (!queryInput.value) {
    message.textContent = "";
    show("home");
  }
});

show("home");
loadHome();
