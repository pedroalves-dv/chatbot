"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import Featured from "./Featured";
import TimezoneList from "./TimezoneList";

export default function AppLayout() {
  const [timezones, setTimezones] = useState([]);
  const [featured, setFeatured] = useState(null);

  // Load saved timezones on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('timezones')) || [];
    setTimezones(saved);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('timezones', JSON.stringify(timezones));
  }, [timezones]);

  const handleOnSearch = (timezone) => {
    if (!timezones.find(t => t.timezone === timezone.timezone)) {
      setTimezones(prev => [...prev, { 
        timezone: timezone.timezone, 
        id: Date.now(),
        identifier: timezone.timezone.includes('/') ? timezone.timezone : null, 
        city: timezone.city,
        lat: timezone.lat,   
        lon: timezone.lon
      }]);
    }
  };

  // Handles Remove Button
  const handleRemove = (id) => {
    setTimezones(prev => prev.filter(tz => tz.id !== id));
  };

  return (
    <div className="container">
      <SearchBar onSearch={handleOnSearch} />
      <Featured />
      <TimezoneList timezones={timezones} onRemove={handleRemove} />
    </div>
  );
}