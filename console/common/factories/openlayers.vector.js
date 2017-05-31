'use strict';

angular.module('dataLake.factory.map-ui.vector', [])
    .factory('mapVector', function(mapBase) {

        var mapApi = angular.extend({}, mapBase);

        mapApi.addWKT = function(name, wkt, cb) {
            var format = new ol.format.WKT();
            var feature = [];

            for (var i = 0; i < wkt; i++) {
                feature.push(format.readFeature(wkt[i], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                }));
            }

            var vector = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feature]
                }),
                name: name
            });


            mapApi.map.addLayer(vector);
            mapApi.layers.push(vector);

            if (cb)
                cb();

        }

        return mapApi;
    })
