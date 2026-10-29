const API_URL = "https://www.omdbapi.com/";
const STORAGE_KEY = "omdb-api-key";

const form = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const message = document.getElementById("message");
const results = document.getElementById("results");
const details = document.getElementById("details");
const keyDialog = document.getElementById("key-dialog");
const keyForm = document.getElementById("key-form");
const keyInput = document.getElementById("key-input");
const changeKeyButton = document.getElementById("change-key");

function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || OMDB_API_KEY;
  } catch {
    return OMDB_API_KEY;
  }
}

function askForKey() {
  keyInput.value = getApiKey();
  keyDialog.showModal();
}

keyForm.addEventListener("submit", () => {
  try {
    localStorage.setItem(STORAGE_KEY, keyInput.value.trim());
  } catch {
    // Storage blocked: the key only lasts for this visit.
  }
  window.sessionKey = keyInput.value.trim();
});

async function callApi(params) {
  const key = window.sessionKey || getApiKey();
  if (!key) {
    askForKey();
    throw new Error("Add an API key to start searching.");
  }

  const url = `${API_URL}?${new URLSearchParams({ apikey: key, ...params })}`;
  const response = await fetch(url);
  if (response.status === 401) {
    askForKey();
    throw new Error("That API key didn't work. Please check it and try again.");
  }
  const data = await response.json();
  if (data.Response === "False") throw new Error(data.Error);
  return data;
}

function posterOrPlaceholder(poster, title) {
  if (poster && poster !== "N/A") {
    return `<img src="${poster}" alt="Poster for ${escapeHtml(title)}" loading="lazy">`;
  }
  return `<div class="no-poster">No poster</div>`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function search(query) {
  message.textContent = "Searching...";
  results.innerHTML = "";
  details.hidden = true;

  try {
    const data = await callApi({ s: query });
    message.textContent = `${data.totalResults} result${data.totalResults === "1" ? "" : "s"} for "${query}"`;
    results.innerHTML = data.Search.map((movie) => `
      <button class="card" data-id="${movie.imdbID}">
        ${posterOrPlaceholder(movie.Poster, movie.Title)}
        <span class="card-title">${escapeHtml(movie.Title)}</span>
        <span class="card-meta">${movie.Year} · ${movie.Type}</span>
      </button>
    `).join("");
  } catch (error) {
    message.textContent = error.message;
  }
}

async function showDetails(id) {
  message.textContent = "Loading...";
  try {
    const movie = await callApi({ i: id, plot: "full" });
    message.textContent = "";
    results.innerHTML = "";
    details.hidden = false;
    details.innerHTML = `
      <button class="back" id="back">← Back to results</button>
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
    document.getElementById("back").addEventListener("click", () => search(queryInput.value.trim()));
  } catch (error) {
    message.textContent = error.message;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (query) search(query);
});

results.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (card) showDetails(card.dataset.id);
});

changeKeyButton.addEventListener("click", askForKey);
