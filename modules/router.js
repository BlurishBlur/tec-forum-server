#!/usr/bin/env node
var database = require('./database.js');



sendHeader = function (response) {
    response.writeHead(200, {'Content-Type': 'application/json',
                             'Access-Control-Allow-Origin': '*',
                             'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'});
}

getUsers = function(request, response) {
    response.end(database.getAllUsers());
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
    'GET/users':     getUsers,
    'PUT/users':     putUser,
    'POST/users':    postUser,
    'DELETE':        handler_delete,
    'OPTIONS':       sendOptions
}

module.exports = {

    handleRequest: function(request, response) {
        sendHeader(response); // burde kun være nødvendigt at sende headeren her
        var routedRequest = request['method'] + request.url;
        if(routes[routedRequest]) {
            console.log('metode findes og kaldes nu')
            routes[routedRequest](request, response);
        }
        else {
            console.log('metode findes ikke: ' + routedRequest);
            response.end("404 - Not found"); // egentligt burde statussen fra senderHeader sættes til 404 i stedet for 200 her
        }
    }
}
