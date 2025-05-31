
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    let timezone;

    if (lat && lon) {
      // Use lat/lon to get timezone
      const tzRes = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`);
      const tzData = await tzRes.json();
      timezone = tzData.zoneName;
      
    } else {
      // Auto-detect via IP
      const locationRes = await fetch("https://ipapi.co/json/");
      const locationData = await locationRes.json();
      timezone = locationData.timezone;
    }

    if (!timezone) {
      return new Response(JSON.stringify({ error: "Timezone not found" }), { status: 500 });
    }

    // Get local time for that timezone
    const timeRes = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY}&format=json&by=zone&zone=${timezone}`);
    const timeData = await timeRes.json();
    const localTime = new Date(timeData.formatted);
    const currentHour = localTime.getHours();

    const status = getRuleBasedBusinessStatus(currentHour);

    return new Response(JSON.stringify({ status }), { status: 200 });
  } catch (error) {
    console.error("❌ Error in business-hours route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// 🧠 Helper Function
function getRuleBasedBusinessStatus(currentHour) {
  const rules = {
    "Private Offices": [9, 17],
    "Public Offices": [8, 16],
    "Shops": [10, 20],
    "Bars": [15, 2],         // Open 5PM–2AM
    "Restaurants": [11, 23],
    "Public Transport": [0, 24], // 24/7
  };

  const isOpen = (start, end) => {
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // e.g. Bars: 17–2 (spans midnight)
      return currentHour >= start || currentHour < end;
    }
  };

  const status = {};
  for (const [category, [start, end]] of Object.entries(rules)) {
    status[category] = isOpen(start, end) ? "Open" : "Closed";
  }

  return status;
}



// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const lat = searchParams.get("lat");
//     const lon = searchParams.get("lon");

//     if (!lat || !lon) {
//       return new Response(JSON.stringify({ error: "Missing lat/lon" }), { status: 400 });
//     }

//     console.log("📡 Fetching business data for:", lat, lon);

//     // Overpass Query: Fetch businesses categorized correctly
//     const overpassQuery = `
//       [out:json];
//       (
//         node["office"](around:2000,${lat},${lon});
//         node["office"="government"](around:2000,${lat},${lon});
//         node["shop"](around:2000,${lat},${lon});
//         node["amenity"="bar"](around:2000,${lat},${lon});
//         node["amenity"="pub"](around:2000,${lat},${lon});
//         node["amenity"="restaurant"](around:2000,${lat},${lon});
//         node["amenity"="bus_station"](around:2000,${lat},${lon});
//         node["amenity"="subway"](around:2000,${lat},${lon});
//         node["amenity"="train_station"](around:2000,${lat},${lon});
//       );
//       out body;
//     `;

//     const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
//     const response = await fetch(overpassUrl);
//     if (!response.ok) throw new Error("Failed to fetch Overpass data");

//     const osmData = await response.json();
//     console.log("✅ OSM Data:", osmData);

//     // Process OSM Data
//     const categorizedBusinesses = {
//       "Private Offices": [],
//       "Public Offices": [],
//       "Shops": [],
//       "Bars": [],
//       "Restaurants": [],
//       "Public Transport": [],
//     };

//     osmData.elements.forEach((element) => {
//       const { tags } = element;
//       const hours = tags["opening_hours"] || "Unknown";

//       if (tags.office) {
//         if (tags.office === "government") {
//           categorizedBusinesses["Public Offices"].push(hours);
//         } else {
//           categorizedBusinesses["Private Offices"].push(hours);
//         }
//       }

//       if (tags.shop) categorizedBusinesses["Shops"].push(hours);
//       if (tags.amenity === "bar" || tags.amenity === "pub") categorizedBusinesses["Bars"].push(hours);
//       if (tags.amenity === "restaurant") categorizedBusinesses["Restaurants"].push(hours);
//       if (["bus_station", "subway", "train_station"].includes(tags.amenity)) {
//         categorizedBusinesses["Public Transport"].push("24/7"); // Assume public transport runs all day
//       }
//     });

//     console.log("📊 Categorized Data:", categorizedBusinesses);

//     // Determine General Status
//     const now = new Date();
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();
//     const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)

//     const status = {};
//     Object.keys(categorizedBusinesses).forEach((category) => {
//       const hoursList = categorizedBusinesses[category];

//       if (category === "Public Transport") {
//         status[category] = "Open"; // Public transport is always open
//       } else if (hoursList.includes("24/7")) {
//         status[category] = "Open";
//       } else if (hoursList.some((hours) => checkIfOpen(hours, currentHour, currentMinute, currentDay))) {
//         status[category] = "Open";
//       } else {
//         status[category] = "Closed";
//       }
//     });

//     return new Response(JSON.stringify({ status }), { status: 200 });
//   } catch (error) {
//     console.error("❌ API Error:", error);
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
//   }
// }

// // Helper function to check if current time falls within opening hours
// function checkIfOpen(openingHours, currentHour, currentMinute, currentDay) {
//   if (openingHours === "Unknown") return false;

//   const dayMap = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
//   const regex = /(\w{2}) (\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g;
//   let match;
//   while ((match = regex.exec(openingHours)) !== null) {
//     const day = match[1];
//     const openHour = parseInt(match[2], 10);
//     const openMinute = parseInt(match[3], 10);
//     const closeHour = parseInt(match[4], 10);
//     const closeMinute = parseInt(match[5], 10);

//     if (dayMap[currentDay] === day) {
//       if (openHour < closeHour || (openHour === closeHour && openMinute < closeMinute)) {
//         // Opening hours do not span midnight
//         if (
//           (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
//           (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute))
//         ) {
//           return true;
//         }
//       } else {
//         // Opening hours span midnight
//         if (
//           (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) ||
//           (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute))
//         ) {
//           return true;
//         }
//       }
//     }
//   }

//   return false;
// }
