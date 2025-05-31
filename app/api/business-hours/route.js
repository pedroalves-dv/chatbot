export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing lat/lon" }), { status: 400 });
    }

    // Use GeoNames only
    const geoRes = await fetch(`https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${process.env.NEXT_PUBLIC_GEONAMES_USERNAME}`);
    const geoData = await geoRes.json();

    if (!geoData.timezoneId || !geoData.time) {
      return new Response(JSON.stringify({ error: "Timezone not found" }), { status: 500 });
    }

    const localTime = new Date(geoData.time.replace(" ", "T")); // Convert to ISO string for Date
    const currentHour = localTime.getHours();

    const status = getRuleBasedBusinessStatus(currentHour);

    return new Response(JSON.stringify({ status }), { status: 200 });
  } catch (error) {
    console.error("❌ Error in business-hours route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

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