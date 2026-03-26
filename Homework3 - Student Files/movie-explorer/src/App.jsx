import { useState, useEffect, useCallback } from "react";
import "./App.css";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState("popularity.desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    if (!API_KEY) {
      setError("API Key is missing. Please check your .env file.");
      return;
    }

    setLoading(true);
    setError(null);

    let url;
    if (debouncedQuery) {
      url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}`;
    } else {
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sort}&page=${currentPage}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Something went wrong. Please check your API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery, sort]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="App">
      <header>
        <h1>Movie Explorer</h1>
      </header>

      <div className="controls">
        <input
          type="text"
          id="search-input"
          placeholder="Search for a movie..."
          value={query}
          onChange={handleSearch}
        />

        <select id="sort-select" value={sort} onChange={handleSort}>
          <option value="popularity.desc">Sort By: Popularity</option>
          <option value="release_date.asc">Sort By: Release Date (Asc)</option>
          <option value="release_date.desc">Sort By: Release Date (Desc)</option>
          <option value="vote_average.asc">Sort By: Rating (Asc)</option>
          <option value="vote_average.desc">Sort By: Rating (Desc)</option>
        </select>
      </div>

      <main id="movie-grid">
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && movies.length === 0 && (
          <p className="no-results">No movies found.</p>
        )}
        {!loading &&
          !error &&
          movies.map((movie) => (
            <div className="movie-card" key={movie.id}>
              <img
                src={
                  movie.poster_path
                    ? IMG_BASE + movie.poster_path
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={movie.title}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500x750?text=No+Image";
                }}
              />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>Release Date: {movie.release_date || "N/A"}</p>
                <p>
                  Rating:{" "}
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>
          ))}
      </main>

      <div className="pagination">
        <button
          id="prev-btn"
          disabled={currentPage <= 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span id="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          id="next-btn"
          disabled={currentPage >= totalPages || loading}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
