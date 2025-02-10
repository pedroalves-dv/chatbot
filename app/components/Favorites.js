// components/Favorites.js
"use client";

import TimezoneCard from "./TimezoneCard";

export default function Favorites({ timezones, onFavorite }) {
  if (!timezones.length) return <p>No favorites added yet.</p>;

  return (
    <div>
      <h2>⭐ Favorite Timezones</h2>
      {timezones.map((tz) => (
        <TimezoneCard key={tz} timezone={tz} onRemove={onFavorite} onFavorite={onFavorite} />
      ))}
    </div>
  );
}
