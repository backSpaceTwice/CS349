// To-Do

// API key
const API_KEY = CONFIG.API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BASE_URL = "https://api.themoviedb.org/3";

let currentPage = 1;
let currentQuery = "";
let currentSort = "popularity.desc";
let totalPages = 1;

// --- DOM Elements ---
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const movieGrid = document.getElementById("movie-grid");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

// --- Fetch Movies ---
async function fetchMovies() {
  let url;

  if (currentQuery) {
    // Search mode: use search endpoint (note: search doesn't support sort_by)
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
  } else {
    // Discovery mode: use discover endpoint (supports sort_by)
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${currentSort}&page=${currentPage}`;
  }

  try {
    movieGrid.innerHTML = '<p class="loading">Loading...</p>';
    const response = await fetch(url);
    const data = await response.json();

    totalPages = data.total_pages || 1;
    populateGrid(data.results);
    updatePagination();
  } catch (error) {
    movieGrid.innerHTML =
      '<p class="error">Something went wrong. Please check your API key.</p>';
  }
}

// --- Populate Grid ---
function populateGrid(movies) {
  if (!movies || movies.length === 0) {
    movieGrid.innerHTML = '<p class="no-results">No movies found.</p>';
    return;
  }

  movieGrid.innerHTML = movies
    .map(
      (movie) => `
    <div class="movie-card">
      <img
        src="${movie.poster_path ? IMG_BASE + movie.poster_path : "https://via.placeholder.com/500x750?text=No+Image"}"
        alt="${movie.title}"
        onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'"
      />
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date || "N/A"}</p>
        <p>Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

// --- Pagination ---
function updatePagination() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// --- Search ---
let searchTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchMovies();
  }, 500); // debounce: wait 500ms after user stops typing
});

// --- Sort ---
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  currentPage = 1;
  fetchMovies();
});

// --- Initial Load ---
fetchMovies();
