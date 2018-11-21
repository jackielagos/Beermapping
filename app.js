// This is our API key for Beer Mapping API
var APIKey = "afdeac53a3e38ffb25babbaa862d1de7";

// Geolocation
// navigator.geolocation.getCurrentPosition(function (position) {
//     console.log(position.coords.latitude, position.coords.longitude);
// });

var geocoder
var barDetails = []
var resultsMap
function initMap() {
    var myLatLong = new google.maps.LatLng(43.68, -79.4);
    resultsMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: myLatLong
    });
    geocoder = new google.maps.Geocoder();
}


function searchBeerInTown(location) {

    // Here we are building the URL we need to query the database of Beer Mapping API for the selected location
    var queryURL = `https://beermapping.com/webservice/loccity/${APIKey}/${location}&s=json`;

    // Running Beer Mapping API ajax call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        //clear parameter from URL (index1 input location)
        var url = window.location.toString();
        if (url.indexOf("?") > 0) {
            var clear_url = url.substring(0, url.indexOf("?"));
            window.history.replaceState({}, document.title, clear_url);
        }

        // Form validation to check correct location entry
        if (response[0].city === null) {
            alert("Please enter a valid location in the correct format.\n(e.g. Waterloo OR Waterloo,ON OR Waterloo,Ontario)\nDo not enter spaces.  Please try again.");

            // Emptying the input text box after each search
            document.querySelector('#location-input').value = '';
        }

        else {

            // Emptying the location-div before each new search
            $("#location-div").empty();

            // Printing the entire object to console
            for (var i = 0; i < response.length; i++) {

                console.log(response[i]);

                let beerHTML = `
                    <a href='https://${response[i].url}' target="_blank">
                        <h5>${response[i].name}</h5>
                    </a>
                    <h6>Address: ${response[i].street + ", " + response[i].city + ", " + response[i].state}</h6>
                    <h6>Country: ${response[i].country}</h6>
                    <h6>Type: ${response[i].status}</h6>
                `;

                // Append the new location content
                $("#location-div").append(beerHTML);

                //concatenate api address deets for geocoder
                var barName = response[i].name;
                var address = response[i].street;
                var city = response[i].city;
                var state = response[i].state;
                var country = response[i].country;
                var barUrl = response[i].url;

                var contentInfo = {
                    streetAddress: address + ", " + city + ", " + state + ", " + country,
                    name: barName,
                    url: barUrl
                }
                barDetails.push(contentInfo);

                // Emptying the input text box after each search
                document.querySelector('#location-input').value = '';

            }

            var handle = setInterval(function () {
                if (barDetails.length == 1) {
                    clearInterval(handle)
                }
                var contentMar = barDetails.pop()
                console.log(contentMar);
                var streetAddresses = contentMar.streetAddress
                console.log(streetAddresses)
                geocoder.geocode({ 'address': streetAddresses }, function (results, status) {
                    if (status === 'OK') {
                        var myLatLong = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng())
                        // console.log(myLatLong);
                        var marker = new google.maps.Marker({
                            map: resultsMap,
                            position: results[0].geometry.location,
                            title: contentMar.name,
                            // url: '<a href = https://' + contentMar.url + ' ' + 'target = "blank">'
                        });

                        // google.maps.event.addListener(marker, 'click', function() {
                        //     window.location.href = marker.url
                        // });
                        var contentString = '<a href = https://' + contentMar.url + ' ' + 'target = "blank">' + contentMar.name + '</a>';
                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        }); console.log(contentString);

                        marker.addListener('click', function () {
                            infowindow.open(map, marker);
                        });


                        resultsMap.panTo(myLatLong);
                    } else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    };
                });
            }, 700);
            // using free Geocoder - query volume per second is low, and query limit is low, hence setInterval
        }
    });
}

// Event handler for user clicking the select-location button
$("#select-location").on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();
    // Storing the location name
    var inputLocation = $("#location-input").val().trim();
    // Running the searchBeerInTown function (passing in the location as an argument)
    searchBeerInTown(inputLocation);
});

// getting parameter stored onto URL from Index.html inputLocation
var queryString = window.location.href;
var index = queryString.indexOf("?");
var substring = queryString.substr(index + 1).split('&');
console.log(substring);
var ending = "";
for (var i = 0; i < substring.length; i++) {
    var params = substring[i].split('=');
    console.log(params);
    var parameter = params[1];
    // Running the searchBeerInTown function using parameter
    if (parameter) {
        searchBeerInTown(parameter);
    }
};
console.log(parameter);