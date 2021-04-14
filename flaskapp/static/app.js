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
           //console.log(availablePercent);
           if (availablePercent >= 0 && availablePercent < 10){
               const marker = new google.maps.Marker({
                   position: {lat: station.pos_lat, lng: station.pos_long},
                   map: map,
                   icon: redImage,
               });
               // Adds an info window to an event listener to each station map markers on the bike stations
              marker.addListener('click', function () {
                  stationName = encodeURIComponent(station.name.trim())
                  infoWindow.setContent(
                      "<h4>" + station.name + "</h4>" +
                      "<hr>" +
                      "<p>Available Bikes: " + station.available_bikes + "</p>" +
                      "<p>Empty Stands: " + station.available_bike_stands + "</p>"
                  );
                  infoWindow.open(map, marker);
              });
           }else if (availablePercent >= 10 && availablePercent < 40){
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

          // Add a style-selector control to the map.
          const styleControl = document.getElementById("style-selector-control");
          map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(styleControl);
          // Set the map's style to the initial value of the selector.
          const styleSelector = document.getElementById("style-selector");
          map.setOptions({ styles: styles[styleSelector.value] });
          // Apply new JSON when the user selects a different style.
          styleSelector.addEventListener("change", () => {
            map.setOptions({ styles: styles[styleSelector.value] });
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
    if (sessionStorage.getItem("stationName") == null) {
      sessionStorage.setItem("stationName", data[0].name)
      selectStation(); dropDay(); dropHour();
    }
    options = "";
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
    selectStation();
}

function selectStation(){

    // Retrieve data after new page open
    var StationName = sessionStorage.getItem("stationName");

    // sets the title of the charts
    dets = document.getElementById("Title");
    dets.innerHTML = StationName;

    // creates the template for the charts
    document.getElementById("realTime").innerHTML = "<div class=\"chartdivs\">\
                                                      <div class=\"chart2\">\
                                                        <h2 class=\"chartTitle\"> Daily averages</h2>\
                                                        <canvas id=\"chart2\" style=\"float:right; \">\
                                                        </canvas>\
                                                      </div>\
                                                      <div class=\"chart1\">\
                                                        <h2 class=\"chartTitle\"> Current available data</h2>\
                                                        <canvas id=\"chart1\" style=\"float:left; width: 50%;\">\
                                                        </canvas>\
                                                      </div>\
                                                      <div class=\"chart3\">\
                                                        <h2 class=\"chartTitle\"> Hourly average of previous day</h2>\
                                                        <canvas id=\"chart3\" style=\"float:right;\">\
                                                        </canvas>\
                                                      </div>\
                                                      <div class=\"chart4\">\
                                                        <h2 class=\"chartTitle\"> Today's hourly average so far</h2>\
                                                        <canvas id=\"chart4\" style=\"float:left;\">\
                                                        </canvas>\
                                                      </div>\
                                                    </div>"

    // fecthing the current data 
    fetch("/details/" + StationName).then(response=> {
        return response.json();

    }).then(data => 
            {
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
                        '#4b778d',
                        '#9e9d89'
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: 50
                },
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
        return response.json();

    }).then(data => 
            {

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
                    backgroundColor: '#4b778d',
                    borderColor: 'green',
                    fill: false,
                }, {
                label: "available stands",
                data: available_stands,
                borderColor: "red",
                backgroundColor: "#9e9d89",
                fill: false,
            }]
            },
            options: {
                layout: {
                    padding: 50
                },
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
        return response.json();

    }).then(data => 
            {

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
                    backgroundColor: '#4b778d',
                    borderColor: 'green',
                    fill: false,
                }, {
                label: "available stands",
                data: available_stands,
                borderColor: "red",
                backgroundColor: "#9e9d89",
                fill: false,
            }]
            },
            options: {
                layout: {
                    padding : 50
                },
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
        return response.json();

    }).then(data => 
            {

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
                    backgroundColor: '#4b778d',
                    borderColor: 'green',
                    fill: false,
                }, {
                label: "available stands",
                data: available_stands,
                borderColor: "red",
                backgroundColor: "#9e9d89",
                fill: false,
            }]
            },
            options: {
                layout: {
                    padding : 50
                },
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

// make the time drop down menus
// the date drop down
function dropDay() {
    list = document.getElementById("dayDrop");
    startDate = new Date();
    options = "";  
    for (i = 0; i <=5 ; i++) {
        var currentDate = new Date();
        currentDate.setDate(startDate.getDate() + i);
        options += "<option value='" + currentDate.getDay() + "'>" + currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + "</option>"; 
    }
    list.innerHTML += options;
}

// make the hour drop down
function dropHour() {
    minutes = ["00",30];
    
    // make the drop down menu to contain the hours of days
    list = document.getElementById("hour");
    string = "";
    for (i = 0; i < 24; i++) {
        for (j = 0; j < 2; j++)
        string += "<option value='" + i +", "+ minutes[j]+"]}" + "'>" + i +":" + minutes[j] + "</option>"; 
    }
    list.innerHTML += string;
}

// get the data from prediction
function predict() {

  // creates the template for the charts
    document.getElementById("pred").innerHTML = "<div class=\"chartdivspred\">\
                                                  <div class=\"chart1\">\
                                                    <h2>Prediction</h2>\
                                                    <canvas id=\"chart5\" style=\"float:left; width:50%\">\
                                                    </canvas>\
                                                  </div>\
                                                  <div class=\"chart2\">\
                                                    <h2>Full day prediction</h2>\
                                                    <canvas id=\"chart6\" style=\"float:left; width:50%\">\
                                                    </canvas>\
                                                  </div>\
                                                </div>"

    dayofWeek = document.getElementById("dayDrop").value;
    list = document.getElementById("hour").value;
    
    arr = list.split(",");
    hour = parseInt(arr[0]);
    minutes = parseInt(arr[1]);
    var StationName = sessionStorage.getItem("stationName");

    
    fetch("/predict/" + dayofWeek + "/" + hour + "/" + minutes + "/" + StationName).then(response=> {
        return response.json();
    }).then(data=>
            {            
            
             if(window.mypredChart != null){
                 window.mypredChart.destroy();
             }
             
            // create the chart containing the data 
            // remove the current chart to place new one
            canvas = document.getElementById('chart5');
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            vals = data;
    // create new chart
            window.mypredChart = new Chart(context, {
            type: 'pie',
            data: {
                labels: ['available bikes', 'avaliable stands'],
                datasets: [{
                    label: 'Station Counts',
                    data: [vals[0].bikes, vals[0].stands],
                    backgroundColor: [
                        '#4b778d',
                        '#9e9d89'
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: 50
                },
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

    // fetch the rest of the days data
    fetch("/daypredict/" + dayofWeek + "/" + hour + "/" + minutes + "/" + StationName).then(response=> {
        return response.json();
    }).then(data=>
            {

            // remove the previous chart
             if(window.daychart != null){
                 window.daychart.destroy();
             }

             // retrieve data from json
             available_bikes = [];
             available_stands = [];
             time = [];
             for (i = 0; i < data.length ; i++) {
                 available_bikes[i] = data[i].bikes;
                 available_stands[i] = data[i].stands;

             }

             // get the list of times
             // last time of the day is 23:30
             time[0] = hour + ":" + minutes;
             timeleft = (23 - hour) * 2 ;
             if (minutes == 0) {
                 timeleft = timeleft + 1;
             }
             for (j = 1; j < data.length; j++) {
                 minutes = (minutes + 30) % 60;
                 if (minutes == 0) {
                     hour = hour + 1
                 }
                 time[j] = hour + ":" + minutes;

             }

            // create the chart containing the data
            // remove the current chart to place new one
            canvas = document.getElementById('chart6');
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

    // create new chart
            window.daychart = new Chart(context, {
            type: 'bar',
            data: {
                labels: time,
                datasets: [{
                    label: 'available bikes',
                    data: available_bikes,
                    backgroundColor: '#4b778d',
                    borderColor: 'green',
                    fill: false,
                }, {
                label: "available stands",
                data: available_stands,
                borderColor: "red",
                backgroundColor: "#9e9d89",
                fill: false,
            }]
            },
            options: {
                layout: {
                    padding : 50
                },
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

function fetchWeather(){
  fetch("/weather").then(response => {
    return response.json();
  }).then(weatherData => {
    // Temperature from Kelvin to Celcius
    var tempCelcius = Math.floor(weatherData[0].temp-273.16);
    // Windspeed in MPH
    var windSpeed = Math.floor((weatherData[0].wind_speed) * 2.23694);
    // get year and time
    var timestamp = weatherData[0].time;
    var date = new Date(timestamp);
    // Weather Description
    var description = weatherData[0].description;

    // days of the week

    var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug','Sept', 'Oct', 'Nov', 'Dec'];
    var dayName = days[date.getDay()];
    var month = months[date.getMonth()]
    var dateMonth = dayName + " - " + month + " - " + date.getDate();
    // Humidity
    var humidity = weatherData[0].humidity;
    var iconCode = weatherData[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";

    document.getElementById("description").innerHTML = description;
    document.getElementById("dateTime").innerHTML = dateMonth;
    document.getElementById("temp").innerHTML = tempCelcius + "&deg";
    document.getElementById("wind").innerHTML = windSpeed + " MPH";
    document.getElementById("humidity").innerHTML = humidity + " %";
    document.getElementById("imageBox").src = iconUrl;

  }).catch(err=> {
      console.log("OOPS", err);
  })
}

const styles = {
  default: [],
  silver: [
    {
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
  ],
  night: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  retro: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#c9b2a6" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "geometry.stroke",
      stylers: [{ color: "#dcd2be" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ae9e90" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#93817c" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#a5b076" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#447530" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#fdfcf8" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f8c967" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e9bc62" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#e98d58" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry.stroke",
      stylers: [{ color: "#db8555" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#806b63" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8f7d77" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ebe3cd" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#b9d3c2" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#92998d" }],
    },
  ],
  hiding: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};
