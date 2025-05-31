"use client";

import TimezoneCard from "./TimezoneCard";

export default function TimezoneList({ timezones, onRemove, onFavorite }) {
  if (!timezones || !timezones.length) return null;

  return (
    <div className="timezone-list">
      {timezones.map((tz, index) => (
        <TimezoneCard key={tz.id} city={tz.city} lat={tz.lat} lon={tz.lon} timezone={tz} onRemove={onRemove} onFavorite={onFavorite} />
      ))}
    </div>
  );
}