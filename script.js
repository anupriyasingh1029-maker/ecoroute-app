/**
 * EcoRoute – Eco-Friendly Route Planner
 * Vanilla JavaScript (No backend, no paid APIs, GitHub Pages ready)
 * 
 * Features:
 * 1. Leaflet.js interactive map with OpenStreetMap & OSRM routing
 * 2. 10 Transport modes with editable emission factors, speeds, and INR costs
 * 3. CO2, travel time, fuel usage, and cost calculations
 * 4. Comparison table and Chart.js bar graph
 * 5. Greenest choice spotlight with savings vs Petrol Car
 * 6. Passenger count & round-trip toggles
 * 7. LocalStorage history (last 5 searches) & Dark/Light mode
 */

// ============================================================================
// 1. EDITABLE EMISSION FACTORS & TRANSPORT MODES CONFIGURATION
// Anyone can adjust fuel rates, speeds, and emission factors right here!
// ============================================================================
const TRANSPORT_MODES = {
  walking: {
    id: "walking",
    name: "Walking",
    category: "Active",
    speedKmH: 4.5,            // Average walking speed in km/h
    co2PerKm: 0.000,          // kg CO2 per km (direct exhaust: 0)
    fuelType: "calories",
    fuelRatePerKm: 52,        // ~52 kcal burned per km
    fuelUnit: "kcal burned",
    costPerKm: 0.0,           // Free!
    baseFare: 0.0,
    isSharedVehicle: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 4 2 2-4 4"/><circle cx="15" cy="4" r="1.5"/><path d="M7 21l3-7 3 2 3-5"/><path d="m6 12 3-3 2 1"/></svg>`,
    description: "100% emission-free, zero cost, and improves cardiovascular health."
  },
  cycling: {
    id: "cycling",
    name: "Cycling",
    category: "Active",
    speedKmH: 15.0,           // Average city cycling speed in km/h
    co2PerKm: 0.000,          // kg CO2 per km
    fuelType: "calories",
    fuelRatePerKm: 32,        // ~32 kcal burned per km
    fuelUnit: "kcal burned",
    costPerKm: 0.0,
    baseFare: 0.0,
    isSharedVehicle: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l4-2 3 5 4-1"/><path d="m9 9-4 8.5"/></svg>`,
    description: "Zero tailpipe emissions, efficient for urban commutes up to 15 km."
  },
  electric_scooter: {
    id: "electric_scooter",
    name: "Electric Scooter",
    category: "Electric",
    speedKmH: 28.0,           // km/h
    co2PerKm: 0.016,          // kg CO2/km (power grid charging factor ~700g/kWh, 0.022 kWh/km)
    fuelType: "electricity",
    fuelRatePerKm: 0.025,     // kWh per km
    fuelUnit: "kWh",
    costPerKm: 0.35,          // INR ₹0.35 per km charging cost
    baseFare: 0.0,
    isSharedVehicle: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M18 15h-8l-3-9H4"/><path d="M9 6h6"/></svg>`,
    description: "Ultra-low energy consumption with minimal grid charging emissions."
  },
  petrol_bike: {
    id: "petrol_bike",
    name: "Petrol Bike",
    category: "Motorized",
    speedKmH: 38.0,           // km/h in typical Indian city traffic
    co2PerKm: 0.046,          // kg CO2/km (~50 km/litre, 2.31 kg CO2/litre)
    fuelType: "petrol",
    fuelRatePerKm: 0.020,     // Litres per km (1/50)
    fuelUnit: "L Petrol",
    costPerKm: 2.10,          // ~₹105/L / 50 = ₹2.10/km
    baseFare: 0.0,
    isSharedVehicle: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M5 16h3l3-7h4l2 4h2"/><path d="M13 9V5l3-1"/></svg>`,
    description: "Agile through traffic, but burns fossil fuel with moderate emissions."
  },
  petrol_car: {
    id: "petrol_car",
    name: "Petrol Car",
    category: "Private Car",
    speedKmH: 32.0,           // km/h average city speed
    co2PerKm: 0.165,          // kg CO2/km (Benchmark: ~14 km/L, 2.31 kg CO2/L)
    fuelType: "petrol",
    fuelRatePerKm: 0.071,     // Litres per km (1/14)
    fuelUnit: "L Petrol",
    costPerKm: 7.50,          // ~₹105/L * 0.071 = ₹7.50/km
    baseFare: 0.0,
    isSharedVehicle: true,    // Emissions and fuel cost split across passengers
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
    description: "Standard private baseline. High emissions per solo passenger."
  },
  diesel_car: {
    id: "diesel_car",
    name: "Diesel Car",
    category: "Private Car",
    speedKmH: 32.0,
    co2PerKm: 0.150,          // kg CO2/km (~18 km/L, 2.68 kg CO2/L)
    fuelType: "diesel",
    fuelRatePerKm: 0.055,     // Litres per km
    fuelUnit: "L Diesel",
    costPerKm: 5.20,          // ~₹94/L * 0.055 = ₹5.20/km
    baseFare: 0.0,
    isSharedVehicle: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 12h14"/></svg>`,
    description: "Slightly better fuel economy than petrol, but releases NOx and soot."
  },
  electric_car: {
    id: "electric_car",
    name: "Electric Car (EV)",
    category: "Electric",
    speedKmH: 32.0,
    co2PerKm: 0.075,          // kg CO2/km (0.13 kWh/km * ~0.60 kg CO2/kWh grid mix)
    fuelType: "electricity",
    fuelRatePerKm: 0.135,     // kWh per km
    fuelUnit: "kWh",
    costPerKm: 1.25,          // ~₹9/kWh home tariff * 0.135
    baseFare: 0.0,
    isSharedVehicle: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 7l-2 4h4l-2 4"/></svg>`,
    description: "Zero tailpipe pollution. Cuts carbon emissions in half compared to petrol."
  },
  cng_auto: {
    id: "cng_auto",
    name: "CNG Auto Rickshaw",
    category: "Para-transit",
    speedKmH: 26.0,
    co2PerKm: 0.078,          // kg CO2/km (~27 km/kg CNG, 2.1 kg CO2/kg CNG)
    fuelType: "cng",
    fuelRatePerKm: 0.037,     // kg CNG per km
    fuelUnit: "kg CNG",
    costPerKm: 11.50,         // Metered fare per km in INR
    baseFare: 25.0,           // Flag drop / base meter fare
    isSharedVehicle: true,    // Fare and emissions split across group
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h18l-2-7H5z"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="M8 6h8"/></svg>`,
    description: "Cleaner burning CNG alternative for flexible city trips."
  },
  bus: {
    id: "bus",
    name: "City Public Bus",
    category: "Public Transit",
    speedKmH: 22.0,           // Accounts for passenger stops and city transit flow
    co2PerKm: 0.032,          // kg CO2 per passenger-km (shared among 40+ riders)
    fuelType: "fleet_share",
    fuelRatePerKm: 0.008,     // Fuel share per passenger
    fuelUnit: "L eq/pass",
    costPerKm: 1.50,          // Ticket fare ~₹1.5 per passenger-km
    baseFare: 10.0,           // Minimum bus ticket
    isSharedVehicle: false,   // Already priced and emitted on per-passenger basis
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="15" rx="2"/><path d="M3 11h18"/><circle cx="7" cy="15" r="1.5"/><circle cx="17" cy="15" r="1.5"/><path d="M6 18v2"/><path d="M18 18v2"/></svg>`,
    description: "High capacity mass transit; takes dozens of polluting cars off the road."
  },
  metro: {
    id: "metro",
    name: "Metro Train",
    category: "Public Transit",
    speedKmH: 42.0,           // Rapid transit grade-separated speed
    co2PerKm: 0.018,          // kg CO2 per passenger-km (clean electrified mass transit)
    fuelType: "grid_electric",
    fuelRatePerKm: 0.028,     // kWh per passenger
    fuelUnit: "kWh/pass",
    costPerKm: 2.20,          // Standard metro fare tier per km
    baseFare: 15.0,           // Minimum metro ticket
    isSharedVehicle: false,   // Per-passenger basis
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="3"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/><path d="M4 9h16"/><path d="m8 18-3 3"/><path d="m16 18 3 3"/></svg>`,
    description: "Fastest travel time in urban corridors with the lowest mass transit footprint."
  }
};

