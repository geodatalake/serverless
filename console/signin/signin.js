/*********************************************************************************************************************
 *  Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

angular.module('dataLake.signin', ['dataLake.utils'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('signin', {
        url: '/signin',
        views: {
            '': {
                templateUrl: 'signin/signin.html',
                controller: 'SigninCtrl'
            }
        },
        resolve: {
            oauthData: function($location, $localstorage) {
                if ($location.$$absUrl.indexOf('authorization_token') > -1) {
                    var auth_string = $location.$$absUrl.split('authorization_token=')[1]
                    var auth_token = auth_string.substring(0, auth_string.indexOf('&refresh_token'))
                    var refresh_token = auth_string.substring(auth_string.indexOf('&refresh_token') + 15, auth_string.indexOf('#/'))
                    var base64Url = auth_string.split('.')[1]
                    var base64 = base64Url.replace('-', '+').replace('_', '/')

                    $localstorage.set('user', window.atob(base64));
                    $localstorage.set('auth_token', auth_token);
                    $localstorage.set('refresh_token', refresh_token);

                    return Object.assign(JSON.parse(window.atob(base64)), { auth_token: auth_token, refresh_token: refresh_token })

                    // document.location.replace('http://' + $location.$$host);

                }
            }
         }
    });
}])

.controller('SigninCtrl', function($scope, $state, authService, $blockUI, $location, $localstorage) {

    $scope.errormessage = '';
    $blockUI.stop();

    if ($localstorage.get('user') && $localstorage.get('auth_token')) {
        console.log($location)
        // HACK: super hack for the demo
        authService.signin({ email: 'apurvp@spaceflightindustries.com', password: 'Space@123' }, '').then(function (result) {
            console.log('result in her', result)
            $state.go('dashboard', {});
        })
    }

    $scope.signin = function(user, isValid) {

        if (isValid) {
            authService.signin(user, '').then(function(resp) {
                if (resp.state == 'login_success') {
                    $state.go('dashboard', {});
                } else if (resp.state == 'new_password_required') {
                    $state.go('confirm', {
                        email: user.email,
                        password: user.password
                    });
                }
            }, function(msg) {
                $scope.errormessage = 'Unable to sign in user. Please check your username and password.';
                if ($scope.$$phase != '$digest') {
                    $scope.$apply();
                }

                return;
            });

        } else {
            $scope.errormessage = 'There are still invalid fields.';
        }
    };

});
