var _map;
var _overlay;

var _niSchoolData;
var _scotlandSchoolData;
var _englandSchoolData;

var _homeLocation;
var _distance = 10;

var _geographicProj  = new OpenLayers.Projection("EPSG:4326");
var _mapProj  = new OpenLayers.Projection("EPSG:3857");
var _mercatorProj = new OpenLayers.Projection("EPSG:900913");

// Find distance between two points on the map
function distanceBetweenPoints(p1Map, p2Map){
  var p1Merc = p1Map.transform(_mapProj, _mercatorProj);
  var p2Merc = p2Map.transform(_mapProj, _mercatorProj);
  return p1Merc.distanceTo(p2Merc);
}

// when jQuery has loaded the data, we can create features for each photo
function jsonSuccessHandler(data) {

  this.indexValue.target = data;

  // we need to transform the geometries into the view's projection
//  var transform = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');

  // loop over the items in the response
  data.forEach(function(item) {

    // create a new feature with the item as the properties
    var feature = new OpenLayers.Feature(item);
    // add a url property for later ease of access
//    feature.set('url', item.media.m);
    // create an appropriate geometry and add it to the feature

//    console.debug(item)

    var thisLocation = new OpenLayers.Geometry.Point(parseFloat(item.LON), parseFloat(item.LAT)).transform('EPSG:4326', 'EPSG:3857');

//    console.debug(thisLocation);
    var distance = distanceBetweenPoints(_homeLocation, thisLocation);

    var tiptext = ""
    if( "SCHNAME" in item )
      tiptext = item.SCHNAME;
    else if( "Institution Name" in item )
      tiptext = item["Institution Name"];
    else if( "School Name" in item )
      tiptext = item["School Name"];

    tiptext = tiptext + " " + distance;

    _overlay.addFeatures([
        new OpenLayers.Feature.Vector(myLocation, {tooltip: tiptext})
    ]);


  });
}

function init() {

    // The overlay layer for our marker, with a simple diamond as symbol
    _overlay = new OpenLayers.Layer.Vector('Overlay', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: 'img/marker.png',
            graphicWidth: 20, graphicHeight: 24, graphicYOffset: -24,
            title: '${tooltip}'
        })
    });

    // The location of our marker and popup. We usually think in geographic
    // coordinates ('EPSG:4326'), but the map is projected ('EPSG:3857').
    _homeLocation = new OpenLayers.Geometry.Point(-2.986221, 53.413420)
        .transform('EPSG:4326', 'EPSG:3857');

    // We add the marker with a tooltip text to the overlay
    _overlay.addFeatures([
        new OpenLayers.Feature.Vector(_homeLocation, {tooltip: 'OpenLayers'})
    ]);

    // A popup with some information about our location
    var popup = new OpenLayers.Popup.FramedCloud("Popup",
        _homeLocation.getBounds().getCenterLonLat(), null,
        '<a target="_blank" href="http://openlayers.org/">We</a> ' +
        'could be in Liverpool.<br>Or elsewhere.', null,
        true // <-- true if we want a close (X) button, false otherwise
    );

    // Finally we create the map
    _map = new OpenLayers.Map({
        div: "map", projection: "EPSG:3857",
        layers: [new OpenLayers.Layer.OSM(), _overlay],
        center: _homeLocation.getBounds().getCenterLonLat(), zoom: 6
    });

    // and add the popup to it.
//    map.addPopup(popup);

    // pull json for NI
    $.ajax({
      url: 'resources/Northern_Ireland_Jan2021_latlon.json',
      success: jsonSuccessHandler,
      indexValue: { target:_niSchoolData },
      error: function () {
        alert("Error retrieving NI data");
      },
      complete: function () {
      }
    });

    // pull json for Scotland
    $.ajax({
      url: 'resources/Scotland_Oct2020_open_latlon.json',
      success: jsonSuccessHandler,
      indexValue: { target:_scotlandSchoolData },
      error: function () {
        alert("Error retrieving Scotland data");
      },
      complete: function () {
      }
    });
    // pull json for England
    $.ajax({
      url: 'resources/England_2018_2019_latlon.json',
      success: jsonSuccessHandler,
      indexValue: { target:_englandSchoolData },
      error: function () {
        alert("Error retrieving England data");
      },
      complete: function () {
      }
    });
}
