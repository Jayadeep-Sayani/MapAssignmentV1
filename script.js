var markers = [];
var map;
var service;
var currentLocation;
var infoWindow;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7128, lng: -74.0060},
    zoom: 13
  });
  var marker = new google.maps.Marker({
    position: {lat: 40.7128, lng: -74.0060},
    map: map,
    title: 'New York'
  });
  infoWindow = new google.maps.InfoWindow({
    content: '<h3>New York</h3>'
  });
  service = new google.maps.places.PlacesService(map);

  var radiusSlider = document.getElementById("radius-slider");
  radiusSlider.addEventListener('input', function() {
    deleteMarkers();
    if (currentLocation) {
      showPlacesNearLocation(currentLocation, document.getElementById("placeType").value, this.value);
    } else {
      showParksNearLocation({lat: 40.7128, lng: -74.0060}, this.value);
    }
  });


  // Add a listeneaphe dropdown menu
  const select = document.getElementById('placeType');
  select.value = "park";
  select.addEventListener('change', function() {
    deleteMarkers();

    const placeType = select.value;
    const radius = radiusSlider.value;
    if (currentLocation) {
      showPlacesNearLocation(currentLocation, placeType, radius);
    } else {
      showParksNearLocation({lat: 40.7128, lng: -74.0060}, radius);
    }
  });

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    deleteMarkers();
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
          currentLocation = pos;
          showPlacesNearLocation(pos, select.value);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  // Show parks near the initial location
  showParksNearLocation({lat: 40.7128, lng: -74.0060}, radiusSlider.value);

  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });



}

function showPlacesNearLocation(pos, placeType, radius) {
  currentLocation = pos;
  // Remove existing markers from the map
  infoWindow.close();
  service.nearbySearch({
    location: pos,
    radius: radius,
    type: [placeType]
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  });
}

function showParksNearLocation(pos, radius) {
  showPlacesNearLocation(pos, 'park', radius);
}

function createMarker(place) {

  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    icon: {
      url: place.icon,
      scaledSize: new google.maps.Size(30, 30)
    },
    title: place.name
  });
  var contentString = '<h3>' + place.name + '</h3>' +
      '<p>Rating: ' + place.rating + ' out of 5</p>' +
      '<p>' + place.vicinity + '</p>';

  marker.addListener('click', function() {
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
  });

  markers.push(marker); // add marker to the array

}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function hideMarkers() {
  setMapOnAll(null);
}

function deleteMarkers() {
  hideMarkers();
  markers = [];
}


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
