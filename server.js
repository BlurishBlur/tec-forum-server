#!/usr/bin/env node

var http = require('http');
var mysql = require('mysql');
var config = require('./config.json');

var pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

query = function() {
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');

            connection.query('SELECT * FROM Users', function (error, result) {
                connection.release();
                if (error) {
                    //throw err;
                    console.log('Error in the query');
                }
                else {
                    console.log(result);
                }
            });
        }
    });
}

query();

saveUser = function(data) {
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var query = "INSERT INTO Users(username, password) VALUES(?, ?)";
            var userObj = JSON.parse(data);
            connection.query(query, [userObj.username, userObj.password], function (error, result) {
                connection.release();
                if (error) {
                    throw error;
                    console.log('Error in the query');
                }
                else {
                    console.log('Successfully created user ' + data8);
                }
            });
        }
    });
}

logIn = function(data, callback) {
    var loggedIn = false;
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var query = "SELECT username FROM Users WHERE username = ? AND password = ?"
            var userObj = JSON.parse(data);
            connection.query(query, [userObj.username, userObj.password], function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    loggedIn = (result.length > 0);
                }
                callback(loggedIn);
            });
        }
    });
    /*var contains = users.some(function(user) {
        return user.username === userObj.username && user.password === userObj.password;
    });*/
}

sendHeader = function (response) {
    response.writeHead(200, {'Content-Type': 'application/json',
                             'Access-Control-Allow-Origin': '*',
                             'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'});
}

getUsers = function(request, response) {
    response.end(JSON.stringify(users));
}

putUser = function(request, response) { //create
    request.on('data', function(data) {
        console.log('Received user data: ' + data);
        saveUser(data);
        response.end('User created.');
    });
}

postUser = function(request, response) { //login
    request.on('data', function(data) {
        console.log('Received login request for: ' + data);
        logIn(data, function(loggedIn) {
            console.log('Logged in: ' + loggedIn);
            response.end(JSON.stringify(loggedIn));
        });
    })
}

handler_post = function (request, response) {
    request.on('data', function(data) {
        console.log(''+data);
        sendHeader(response);
        response.end(JSON.stringify(search(data)));
    });
};
handler_delete = function (request, response) {
    request.on('data', function(data) {
        deleteFromArray(data);
        sendHeader(response);
        response.end(JSON.stringify(4));
    });
};
handler_options = function (request, response) {
    //sendHeader(response);
    response.end(null);
};

routes = { //undersøg nærmere hvornår put og post henholdsvis skal bruges
    'GET/users':     getUsers,
    'PUT/users':     putUser,
    'POST/users':    postUser,
    'DELETE':        handler_delete,
    'OPTIONS':       handler_options,
};

handleRequest = function(request, response) {
    sendHeader(response); // burde kun være nødvendigt at sende headeren her
    var routedRequest = request['method'] + request.url;
    if(routes[routedRequest]) {
        routes[routedRequest](request, response);
    }
    else {
        response.end("404 - Not found"); // egentligt burde statussen fra senderHeader sættes til 404 i stedet for 200 her
    }
}

var server = http.createServer(function (request, response){
    console.log("Received request for " + request['method'] + request.url);
    handleRequest(request, response);
});

server.listen(config.server.port, config.server.host, function(){
    console.log("Listening to http://%s:%s", config.server.host, config.server.port);
});