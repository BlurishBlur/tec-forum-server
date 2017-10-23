#!/usr/bin/env node
var database = require('./database.js');
var url = require('url');


sendHeader = function (response) {
    response.writeHead(200, {'Content-Type': 'application/json',
                             'Access-Control-Allow-Origin': '*',
                             'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'});
}

getUser = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getUser(urlParts.query, function(userDTO) {
        response.end(JSON.stringify(userDTO));
    });
}

getThread = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThread(urlParts.query, function(threadDTO) {
        response.end(JSON.stringify(threadDTO));
    });
}

getThreadComments = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadComments(urlParts.query, function(commentsDTO) {
        response.end(JSON.stringify(commentsDTO));
    });
}

getCategories = function(request, response) {
    database.getCategories(function(categoriesDTO) {
        response.end(JSON.stringify(categoriesDTO));
    });
}

getThreadsInCategory = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadsInCategory(urlParts.query, function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
}

getUserThreads = function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getUserThreads(urlParts.query, function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
}

putUser = function(request, response) { //create
    request.on('data', function(data) {
        console.log('Received user creation request for: ' + data);
        database.saveUser(data, function(saveUserDTO) {
            console.log(saveUserDTO);
            response.end(JSON.stringify(saveUserDTO));
        });
    });
}

postUser = function(request, response) { //login
    request.on('data', function(data) {
        console.log('Received login request for: ' + data);
        database.logIn(data, function(logInDTO) {
            console.log(logInDTO);
            response.end(JSON.stringify(logInDTO));
        });
    })
}

handler_delete = function (request, response) {
    /*request.on('data', function(data) {
        deleteFromArray(data);
        sendHeader(response);
        response.end(JSON.stringify(4));
    });*/
}

sendOptions = function (request, response) {
    //sendHeader(response);
    response.end(null);
}

routes = {
    'GET/users':     getUser,
    'GET/thread':   getThread,
    'GET/thread/comments':  getThreadComments,
    'GET/categories':     getCategories,
    'GET/categories/threads':     getThreadsInCategory,
    'GET/users/threads':    getUserThreads,
    'PUT/users':     putUser,
    'POST/users':    postUser,
    'DELETE':        handler_delete,
    'OPTIONS':       sendOptions
}

module.exports = {

    handleRequest: function(request, response) {
        sendHeader(response); // burde kun være nødvendigt at sende headeren her
        var urlParts = url.parse(request.url, true);
        var routedRequest = request['method'] + urlParts.pathname;
        if(routes[routedRequest]) {
            routes[routedRequest](request, response);
        }
        else {
            console.log('Could not find method ' + routedRequest);
            response.end("404 - Not found"); // egentligt burde statussen fra senderHeader sættes til 404 i stedet for 200 her
        }
    }
}
