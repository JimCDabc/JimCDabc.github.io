// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

var terrain = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.mapbox-terrain-v2",
    accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
  QUAKES: new L.LayerGroup(),
  PLATES: new L.LayerGroup(),
};

// Create the map with our layers
var map = L.map("map", {
    center: [30, 0],
    zoom: 2,
    layers: [
        lightmap,
        layers.QUAKES,
        layers.PLATES
    ]
});

// // Add our 'lightmap' tile layer to the map
// lightmap.addTo(map);
// create base layers
var baselayers = { 
    "Lightmap": lightmap,
    "Darkmap" : darkmap,
    "Satellite" : satellite,
    "Outdoors" : outdoors,
    "Terrain" : terrain
};

// Create an overlays object to add to the layer control
var overlays = {
  "Earthquakes": layers.QUAKES,
  "Tectonic Plates": layers.PLATES
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(baselayers, overlays).addTo(map);

// color scale
function getColor(d) {
    return d > 9 ? '#800026' :  
        d > 8 ? '#800026' :
        d > 7 ? '#bd0026' :
        d > 6 ? '#e31a1c' :
        d > 5 ? '#fc4e2a' :
        d > 4 ? '#fd8d3c' :
        d > 3 ? '#feb24c' :
        d > 2 ? '#fed976' :
        d > 1 ? '#ffeda0' :
                '#ffffcc'

}

var grades = [0,1,2,3,4,5,6,7,8]
// Create a legend to display information about our map
var info = L.control({
    position: "bottomright"
});
  
// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> '
         + grades[i] 
         + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    return div;
};

// Add the info legend to the map
info.addTo(map);

// Perform an API call to the Citi Bike Station Information endpoint
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson", function(quakeRes) {

    console.log("Earthquake JSON Results: ", quakeRes);
    var quakeFeatures = quakeRes.features;
    quakeFeatures.forEach(function(quake) {
        var latlng = L.latLng(quake.geometry.coordinates[1], quake.geometry.coordinates[0]);
        var props = quake.properties;

        // convert USGS time (milleseconds since 1970 to a string)
        var date = new Date(props.time);
        datestr = date.toString();

        // create the marker for the quake and bind pop up
        var quakeMarker =
            L.circle(latlng, {
            color: getColor(props.mag),
            stroke: false,
            fillOpacity: 0.8,
            // radius:  10000 * (2 ** props.mag),
            radius:  50000 * props.mag
            }).bindPopup(props.place + "<br>Magnitude: " +
            + props.mag + "<br>Time: " + datestr);

        // console.log(layers.QUAKES);
        layers.QUAKES.addLayer(quakeMarker);
   });

    // var promise = d3.json("https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json", function(plateRes) {
    // downloaded tectonic plate data locally from https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json
    // d3.json("./static/data/tectonicplates-master/GeoJSON/PB2002_plates.json", function(plateRes) {
        d3.json("./static/data/tectonicplates-master/GeoJSON/PB2002_boundaries.json", function(plateRes) {
        console.log("Tectonic Plate Response: ", plateRes);
        plateFeatures = plateRes.features
        plateFeatures.forEach(function(plateFeature) {
            plateLayer = L.geoJSON(plateFeature, {
                color: "yellow",
                stroke:true,
                weight: "1",
            })

            // <path class="leaflet-interactive" stroke="yellow" stroke-opacity="1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M1259 474L1264 481L1269 478L1275 485L1281 480L1294 495L1299 490L1312 502"></path>

            layers.PLATES.addLayer(plateLayer);
        });
    });
})