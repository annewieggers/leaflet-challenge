// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time, status and tsunami impact of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Location: " + feature.properties.place +
      "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p>" +
      "<p>Magnitude: " + feature.properties.mag + "</p>")
  }

  // Define function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define a function for the colour of the circle based on magnitude
function circleColor(magnitude) {
    switch (true) {
        case magnitude > 5:
            return "red";
        case magnitude > 4:
            return "darkorange";
        case magnitude > 3:
            return "orange";
        case magnitude > 2:
            return "yellow";
        case magnitude > 1:
            return "green";
    default:
      return "lightblue";
    }
  }
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radiusSize(earthquakeData.properties.mag),
          color: circleColor(earthquakeData.properties.mag),
          fillOpacity: 1
        });
      },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define satellite, grayscale and outdoors map layers
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

  // Create the faultline layer for bonus
  var faultLine = new L.LayerGroup();

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Gray Map": grayscaleMap,
    "Outdoors Map": outdoorsMap
  };

  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: faultLine
  };

  // Create our map, giving it the outdoors map and earthquakes and faultline layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satelliteMap, earthquakes, faultLine]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Perform a GET request to the query URL for faultline (bonus)
var faultlineUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
// Create the faultlines and add them to the faultline layer
d3.json(faultlineUrl, function(data) {
  L.geoJSON(data, {
    style: function() {
      return {color: "purple", fillOpacity: 0}
    }
  }).addTo(faultLine)
})

// Create legend
  // color function to be used when creating the legend
  function legendColor(d) {
    return d > 5 ? 'red' :
           d > 4  ? 'darkorange' :
           d > 3  ? 'orange' :
           d > 2  ? 'yellow' :
           d > 1  ? 'green' :
                    'lightblue';
  }

// Create a legend to display information about our map
var legend = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend"),
    mags = [0, 1, 2, 3, 4, 5],
    labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
            '<i style="background:' + legendColor(mags[i] + 1) + '"></i> ' +
            mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
  }
  return div;
};
  
// Add the info legend to the map
legend.addTo(myMap);
}




  




