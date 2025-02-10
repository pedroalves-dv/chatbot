export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing lat/lon" }), { status: 400 });
    }

    console.log("📡 Fetching business data for:", lat, lon);

    // Overpass Query: Fetch businesses categorized correctly
    const overpassQuery = `
      [out:json];
      (
        node["office"](around:2000,${lat},${lon});
        node["office"="government"](around:2000,${lat},${lon});
        node["shop"](around:2000,${lat},${lon});
        node["amenity"="bar"](around:2000,${lat},${lon});
        node["amenity"="pub"](around:2000,${lat},${lon});
        node["amenity"="restaurant"](around:2000,${lat},${lon});
        node["amenity"="bus_station"](around:2000,${lat},${lon});
        node["amenity"="subway"](around:2000,${lat},${lon});
        node["amenity"="train_station"](around:2000,${lat},${lon});
      );
      out body;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const response = await fetch(overpassUrl);
    if (!response.ok) throw new Error("Failed to fetch Overpass data");

    const osmData = await response.json();
    console.log("✅ OSM Data:", osmData);

    // Process OSM Data
    const categorizedBusinesses = {
      "Private Offices": [],
      "Public Offices": [],
      "Shops": [],
      "Bars": [],
      "Restaurants": [],
      "Public Transport": [],
    };

    osmData.elements.forEach((element) => {
      const { tags } = element;
      const hours = tags["opening_hours"] || "Unknown";

      if (tags.office) {
        if (tags.office === "government") {
          categorizedBusinesses["Public Offices"].push(hours);
        } else {
          categorizedBusinesses["Private Offices"].push(hours);
        }
      }

      if (tags.shop) categorizedBusinesses["Shops"].push(hours);
      if (tags.amenity === "bar" || tags.amenity === "pub") categorizedBusinesses["Bars"].push(hours);
      if (tags.amenity === "restaurant") categorizedBusinesses["Restaurants"].push(hours);
      if (["bus_station", "subway", "train_station"].includes(tags.amenity)) {
        categorizedBusinesses["Public Transport"].push("24/7"); // Assume public transport runs all day
      }
    });

    console.log("📊 Categorized Data:", categorizedBusinesses);

    // Determine General Status
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)

    const status = {};
    Object.keys(categorizedBusinesses).forEach((category) => {
      const hoursList = categorizedBusinesses[category];

      if (category === "Public Transport") {
        status[category] = "Open"; // Public transport is always open
      } else if (hoursList.includes("24/7")) {
        status[category] = "Open";
      } else if (hoursList.some((hours) => checkIfOpen(hours, currentHour, currentMinute, currentDay))) {
        status[category] = "Open";
      } else {
        status[category] = "Closed";
      }
    });

    return new Response(JSON.stringify({ status }), { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// Helper function to check if current time falls within opening hours
function checkIfOpen(openingHours, currentHour, currentMinute, currentDay) {
  if (openingHours === "Unknown") return false;

  const dayMap = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const regex = /(\w{2}) (\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g;
  let match;
  while ((match = regex.exec(openingHours)) !== null) {
    const day = match[1];
    const openHour = parseInt(match[2], 10);
    const openMinute = parseInt(match[3], 10);
    const closeHour = parseInt(match[4], 10);
    const closeMinute = parseInt(match[5], 10);

    if (dayMap[currentDay] === day) {
      if (openHour < closeHour || (openHour === closeHour && openMinute < closeMinute)) {
        // Opening hours do not span midnight
        if (
          (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
          (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute))
        ) {
          return true;
        }
      } else {
        // Opening hours span midnight
        if (
          (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) ||
          (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute))
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
