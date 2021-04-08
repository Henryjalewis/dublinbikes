let map;

function initMap() {

  fetch("/stations").then(response => {
    return response.json();
  }).then (data => {
    // Sets the map to centre on Dublin
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 53.346, lng: -6.26986 },
      zoom: 13.9,
      mapTypeControl:true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },
    });

    // variable to hold info window
    var infoWindow = new google.maps.InfoWindow();
    // variables for change of color on markers indicating bike availability
    var redImage = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    var orangeImage = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    var greenImage = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

        // Sets the map markers on the bike stations
       data.forEach(station => {
           var availablePercent = (station.available_bikes / station.bike_stands) * 100;
           console.log(availablePercent);
           if (availablePercent >= 0 && availablePercent <= 10){
               const marker = new google.maps.Marker({
                   position: {lat: station.pos_lat, lng: station.pos_long},
                   map: map,
                   icon: redImage,
               });
               // Adds an info window to an event listener to each station map markers on the bike stations
              marker.addListener('click', function () {
                  infoWindow.setContent(
                      "<h4>" + station.name + "</h4>" +
                      "<hr>" +
                      "<p>Available Bikes: " + station.available_bikes + "</p>" +
                      "<p>Empty Stands: " + station.available_bike_stands + "</p>"
                  );
                  infoWindow.open(map, marker);
              });
           }else if (availablePercent >= 10 && availablePercent <= 40){
                const marker = new google.maps.Marker({
                   position: {lat: station.pos_lat, lng: station.pos_long},
                   map: map,
                   icon: orangeImage,
               });
                // Adds an info window to an event listener to each station map markers on the bike stations
              marker.addListener('click', function () {
                  infoWindow.setContent(
                      "<h4>" + station.name + "</h4>" +
                      "<hr>" +
                      "<p>Available Bikes: " + station.available_bikes + "</p>" +
                      "<p>Empty Stands: " + station.available_bike_stands + "</p>"
                  );
                  infoWindow.open(map, marker);
              });
           }else if (availablePercent >= 40){
               const marker = new google.maps.Marker({
                   position: {lat: station.pos_lat, lng: station.pos_long},
                   map: map,
                   icon: greenImage,
               });
               // Adds an info window to an event listener to each station map markers on the bike stations
              marker.addListener('click', function () {
                  infoWindow.setContent(
                      "<h4>" + station.name + "</h4>" +
                      "<hr>" +
                      "<p>Available Bikes: " + station.available_bikes + "</p>" +
                      "<p>Empty Stands: " + station.available_bike_stands + "</p>"
                  );
                  infoWindow.open(map, marker);
              });
           }


       });
        map.addListener('click', function () {
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
    if (location.href != "analytics/information") {
        // open new window at url detail
        location.href ="analytics/information";

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
            type: 'bar',
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
            });
    
    // fecthing the average data 
    fetch("/dayavg/" + StationName).then(response=> {
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
                time[i] = date.toLocaleTimeString('en-US');
            }
            // create the chart containing the data 
            // rempve the current chart to place new one
            ctx = document.getElementById('chart4').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            // create line chart
            myChart = new Chart(ctx, {
            type: 'bar',
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
            });
    
    
    // fecthing the average data 
    fetch("/pastavg/" + StationName).then(response=> {
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
                time[i] = date.toLocaleTimeString('en-US');
            }
            // create the chart containing the data 
            // rempve the current chart to place new one
            ctx = document.getElementById('chart3').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            // create line chart
            myChart = new Chart(ctx, {
            type: 'bar',
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
            });

}

function defaultChart() {
    // fecthing the average data 
    fetch("/houravg").then(response=> {
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
                time[i] = date.toLocaleTimeString('en-US');
            }
            // create the chart containing the data 
            // rempve the current chart to place new one
            ctx = document.getElementById('myChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.width, ctx.height);


            // create line chart
            myChart = new Chart(ctx, {
            type: 'bar',
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
            }],
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        }
    ).catch(err => {
            console.log("ERROR",err)
            })
    
    Drop();
}

function getLocation() {
    
}

async function fetchWeather(){
    const response = await fetch("/weather");
    const weatherData = await response.json();
    return weatherData;
}

fetchWeather().then(weatherData => {
    // Temperature from Kelvin to Celcius
    var tempCelcius = Math.floor(weatherData[0].feels_like-273.16);
    // Windspeed in MPH
    var windSpeed = Math.floor((weatherData[0].wind_speed) * 2.23694);
    // get year and time
    var timestamp = weatherData[0].time;
    var date = new Date(timestamp);
    // days of the week

    var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug','Sept', 'Oct', 'Nov', 'Dec'];
    var dayName = days[date.getDay()];
    var month = months[date.getMonth()]
    var dateMonth = dayName + " - " + month + " - " + date.getDate();
    console.log(dateMonth)
    // Humidity
    var humidity = weatherData[0].humidity;
    var iconCode = weatherData[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";

    document.getElementById("dateTime").innerHTML = dateMonth;
    document.getElementById("temp").innerHTML = tempCelcius + "&deg";
    document.getElementById("wind").innerHTML = windSpeed + " MPH";
    document.getElementById("humidity").innerHTML = humidity + " %";
    document.getElementById("imageBox").src = iconUrl;

}).catch(err=> {
    console.log("OOPS", err);
})

