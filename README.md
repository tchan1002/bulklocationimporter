# 📍 Bulk Location Importer

A Next.js web app that takes a CSV of location names, geocodes them, and exports to Google Maps or Apple Maps.

![Screenshot](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Bulk+Location+Importer)

## Features

- **CSV Input**: Paste your location data in CSV format
- **Smart Geocoding**: Automatically finds coordinates using Mapbox API
- **Fallback Search**: Tries multiple query formats if initial search fails
- **Interactive Map**: Preview all locations with color-coded category pins
- **Manual Entry**: Fix locations that couldn't be found automatically
- **Export Options**:
  - **KML** → Import to Google My Maps (best experience!)
  - **GPX** → Universal format for Apple Maps & other GPS apps
  - **Direct Links** → Quick links for small collections

## Setup

### 1. Clone and Install

```bash
cd bulklocationimporter
npm install
```

### 2. Get a Mapbox API Token (Free)

1. Go to [mapbox.com](https://www.mapbox.com/) and create a free account
2. Navigate to your [Access Tokens page](https://account.mapbox.com/access-tokens/)
3. Copy your **Default public token** (starts with `pk.`)

### 3. Configure Environment

Create a `.env.local` file in the project root:

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token_here
```

Replace `pk.your_mapbox_public_token_here` with your actual token.

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Input Format

Your CSV should have these columns (in any order):

| Column | Required | Description |
|--------|----------|-------------|
| Name | ✅ | Name of the place |
| Category | ❌ | Type (Bar, Food, Museum, etc.) |
| Neighborhood/Area | ❌ | Local area/neighborhood |
| City | ❌ | City name |
| State | ❌ | State/province |
| Country | ❌ | Country name |
| Notes | ❌ | Your notes about the place |

**Example:**

```csv
Name,Category,Neighborhood/Area,City,State,Country,Notes
La Mezcalerita,Bar,Ruta Independencia,Oaxaca de Juárez,Oaxaca,Mexico,Rooftop bar with great views
Boulenc,Bakery,Centro,Oaxaca de Juárez,Oaxaca,Mexico,Excellent bakery and restaurant
Monte Albán,Day Trip,Outside City,Oaxaca,Oaxaca,Mexico,Zapotec ruins with amazing views
```

### Exporting to Google Maps

1. Click **"KML File"** to download
2. Go to [google.com/mymaps](https://www.google.com/mymaps)
3. Click **"Create a new map"**
4. Click **"Import"** and upload your KML file
5. Your map syncs to the Google Maps app on your phone! 🎉

### Exporting to Apple Maps

1. Click **"GPX File"** to download
2. AirDrop or save to your iPhone's Files app
3. Open the GPX file and choose **"Open in Maps"**

> ⚠️ **Note**: Apple Maps doesn't save imported waypoints permanently. For better GPS app support, consider [Pocket Earth](https://apps.apple.com/app/pocket-earth/id481679421) or [Maps.me](https://maps.me/).

## Category Colors

| Category | Color |
|----------|-------|
| Bar | 🟣 Purple |
| Food | 🟠 Orange |
| Cafe | 🟤 Brown |
| Bakery | 🟡 Yellow |
| Dessert | 🩷 Pink |
| Market | 🟢 Green |
| Museum | 🔵 Blue |
| Park/Garden | 🌿 Teal |
| Day Trip | 🔴 Red |
| Beach | 🩵 Cyan |

## API Costs

This app uses **Mapbox Geocoding API**:

- **Free tier**: 100,000 requests/month
- Typical usage: ~50-100 locations = negligible cost
- No credit card required for free tier

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Map**: Mapbox GL JS
- **Geocoding**: Mapbox Geocoding API
- **CSV Parsing**: PapaParse

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

Deploy to Vercel (recommended):

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable
4. Deploy!

## PWA Support

This app works as a Progressive Web App. On mobile:

1. Open the app in Safari/Chrome
2. Tap "Add to Home Screen"
3. Use it like a native app!

## License

MIT

