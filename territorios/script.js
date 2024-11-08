// Initialize the map with a dark tile layer
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


// L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//   maxZoom: 18,
//   attribution: '© OpenStreetMap contributors',
// }).addTo(map);

// Function to generate a random color in hexadecimal
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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
  const zoomLevel = map.getZoom() ;
  var fSize;
  if (zoomLevel < 14) { fSize = 0} else
  if (zoomLevel < 15) {fSize = 1} else
    if (zoomLevel < 16) { fSize = 1.5 } else
      if (zoomLevel < 17) { fSize = 2 } else
        if (zoomLevel < 18) { fSize =  3} else
          if (zoomLevel < 19) { fSize = 4 } else
            if (zoomLevel < 20) { fSize = 5 } else
            { fSize = 6 } ;

  console.log(zoomLevel + "  " + fSize)
  document.querySelectorAll('.territorio-label span').forEach(label => {
    label.style.fontSize = `${(fSize)}em`; // Adjust font size based on zoom
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

    console.log("Transformed Territorios Data:", territoriosTransformed); // Debug

    // Verify that transformedData is a valid FeatureCollection
    if (territoriosTransformed.type !== "FeatureCollection" || !Array.isArray(territoriosTransformed.features)) {
      throw new Error("Invalid GeoJSON structure for Territorios");
    }

    // Add the Territorios polygons to the map with dark mode styling
    const territoriosLayer = L.geoJSON(territoriosTransformed, {
      style: function (feature) {
        const territorio = feature.properties.territorio;
        if (!territorioColors[territorio]) {
          territorioColors[territorio] = getRandomColor(); // Assign random color if not already assigned
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
          html: `<span style="color: ${labelColor};">${feature.properties.territorio}</span>`,
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

    console.log("Transformed Grupos Data:", gruposTransformed); // Debug

    // Verify that transformedData is a valid FeatureCollection
    if (gruposTransformed.type !== "FeatureCollection" || !Array.isArray(gruposTransformed.features)) {
      throw new Error("Invalid GeoJSON structure for Grupos");
    }

    // Add the Grupos polygons to the map with dark mode styling, making them non-interactive
    const gruposLayer = L.geoJSON(gruposTransformed, {
      style: function (feature) {
        return {
          color: 'blue',  // Light cyan border for visibility
          weight: 10,  // Thicker border for contrast
          opacity: 0.2,  // Semi-transparent border
          dashArray: '5, 15',
          fillOpacity: 0, // No fill
        };
      },
      interactive: false  // Make the layer non-interactive
    }).addTo(map);

    // Automatically adjust the map view to fit the bounds of the loaded data
    map.fitBounds(territoriosLayer.getBounds());

  } catch (error) {
    console.error("Error loading map data:", error);
  }
};

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// Call the async function to load and display the map data
loadMapData();
