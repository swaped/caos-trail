# Caos Trail - Interactive Walking Trail Map

A beautiful React + Vite application featuring an interactive OpenStreetMap interface with 4 pre-defined markers and a walking trail around Coulsdon, Surrey (Lat: 51.36829, Lng: -0.16755).

**No API key required!** Uses free OpenStreetMap tiles and OSRM routing.

## Features

- 🗺️ **OpenStreetMap Integration** - Free, open-source map with no API key needed
- 📍 **4 Pre-defined Markers** - Explore local points of interest:
  - Coulsdon Common
  - Farthing Downs  
  - Happy Valley Park
  - Old Coulsdon Recreation Ground
- 🥾 **Walking Route** - Automatic walking path calculated using OSRM
- 📊 **Route Statistics** - Shows total distance and estimated walking time
- 🎨 **Modern Dark Theme** - Premium UI with gradient accents and smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 💡 **Interactive Sidebar** - Click on locations to highlight them on the map

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd caos-trail
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

That's it! No API keys or additional setup required.

## Project Structure

```
caos-trail/
├── src/
│   ├── App.tsx        # Main application with map, markers, and routing
│   ├── App.css        # Styling for the application
│   ├── main.tsx       # React entry point
│   ├── index.css      # Global styles and fonts
│   └── vite-env.d.ts  # TypeScript declarations
├── index.html         # HTML template
└── package.json       # Dependencies and scripts
```

## Marker Locations

| # | Location | Latitude | Longitude | Description |
|---|----------|----------|-----------|-------------|
| 1 | Coulsdon Common | 51.3705 | -0.1695 | Natural open space with trails |
| 2 | Farthing Downs | 51.3700 | -0.1720 | Historic chalk downland |
| 3 | Happy Valley Park | 51.3650 | -0.1700 | Scenic hiking park |
| 4 | Old Coulsdon Recreation Ground | 51.3660 | -0.1640 | Sports facilities and playgrounds |

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React-Leaflet** - React components for Leaflet maps
- **Leaflet** - JavaScript library for OpenStreetMap
- **OSRM** - Open Source Routing Machine for walking directions
- **OpenStreetMap** - Free, open-source map tiles

## APIs Used (All Free!)

- **OpenStreetMap Tiles** - `https://tile.openstreetmap.org`
- **OSRM Routing** - `https://router.project-osrm.org` (walking/foot profile)

## License

MIT License
# caos-trail
# caos-trail
