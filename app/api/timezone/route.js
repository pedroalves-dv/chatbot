// app/api/timezone/route.js
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const API_KEY = process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY;
//     if (!API_KEY) {
//       return NextResponse.json({ error: "API key is missing" }, { status: 500 });
//     }

//     const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=Europe/Paris`;
//     const response = await fetch(url);

//     if (!response.ok) {
//       return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: 500 });
//     }

//     const data = await response.json();
    
//     return NextResponse.json({
//       timestamp: data.timestamp,
//       formatted: data.formatted,
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_TIMEZONE_DB_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    // Get the timezone from the query string
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    if (!zone) {
      return NextResponse.json({ error: "Missing timezone parameter" }, { status: 400 });
    }

    const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${zone}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      currentLocalTime: data.formatted,
      timeZone: data.zoneName,
      currentUtcOffset: data.gmtOffset / 3600, // convert seconds to hours
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}