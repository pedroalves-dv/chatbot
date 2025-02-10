// components/TimezoneList.js
"use client";

import TimezoneCard from "./TimezoneCard";

export default function TimezoneList({ timezone, onRemove, onFavorite }) {
  if (!timezone.length) return null;

  return (
    <div className="timezone-list">
      {timezone.map((tz, index) => (
        <TimezoneCard key={`${tz}-${index}`} timezone={tz} onRemove={onRemove} onFavorite={onFavorite} />
      ))}
    </div>
  );
}
