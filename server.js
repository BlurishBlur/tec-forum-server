#!/usr/bin/env node

var http = require('http');
var config = require('./cfg/config.json');
var router = require('./modules/router.js');
var database = require('./modules/database.js');

var server = http.createServer(function (request, response){
    console.log("Received request for " + request['method'] + request.url);
    router.handleRequest(request, response);
});

server.listen(config.server.port, config.server.host, function(){
    console.log("Listening to http://%s:%s", config.server.host, config.server.port);
});