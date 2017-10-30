#!/usr/bin/env node

var url = require('url');

sendHeader = function(httpCode, response) {
    response.writeHead(httpCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
}

handler_delete = function(request, response) {
    /*request.on('data', function(data) {
        deleteFromArray(data);
        sendHeader(response);
        response.end(JSON.stringify(4));
    });*/
}

sendOptions = function(request, response) {
    //sendHeader(response);
    response.end(null);
}

routes = {
    'OPTIONS': sendOptions
}

module.exports = {

    handleRequest: function(request, response) {
        var urlParts = url.parse(request.url, true);
        var routedRequest = request['method'] + urlParts.pathname;
        if (request['method'] == 'OPTIONS') {
            routedRequest = request['method'];
        }
        if (routes[routedRequest]) {
            sendHeader(200, response); // burde kun være nødvendigt at sende headeren her
            routes[routedRequest](request, response);
        } else {
            console.log('Could not find method ' + routedRequest);
            sendHeader(404, response);
            response.end(null); // egentligt burde statussen fra senderHeader sættes til 404 i stedet for 200 her
        }
    },

    get: function(path, func) {
        routes['GET' + path] = func;
    },

    put: function(path, func) {
        routes['PUT' + path] = func;
    },

    post: function(path, func) {
        routes['POST' + path] = func;
    },

    delete: function(path, func) {
        routes['DELETE' + path] = func;
    }

}