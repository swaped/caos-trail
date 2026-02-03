import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
// Custom icon for user location
const userLocationIcon = L.divIcon({
  className: "custom-marker user-location-marker animated-user-marker",
  html: `
    <div class="animated-user-marker-inner">
      <span style="font-size: 36px; color: white;">🚶</span>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 56],
  popupAnchor: [0, -56],
});
import "leaflet/dist/leaflet.css";
import "./App.css";

// Add animation styles for the user marker
const style = document.createElement("style");
style.innerHTML = `
.animated-user-marker-inner {
  width: 56px;
  height: 56px;
  background: #2563eb;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: user-marker-pulse 1.2s infinite cubic-bezier(0.66,0,0,1);
}
@keyframes user-marker-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37,99,235,0.7);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(37,99,235,0);
    transform: scale(1.12);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37,99,235,0);
    transform: scale(1);
  }
}
`;
document.head.appendChild(style);

// Center coordinates
const CENTER: [number, number] = [51.37070070451733, -0.1597597879141367];

// Load markers from external JSON file
type MarkerType = {
  id: number;
  position: [number, number];
  title: string;
  description: string;
  color: string;
  icon: string;
};

// Create custom colored marker icons
const createMarkerIcon = (
  color: string,
  isActive: boolean = false,
  label?: string | number,
) => {
  const size = isActive ? 40 : 32;
  const borderColor = isActive ? "#e53935" : "white";
  const borderWidth = isActive ? 4 : 3;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #111827;
          font-size: ${isActive ? 14 : 12}px;
        ">
          ${label ? `<span style="user-select: none;">${label}</span>` : ""}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Component to fit map bounds to show all markers
function FitBounds({ route }: { route: [number, number][] }) {
  return; //to ignore fit map and keep zoomed in center
  const map = useMap();

  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route]);

  return null;
}

function App() {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("map");
  const markerRefs = useRef<Record<number, L.Marker>>({});
  // Load markers from JSON file
  useEffect(() => {
    fetch("/markers.json")
      .then((res) => res.json())
      .then((data) => {
        // Ensure position is typed as [number, number]
        setMarkers(
          data.map((m: any) => ({
            ...m,
            position: [m.position[0], m.position[1]] as [number, number],
          })),
        );
      });
  }, []);
  
  // Open popup when selectedMarker changes
  useEffect(() => {
    if (selectedMarker && markerRefs.current[selectedMarker.id]) {
      const markerRef = markerRefs.current[selectedMarker.id];
      markerRef.openPopup();
    }
  }, [selectedMarker]);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  // User location state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error(err);
      },
      { enableHighAccuracy: true },
    );
  }, []);

  // Fetch walking route from OSRM (Open Source Routing Machine)
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    const fetchRoute = async () => {
      try {
        // Build coordinates string for OSRM (lng,lat format)
        const coordinates = markers
          .map((m) => `${m.position[1]},${m.position[0]}`)
          .join(";");

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson`,
        );

        if (!response.ok) throw new Error("Failed to fetch route");

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Extract route coordinates (OSRM returns [lng, lat], we need [lat, lng])
          const path: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]],
          );
          setRoutePath(path);

          // Set route info
          const distanceKm = (route.distance / 1000).toFixed(2);
          const durationMin = Math.round(route.duration / 60);
          setRouteInfo({
            distance: `${distanceKm} km`,
            duration: `${durationMin} min`,
          });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        // Fallback: create direct line between markers
        setRoutePath(markers.map((m) => m.position));
      }
    };

    fetchRoute();
  }, [markers]);

  return (
    <div className="app-container">
      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
        >
          {mobileView === "list" ? "📍 Map View" : "📋 List View"}
        </button>

        {/* Sidebar with marker information */}
        <aside className={`sidebar ${mobileView === "list" ? "mobile-visible" : ""}`}>
          <div className="logo">
            <span className="logo-icon">🚶‍♀️</span>
            <h1>CAOS Trail</h1>
          </div>

          {/* Route Info Card */}
          {routeInfo && (
            <div className="route-info-card">
              <div className="route-stat">
                <span className="route-icon">🚶</span>
                <div className="route-detail">
                  <span className="route-label">Total Distance</span>
                  <span className="route-value">{routeInfo.distance}</span>
                </div>
              </div>
              <div className="route-stat">
                <span className="route-icon">⏱️</span>
                <div className="route-detail">
                  <span className="route-label">Walking Time</span>
                  <span className="route-value">{routeInfo.duration}</span>
                </div>
              </div>
            </div>
          )}

          <div
            className="marker-list"
            style={{ gap: "0.5rem", padding: "0.5rem 0" }}
          >
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className={`marker-card ${selectedMarker?.id === marker.id ? "active" : ""} ${hoveredMarker === marker.id ? "hovered" : ""}`}
                onClick={() => {
                  setSelectedMarker(marker);
                  setMobileView("map");
                }}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
                style={{ padding: "0.5rem 0.75rem", minWidth: 0 }}
              >
                <div
                  className="marker-step"
                  style={{ marginBottom: "0.25rem" }}
                >
                  <span className="step-number">{index + 1}</span>
                  {index < markers.length - 1 && (
                    <div className="step-connector" />
                  )}
                </div>
                <div
                  className="marker-icon"
                  style={{
                    backgroundColor: marker.color,
                    marginBottom: "0.25rem",
                  }}
                >
                  {marker.icon}
                </div>
                <div className="marker-info" style={{ margin: 0 }}>
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>
                    {marker.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="footer">
            <p>© 2026 CAOS Trail</p>
          </footer>
        </aside>

        {/* Map Container */}
        <div className={`map-container ${mobileView === "map" ? "mobile-visible" : ""}`}>
          <MapContainer
            center={CENTER}
            zoom={16}
            className="map"
            scrollWheelZoom={true}
          >
            {/* OpenStreetMap Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Walking Route Polyline */}
            {routePath.length > 0 && (
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: "#6366f1",
                  weight: 5,
                  opacity: 0.8,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}

            {/* Markers */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                ref={(markerRef) => {
                  if (markerRef) {
                    markerRefs.current[marker.id] = markerRef;
                  }
                }}
                position={marker.position}
                icon={createMarkerIcon(
                  marker.color,
                  hoveredMarker === marker.id ||
                    selectedMarker?.id === marker.id,
                  marker.id,
                )}
                eventHandlers={{
                  click: () => setSelectedMarker(marker),
                  mouseover: () => setHoveredMarker(marker.id),
                  mouseout: () => setHoveredMarker(null),
                }}
              >
                <Popup>
                  <div className="info-window">
                    <h3>
                      {marker.icon} {marker.title}
                    </h3>
                    <p>{marker.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="info-window">
                    <h3>Your Location</h3>
                    <p>This is your current position.</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Fit bounds to route */}
            {routePath.length > 0 && <FitBounds route={routePath} />}
          </MapContainer>

          {/* Map Overlay - Instructions */}
          <div className="map-overlay">
            <span className="instruction">
              🥾 Follow the trail through all marked locations
            </span>
          </div>
        </div>
      </main>
      <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "e5a8572ef0e24d598015856b4637b8b2"}'>
      </script>
    </div>
  );
}

export default App;
