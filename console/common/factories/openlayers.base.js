'use strict';

angular.module('dataLake.factory.map-ui.base', [])
    .factory('mapBase', function() {
        var mapApi = {};

        mapApi.droppedLayers = new ol.layer.Group({
            'title': 'Dropped layers',
            layers: []
        });
        mapApi.layers = [];
        mapApi.globalDraw;
        mapApi.drawSource = new ol.source.Vector();
        mapApi.drawToggle = false;
        mapApi.drawType = null;
        mapApi.drawLayer = new ol.layer.Vector({
            source: mapApi.drawSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            })
        });
        mapApi.measureSource = new ol.source.Vector();

        mapApi.measureLayer = new ol.layer.Vector({
            source: mapApi.measureSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            })
        });

        var baseLayers = [];

        var newLayer = new ol.layer.Tile({
            title: 'Open Street Map', type: 'base', source: new ol.source.OSM({
                wrapX: true
            })
        })

        baseLayers.push(newLayer)

        var baseLayers = new ol.layer.Group({
            'title': 'Base maps',
            layers: baseLayers
        });

        //Group base layers so they may be added to
        mapApi.baseLayers = baseLayers
        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');


        mapApi.overlay = new ol.Overlay( /** @type {olx.OverlayOptions} */ ({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        }));

        //Map initialization
        var select = new ol.interaction.Select();

        var translate = new ol.interaction.Translate({
            features: select.getFeatures()
        });

        mapApi.map = new ol.Map({
            controls: ol.control.defaults().extend([
                new ol.control.FullScreen(),
                new ol.control.ZoomSlider(),
                new ol.control.MousePosition({
                    projection: 'EPSG:4326',
                    coordinateFormat: ol.coordinate.createStringXY(2)
                }),
            ]),
            layers: [mapApi.baseLayers, mapApi.droppedLayers, mapApi.drawLayer, mapApi.measureLayer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.transform([-77.0369, 38.9072, -777, 38.8], 'EPSG:4326', 'EPSG:3857'),
                zoom: 14,
                minZoom: 3,
                maxZoom: 20
            })
        });

        mapApi.returnLayers = function(){
            console.log(mapApi.baseLayers)
            return [mapApi.baseLayers.get('layers').getArray()]
        }
        return mapApi;
    });