// ============================================================================
// 2. STATE MANAGEMENT & PRESETS
// ============================================================================
const state = {
  distanceKm: 15.0,           // Default starting distance
  sourceText: "Connaught Place, New Delhi",
  destText: "Gurugram Cyber City, Haryana",
  sourceCoords: { lat: 28.6315, lng: 77.2167 },
  destCoords: { lat: 28.4950, lng: 77.0895 },
  passengerCount: 1,
  isRoundTrip: false,
  calculationType: "route",   // 'route' (via map coordinates) or 'manual' (entered km)
  theme: "light",
  isRouting: false
};

// Popular Preset Routes for instant 1-click test
const PRESETS = [
  {
    name: "Delhi → Cyber City (28 km)",
    source: "Connaught Place, New Delhi",
    dest: "DLF Cyber City, Gurugram",
    srcCoords: { lat: 28.6315, lng: 77.2167 },
    dstCoords: { lat: 28.4950, lng: 77.0895 },
    dist: 28.4
  },
  {
    name: "Mumbai CST → BKC (16 km)",
    source: "Chhatrapati Shivaji Terminus, Mumbai",
    dest: "Bandra Kurla Complex, Mumbai",
    srcCoords: { lat: 18.9401, lng: 72.8355 },
    dstCoords: { lat: 19.0657, lng: 72.8687 },
    dist: 16.2
  },
  {
    name: "Bengaluru MG Rd → Whitefield (19 km)",
    source: "MG Road Metro, Bengaluru",
    dest: "ITPB, Whitefield, Bengaluru",
    srcCoords: { lat: 12.9756, lng: 77.6066 },
    dstCoords: { lat: 12.9856, lng: 77.7314 },
    dist: 19.1
  },
  {
    name: "Local Quick Commute (6 km)",
    source: "Home",
    dest: "Office",
    dist: 6.0
  }
];

