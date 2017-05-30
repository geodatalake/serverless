'use strict';

angular.module('dataLake.factory.map-ui.api', [])
    .factory('map', function(mapVector, mapBase, mapInteractions) {
        var mapApi = angular.extend({}, mapVector, mapBase, mapInteractions);
        return mapApi;
    });
