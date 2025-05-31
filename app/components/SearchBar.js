"use client";

import { useState, useEffect, useRef } from "react";

// Helper Function: Format display name to show city and country
function formatDisplayName(display_name) {
  if (!display_name) return "";
  const parts = display_name.split(",");
  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  // Show first and last part (city and country)
  if (trimmed.length >= 2) {
    return `${trimmed[0]}, ${trimmed[trimmed.length - 1]}`;
  }
  return trimmed[0] || "";
}

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (searchText) => {
    if (searchText.length < 2) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchText
        )}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Meridian Time App (contact@yourdomain.com)",
          },
        }
      );
      const data = await res.json();

      // Filter unique display_name
      const unique = [];
      const seen = new Set();
      for (const item of data) {
        if (!seen.has(item.display_name)) {
          unique.push(item);
          seen.add(item.display_name);
        }
        if (unique.length >= 5) break;
      }
      setSuggestions(unique);

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show suggestions when input is focused
  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce fetchSuggestions
  useEffect(() => {
    const debounce = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounce);
  }, [query, showSuggestions]);

  // Handle suggestion selection
  const handleSelect = async (result) => {
    if (!result.lat || !result.lon) return;

    // Fetch timezone using lat/lon
    try {
      const tzRes = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY}&format=json&by=position&lat=${result.lat}&lng=${result.lon}`
      );
      const tzData = await tzRes.json();
      if (!tzData.zoneName) throw new Error("Timezone not found");

      onSearch({
        timezone: tzData.zoneName, // e.g., "Europe/Lisbon"
        identifier: `${result.lat},${result.lon}`,
        city: result.display_name,
        lat: result.lat,
        lon: result.lon
      });
    } catch (err) {
      alert("Could not fetch timezone for this location.");
    }

    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="header" ref={containerRef}>
      <nav className="logo">Meridian</nav>

      <div className="search-container">
        <input
          className="search-input"
          value={query}
          onChange={(e) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === "") {
      setSuggestions([]);
    }
  }}
          placeholder="Search city or timezone..."
          onFocus={handleFocus}
        />

        {/* {isLoading && <div className="loading-indicator">Searching...</div>} */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-dropdown visible">
            {suggestions.map((result, index) => (
              <li
                key={index}
                onClick={() => handleSelect(result)}
                className="suggestion-item"
              >
                {formatDisplayName(result.display_name)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav>
        <a>Sign In</a>
      </nav>
    </div>
  );
}
