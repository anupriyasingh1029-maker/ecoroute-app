# 🌱 EcoRoute – Eco-Friendly Route Planner

A lightweight, high-performance, single-page web application designed to help commuters, travelers, and city planners compare carbon emissions, fuel consumption, travel times, and costs across 10 different transport modes.

Built with pure **HTML5, CSS3, and Vanilla JavaScript** — **no backend required, no API keys, and 100% free to host on GitHub Pages** or any static web host.

---

## 🚀 Live Demo & GitHub Pages Hosting

Because this project is built entirely with client-side vanilla technologies, you can host it for free on GitHub Pages in under 60 seconds:

1. Push or upload these files (`index.html`, `style.css`, `script.js`, `README.md`) to a repository on GitHub.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## ✨ Features

1. **Interactive Route Map (Leaflet.js + OpenStreetMap)**
   - Click anywhere on the map to place **Start (Point A)** and **Destination (Point B)** pins.
   - Drag pins dynamically to update points and recalculate routes.
   - Uses the free Open Source Routing Machine (OSRM) to calculate realistic driving distances along actual roads, with an instant geometric fallback (Haversine formula + winding factor) if offline.
   - Single-click **"Locate Me"** button to automatically detect your GPS position.

2. **10 Modes of Transport Compared**
   - 🚶 **Walking** (0 g CO2, 0 cost, tracks calories burned)
   - 🚲 **Cycling** (0 g CO2, 0 cost, tracks calories burned)
   - 🛴 **Electric Scooter** (~16 g CO2/km grid emissions, ultra-cheap)
   - 🏍️ **Petrol Motorcycle / Bike** (~46 g CO2/km, agile city travel)
   - 🚗 **Petrol Car** (~165 g CO2/km, default private baseline benchmark)
   - 🚙 **Diesel Car** (~150 g CO2/km, higher particulates, better fuel economy)
   - ⚡ **Electric Car (EV)** (~75 g CO2/km grid footprint, zero tailpipe emissions)
   - 🛺 **CNG Auto Rickshaw** (~78 g CO2/km, metered fare in INR)
   - 🚌 **City Public Bus** (~32 g CO2/passenger-km)
   - 🚇 **Metro Train** (~18 g CO2/passenger-km, fastest urban rapid transit)

3. **Detailed Metrics for Every Mode**
   - **Travel Time** (hours & minutes calculated from realistic urban speeds).
   - **Fuel / Energy Consumed** (kcal for active modes, kWh for EVs, Litres for petrol/diesel, kg for CNG).
   - **Carbon Emitted** (in kg CO2e per person).
   - **Trip Cost** in Indian Rupees (**₹ INR**).
   - **Emissions Saved** relative to a petrol car.

4. **Carbon Footprint Visualizations**
   - **Spotlight Banner** highlighting the greenest option with tree absorption day equivalencies.
   - **Interactive Chart.js Bar Chart** color-coded from emerald (zero/low emissions) to red (high emissions).
   - **Full Matrix Comparison Table** sortable by lowest carbon impact.

5. **Trip Parameter Controls**
   - **Passenger Count Stepper** (1 to 10): Automatically accounts for ride-sharing / carpooling benefits by distributing vehicular emissions and fares across passengers.
   - **Round Trip Toggle**: One-click 2x multiplier for return journeys.
   - **Direct Distance Input**: Enter a distance directly in kilometers without needing map coordinates.

6. **User Convenience**
   - **Dark / Light Mode**: Automatically detects system preference or toggles on demand with persistent `localStorage`.
   - **Recent Searches**: Saves the last 5 searched routes in `localStorage` for 1-click reloading.
   - **Actionable Greener Travel Tips**: 5 practical tips to minimize commuter emissions.
   - **Clear Error & Status Alerts**: User-friendly notices for invalid numbers or network fallbacks.

---

## 🛠️ Project Structure

```text
├── index.html        # Semantic HTML5 layout, Leaflet map canvas & Chart.js container
├── style.css         # Custom modern eco-themed CSS with CSS variables & dark mode
├── script.js         # Core vanilla JS: config, map routing, calculations & UI rendering
└── README.md         # Documentation, formulas, and customization guide
```

---

## ⚙️ How to Customize Emission Factors & Rates

All transport metrics, speeds, fuel consumption, and fares are located in a single, well-documented object at the top of `script.js`:

```javascript
const TRANSPORT_MODES = {
  petrol_car: {
    id: "petrol_car",
    name: "Petrol Car",
    category: "Private Car",
    speedKmH: 32.0,           // km/h average city speed
    co2PerKm: 0.165,          // kg CO2 per km (Benchmark: 14 km/L, 2.31 kg CO2/L)
    fuelType: "petrol",
    fuelRatePerKm: 0.071,     // Litres per km (1 / 14 km/L)
    fuelUnit: "L Petrol",
    costPerKm: 7.50,          // INR ₹ per km (~₹105/L / 14 km/L)
    baseFare: 0.0,
    isSharedVehicle: true,    // Emissions and fuel cost split across passengers
    // ...
  },
  // ... other modes
};
```

To update fuel prices (e.g. if petrol price changes from ₹105/L to ₹110/L) or change metro fare tiers, simply modify the `costPerKm`, `co2PerKm`, or `speedKmH` numbers in `script.js`.

---

## 🧪 Emission Factors Methodology & Sources

- **Petrol**: ~2.31 kg CO2 emitted per litre of petrol burned.
- **Diesel**: ~2.68 kg CO2 emitted per litre of diesel burned.
- **Electricity (Indian National Grid Average)**: ~0.70 kg CO2 per kWh (Central Electricity Authority / CEA baseline database).
- **CNG**: ~2.10 kg CO2 per kg of compressed natural gas burned.
- **Tree Absorption Equivalent**: 1 mature tree absorbs approximately 21.7 kg of CO2 per year (~0.06 kg per day).

---

## 📜 License

Distributed under the Apache-2.0 License. Free for educational, personal, and commercial use.
