"use client";

import { useState, useEffect } from "react";

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Track focus state

  // Fetch location suggestions based on input
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]); // Clear suggestions if input is too short
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.timezonedb.com/v2.1/list-time-zone?key=${process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY}&format=json&zone=${input}`
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");

        const data = await res.json();
        console.log("🌍 Raw API Response:", data);

        if (!data.zones || data.zones.length === 0) {
          console.log(setError("No results found"));
          setSuggestions([]);
        } else {
          setError("");
          const uniqueSuggestions = data.zones.map((zone) => ({
            label: `${zone.countryName}, ${zone.zoneName}`,
            timezone: zone.zoneName,
          }));

          console.log("✅ Filtered Suggestions:", uniqueSuggestions);
          setSuggestions(uniqueSuggestions);
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        setError("Error fetching suggestions");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 500); // Delay to prevent API spam

    return () => clearTimeout(debounceTimeout);
  }, [input]);

  // Handle selection
  const handleSelect = (place) => {
    setInput(""); // Clear the input
    setSuggestions([]);
    onSearch(place.timezone); // Pass the timezone to the onSearch function
    setIsFocused(false); // Hide dropdown after selecting
  };

  return (
    <div className="search-bar">
      <nav className="logo">Meridian</nav>

      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Country, City, or Timezone"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)} // Show dropdown on focus
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Hide dropdown with delay for click support
        />
        <button className="search-button" onClick={() => onSearch(input)}>
          →
        </button>
        {/* Dropdown suggestions */}
        {error && <p className="error-text">{error}</p>}
        {suggestions.length > 0 && isFocused && (
          <ul className={`suggestions-dropdown ${suggestions.length ? "visible" : ""}`}>
            {suggestions.map((place, index) => (
              <li key={index} onClick={() => handleSelect(place)}>
                {place.label}
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