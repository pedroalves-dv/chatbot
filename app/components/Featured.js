"use client";

import { useState, useEffect } from "react";

const Featured = () => {
  const [currentTime, setCurrentTime] = useState(null);
  const [generalStatus, setGeneralStatus] = useState(null);
  const [timeZone, setTimeZone] = useState("");
  const [gmtOffset, setGmtOffset] = useState("");
  const [isMounted, setIsMounted] = useState(false);

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
      const { latitude, longitude, timezone } = locationData;

      console.log("📍 Location detected:", latitude, longitude);

       // Set the time zone
       setTimeZone(timezone);

        // Get GMT offset
      const now = new Date();
      const options = { timeZone: timezone, timeZoneName: "short" };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);
      const gmtPart = parts.find(part => part.type === "timeZoneName");
      setGmtOffset(gmtPart.value);

      const res = await fetch(`/api/business-hours?lat=${latitude}&lon=${longitude}`);
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

  const formatTime = (date) => {
    const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    const [time, period] = timeString.split(' ');
    return { time, period };
  };

  const { time, period } = currentTime ? formatTime(currentTime) : { time: "Loading...", period: "" };

  return (
    <div className="featured-container">
      <div className="featured-time-container">
      <p>{timeZone} <span>{gmtOffset}</span></p>
        <p className="featured-time">
          <span>{time}</span>
          <span className="pm">{period}</span>
        </p>
      </div>
      {generalStatus ? (
        <div className="categories-container">
          <p className="category">Private Offices: <span className={generalStatus["Private Offices"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Private Offices"]}</span></p>
          <p className="category">Public Offices: <span className={generalStatus["Public Offices"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Public Offices"]}</span></p>
          <p className="category">Shops: <span className={generalStatus["Shops"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Shops"]}</span></p>
          <p className="category">Bars: <span className={generalStatus["Bars"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Bars"]}</span></p>
          <p className="category">Restaurants: <span className={generalStatus["Restaurants"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Restaurants"]}</span></p>
          <p className="category">Public Transport: <span className={generalStatus["Public Transport"] === "Open" ? "tag open" : "tag closed"}>{generalStatus["Public Transport"]}</span></p>
        </div>
      ) : (
        <p>Loading business hours...</p>
      )}
    </div>
  );
};

export default Featured;