// Reference variables for Map & Chart instances
let mapInstance = null;
let originMarker = null;
let destMarker = null;
let routePolyline = null;
let co2ChartInstance = null;
let clickStep = 0; // 0: Next click sets Origin, 1: Next click sets Destination

// ============================================================================
// 3. INITIALIZATION ON DOM READY
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMap();
  initPresets();
  initEventListeners();
  loadSearchHistory();

  // Run initial calculation with default state
  calculateAndRender();
  // Fetch initial route on map
  fetchRoadRoute();
});

// ============================================================================
// 4. MAP INITIALIZATION & ROUTING (Leaflet + OpenStreetMap + OSRM)
// ============================================================================
function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Initialize Leaflet Map centered on default location
  mapInstance = L.map("map", {
    center: [state.sourceCoords.lat, state.sourceCoords.lng],
    zoom: 11,
    zoomControl: true
  });

  // OpenStreetMap Tile Layer (Free, Open Source)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  // Map Click Listener to easily set points
  mapInstance.on("click", (e) => {
    handleMapClick(e.latlng);
  });

  updateMapMarkers();
}

/**
 * Handle user clicking on the map:
 * First click moves Start pin (A)
 * Second click moves Destination pin (B)
 */
function handleMapClick(latlng) {
  if (clickStep === 0) {
    state.sourceCoords = { lat: latlng.lat, lng: latlng.lng };
    state.sourceText = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    document.getElementById("sourceInput").value = state.sourceText;
    clickStep = 1;
    showAlert("Start point (A) placed! Now click on the map to set Destination (B).", "info");
  } else {
    state.destCoords = { lat: latlng.lat, lng: latlng.lng };
    state.destText = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    document.getElementById("destInput").value = state.destText;
    clickStep = 0;
    showAlert("Destination (B) placed! Computing greenest route...", "info");
  }

  updateMapMarkers();
  fetchRoadRoute();
}

/**
 * Update Leaflet marker pins on the map
 */
function updateMapMarkers() {
  if (!mapInstance) return;

  const iconA = L.divIcon({
    className: "custom-pin pin-origin",
    html: "A",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const iconB = L.divIcon({
    className: "custom-pin pin-destination",
    html: "B",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  // Origin Marker
  if (state.sourceCoords) {
    if (!originMarker) {
      originMarker = L.marker([state.sourceCoords.lat, state.sourceCoords.lng], {
        icon: iconA,
        draggable: true
      }).addTo(mapInstance);

      originMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        state.sourceCoords = { lat: pos.lat, lng: pos.lng };
        state.sourceText = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
        document.getElementById("sourceInput").value = state.sourceText;
        fetchRoadRoute();
      });
    } else {
      originMarker.setLatLng([state.sourceCoords.lat, state.sourceCoords.lng]);
    }
    originMarker.bindPopup("<strong>Start Point (A)</strong><br>" + state.sourceText);
  }

  // Destination Marker
  if (state.destCoords) {
    if (!destMarker) {
      destMarker = L.marker([state.destCoords.lat, state.destCoords.lng], {
        icon: iconB,
        draggable: true
      }).addTo(mapInstance);

      destMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        state.destCoords = { lat: pos.lat, lng: pos.lng };
        state.destText = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
        document.getElementById("destInput").value = state.destText;
        fetchRoadRoute();
      });
    } else {
      destMarker.setLatLng([state.destCoords.lat, state.destCoords.lng]);
    }
    destMarker.bindPopup("<strong>Destination (B)</strong><br>" + state.destText);
  }
}

/**
 * Fetch realistic road route using free OSRM (Open Source Routing Machine)
 * With graceful fallback to Haversine distance if offline or rate limited.
 */
