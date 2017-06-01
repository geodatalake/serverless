'use strict';

angular.module('dataLake.map-ui', [])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
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

    .controller('IndexController', function ($scope, $http, map,authService, dataPackageFactory) {
        console.log('map', map)
        $scope.layerImgSrc = "./map-ui/images/layer-switcher.png";
        authService.getUserAccessToken().then(function(token) {
            $scope.auth = ['tk:', token.jwtToken].join('');
        });
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
        $scope.results = [];
        $scope.http = $http;
        $scope.openBar = true;
        $scope.switcherShow = false;
        $scope.baseLayers = map.returnLayers()[0];
        for (var i = 0; i < $scope.baseLayers.length; i++) {

            if ($scope.baseLayers[i].getVisible() == true)
                $scope.selectedBaseLayer = $scope.baseLayers[i].get('title');
        }

        var mockData = {
            wkt: ['POLYGON((-77.0369 38.9072, -77.0469 38.9072, -77.0269 38.8972, -77.0269 38.8972, -77.0269 38.8972))'],
            fileLocations: [{
            url: "s3://test-data-lake-001/3-Band-7cm-Imagery/2015-05-15_TS2015/2015-05-15_TS2015_GMLJP2_TIles_7cm/TS2015_0.jp2"
        }]
        }
        $scope.submit = function () {
            var data = {
                bbox: $scope.extent,
                date: $scope.date,
                fileType: $scope.file
            }
            var req = {
                method: 'POST',
                url: "/prod/searchBounds/",
                headers: {
                    'auth': $scope.auth
                },
                data: data
            }
            $http(req).then(function (body) {
                var body = body.data
                $scope.results = body.fileLocations;
                for (var i=0; i < body.fileLocations.length; i++) {
                    body.fileLocations[i].checked = false
                }
                map.addWKT("WKT Layer", body.wkt, function () {
                    $scope.layers = map.layers;
                })
            }, function(body){
                for (var i=0; i < mockData.fileLocations.length; i++) {
                    mockData.fileLocations[i].checked = false
                }
                $scope.results = mockData.fileLocations
                map.addWKT("WKT Layer", mockData.wkt, function () {
                    $scope.layers = map.layers;
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

        $scope.drawAOI = function (type) {
            var callback = function (feature) {
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
        $scope.toggleLayer = function (layer) {
            layer.setVisible(!layer.getVisible())
        }

        /**
         * Toggle the base layer. One base layer can be on at a time and must be on.
         *
         * @param layer
         */
        $scope.toggleBaseLayer = function (layer) {
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
        $scope.toggleLeftBar = function () {
            $scope.openBar = !$scope.openBar;
        }

        /**
         * Watcher function for date range changes to make sure that the end date
         * can't be before the start.
         *
         */
        $scope.dateChange = function () {
            if ($scope.date.start.getTime() > $scope.date.end.getTime())
                $scope.date.end = $scope.date.start;
        }

        //var auth = "tk:eyJraWQiOiJac1ZvRUJxQjcydDBXTVo5XC96Y1lhTUdXUHNZcDhZVGFiSUxxRkZuRDc4VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxNDllYTQyZS1iNDcxLTRhNmEtYWFmMy1hNmViYmJlMzg0ZmEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfcVhRcEN1WXhJIiwiZXhwIjoxNDk2MzM4NTUyLCJpYXQiOjE0OTYzMzQ5NTIsImp0aSI6IjkxMjk2MDZkLTcwNTMtNDM2NS05YTFiLWE5OWQ4Y2U0YTU5MiIsImNsaWVudF9pZCI6IjEyczhhYms1NHQ1aGU1MTNpZjA1dmhwN3JhIiwidXNlcm5hbWUiOiJtaXRjaGlfc3BhY2VmbGlnaHRpbmR1c3RyaWVzX2NvbSJ9.ddvzlpHacAs7OpfkDXqyBa-dP0KHupsJEPTpd5ZzpKeE18ewOIOzlUx4F1AB5WxfSRS18N5LXyFIlVEPopGsc0cM30QdcsPIO9RPC9ske6gkERV8wHza40VS02MJBMKKqW1VfiJ-LWXrbFw48iQDu0wZEIYR-KwwX8oTFGJLbR-5gYb9Jc88CDgonsT1Ylu_EFoKBVNAqYU0VQwCcwlQWLp-DHd0-59KFguSv0v3gD92Vf6CQj006EhNft1YmTo-_rdvy_uNLeX3QQwHfxhbX9ycso6fG_jJD8yecilqvEJqWx6XODWeuqVjMECY-tftknnzdPaZPzyxCnXueYYadw"
        $scope.createPackage = function (name, description) {

            var data = {
                package: {
                    name: "Manifest",
                    description: "manifest test"
                },
                owner: 'stephanier_spaceflightindustries_com'
            }
            var req = {
                method: 'POST',
                url: APIG_ENDPOINT +"/packages/new",
                headers: {
                    'auth': $scope.auth
                },
                data: data
            }

            $http(req).then(function (body) {
                console.log(body)
                $scope.addFilesToPackage(body.data.package_id)
            })
        }

        $scope.addFilesToPackage = function (id, name) {
            var data ={
                'updated_at':new Date(),
                'package_id':id,
                'deleted':false,
                'created_at':new Date(),
                'Owner':"mitchi_spaceflightindustries_com",
                'Description':"test",
                'name':name
            }
            var req = {
                method: 'PUT',
                url: APIG_ENDPOINT +"/packages/" + id,
                headers: {
                    'auth': $scope.auth
                },
                data: data
            }
            $http(req).then( function (body) {
                $scope.getManifest(id, "manifest.json")
            })
        }

        $scope.createFile = function(id,url,dataset_id) {
            var files = []
            for (var i=0; i < $scope.results.length; i ++) {
                if ($scope.results[i].checked == true)
                    files.push({url:$scope.results[i].url})
            }

            var json = {
                fileLocations: files
            }
            json = JSON.stringify(json);
            console.log(json)
            var req = {
                method: 'PUT',
                url: url,
                headers: {
                    'auth': $scope.auth
                },
                data: json
            }

            $http(req).then(function(){
                var req = {
                    method: 'POST',
                    url: APIG_ENDPOINT + "/packages/"+id+"/datasets/"+dataset_id+"/process",
                    headers: {
                        'auth': $scope.auth
                    },
                    data: {}
                }
                $http(req).then(function(body) {
                    console.log(body)
                    var req = {
                        method: 'GET',
                        url: APIG_ENDPOINT + "/packages/"+id,
                        headers: {
                            'auth': $scope.auth
                        }
                    }
                    $http(req).then(function(body) {
                        console.log(body)
                        $scope.addToCart(id)
                    });
                })

            })

        }

        $scope.getManifest = function(id, name) {
            var data = {
                'name':name,
                'type':"manifest",
                'content_type':"application/json",
                'owner':"Mitchell Ingram"
            }
            var req = {
                method: 'POST',
                url: APIG_ENDPOINT +"/packages/"+id+"/datasets/new",
                headers: {
                    'auth': $scope.auth
                },
                data: data
            }
            $http(req).then( function (body) {
                console.log(body)
                $scope.createFile(id, body.data.uploadUrl, body.data.dataset_id)
            })
        }

        $scope.addToCart = function(id){
            var data = {
                package_id:id
            }
            var req = {
                method: 'POST',
                url: APIG_ENDPOINT +"/cart/new",
                headers: {
                    'auth': $scope.auth
                },
                data: data
            }
            $http(req).then( function ( body) {
                console.log(body)

                    window.location = "http://datalakeweb-us-west-2-414519249282.s3-website-us-west-2.amazonaws.com/#/cart"
            })
        }
    });
