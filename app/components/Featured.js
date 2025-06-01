"use client";

import { useState, useEffect } from "react";

function formatDisplayName(display_name) {
  if (!display_name) return "";
  const parts = display_name.split(",");
  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  if (trimmed.length >= 2) {
    return `${trimmed[0]}, ${trimmed[trimmed.length - 1]}`;
  }
  return trimmed[0] || "";
}

const Featured = () => {
  const [currentTime, setCurrentTime] = useState(null);
  const [generalStatus, setGeneralStatus] = useState(null);
  const [timeZone, setTimeZone] = useState("");
  const [gmtOffset, setGmtOffset] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [cityCountry, setCityCountry] = useState("");

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchBusinessHours();

    return () => clearInterval(interval);
  }, []);

  const fetchBusinessHours = async () => {
    try {
      // Auto-detect user location via IP
      const locationRes = await fetch("https://ipapi.co/json/");
      if (!locationRes.ok) throw new Error("Failed to fetch location");

      const locationData = await locationRes.json();
      const { latitude, longitude, timezone, city, country_name } =
        locationData;

      setCityCountry(`${city}, ${country_name}`);

      console.log("📍 Location detected:", latitude, longitude);

      // Set the time zone
      setTimeZone(timezone);

      // Get GMT offset
      const now = new Date();
      const options = { timeZone: timezone, timeZoneName: "short" };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);
      const gmtPart = parts.find((part) => part.type === "timeZoneName");
      setGmtOffset(gmtPart.value);

      // const res = await fetch(`/api/business-hours`);
      const res = await fetch(
        `/api/business-hours?lat=${latitude}&lon=${longitude}`
      );
      if (!res.ok) throw new Error("Failed to fetch business hours");

      const data = await res.json();
      console.log("✅ Business Status:", data);

      setGeneralStatus(data.status);
    } catch (error) {
      console.error("❌ Error fetching business hours:", error);
    }
  };

  if (!isMounted) {
    return null; // Render nothing on the server
  }

  const formatTime = () => {
    if (!currentTime || !timeZone) return "Loading...";
    return currentTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    });
  };

  const formatDate = () => {
    if (!currentTime || !timeZone) return "Loading...";
    return currentTime.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    });
  };

  return (
    <div className="featured-container">
      <div className="featured-time-container">
        <p className="location-info-display">
          <span className="city-country-display">{formatDisplayName(cityCountry)}</span>
          <span className="gmt">{gmtOffset}</span>
          <span className="date-display">{formatDate()}</span>
        </p>
        <div className="time-display">{formatTime()}</div>
      </div>
      {generalStatus ? (
        <div className="categories-container">
          <p className="category">
            Private Offices:{" "}
            <span
              className={
                generalStatus["Private Offices"] === "Open"
                  ? "tag open"
                  : "tag closed"
              }
            >
              {generalStatus["Private Offices"]}
            </span>
          </p>
          <p className="category">
            Public Offices:{" "}
            <span
              className={
                generalStatus["Public Offices"] === "Open"
                  ? "tag open"
                  : "tag closed"
              }
            >
              {generalStatus["Public Offices"]}
            </span>
          </p>
          <p className="category">
            Shops:{" "}
            <span
              className={
                generalStatus["Shops"] === "Open" ? "tag open" : "tag closed"
              }
            >
              {generalStatus["Shops"]}
            </span>
          </p>
          <p className="category">
            Bars:{" "}
            <span
              className={
                generalStatus["Bars"] === "Open" ? "tag open" : "tag closed"
              }
            >
              {generalStatus["Bars"]}
            </span>
          </p>
          <p className="category">
            Restaurants:{" "}
            <span
              className={
                generalStatus["Restaurants"] === "Open"
                  ? "tag open"
                  : "tag closed"
              }
            >
              {generalStatus["Restaurants"]}
            </span>
          </p>
          <p className="category">
            Public Transport:{" "}
            <span
              className={
                generalStatus["Public Transport"] === "Open"
                  ? "tag open"
                  : "tag closed"
              }
            >
              {generalStatus["Public Transport"]}
            </span>
          </p>
        </div>
      ) : (
        <p>Loading business hours...</p>
      )}
    </div>
  );
};

export default Featured;