async function fetchRoadRoute() {
  if (!state.sourceCoords || !state.destCoords) return;

  const statusText = document.getElementById("mapStatusText");
  if (statusText) statusText.textContent = "Calculating route...";

  const src = state.sourceCoords;
  const dst = state.destCoords;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dst.lng},${dst.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!res.ok) throw new Error("OSRM service response error");
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceMeters = route.distance;
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));

      // Update distance in state
      state.distanceKm = Math.max(distanceKm, 0.5);
      document.getElementById("manualDistanceInput").value = state.distanceKm;

      // Draw polyline
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      drawRoutePolyline(coordinates);

      if (statusText) statusText.textContent = `Road route ready (${state.distanceKm} km)`;
      calculateAndRender();
      return;
    }
  } catch (err) {
    console.warn("OSRM routing unavailable, using geometric distance fallback:", err);
  }

  // Fallback: Haversine distance with 1.25 road winding factor
  const directDistance = calculateHaversineDistance(src.lat, src.lng, dst.lat, dst.lng);
  const estimatedRoadKm = Number((directDistance * 1.25).toFixed(1));
  state.distanceKm = Math.max(estimatedRoadKm, 0.5);
  document.getElementById("manualDistanceInput").value = state.distanceKm;

  // Draw direct line
  drawRoutePolyline([[src.lat, src.lng], [dst.lat, dst.lng]], true);
  if (statusText) statusText.textContent = `Estimated route (${state.distanceKm} km)`;
  calculateAndRender();
}

/**
 * Render polyline on Leaflet
 */
function drawRoutePolyline(latlngs, isDashed = false) {
  if (!mapInstance) return;

  if (routePolyline) {
    mapInstance.removeLayer(routePolyline);
  }

  routePolyline = L.polyline(latlngs, {
    color: "#059669",
    weight: 5,
    opacity: 0.85,
    dashArray: isDashed ? "8, 8" : undefined
  }).addTo(mapInstance);

  const bounds = L.latLngBounds(latlngs);
  mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
}

/**
 * Haversine formula to compute distance in kilometers between two GPS points
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// 5. GEOCODING / SEARCH WITH OPENSTREETMAP NOMINATIM
// ============================================================================
async function geocodePlace(queryText) {
  if (!queryText || queryText.trim().length < 2) return null;
  const cleanQuery = encodeURIComponent(queryText.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${cleanQuery}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (err) {
    console.warn("Geocoding failed:", err);
  }
  return null;
}

// ============================================================================
// 6. CALCULATIONS & COMPARISON ENGINE
// ============================================================================
function calculateRouteStats() {
  const effectiveDistance = state.isRoundTrip ? state.distanceKm * 2 : state.distanceKm;
  const passengers = Math.max(state.passengerCount, 1);

  const results = [];

  // Petrol car benchmark for savings calculation
  const petrolCarConfig = TRANSPORT_MODES.petrol_car;
  // Solo petrol car total CO2 benchmark
  const petrolCarTotalCO2 = effectiveDistance * petrolCarConfig.co2PerKm;

  Object.values(TRANSPORT_MODES).forEach((mode) => {
    // Travel time calculation (Hours and minutes)
    const hours = effectiveDistance / mode.speedKmH;
    const totalMinutes = Math.round(hours * 60);
    const timeFormatted = formatDuration(totalMinutes);

    // Fuel / Energy calculation
    let fuelTotal = mode.fuelRatePerKm * effectiveDistance;
    let fuelFormatted = "";
    if (mode.fuelType === "calories") {
      fuelFormatted = `${Math.round(fuelTotal)} ${mode.fuelUnit}`;
    } else {
      fuelFormatted = `${fuelTotal.toFixed(2)} ${mode.fuelUnit}`;
    }

    // CO2 calculation
    // Note: For personal vehicles, emissions are total vehicle or per passenger
    let totalCO2 = 0;
    let co2PerPerson = 0;

    if (mode.isSharedVehicle) {
      // Shared car / auto: total vehicle emissions split by passenger count
      totalCO2 = effectiveDistance * mode.co2PerKm;
      co2PerPerson = totalCO2 / passengers;
    } else {
      // Solo vehicle (bike/scooter) or mass transit (bus/metro which are already per passenger)
      co2PerPerson = effectiveDistance * mode.co2PerKm;
      totalCO2 = co2PerPerson * passengers;
    }

    // Cost Calculation in INR (₹)
    let totalCost = 0;
    let costPerPerson = 0;

    if (mode.isSharedVehicle) {
      // Vehicle run cost (fuel/fare) divided among passengers
      const vehicleFare = mode.baseFare + (effectiveDistance * mode.costPerKm);
      totalCost = vehicleFare;
      costPerPerson = vehicleFare / passengers;
    } else {
      // Individual ticket or individual fuel
      costPerPerson = mode.baseFare + (effectiveDistance * mode.costPerKm);
      totalCost = costPerPerson * passengers;
    }

    // Savings compared to solo petrol car trip
    const co2SavedVsPetrol = Math.max(0, petrolCarTotalCO2 - co2PerPerson);
    const percentSavedVsPetrol = petrolCarTotalCO2 > 0 
      ? Math.round((co2SavedVsPetrol / petrolCarTotalCO2) * 100) 
      : 0;

    results.push({
      id: mode.id,
      name: mode.name,
      category: mode.category,
      icon: mode.icon,
      description: mode.description,
      speedKmH: mode.speedKmH,
      minutes: totalMinutes,
      timeFormatted,
      fuelFormatted,
      co2Kg: Number(co2PerPerson.toFixed(3)),
      costINR: Math.round(costPerPerson),
      totalCostINR: Math.round(totalCost),
      co2SavedVsPetrol: Number(co2SavedVsPetrol.toFixed(2)),
      percentSavedVsPetrol
    });
  });

  // Sort: find greenest mode (lowest CO2)
  const sortedByCO2 = [...results].sort((a, b) => a.co2Kg - b.co2Kg);
  const greenestMode = sortedByCO2[0];

  return {
    effectiveDistance,
    passengers,
    isRoundTrip: state.isRoundTrip,
    results,
    greenestMode
  };
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ============================================================================
// 7. RENDERING UI, CARDS, TABLE & CHARTS
// ============================================================================
function calculateAndRender() {
  // Validate distance
  if (!state.distanceKm || state.distanceKm <= 0 || isNaN(state.distanceKm)) {
    showAlert("Please enter a valid positive distance greater than 0 km.", "error");
    return;
  }
  hideAlert();

  const data = calculateRouteStats();

  renderSummaryBanner(data);
  renderGreenestSpotlight(data);
  renderModeCards(data);
  renderComparisonTable(data);
  renderCO2Chart(data);
}

/**
 * Render Top Summary Stats
 */
