#!/usr/bin/env node

var url = require('url');

var listeners = []; // TODO: SKAL FJERNES EFTER REFACTOR
sendHeader = function(httpCode, response) {
    response.writeHead(httpCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
}

// TODO: SKAL FJERNES EFTER REFACTOR
getThreadComments = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadComments(urlParts.query, function(commentsDTO) {
        response.end(JSON.stringify(commentsDTO));          
    });
}
// TODO: SKAL FJERNES EFTER REFACTOR
getThreadCommentsPoll = function(request, response) {
    listeners.push({response: response, request: request});
    console.log('add listener, listener lenght: '+listeners.length);
}
// TODO: SKAL FJERNES EFTER REFACTOR
putComment = function(request, response) {

    request.on('data', function(data) {
        database.saveComment(data, function() {
            sendThreadCommentsResponse();
        console.log(JSON.parse(data));
            console.log("Comment received, all listeners updated!");
        });
    
    });

}
// TODO: SKAL FJERNES EFTER REFACTOR
sendThreadCommentsResponse = function() {
    listeners.forEach(function(listenerElement) {
        var urlParts = url.parse(listenerElement.request.url, true);
        database.getThreadComments(urlParts.query, function(commentsDTO) {
            listenerElement.response.end(JSON.stringify(commentsDTO)); 
            var index = listeners.indexOf(listenerElement);
            listeners.splice(index, 1);
            console.log('index of listener: '+index);         
    }); 
        });
    //console.log(listeners.length);

}

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