'use strict';

const jwtDecode = require('jwt-decode');
const slsAuth = require('serverless-authentication');

const Provider = slsAuth.Provider;
const Profile = slsAuth.Profile;

const signinHandler = (config, options, callback) => {
    const geoaxis = new Provider(config);
    const signinOptions = options || {};
    signinOptions.signin_uri = 'https://gxisaccess.gxaccess.com/ms_oauth/oauth2/endpoints/oauthservice/authorize';
    signinOptions.scope = 'UserProfile.me'; // profile:user_id
    signinOptions.response_type = 'code';
    geoaxis.signin(signinOptions, callback);
};

const callbackHandler = (event, config, callback) => {

    console.log('event')
    console.log(event)

    console.log('config')
    console.log(config)

    console.log('callback')
    console.log(callback)

    const geoaxis = new Provider(config);

    // HACK: retrieve access_token and map profile via callbackHandler
    const decodedProfile = jwtDecode(event.code);

    const profileMap = response =>
        new Profile({
            id: decodedProfile['oracle.oauth.client_origin_id'],
            name: decodedProfile['oracle.oauth.user_origin_id'],
            email: response.emails ? response.emails[0].value : null,
            picture: response.image ? response.image.url : null,
            provider: 'geoaxis',
            at: response.access_token
        });

    const options = {
        authorization_uri: 'https://gxisaccess.gxaccess.com/ms_oauth/oauth2/endpoints/oauthservice/tokens',
        profile_uri: 'https://gxisaccess.gxaccess.com/ms_oauth/resources/userprofile/me',
        profileMap
    };

    geoaxis.callback(
        event,
        options, {
            authorization: {
                grant_type: 'authorization_code'
            }
        },
        callback
    );
};

exports = module.exports = {
    signinHandler,
    callbackHandler
};