function renderSummaryBanner(data) {
  const summaryEl = document.getElementById("tripSummaryBar");
  if (!summaryEl) return;

  const tripLabel = data.isRoundTrip ? "Round Trip" : "One-Way";
  const petrolCarResult = data.results.find(r => r.id === "petrol_car");
  const maxSavings = petrolCarResult ? (petrolCarResult.co2Kg - data.greenestMode.co2Kg).toFixed(2) : "0";

  summaryEl.innerHTML = `
    <div class="trip-metric">
      <span class="metric-label">Total Distance</span>
      <span class="metric-val">${data.effectiveDistance} <small style="font-size:0.75rem;">km</small></span>
      <span class="metric-sub">${tripLabel}</span>
    </div>
    <div class="trip-metric">
      <span class="metric-label">Passengers</span>
      <span class="metric-val">${data.passengers}</span>
      <span class="metric-sub">${data.passengers > 1 ? "Carpool / Shared" : "Solo Rider"}</span>
    </div>
    <div class="trip-metric">
      <span class="metric-label">Greenest Choice</span>
      <span class="metric-val" style="color: var(--text-emerald);">${data.greenestMode.name}</span>
      <span class="metric-sub">0.0 kg CO2 emitted</span>
    </div>
    <div class="trip-metric">
      <span class="metric-label">Max CO2 Saved</span>
      <span class="metric-val" style="color: var(--text-emerald);">${maxSavings} <small style="font-size:0.75rem;">kg</small></span>
      <span class="metric-sub">vs. driving a petrol car</span>
    </div>
  `;
}

/**
 * Spotlight Card for the Greenest Option
 */
