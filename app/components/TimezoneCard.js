"use client";

import { useState, useEffect } from "react";

function formatDisplayName(display_name) {
  if (!display_name) return "";
  const parts = display_name.split(",");
  const trimmed = parts.map(p => p.trim()).filter(Boolean);
  if (trimmed.length >= 2) {
    return `${trimmed[0]}, ${trimmed[trimmed.length - 1]}`;
  }
  return trimmed[0] || "";
}

export default function TimezoneCard({ timezone: tz, city, lat, lon, onRemove }) {
  const [timeData, setTimeData] = useState(null);
  const [localTime, setLocalTime] = useState(new Date());
  const [businessStatus, setBusinessStatus] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        // const endpoint = `https://worldtimeapi.org/api/timezone/${tz.timezone}`;
        const endpoint = `/api/timezone?zone=${encodeURIComponent(tz.timezone)}`;
        
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch timezone info");

        const data = await res.json();
        setTimeData(data);
      } catch (error) {
        console.error('Error fetching time:', error);
      }
    };

    fetchTime();
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [tz]);

   // Fetch business hours for this location
  useEffect(() => {
    console.log("TimezoneCard effect lat/lon/city:", lat, lon, city); // Add this
    const fetchBusinessHours = async () => {
      if (!lat || !lon) return;
      try {
        const res = await fetch(`/api/business-hours?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed to fetch business hours");
        const data = await res.json();
        console.log("Business hours data for", city, data); // <-- Add this line
        setBusinessStatus(data.status);
      } catch (error) {
        console.error("Error fetching business hours:", error);
      }
    };
    fetchBusinessHours();
  }, [lat, lon, city]);

  const formatTime = () => {
    if (!localTime || !timeData) return "Loading...";
    return localTime.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timeData.timeZone
    });
  };

  return (
    <div className="timezone-card">
      <div className="card-header">
        <p>{formatDisplayName(city)}
        <span className="gmt"> GMT+{timeData?.currentUtcOffset || ''}</span>
        </p>
        
        <div className="time-display">
        {formatTime()}
      </div>
      </div>
      
      
      <div className="card-actions">
        <button 
          className="remove-button"
          onClick={() => onRemove(tz.id)}
        >
          Remove
        </button>
        <button 
          className="remove-button"
          onClick={() => onRemove(tz.id)}
        >
          Favorite
        </button>
      </div>
       {/* add the bussiness hours  */}
       {/* Business hours display */}
      <div className="business-hours">
        {businessStatus ? (
          <div className="categories-container">
            <p className="category">Private Offices: <span className={businessStatus["Private Offices"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Private Offices"]}</span></p>
            <p className="category">Public Offices: <span className={businessStatus["Public Offices"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Public Offices"]}</span></p>
            <p className="category">Shops: <span className={businessStatus["Shops"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Shops"]}</span></p>
            <p className="category">Bars: <span className={businessStatus["Bars"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Bars"]}</span></p>
            <p className="category">Restaurants: <span className={businessStatus["Restaurants"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Restaurants"]}</span></p>
            <p className="category">Public Transport: <span className={businessStatus["Public Transport"] === "Open" ? "tag open" : "tag closed"}>{businessStatus["Public Transport"]}</span></p>
          </div>
        ) : (
          <p>Loading business hours...</p>
        )}
      </div>
    </div>
  );
}