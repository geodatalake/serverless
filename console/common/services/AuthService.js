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

angular.module('dataLake.service.auth', ['dataLake.utils'])
    .service('authService', function($q, $_, $localstorage) {

        this.signup = function(newuser) {
            var deferred = $q.defer();

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

            var attributeList = [];

            var dataName = {
                Name: 'name',
                Value: newuser.name
            };

            var dataDisplayName = {
                Name: 'custom:display_name',
                Value: newuser.name
            };

            var dataRole = {
                Name: 'custom:role',
                Value: newuser.role
            };

            var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName);
            var attributeDisplayName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataDisplayName);
            var attributeRole = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataRole);

            attributeList.push(attributeName);
            attributeList.push(attributeDisplayName);
            attributeList.push(attributeRole);
            attributeList.push(attributeEmail);

            if (newuser.provider === 'google') {

                newuser.username = newuser.email.replace('@', '_').replace(/\./g, '_');

                var dataEmail = {
                    Name: 'custom:email',
                    Value: newuser.email
                };

                var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
                attributeList.push(attributeEmail);
            }

            userPool.signUp(newuser.username, newuser.password, attributeList, null, function(err, result) {
                if (err) {
                    console.log(err);
                    deferred.reject(err.message);
                } else {
                    console.log('result', result)
                    deferred.resolve(result.user);
                }
            });

            return deferred.promise;

        };

        this.newPassword = function(newuser) {
            var deferred = $q.defer();

            newuser.username = newuser.email.replace('@', '_').replace(/\./g, '_');

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: newuser.username,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

            return deferred.promise;
        };

        this.forgot = function(user) {
            var deferred = $q.defer();

            var _username = user.email.replace('@', '_').replace(/\./g, '_');
            console.log(_username);

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: _username,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
            cognitoUser.forgotPassword({
                onSuccess: function(result) {
                    deferred.resolve();
                },
                onFailure: function(err) {
                    console.log(err);
                    var _msg = err.message;
                    deferred.reject(_msg);
                }
            });

            return deferred.promise;
        };

        this.resetPassword = function(user) {
            var deferred = $q.defer();

            var _username = user.email.replace('@', '_').replace(/\./g, '_');

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: _username,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
            cognitoUser.confirmPassword(user.verificationCode, user.password, {
                onSuccess: function(result) {
                    deferred.resolve();
                },
                onFailure: function(err) {
                    console.log(err);
                    var _msg = err.message;
                    deferred.reject(_msg);
                }
            });

            return deferred.promise;
        };

        this.changePassword = function(oldpassword, newpassword) {
            var deferred = $q.defer();

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            cognitoUser.getSession(function(err, session) {
                if (err) {
                    console.log(err);
                    var _msg = err.message;
                    deferred.reject(_msg);
                } else {
                    cognitoUser.changePassword(oldpassword, newpassword, function(err, result) {
                        if (err) {
                            console.log(err);
                            var _msg = err.message;
                            deferred.reject(_msg);
                        } else {
                            deferred.resolve(result);
                        }

                    });
                }
            });

            return deferred.promise;
        };

        this.signin = function(user, authAction) {

            var deferred = $q.defer();

            var authenticationData = {
                Username: user.email,
                Password: user.password,
            };

            var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

            var poolData = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            var userData = {
                Username: user.email,
                Pool: userPool
            };

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

            try {
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function(result) {
                        console.log('result', result)
                        $localstorage.set('username', cognitoUser.getUsername());
                        deferred.resolve({
                            state: 'login_success',
                            result: result
                        });
                    },

                    onFailure: function(err) {
                        console.log(err);
                        deferred.reject(err);
                    },
                    newPasswordRequired: function(userAttributes, requiredAttributes) {
                        if (authAction === 'password_challenge') {
                            cognitoUser.completeNewPasswordChallenge(user.newPassword, [], {
                                onSuccess: function(result) {
                                    deferred.resolve();
                                },
                                onFailure: function(err) {
                                    console.log(err);
                                    var _msg = err.message;
                                    deferred.reject(_msg);
                                }
                            });
                        } else {
                            deferred.resolve({
                                state: 'new_password_required',
                                result: {
                                    userAttributes: userAttributes,
                                    requiredAttributes: requiredAttributes
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                console.log(e);
                deferred.reject(e);
            }

            return deferred.promise;

        };

        this.signOut = function() {

            try {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.signOut();
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                console.log(e);
                return false;
            }

        };

        this.isAuthenticated = function() {
            var deferred = $q.defer();
            try {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        } else {
                            deferred.resolve(true);
                        }
                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };

        this.isAdminAuthenticated = function() {
            var deferred = $q.defer();
            try {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };
                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {
                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            deferred.resolve(false);
                        } else {
                            cognitoUser.getUserAttributes(function(err, result) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve(false);
                                } else {
                                    var dn = $_.where(result, {
                                        Name: 'custom:role'
                                    });
                                    if (dn.length > 0) {
                                        if (dn[0].Value == 'Admin') {
                                            deferred.resolve(true);
                                        } else {
                                            deferred.resolve(false);
                                        }
                                    } else {
                                        deferred.resolve(false);
                                    }
                                }
                            });
                        }
                    });
                } else {
                    deferred.resolve(false);
                }
            } catch (e) {
                console.log(e);
                deferred.resolve(false);
            }

            return deferred.promise;

        };

        this.logOut = function() {

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {
                cognitoUser.signOut();
            }

        };

        this.getUserAccessToken = function() {

            var deferred = $q.defer();

            // if ($localstorage.get('auth_token') && $localstorage.get('refresh_token')) {
            //     deferred.resolve({
            //         token: { jwtToken: $localstorage.get('auth_token') }
            //     });
            // } else {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };

                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                console.log('cognitoUser', cognitoUser)

                if (cognitoUser != null) {

                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            console.log(err);
                            deferred.reject(err);
                        }

                        console.log('session', session)

                        deferred.resolve(session.accessToken);
                    });

                } else {
                    deferred.reject();
                }
            // }

            return deferred.promise;
        };

        this.getUserAccessTokenWithUsername = function() {
            var deferred = $q.defer();

            // if ($localstorage.get('auth_token') && $localstorage.get('refresh_token')) {
            //     var user = JSON.parse($localstorage.get('user'))
            //     deferred.resolve({
            //         token: { jwtToken: $localstorage.get('auth_token') },
            //         username: user.username
            //     });
            // } else {
                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };

                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                console.log('cognitoUser2', cognitoUser)

                if (cognitoUser != null) {

                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            console.log(err);
                            deferred.reject(err);
                        }

                        deferred.resolve({
                            token: session.accessToken,
                            username: cognitoUser.username
                        });
                    });

                } else {
                    deferred.reject();
                }
            // }

            return deferred.promise;
        };

        this.getUsername = function() {

            var userinfo = {
                email: '',
                name: '',
                username: '',
                display_name: ''
            };

            var data = {
                UserPoolId: YOUR_USER_POOL_ID,
                ClientId: YOUR_USER_POOL_CLIENT_ID,
                Paranoia: 8
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
            var cognitoUser = userPool.getCurrentUser();
            return cognitoUser.username;

        };

        this.getUserInfo = function() {
            var deferred = $q.defer();

            // TODO: optimize for google
            if ($localstorage.get('auth_token')) {
                var user = JSON.parse($localstorage.get('user'))
                var userinfo = {
                    email: user.email,
                    name: user.username,
                    username: user.username,
                    display_name: user.username,
                    role: 'Admin'
                };
                deferred.resolve(userinfo);
            } else {
                var userinfo = {
                    email: '',
                    name: '',
                    username: '',
                    display_name: ''
                };

                var data = {
                    UserPoolId: YOUR_USER_POOL_ID,
                    ClientId: YOUR_USER_POOL_CLIENT_ID,
                    Paranoia: 8
                };

                var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
                var cognitoUser = userPool.getCurrentUser();

                if (cognitoUser != null) {

                    cognitoUser.getSession(function(err, session) {
                        if (err) {
                            console.log(err);
                            deferred.reject(err);
                        }

                        cognitoUser.getUserAttributes(function(err, result) {
                            if (err) {
                                console.log(err);
                                deferred.reject(err);
                            }

                            var em = $_.where(result, {
                                Name: 'email'
                            });

                            if (em.length > 0) {
                                userinfo.email = em[0].Value;
                            }

                            var dn = $_.where(result, {
                                Name: 'custom:display_name'
                            });

                            if (dn.length > 0) {
                                userinfo.display_name = dn[0].Value;
                            }

                            var ak = $_.where(result, {
                                Name: 'custom:accesskey'
                            });

                            if (ak.length > 0) {
                                userinfo.accesskey = ak[0].Value;
                            }

                            var rl = $_.where(result, {
                                Name: 'custom:role'
                            });

                            if (rl.length > 0) {
                                userinfo.role = rl[0].Value;
                            }

                            userinfo.username = cognitoUser.getUsername();

                            deferred.resolve(userinfo);

                        });
                    });
                } else {
                    deferred.reject('Cognito User is null.');
                }
            }

            return deferred.promise;

        };

    });
