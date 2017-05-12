'use strict';

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
    const geoaxis = new Provider(config);
    const profileMap = response =>
        new Profile({
            id: response.id,
            name: response.displayName,
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
