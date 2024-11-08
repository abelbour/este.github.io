// Initialize the map with a dark tile layer and set center
const map = L.map('map').setView([-31.73197, -60.5238], 13);

// Optional: Use a more distinct dark tile layer for enhanced dark mode experience
// L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
//   maxZoom: 18,
//   attribution: '© OpenStreetMap contributors, © CartoDB',
// }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// Function to generate a random color in hexadecimal
function getRandomColor() {
  const randomHue = Math.floor(Math.random() * 360); // Random hue between 0 and 359
  const saturation = 50; // Fixed saturation at 50%
  const lightness = 50; // Fixed lightness at 70%
  return `hsl(${randomHue}, ${saturation}%, ${lightness}%)`;
}

// Object to store colors for each unique Territorio
const territorioColors = {};

// Define the JSONata queries to extract GeoJSON and properties
const territoriosQuery = jsonata(`
{
  "type": "FeatureCollection",
  "name": "Territorios",
  "features": values.{
    "type": "Feature",
    "properties": {
      "territorio": $[0], 
      "Grupo": $[1], 
      "tessellate": -1, 
      "extrude": 0, 
      "visibility": -1 
    }, 
    "geometry": { 
      "type": "Polygon", 
      "coordinates": $eval($[4]) 
    }
  }
}`);

const gruposQuery = jsonata(`
{
  "type": "FeatureCollection",
  "name": "Grupos",
  "features": values.{
    "type": "Feature",
    "properties": {
      "Grupo": $[0]
    },
    "geometry": { 
      "type": "Polygon", 
      "coordinates": $eval($[3]) 
    }
  }
}`);

map.on('zoom', function () {
  const zoomLevel = map.getZoom();
  var fSize;
  if (zoomLevel < 14) { fSize = 0 } else
    if (zoomLevel < 15) { fSize = 1 } else
      if (zoomLevel < 16) { fSize = 1.5 } else
        if (zoomLevel < 17) { fSize = 3 } else
          if (zoomLevel < 18) { fSize = 5 } else
            if (zoomLevel < 19) { fSize = 8 } else
              if (zoomLevel < 20) { fSize = 10 } else { fSize = 12 };
console.log(zoomLevel + " " + fSize)
  document.querySelectorAll('.territorio-label span').forEach(label => {
    label.style.fontSize = `${fSize}em`; // Adjust font size based on zoom
  });
});

// Async function to load, transform, and display the data
async function loadMapData() {
  try {
    // Fetch data from Google Sheets (Territorios URL)
    const territoriosResponse = await fetch(territoriosURL);
    if (!territoriosResponse.ok) throw new Error(`Territorios data fetch error: ${territoriosResponse.statusText}`);
    const territoriosData = await territoriosResponse.json();

    // Apply JSONata query for Territorios asynchronously
    const territoriosTransformed = await new Promise((resolve, reject) => {
      try {
        const result = territoriosQuery.evaluate(territoriosData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // Add the Territorios polygons to the map
    const territoriosLayer = L.geoJSON(territoriosTransformed, {
      style: function (feature) {
        const territorio = feature.properties.territorio;
        if (!territorioColors[territorio]) {
          territorioColors[territorio] = getRandomColor();
        }
        return {
          color: territorioColors[territorio],
          weight: 1,
          opacity: 0.8,
          dashArray: '5, 5',
          fillOpacity: 0.1
        };
      },
      onEachFeature: function (feature, layer) {
        const center = layer.getBounds().getCenter();
        const labelColor = territorioColors[feature.properties.territorio];

        const label = L.divIcon({
          className: 'polygon-label territorio-label',
          html: `<span style="color: gray; opacity: 0.5;">${feature.properties.territorio}</span>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        });
        L.marker(center, { icon: label }).addTo(map);

        // Create a popup with territory and group info
        const popupContent = `
          <b style="color: black;">Territorio:</b> ${feature.properties.territorio || "No data"}<br>
          <b style="color: black;">Grupo:</b> ${feature.properties.Grupo || "No data"}
        `;
        layer.bindPopup(popupContent);
      }
    }).addTo(map);

    // Fetch data from Google Sheets (Grupos URL)
    const gruposResponse = await fetch(gruposURL);
    if (!gruposResponse.ok) throw new Error(`Grupos data fetch error: ${gruposResponse.statusText}`);
    const gruposData = await gruposResponse.json();

    // Apply JSONata query for Grupos asynchronously
    const gruposTransformed = await new Promise((resolve, reject) => {
      try {
        const result = gruposQuery.evaluate(gruposData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // Add the Grupos polygons to the map with a different style
    const gruposLayer = L.geoJSON(gruposTransformed, {
      style: function (feature) {
        return {
          color: 'teal',
          weight: 10,
          opacity: 0.25,
          dashArray: '15, 5',
          fillOpacity: 0,
        };
      },
      interactive: false  // Make the layer non-interactive
    }).addTo(map);

    // Fit map bounds to Territorios layer when loaded
    map.fitBounds(territoriosLayer.getBounds());

  } catch (error) {
    console.error("Error loading map data:", error);
  }
}

// Load and display the map data
loadMapData();

// Add the light-only-labels layer on top in a separate pane
map.createPane('labelsPane');  // Create a custom pane for labels
map.getPane('labelsPane').style.zIndex = 650;  // Set z-index above other layers
map.getPane('labelsPane').style.pointerEvents = 'none';  // Disable pointer events to prevent interference

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
  pane: 'labelsPane'  // Assign to the custom pane
}).addTo(map);