function renderGreenestSpotlight(data) {
  const spotlightContainer = document.getElementById("spotlightCard");
  if (!spotlightContainer) return;

  const best = data.greenestMode;
  const petrolCar = data.results.find(r => r.id === "petrol_car");
  const savingsKg = petrolCar ? (petrolCar.co2Kg - best.co2Kg).toFixed(2) : "0";
  // One tree absorbs roughly 21.7 kg CO2 per year (~0.06 kg per day)
  const treeDays = (Number(savingsKg) / 0.06).toFixed(1);

  spotlightContainer.innerHTML = `
    <div class="spotlight-badge">🌱 Greenest Travel Choice</div>
    <div class="spotlight-grid">
      <div class="spotlight-icon-box">
        ${best.icon}
      </div>
      <div class="spotlight-details">
        <h3>${best.name}</h3>
        <p>${best.description}</p>
        <p style="font-size: 0.8rem; margin-top: 0.35rem; color: var(--text-secondary);">
          Travel Time: <strong>${best.timeFormatted}</strong> · Energy: <strong>${best.fuelFormatted}</strong> · Cost: <strong>₹${best.costINR}</strong>
        </p>
      </div>
      <div class="savings-highlight">
        <div class="savings-num">${savingsKg} kg</div>
        <div class="savings-label">CO2 Saved vs Petrol Car</div>
        <div style="font-size: 0.72rem; color: var(--text-emerald); margin-top: 0.2rem;">
          🌳 Equal to ~${treeDays} days of 1 tree absorbing CO2
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Cards for all 10 Transport Modes
 */
function renderModeCards(data) {
  const container = document.getElementById("modesGrid");
  if (!container) return;

  container.innerHTML = "";

  data.results.forEach((item) => {
    const isGreenest = item.id === data.greenestMode.id;
    const co2Class = item.co2Kg === 0 ? "co2-zero" : item.co2Kg > 2.0 ? "co2-high" : "";

    const card = document.createElement("div");
    card.className = `mode-card ${isGreenest ? "is-greenest" : ""}`;
    card.innerHTML = `
      <div class="mode-header">
        <div class="mode-title-wrapper">
          <div class="mode-icon">${item.icon}</div>
          <div>
            <div class="mode-name">${item.name}</div>
            <div class="mode-category-tag">${item.category}</div>
          </div>
        </div>
        ${isGreenest ? `<span class="mode-badge-green">Greenest</span>` : ""}
      </div>

      <div class="mode-stats-grid">
        <div class="mode-stat-item">
          <span class="mode-stat-label">CO2 Emitted</span>
          <span class="mode-stat-value ${co2Class}">${item.co2Kg} kg</span>
        </div>
        <div class="mode-stat-item">
          <span class="mode-stat-label">Estimated Cost</span>
          <span class="mode-stat-value">₹${item.costINR}</span>
        </div>
        <div class="mode-stat-item">
          <span class="mode-stat-label">Travel Time</span>
          <span class="mode-stat-value">${item.timeFormatted}</span>
        </div>
        <div class="mode-stat-item">
          <span class="mode-stat-label">Fuel / Energy</span>
          <span class="mode-stat-value">${item.fuelFormatted}</span>
        </div>
      </div>

      <div class="mode-footer">
        <span>Saved vs Petrol Car:</span>
        <strong style="color: ${item.percentSavedVsPetrol > 0 ? "var(--text-emerald)" : "var(--text-muted)"}">
          ${item.co2SavedVsPetrol > 0 ? `${item.co2SavedVsPetrol} kg (${item.percentSavedVsPetrol}%)` : "Benchmark"}
        </strong>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Render Comparison Table
 */
function renderComparisonTable(data) {
  const tbody = document.getElementById("compareTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Sort by lowest CO2 first
  const sorted = [...data.results].sort((a, b) => a.co2Kg - b.co2Kg);

  sorted.forEach((item, index) => {
    const isBest = index === 0;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="table-mode-cell">
          ${item.icon}
          <span>${item.name}</span>
          ${isBest ? `<span class="table-pill-green">Lowest CO2</span>` : ""}
        </div>
      </td>
      <td><strong>${item.co2Kg} kg</strong></td>
      <td>₹${item.costINR} ${data.passengers > 1 ? `<small style="color:var(--text-muted)">(₹${item.totalCostINR} tot)</small>` : ""}</td>
      <td>${item.timeFormatted}</td>
      <td>${item.fuelFormatted}</td>
      <td style="color: ${item.co2SavedVsPetrol > 0 ? "var(--text-emerald)" : "var(--text-muted)"}">
        ${item.co2SavedVsPetrol > 0 ? `+${item.co2SavedVsPetrol} kg (${item.percentSavedVsPetrol}%)` : "Baseline"}
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Render Chart.js Bar Graph for Carbon Emissions
 */
function renderCO2Chart(data) {
  const ctx = document.getElementById("co2Chart");
  if (!ctx) return;

  // Destroy previous chart instance if exists
  if (co2ChartInstance) {
    co2ChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const labels = data.results.map(r => r.name);
  const values = data.results.map(r => r.co2Kg);

  // Dynamic colors: emerald for zero/ultra-low, sky for low, amber for medium, rose for high
  const backgroundColors = data.results.map((r) => {
    if (r.co2Kg === 0) return "#10b981";       // Emerald
    if (r.co2Kg <= 0.05) return "#06b6d4";     // Cyan
    if (r.co2Kg <= 0.15) return "#3b82f6";     // Blue
    if (r.co2Kg <= 0.5) return "#f59e0b";      // Amber
    return "#ef4444";                          // Red
  });

  // @ts-ignore
  co2ChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "CO2 Emitted (kg per person)",
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          maxBarThickness: 38
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const item = data.results[context.dataIndex];
              return ` ${context.raw} kg CO2 (${item.timeFormatted}, ₹${item.costINR})`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: { size: 11, family: "system-ui" },
            maxRotation: 45,
            minRotation: 25
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Emissions in kg CO2",
            color: textColor,
            font: { size: 12, weight: "bold" }
          },
          ticks: {
            color: textColor,
            font: { family: "system-ui" }
          },
          grid: {
            color: gridColor
          }
        }
      }
    }
  });
}

// ============================================================================
// 8. SEARCH HISTORY MANAGEMENT (localStorage last 5 searches)
// ============================================================================
const STORAGE_KEY = "ecoroute_recent_searches_v1";

