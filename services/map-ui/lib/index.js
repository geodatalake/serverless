let AWS = require('aws-sdk');
let request = require('request');
let Metadata = require('./metadata.js');
let AccessLog = require('./access-log.js');
const servicename = 'data-lake-search-service';


module.exports.respond = function(event, cb) {

    // 2017-02-18: hotfix to accomodate API Gateway header transformations
    let _authToken = '';
    if (event.headers.Auth) {
        console.log(['Header token post transformation:', 'Auth'].join(' '));
        _authToken = event.headers.Auth;
    } else if (event.headers.auth) {
        console.log(['Header token post transformation:', 'auth'].join(' '));
        _authToken = event.headers.auth;
    }

    let _authCheckPayload = {
        authcheck: ['Admin', 'Member'],
        authorizationToken: _authToken
    };

    let _response = '';

    // invoke data-lake-admin-service function to verify if user has
    // proper role for requested action
    let params = {
        FunctionName: 'data-lake-admin-service',
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify(_authCheckPayload)
    };
    let lambda = new AWS.Lambda();
    lambda.invoke(params, function(err, data) {
        if (err) {
            console.log(err);
            _response = buildOutput(500, err);
            return cb(_response, null);
        }

        let _ticket = JSON.parse(data.Payload);
        console.log('Authorization check result: ' + _ticket.auth_status);
        if (_ticket.auth_status === 'authorized') {
            processRequest(event, _ticket, cb);
        } else {
            _response = buildOutput(401, {
                error: {
                    message: 'User is not authorized to perform the requested action.'
                }
            });
            return cb(_response, null);
        }

    });
};

function processRequest(event, ticket, cb) {

    let _response = {};
    let _accessLog = new AccessLog();

    let INVALID_PATH_ERR = {
        Error: ['Invalid path request ', event.resource, ', ', event.httpMethod].join('')
    };

    if (event.resource === '/searchBounds') {
        var form = event.body;
        var url = "tbd.tbd/tbd";
        request.post(url, {form:form}, function(error, resp, result){
            if (error)
                _response = buildOutput(401, error);
                 return cb(_response, null);

            _response = buildOutput(200, result);
            _accessLog.logEvent(event.requestContext.requestId, servicename, ticket.userid, _operation,
                'success',
                function(err, resp) {
                    return cb(null, _response);
                });
        })
    }
}

/**
 * Constructs the appropriate HTTP response.
 * @param {integer} statusCode - HTTP status code for the response.
 * @param {JSON} data - Result body to return in the response.
 */
function buildOutput(statusCode, data) {

    let _response = {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    };

    return _response;
};