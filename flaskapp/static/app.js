let map;

function initMap() {

  fetch("/stations").then(response => {
    return response.json();
  }).then (data => {
    // Sets the map to centre on Dublin
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 53.346, lng: -6.26986 },
      zoom: 14,
    });

    // variable to hold info eindow
    var infoWindow = new google.maps.InfoWindow();

    // Sets the map markers on the bike stations
    data.forEach(station => {
      const marker = new google.maps.Marker({
        position: { lat: station.pos_lat, lng: station.pos_long },
        map: map,
      });
    
      // Adds an info window to an event listener to each station map markers on the bike stations
      marker.addListener('click', function() {
        infoWindow.setContent(
          "<h4>" + station.name + "</h4>" +
          "<hr>" +
          "<p>Total Stands: " + station.bike_stands + "</p>" +
          "<p>Available Bikes: " + station.available_bikes + "</p>"
        );
        infoWindow.open(map, marker);
      });

    });

    map.addListener('click', function() {
      if (infowindow) infowindow.close();
    });

  }).catch(err => {
    console.log("ERROR",err);
  })
}


function Drop() {
  x = document.getElementById("station");
  fetch("/stations").then(response=> {
    return response.json();
  }).then (data => {
    // create drop down station names
    options = "<option value=0> </option>";
    for (i = 0; i < data.length; i++) {
      options += "<option value='" + data[i].name + "'>" + data[i].name + "</option>"; 
    }
    x.innerHTML = options;
  });
}


function selectStation() {
test = document.getElementById("Testing");
y = document.getElementById("station");
test.innerHTML = y.value;

dets = document.getElementById("Details");

// fecthing the data
fetch("/details/" + y.value).then(response=> {
  console.log(response);
  return response.json();
}).then(data => 
  {
  console.log("station: ", data);
  str = "available bikes :" + data[0].available_bikes + "available stations" + data[0].available_bike_stands
  dets.innerHTML = str;
  }
).catch(err => {
  console.log("ERROR",err)
  })
  return false;
}