function saveCurrentSearch() {
  const currentTitle = `${state.sourceText.split(",")[0]} → ${state.destText.split(",")[0]}`;
  const historyItem = {
    id: Date.now(),
    title: currentTitle,
    distanceKm: state.distanceKm,
    sourceText: state.sourceText,
    destText: state.destText,
    sourceCoords: state.sourceCoords,
    destCoords: state.destCoords,
    passengers: state.passengerCount,
    isRoundTrip: state.isRoundTrip,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })
  };

  let history = getStoredHistory();
  // Filter out exact duplicate title if already existing
  history = history.filter(item => item.title !== currentTitle);
  // Prepend current
  history.unshift(historyItem);
  // Keep only the last 5 searches
  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderSearchHistory();
}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadSearchHistory() {
  renderSearchHistory();
}

function renderSearchHistory() {
  const listEl = document.getElementById("searchHistoryList");
  if (!listEl) return;

  const history = getStoredHistory();
  if (history.length === 0) {
    listEl.innerHTML = `<li class="history-empty">No recent routes saved. Your recent searches will appear here.</li>`;
    return;
  }

  listEl.innerHTML = "";
  history.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="history-info" onclick="restoreSearch(${item.id})">
        <span class="history-title">${item.title}</span>
        <span class="history-meta">${item.distanceKm} km · ${item.isRoundTrip ? "Round Trip" : "One-way"} · ${item.date}</span>
      </div>
      <button class="history-delete" onclick="deleteHistoryItem(${item.id}, event)" title="Remove this search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    `;
    listEl.appendChild(li);
  });
}

// Global functions attached to window for inline onclick handlers
window.restoreSearch = function (id) {
  const history = getStoredHistory();
  const found = history.find(item => item.id === id);
  if (!found) return;

  state.distanceKm = found.distanceKm;
  state.sourceText = found.sourceText;
  state.destText = found.destText;
  state.sourceCoords = found.sourceCoords;
  state.destCoords = found.destCoords;
  state.passengerCount = found.passengers || 1;
  state.isRoundTrip = !!found.isRoundTrip;

  document.getElementById("sourceInput").value = state.sourceText;
  document.getElementById("destInput").value = state.destText;
  document.getElementById("manualDistanceInput").value = state.distanceKm;
  document.getElementById("passengerCountInput").value = state.passengerCount;
  document.getElementById("roundTripSwitch").checked = state.isRoundTrip;

  updateMapMarkers();
  fetchRoadRoute();
  showAlert(`Loaded saved route: "${found.title}"`, "info");
};

window.deleteHistoryItem = function (id, event) {
  if (event) event.stopPropagation();
  let history = getStoredHistory();
  history = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderSearchHistory();
};

window.clearAllHistory = function () {
  localStorage.removeItem(STORAGE_KEY);
  renderSearchHistory();
};

