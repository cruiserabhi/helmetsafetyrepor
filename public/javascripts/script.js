  var corvo = false, attano = true;
  var m1 = null, m2 = null;
  var m1pos, m2pos;
  var sourceIcon = 's.png', destinationIcon = 'd.png';
  var strokeColor = '#131540';
  var strokeOpacity = 0.6;
  var strokeWeight = 20;
  var oldlat = 28.458300;
  var oldlon = 77.071345; 
  var newlat;
  var newlon;  
  var mapObj;
$(document).ready(function(){
  
    mapObj = new GMaps({
    el: '#map',
    lat: 28.458300,
    lng: 77.071345,
    zoom: 16,
    click: function(e) {
      if (corvo) {
        mapObj.removeMarker((attano) ? m1 : m2);
      }

      if (attano) {
        m1 = mapObj.addMarker({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          icon: sourceIcon
        });
        m1pos = m1.getPosition();
      } else {
        m2 = mapObj.addMarker({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          icon: destinationIcon
        });
        m2pos = m2.getPosition();
      }
      // If two markers have been placed
      if (m1 !== null && m2 !== null) {
        corvo = true;
        $('#trace_route').prop('disabled', false);
      }
      attano = !attano;
    }
  });
  
  $('#loc_text').keypress(function(e){
    if (e.which == 13) {
      var address = $('#loc_text').val();
      GMaps.geocode({
        address: address,
        callback: function(results, status) {
          if (status == 'OK') {
            latlng = results[0].geometry.location;
            mapObj.setCenter(latlng.lat(), latlng.lng());
            mapObj.setZoom(16);
          } else if (status == 'ZERO_RESULTS') {
            alert('Sorry, no location named ' + address);
          }
        }
      });
    }
  });

  $('#loc_button').click(function(){
    GMaps.geolocate({
      success: function(position) {
        mapObj.setCenter(position.coords.latitude, position.coords.longitude);
        mapObj.setZoom(16);
      },
      error: function(error) {
        alert('Geolocation failed. Please try again or enter location manually.');
      },
      not_supported: function() {
        alert("Your browser does not support geolocation");
      }
    });
  });

  $('#trace_route').click(function(){
    // Remove previous route
    mapObj.removePolylines();
    mapObj.getRoutes({
      origin: [m1pos.lat(), m1pos.lng()],
      destination: [m2pos.lat(), m2pos.lng()],
      travelMode: 'walking',
      callback: function(result) {
        var path = [];
        // Convert object path to array of coordinates
        $.each(result[0].overview_path, function(i, coord) {
          path.push([coord.lat(), coord.lng()]);
        });
        mapObj.drawPolyline({
          path: path,
          strokeColor: strokeColor,
          strokeOpacity: strokeOpacity,
          strokeWeight: strokeWeight
        });
        getStaticMap(path);
        // Empty `result` array
        result.length = 0;
      }
    });
  });
});

  function getStaticMap(path) {
    var c = mapObj.getCenter();
    var sm1 = {
      lat: oldlat,
      lng: oldlon,
      color: 'red'
    };
    var sm2 = {
      lat: newlat,
      lng: newlon,
      color: 'blue'
    };
    var url = GMaps.staticMapURL({
      size: [1000, 700],
      lat: c.lat(),
      lng: c.lng(),
      zoom: mapObj.getZoom(),
      markers: [sm1, sm2],
      polyline: {
        path: path,
        strokeColor: strokeColor,
        strokeOpacity: strokeOpacity,
        strokeWeight: strokeWeight
      }
    });
    oldlat = newlat;
	oldlon = newlon;
    $('#preview').prop('href', url);
    $('#download').prop('href', url);
    $('.output').fadeIn(1000);
    $('#static_url').val(url).select();
  }

function traceroute(lat , lon, col,type)
  {
	newlat = lat;
    newlon = lon;
    strokeColor = col;
    // Remove previous route
    mapObj.removePolylines();
    mapObj.getRoutes({
      origin: [oldlat, oldlon],
      destination: [newlat, newlon],
      travelMode: 'DRIVING',
      callback: function(result) {
        var path = [];
        // Convert object path to array of coordinates
        $.each(result[0].overview_path, function(i, coord) {
          path.push([coord.lat(), coord.lng()]);
        });
        if (type == 0) {
            mapObj.addMarker({
                lat: newlat,
                lng: newlon,
                icon: "/images/s.png"
            });
        }
        else
        {
            mapObj.addMarker({
                lat: newlat,
                lng: newlon,
                icon: "/images/d.png"
            });
        }
/*
        mapObj.drawPolyline({
          path: path,
          strokeColor: strokeColor,
          strokeOpacity: strokeOpacity,
          strokeWeight: strokeWeight
        });
*/
        getStaticMap(path);
        // Empty `result` array
        result.length = 0;
      }
    });
}

function traceroutedriving(lat, lon, col) {
    newlat = lat;
    newlon = lon;
    strokeColor = col;
    // Remove previous route
    mapObj.removePolylines();
    mapObj.getRoutes({
        origin: [oldlat, oldlon],
        destination: [newlat, newlon],
        travelMode: 'DRIVING',
        callback: function (result) {
            var path = [];
            // Convert object path to array of coordinates
            $.each(result[0].overview_path, function (i, coord) {
                path.push([coord.lat(), coord.lng()]);
            });
            mapObj.drawPolyline({
                path: path,
                strokeColor: strokeColor,
                strokeOpacity: strokeOpacity,
                strokeWeight: strokeWeight
            });
            getStaticMap(path);
            // Empty `result` array
            result.length = 0;
        }
    });
}
