# Max-i-movie Lookup

Search for any movie or TV series and see its poster, IMDb rating, plot, director and cast. Built with plain HTML, CSS and JavaScript, using the free [OMDb API](https://www.omdbapi.com/).

**Try it live:** https://uzoma-max.github.io/Movie-Lookup/

## Features

- Homepage rows of popular movies and animation favourites, with ratings on each poster
- Search by title and browse results as poster cards
- Click a result to see full details: rating, runtime, genre, plot, director and cast
- Smooth animations: drifting hero glow, cards that slide in, hover zoom and loading shimmer
- Featured movies are cached for a day to save API requests
- Works on phones and supports dark mode

## How to run it

No installation needed. Clone the repo and open `index.html` in your browser:

```bash
git clone https://github.com/uzoma-max/Movie-Lookup.git
cd Movie-Lookup
open index.html   # on Windows: start index.html
```

The OMDb API key lives in `config.js`. To use your own, get a free one at https://www.omdbapi.com/apikey.aspx and replace it there.

## How it works

- `script.js` sends search requests to OMDb with `fetch`, then builds the result cards from the JSON it gets back.
- Clicking a card makes a second request by IMDb ID to load the full details.
- `style.css` uses CSS Grid for the card layout and the details page.

## What I learned

- Calling a REST API with `fetch` and `async`/`await`
- Turning JSON data into HTML
- Handling errors and loading states
- Keeping configuration like API keys in a separate file