// ============================================================================
// 9. EVENT LISTENERS & USER CONTROLS
// ============================================================================
function initEventListeners() {
  // Plan / Calculate Route Form Submit
  const plannerForm = document.getElementById("plannerForm");
  if (plannerForm) {
    plannerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit();
    });
  }

  // Manual Distance Input change
  const manualDistanceInput = document.getElementById("manualDistanceInput");
  if (manualDistanceInput) {
    manualDistanceInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.distanceKm = val;
        calculateAndRender();
      }
    });
  }

  // Passengers stepper
  const passengerInput = document.getElementById("passengerCountInput");
  const btnMinusPassenger = document.getElementById("btnMinusPassenger");
  const btnPlusPassenger = document.getElementById("btnPlusPassenger");

  if (btnMinusPassenger && passengerInput) {
    btnMinusPassenger.addEventListener("click", () => {
      let val = parseInt(passengerInput.value, 10) || 1;
      if (val > 1) {
        val -= 1;
        passengerInput.value = val;
        state.passengerCount = val;
        calculateAndRender();
      }
    });
  }

  if (btnPlusPassenger && passengerInput) {
    btnPlusPassenger.addEventListener("click", () => {
      let val = parseInt(passengerInput.value, 10) || 1;
      if (val < 10) {
        val += 1;
        passengerInput.value = val;
        state.passengerCount = val;
        calculateAndRender();
      }
    });
  }

  // Round Trip Switch
  const roundTripSwitch = document.getElementById("roundTripSwitch");
  if (roundTripSwitch) {
    roundTripSwitch.addEventListener("change", (e) => {
      state.isRoundTrip = e.target.checked;
      calculateAndRender();
    });
  }

  // Reverse / Swap points button
  const swapBtn = document.getElementById("swapPointsBtn");
  if (swapBtn) {
    swapBtn.addEventListener("click", () => {
      const tempText = state.sourceText;
      state.sourceText = state.destText;
      state.destText = tempText;

      const tempCoords = state.sourceCoords;
      state.sourceCoords = state.destCoords;
      state.destCoords = tempCoords;

      document.getElementById("sourceInput").value = state.sourceText;
      document.getElementById("destInput").value = state.destText;

      updateMapMarkers();
      fetchRoadRoute();
    });
  }

  // Use Current Location
  const locateMeBtn = document.getElementById("locateMeBtn");
  if (locateMeBtn) {
    locateMeBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showAlert("Geolocation is not supported by your browser.", "error");
        return;
      }
      showAlert("Detecting your current location...", "info");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          state.sourceCoords = { lat, lng };
          state.sourceText = `My Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          document.getElementById("sourceInput").value = state.sourceText;
          updateMapMarkers();
          fetchRoadRoute();
          showAlert("Current location set as Start Point!", "info");
        },
        (err) => {
          showAlert("Unable to retrieve your location: " + err.message, "error");
        }
      );
    });
  }

  // Dark / Light Theme Toggle
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
}

/**
 * Handle route planner form submit (geocoding text inputs if updated)
 */
async function handleFormSubmit() {
  const srcInput = document.getElementById("sourceInput");
  const dstInput = document.getElementById("destInput");
  const distInput = document.getElementById("manualDistanceInput");

  const srcVal = srcInput ? srcInput.value.trim() : "";
  const dstVal = dstInput ? dstInput.value.trim() : "";
  const distVal = distInput ? parseFloat(distInput.value) : 0;

  // If user only typed a manual distance
  if ((!srcVal || !dstVal) && distVal > 0) {
    state.distanceKm = distVal;
    calculateAndRender();
    saveCurrentSearch();
    showAlert(`Calculated options for ${state.distanceKm} km trip.`, "info");
    return;
  }

  if (!srcVal || !dstVal) {
    showAlert("Please enter both Start and Destination, or type a distance in km.", "error");
    return;
  }

  showAlert("Searching locations and calculating route...", "info");

  // Geocode origin if changed from text
  if (srcVal !== state.sourceText) {
    const geoA = await geocodePlace(srcVal);
    if (geoA) {
      state.sourceCoords = { lat: geoA.lat, lng: geoA.lng };
      state.sourceText = srcVal;
    } else {
      showAlert(`Could not find coordinates for "${srcVal}". Using current distance.`, "error");
    }
  }

  // Geocode destination if changed from text
  if (dstVal !== state.destText) {
    const geoB = await geocodePlace(dstVal);
    if (geoB) {
      state.destCoords = { lat: geoB.lat, lng: geoB.lng };
      state.destText = dstVal;
    } else {
      showAlert(`Could not find coordinates for "${dstVal}". Using current distance.`, "error");
    }
  }

  updateMapMarkers();
  await fetchRoadRoute();
  saveCurrentSearch();
}

/**
 * Initialize Preset Route Buttons
 */
function initPresets() {
  const container = document.getElementById("presetChipsContainer");
  if (!container) return;

  container.innerHTML = "";
  PRESETS.forEach((preset) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-btn";
    chip.textContent = preset.name;
    chip.addEventListener("click", () => {
      state.sourceText = preset.source;
      state.destText = preset.dest;
      state.distanceKm = preset.dist;

      document.getElementById("sourceInput").value = preset.source;
      document.getElementById("destInput").value = preset.dest;
      document.getElementById("manualDistanceInput").value = preset.dist;

      if (preset.srcCoords && preset.dstCoords) {
        state.sourceCoords = preset.srcCoords;
        state.destCoords = preset.dstCoords;
        updateMapMarkers();
        fetchRoadRoute();
      } else {
        calculateAndRender();
      }
      saveCurrentSearch();
    });
    container.appendChild(chip);
  });
}

// ============================================================================
// 10. THEME MANAGEMENT (Light / Dark)
// ============================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("ecoroute_theme") || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = current === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("ecoroute_theme", newTheme);

  // Redraw chart with theme colors
  calculateAndRender();
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);

  const themeLabel = document.getElementById("themeLabel");
  const themeIcon = document.getElementById("themeIcon");

  if (theme === "dark") {
    if (themeLabel) themeLabel.textContent = "Light Mode";
    if (themeIcon) {
      themeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    }
  } else {
    if (themeLabel) themeLabel.textContent = "Dark Mode";
    if (themeIcon) {
      themeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }
}

// ============================================================================
// 11. HELPER ALERT NOTIFICATIONS
// ============================================================================
let alertTimeout = null;

function showAlert(message, type = "info") {
  const box = document.getElementById("alertBanner");
  if (!box) return;

  box.textContent = message;
  box.className = `alert-box show alert-${type}`;

  if (alertTimeout) clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    hideAlert();
  }, 6000);
}

function hideAlert() {
  const box = document.getElementById("alertBanner");
  if (box) {
    box.className = "alert-box";
  }
}
