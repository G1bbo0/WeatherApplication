$(document).ready(function(){
    
    $(document).ajaxStart(function(){
            $('#loadingScreen').show();
            $('#main').hide();
        }).ajaxStop(function() {
            $('#loadingScreen').hide();
            $('#main').show();
        });
                                
    //var locationName = prompt("Please enter a location");

    var newLocation = "";
    
    $("#useLocation").click(function(){
        
        $('#loadingScreen').show();
        $('#main').hide();
    
        if (navigator.geolocation) {

            function success(pos) {
                
                $('#loadingScreen').show();
                $('#main').hide();
                var crds = pos.coords;

                // Set the string for the coordinates for DarkSky API
                newLocation = crds.latitude + "," + crds.longitude;

                //newLocation = getLocationCoords();

                // Set the string to get location name based on opencage format
                var latLongName = crds.latitude + "+" + crds.longitude;
                
                getLocationName(latLongName);

                // Run function to get weather data from API
                getWeatherData(newLocation);

            }

            function error(err) {
                //console.log(err);

                // Default location is Canberra
                var defaultLocation = '-35.28346,149.12807';
                
                getLocationName('-35.28346+149.12807');

                getWeatherData(defaultLocation);
                

            }

            // this is the line that triggers the browser prompt
            navigator.geolocation.getCurrentPosition(success, error);
        } 
        
        $('#startScreen').hide();
        $('#results').show();
    
    });
    
    
    $("#searchLocation").click(function(){
        $('#searchSpan').slideDown();
        $('#locationName').focus();
        $('#buttonSpan').slideUp();
    });
    
    $("#cancelSearch").click(function(){
        $('#searchSpan').slideUp();
        $('#locationName').val("");
        $('#buttonSpan').slideDown();
    });
    
    $("#submitSearch").click(function(){
        var locationName = $("#locationName").val(); 
        
        if (locationName !== "" && locationName !== undefined) {
            getLocationCoords(locationName);
        
            
            
        }
    });
    
    $('#locationName').keypress(function(e) {
    var key = e.which;
    if (key == 13) 
    {
      $('#submitSearch').click();
      return false;
    }
  });
    
});

function getLocationName(latLngCoords) {

    var apikey = '306c0184a907418b8cbfb5a1ee30afba';

    var geocodeURL = "https://api.opencagedata.com/geocode/v1/json?q=" + latLngCoords + "&key=" + apikey;

    $.get(geocodeURL, function(locationData) {
        console.log(locationData.results[0]);

        var locationComponent = locationData.results[0].components;
        
        var locationCity = "";
        
        if (locationComponent.city !== undefined) { 
            locationCity = locationComponent.city;
        } else if (locationComponent.suburb !== undefined) {
            locationCity = locationComponent.suburb;
        } else if (locationComponent.locality !== undefined) {
            locationCity = locationComponent.locality;
        } else if (locationComponent.state !== undefined) {
            locationCity = locationComponent.state;
        } else {
            locationCity = undefined;
        }
        
        var locationState = "";
        
        if (locationComponent.state_code !== undefined) { 
            locationState = locationComponent.state_code;
        } else if (locationComponent.country !== undefined) {
            locationState = locationComponent.country;
        } else {
            locationState = undefined;
        }
        
        if (locationCity !== undefined && locationState !== undefined) {
            var locString = locationCity + ", " + locationState;
        } else if (locationCity !== undefined) {
            var locString = locationCity;
        } else {
            var locString = locationState;
        }

        
        var location = $("<h1>").text(locString);

        $("#currentLocation").append(location);
    });

}

function getLocationCoords(locationName) {

    var apikey = '306c0184a907418b8cbfb5a1ee30afba';

    var geocodeURL = "https://api.opencagedata.com/geocode/v1/json?q=" + locationName + "&key=" + apikey;

    var outputCoords = "";
    var locationNameCoords = "";

    $.get(geocodeURL).done(function(result) {
  
        if(result.status.message === "OK" && result.results !== null && result.results.length > 0) {
            var geometry = result.results[0].geometry;
            outputCoords = geometry.lat + "," + geometry.lng;
            locationNameCoords = geometry.lat + "+" + geometry.lng;
                        
            getLocationName(locationNameCoords);
            
            getWeatherData(outputCoords);
            
            $('#results').show();
            $('#startScreen').hide();
        } else {
            locationNotFound();
        } 
    });
}

