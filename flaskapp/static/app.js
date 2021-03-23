let map;

function initMap() {

  fetch("/stations").then(response=> {
    return response.json();
  }).then (data => {
    console.log("data: ", data);

     // Sets the map to centre on Dublin
   map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3497645, lng: -6.2602732 },
    zoom: 13,
  });
     // Sets the map markers on the bike stations
  data.forEach(station => {
    const marker = new google.maps.Marker({
        position: { lat: station.pos_lat, lng: station.pos_long },
    map: map,
    });
       // Adds an info window to an event listener to each station map markers on the bike stations
    marker.addListener("click", () => {
     const infowindow = new google.maps.InfoWindow({
        content: station.name,
     });
    infowindow.open(map, marker);
  });

  });
  }).catch(err => {
      console.log("ERROR",err);
  })


}
