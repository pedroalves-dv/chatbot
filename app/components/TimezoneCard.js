"use client";

import { useState, useEffect } from "react";

export default function TimezoneCard({ timezone, onRemove, onFavorite }) {
  const [currentTime, setCurrentTime] = useState(null);
  const [gmtOffset, setGmtOffset] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchGmtOffset();

    return () => clearInterval(interval);
  }, [timezone]);

  const fetchGmtOffset = () => {
    try {
      const now = new Date();
      const options = { timeZone: timezone, timeZoneName: "short" };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);
      const gmtPart = parts.find((part) => part.type === "timeZoneName");
      setGmtOffset(gmtPart?.value || "GMT?");
    } catch (error) {
      console.error("Invalid time zone specified:", timezone);
      setGmtOffset("Invalid Time Zone");
    }
  };

  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    } catch (error) {
      console.error("Invalid time zone specified:", timezone);
      return "Invalid Time Zone";
    }
  };

  return (
    <div className="timezone-card">
      <div className="timezone-info">
        <h2>{timezone}</h2>
        <p className="timezone-time">{currentTime ? formatTime(currentTime) : "Loading..."}</p>
        <p className="timezone-offset">{gmtOffset}</p>
      </div>
      <div className="timezone-actions">
        <button className="remove-button" onClick={() => onRemove(timezone)}>Remove</button>
        <button className="favorite-button" onClick={() => onFavorite(timezone)}>★ Favorite</button>
      </div>
    </div>
  );
}