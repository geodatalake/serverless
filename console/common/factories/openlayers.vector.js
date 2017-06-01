'use strict';

angular.module('dataLake.factory.map-ui.vector', [])
    .factory('mapVector', function(mapBase) {

        var mapApi = angular.extend({}, mapBase);

        mapApi.addWKT = function(name, wkt, cb) {
            var format = new ol.format.WKT();

            var source = new ol.source.Vector({
            })

            var vector = new ol.layer.Vector({
                source: source,
                title: "Result layer"
            });
            for (var i=0; i < wkt.length; i ++) {
                var f = format.readFeature(wkt[i], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                })
                source.addFeature(f)
            }

            vector.setVisible(true)
            vector.checked = true;
            mapApi.map.addLayer(vector);
            mapApi.layers.push(vector);

            if (cb)
                cb();

        }

        return mapApi;
    })
