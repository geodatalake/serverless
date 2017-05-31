'use strict';

angular.module('dataLake.map-ui', [])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('map-ui', {
        url: '/map-ui',
        views: {
            '': {
                templateUrl: 'map-ui/map-ui.html',
                controller: 'IndexController'
            }
        }
    });
}])

.controller('IndexController', function($scope, $http, map) {
    console.log('map', map)
    $scope.date = {
        start: new Date(),
        end: new Date()
    }

    $scope.files = [{
        label: "geotiff"
    }, {
        label: "lidar"
    }, {
        label: "vector"
    }]

    $scope.file = $scope.files[0];
    $scope.result;
    $scope.http = $http;
    $scope.openBar = true;
    $scope.switcherShow = false;
    $scope.baseLayers = map.baseLayers;
    $scope.layerImgSrc = "./images/layer-switcher.png";

    for (var i = 0; i < $scope.baseLayers.length; i++) {

        if ($scope.baseLayers[i].getVisible() == true)
            $scope.selectedBaseLayer = $scope.baseLayers[i].get('title');
    }



    $scope.submit = function() {
        var data = {
            bbox: $scope.extent,
            date: $scope.date,
            fileType: $scope.file
        }
        $http.post("/submit", {
            form: data
        }, function(err, httpResponse, body) {
            $scope.result = JSON.parse(body);
            map.addWKT("WKT Layer", IndexController.result.wkt, function() {
                $scope.layers = $scope.map.returnLayers()[1];
            })
        });
    }

    /**
     * Takes a draw type, which is a polygon or a circle and a return function.
     * Draws on the map and returns the drawn feature
     *
     * @param type
     * @param func
     */

    $scope.drawAOI = function(type) {
        var callback = function(feature) {
            $scope.extent = feature.getGeometry().getExtent();
            $scope.extent = ol.proj.transformExtent($scope.extent, 'EPSG:3857', 'EPSG:4326');

        }
        map.drawAOI(type, callback)
    }

    /**
     * Toggles the visibility of a layer
     *
     * @param layer
     */
    $scope.toggleLayer = function(layer) {
        layer.setVisible(!layer.getVisible())
    }

    /**
     * Toggle the base layer. One base layer can be on at a time and must be on.
     *
     * @param layer
     */
    $scope.toggleBaseLayer = function(layer) {
        for (var i = 0; i < $scope.baseLayers.length; i++) {
            $scope.baseLayers[i].setVisible(false)
        }

        layer.setVisible(true)
        $scope.selectedBaseLayer = layer.get('title');

    }

    /**
     * Toggle the visibility of the bar on the left
     *
     */
    $scope.toggleLeftBar = function() {
        $scope.openBar = !$scope.openBar;
    }

    /**
     * Watcher function for date range changes to make sure that the end date
     * can't be before the start.
     *
     */
    $scope.dateChange = function() {
        if ($scope.date.start.getTime() > $scope.date.end.getTime())
            $scope.date.end = $scope.date.start;
    }
});
