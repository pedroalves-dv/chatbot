# Meridian

Meridian is a modern web app for exploring world time zones, local times, and business hours for cities around the globe. Built with Next.js, it lets you search for any city, view its current local time, and see at a glance whether common types of businesses (offices, shops, restaurants, bars, public transport) are open or closed right now.

## Features

- 🌍 **Search any city** to instantly see its local time and timezone.
- 🕒 **Live time display** that updates every second.
- 🏢 **Business hours overview** for each location, showing if offices, shops, bars, restaurants, and public transport are open.
- 🗂️ **Dashboard** add/remove timezones in your dashboard to customize it
- ⭐ **Save favorite timezones** (WPI)
- 🔒 **Google Sign-In** (WPI)
- 🌗 **Dark mode toggle** for comfortable viewing.
- ⚡ **Fast, responsive UI** (WPI)

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/meridian.git
cd meridian
npm install
```

Create a `.env.local` file in the root directory and add your API keys:
```
NEXT_PUBLIC_TIMEZONE_DB_API_KEY=your_timezone_db_api_key
NEXT_PUBLIC_GEONAMES_USERNAME=your_geonames_username
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Use the search bar to find any city or timezone.
- Click a suggestion to add it to your dashboard.
- View live local time and business status for each saved location.
- Sign in with Google for a personalized experience.
- Toggle dark mode using the sun/moon icon.

## Tech Stack

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [NextAuth.js](https://next-auth.js.org) for authentication
- [TimezoneDB](https://timezonedb.com/) , [GeoNames](https://www.geonames.org/) and [Nominatim](https://nominatim.org/) APIs

## License

MIT

---

Built with ❤️ using Next.js.