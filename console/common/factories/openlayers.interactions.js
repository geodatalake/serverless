'use strict';

angular.module('dataLake.factory.map-ui.interactions', [])
    .factory('mapInteractions', function(mapBase) {

        var mapApi = angular.extend({}, mapBase);

        mapApi.drawAOI = function(type, func) {
            if (!mapApi.drawOn) {
                mapApi.drawOn = true;
                var sketch;
                mapApi.globalDraw = new ol.interaction.Draw({
                    source: mapApi.drawSource,
                    type: type
                });
                mapApi.globalDraw.on('drawstart',
                    function(evt) {
                        sketch = evt.feature;

                    }, this);
                mapApi.globalDraw.on("drawend", function(e) {
                    func(e.feature)
                    mapApi.drawSource.clear()
                    mapApi.drawOn = false;
                    mapApi.map.removeInteraction(mapApi.globalDraw);
                });
                mapApi.map.addInteraction(mapApi.globalDraw);

            } else {
                console.log("Stop")
                mapApi.drawOn = false;
                mapApi.map.removeInteraction(mapApi.globalDraw);

            }
        }

        return mapApi;
    })
