let map;

function initMap() {

  fetch("/stations").then(response => {
    return response.json();
  }).then (data => {
    // Sets the map to centre on Dublin
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 53.346, lng: -6.26986 },
      zoom: 13.9,
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
          "<p>Available Bikes: " + station.available_bikes + "</p>" +
          "<p>Empty Stands: " + station.available_bike_stands + "</p>"
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


function redirectStation() {
    // Store 
    y = document.getElementById("station");
    // save the variable in the tab name    
    sessionStorage.setItem("stationName", y.value);
    if (window.location.href != "/information") {
        // open new window at url detail
        location.href ="/information";
    } else {
        selectStation();
    }
    
}

function selectStation(){
    // Retrieve data after new page open
    var StationName = sessionStorage.getItem("stationName");
    console.log(StationName)
    // sets the title of the charts
    dets = document.getElementById("Title");
    dets.innerHTML = StationName;

    // fecthing the current data 
    fetch("/details/" + StationName).then(response=> {
        console.log(response);
        return response.json();

    }).then(data => 
            {
            console.log("station: ", data);


            // create the chart containing the data 
            // rempve the current chart to place new one
            ctx = document.getElementById('chart1').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            vals = data;
    // create new chart

            myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['available bikes', 'avaliable stands'],
                datasets: [{
                    label: 'Station Counts',
                    data: [vals[0].available_bikes, vals[0].available_bike_stands],
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
    
    // fecthing the average data 
    fetch("/avgdetails/" + StationName).then(response=> {
        console.log(response);
        return response.json();

    }).then(data => 
            {
            console.log("average: ", data);

            // we need to extract the data and put into an array
            available_bikes = [];
            available_stands= [];
            time = [];
            
            for (i = 0; i < data.length; i++) {
                available_bikes[i] = data[i].available_bikes;
                available_stands[i] = data[i].available_bike_stands;
                date = new Date(data[i].last_update)
                time[i] = date.toLocaleDateString('zh-Hans-CN');
            }
            // create the chart containing the data 
            // rempve the current chart to place new one
            ctx = document.getElementById('chart2').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            // create line chart
            myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: time,
                datasets: [{
                    label: 'available bikes',
                    data: available_bikes,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'green',
                    fill: false,
                }, {
                label: "available stands",
                data: available_stands,
                borderColor: "red",
                backgroundColor: "rgba(225,0,0,0.4)",
                fill: false,
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
}

function getLocation() {
    
}

async function fetchWeather(){
    const response = await fetch("/weather");
    const weatherData = await response.json();
    return weatherData;
}

fetchWeather().then(weatherData => {
    weatherData
    console.log(weatherData);
    console.log(weatherData[0].description);
}).catch(err=> {
    console.log("OOPS", err);
})
