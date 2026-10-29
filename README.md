# Max-i-movie Lookup

Search for any movie or TV series and see its poster, IMDb rating, plot, director and cast. Built with plain HTML, CSS and JavaScript, using the free [OMDb API](https://www.omdbapi.com/).

**Try it live:** https://uzoma-max.github.io/movie-lookup/

## Features

- Search by title and browse results as poster cards
- Click a result to see full details: rating, runtime, genre, plot, director and cast
- Friendly messages for no results or a bad API key
- Works on phones and supports dark mode

## How to run it

No installation needed. Clone the repo and open `index.html` in your browser:

```bash
git clone https://github.com/uzoma-max/movie-lookup.git
cd movie-lookup
open index.html   # on Windows: start index.html
```

The app comes with a free OMDb API key in `config.js`. To use your own, get one at https://www.omdbapi.com/apikey.aspx and either replace the key in `config.js` or click **Change API key** at the bottom of the page.

## How it works

- `script.js` sends search requests to OMDb with `fetch`, then builds the result cards from the JSON it gets back.
- Clicking a card makes a second request by IMDb ID to load the full details.
- `style.css` uses CSS Grid for the card layout and the details page.

## What I learned

- Calling a REST API with `fetch` and `async`/`await`
- Turning JSON data into HTML
- Handling errors and loading states
- Keeping configuration like API keys in a separate file
