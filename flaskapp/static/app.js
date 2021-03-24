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
test = document.getElementById("Chart");
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
        
        
        // create the chart containing the data 
        // rempve the current chart to place new one
            ctx = document.getElementById('myChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);
        // create new chart
            myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['available bikes', 'avaliable stands'],
                datasets: [{
                    label: 'Station Counts',
                    data: [4, 5],
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    
        }
).catch(err => {
        console.log("ERROR",err)
        })
    return false;
}

function getLocation() {
    
}
