var mymap = L.map('mapid').setView([23.648235, -102.747675], 5.4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoib21hci1uYXZhcnJvIiwiYSI6ImNpanN2ZWZxZzBoa291eWx4ZWdsajl1OGIifQ.SH4OG9811nirTGJ3rE4DHw'
}).addTo(mymap);

// funcion global para agregar comas
const numberWithCommas = (from) => {
    return from.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

function choroplethizeTotal(d) {
    return d > 162 ? '#990000' :
        d > 80 ? '#d7301f' :
            d > 54 ? '#ef6548' :
                d > 24 ? '#fc8d59' :
                 d > 11 ? '#fdbb84' :
                     d > 5 ? '#fdd49e' :
                        '#fef0d9';
}

function choroplethizeRatio(d) {
    return d > .8 ? '#990000' :
    d > .7 ? '#d7301f' :
        d > .5 ? '#ef6548' :
            d > .3 ? '#fc8d59' :
             d > .2 ? '#fdbb84' :
                 d > .1 ? '#fdd49e' :
                    '#fef0d9';
}
function styleEmpresasTotal(feature) {
    return {
        weight: .75,
        opacity: 0.5,
        color: 'grey',
        dashArray: '0',
        fillOpacity: 0.9,
        fillColor: choroplethizeTotal(feature.properties._Total)
    }
}

function styleEmpresasRatio(feature) {
    return {
        weight: .75,
        opacity: 0.5,
        color: 'grey',
        dashArray: '0',
        fillOpacity: 0.9,
        fillColor: choroplethizeRatio(feature.properties.Ratio)
    }
}
var EmpresasTotalesLayer = L.geoJSON([empresas], {
    style: styleEmpresasTotal,
     onEachFeature: geojsonPopup,
    pointToLayer: function (feature, latlng){
        return L.marker(latlng);
    }
});
var EmpresasRatioLayer = L.geoJSON([empresas], {
    style: styleEmpresasRatio,
     onEachFeature: geojsonPopup,
    pointToLayer: function (feature, latlng){
        return L.marker(latlng);
    }
});

function geojsonPopup(feature, layer){
    if(feature.properties.NOMGEO != null){
        layer.bindPopup('Estado:   ' + feature.properties.NOMGEO + '<br>Total de empresas:   '+ feature.properties._Total + '<br>Ratio de corrupción:   '+ feature.properties.Ratio);
    }
}

EmpresasTotalesLayer.addTo(mymap);
var featureLayers = {
    "Total de Empresas": EmpresasTotalesLayer,
    "Ratio de Corrupción": EmpresasRatioLayer
};
var geojson = L.control.layers(featureLayers).addTo(mymap);

// LEGEND STARTS HERE
var EmpresasTotalesLegend = L.control({ position: 'bottomright' });
var EmpresasRatioLegend = L.control({ position: 'bottomright' }); 

EmpresasTotalesLegend.onAdd = function (mymap) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 5, 11, 24, 80, 162, 230],
    labels = ['Suma de Empresas con casos de corrupción'],
    fromLabel, from, toLabel, to;
    for (var i = 0; i < grades.length-1; i++) {
        from = grades[i];
        fromLabel = numberWithCommas(grades[i]);
        to = grades[i + 1];
        toLabel = numberWithCommas(grades[i + 1]);
        labels.push(
            '<i style="background:' + choroplethizeTotal (from + 1) + '"></i> ' +
            fromLabel + (toLabel ? ' - ' + toLabel : ' - 162'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
};
EmpresasRatioLegend.onAdd = function (mymap) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [.1,.2,.3,.4,.5,.7,.8,.9],
    labels = ['Ratio de corrupción'],
    fromLabel, from, toLabel, to;
    for (var i = 0; i < grades.length-1; i++) {
        from = grades[i];
        fromLabel = grades[i];
        to = grades[i + 1];
        toLabel = grades[i + 1];
        labels.push(
            '<i style="background:' + choroplethizeRatio(from + .01) + '"></i> ' +
            fromLabel + (toLabel ? ' - ' + toLabel : ' - .8'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
};
EmpresasTotalesLegend.addTo(mymap);
let currentLegend = EmpresasTotalesLegend;

// LEGEND Box
mymap.on('baselayerchange', function (eventLayer) {
    if (eventLayer.name === 'Total de Empresas') {
        mymap.removeControl(currentLegend);
        currentLegend = EmpresasTotalesLegend;
        EmpresasTotalesLegend.addTo(mymap);
    }
    else if (eventLayer.name === 'Ratio de Corrupción') {
        mymap.removeControl(currentLegend);
        currentLegend = EmpresasRatioLegend;
        EmpresasRatioLegend.addTo(mymap);
    }
});