function locationNotFound() {
    $('#main').hide();
    $('#loadingScreen').hide();
    $('#tryAgainScreen').show();
    
    
    $("#tryAgain").click(function(){
        $('#tryAgainScreen').hide();
        $('#startScreen').show();
        $('#searchSpan').hide();
        $('#buttonSpan').show();
        $('#locationName').val("");
    });
}

// this function will load data from DarkSky API
function getWeatherData(currentLocation) {

    // My secret key
    var key = "fe22622bb357032c5853005760b83172";

    // API Call
    var url = "https://api.darksky.net/forecast/" + key + "/" + currentLocation + "?units=si";
    
    $.get(url, function(data){
        
        weather = data;
        
        console.log(data);
        
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        var now = new Date(data.currently.time * 1000);
        
        var day = $('<h1 class="currentDay">').text(days[now.getDay()]);
        
        var date = $('<h1 class="currentDate">').text(now.toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
        
        var currentTime = now.toLocaleTimeString('en-AU',{
	        hour12: true,
	        hour: '2-digit', 
	        minute: '2-digit'
	        });
        var time = $('<h1 class="currentTime">').text("As at " + currentTime);
        
        $("#currentInfo").append(day).append(date).append(time);

        var currently = $("<h2 id='currentTemp'>").html(Math.round(data.currently.temperature) + "&deg;C");

        $("#currentInfo").append(currently);

        var summary = $("<h1>").text(data.currently.summary);

        $("#currentInfo").append(summary);
        
        var background = data.currently.icon;
        
        $("#currently").css("background", "url(backgrounds/" + background + ".jpg)");
        
        
        // CHART.JS
        
        var ctx = $("#myChart");
        var chartLabels = [];
        var chartData = [];
        
        Chart.defaults.global.defaultFontFamily = "Lato";
        Chart.defaults.global.defaultFontSize = 18;


        
        for (var i = data.hourly.data.length-1; i >= data.hourly.data.length-12; i--) {
            var hourlyInfo = data.hourly.data[i];
            
            //console.log(hourlyInfo);
            
            var hourlyTime = new Date(hourlyInfo.time*1000).toLocaleTimeString('en-AU',{
	           hour12: true,
	           hour: '2-digit', 
	           minute: '2-digit'
	        });
            var labelTime = hourlyTime.replace(/:\d+ /, '');
            
            chartLabels.push(labelTime);
            
            var temperature = Math.round(hourlyInfo.temperature);
            
            chartData.push(temperature);
        }
        
        var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            labels: chartLabels,
            datasets: [{
                label: "Hourly Temperature",
                borderColor: 'black',
                data: chartData,
                fill: false,
            }]
        },

        // Configuration options go here
        options: { }
        });
        
        
        
        // loop through the data and add to unordered list
        // new list item for each new item

        for (var i = 0; i < data.daily.data.length; i++) {
            var f = data.daily.data[i]; // the data for one day in the forecast

            var list = $("<ul>");
            var date = new Date(f.time*1000);
            var rainChance = Math.round(f.precipProbability * 100) + "&#37;";

            if(i == 0) {
                list.append("<li>Today</li>")
            } else if (i == 1) {
                list.append("<li>Tomorrow</li>")
            } else {
                list.append("<li>" + days[date.getDay()] + "</li>")
            }

            list.append("<li>" + f.summary + "</li>").append("<li>UV Index: " + f.uvIndex + "</li>").append("<li>Chance of rain: " + rainChance + "</li>");
            
            var icon = f.icon;
            
            list.append("<img class='forecastIcon' src='icons/" + icon + ".png'>");            
            
            var minTemp = Math.round(f.temperatureMin) + "&deg;C";
            var maxTemp = Math.round(f.temperatureMax) + "&deg;C";
            
            list.append("<li><p class='minTemp'>Min: " + minTemp + "</p><p class='maxTemp'>Max: " + maxTemp + "</p></li><div style='clear: both;'></div>")

            //append the tr to the table
            $("#forecast").append(list);
        }

    });
}