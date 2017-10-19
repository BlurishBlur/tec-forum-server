#!/usr/bin/env node

var http = require('http');
var mysql = require('mysql');
var config = require('./config.json');

var pool = mysql.createPool(
    config.database
);

getAllUsers = function() {
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');

            connection.query('SELECT * FROM users;', function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    console.log(result);
                }
            });
        }
    });
}

deleteAllUsers = function() {
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');

            connection.query('DELETE from users;', function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    console.log(result);
                }
            });
        }
    });
}

createTestUser = function() {
    pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var query = "INSERT INTO users(username, password) VALUES('Antonio', '123'), ('Niels', '123'), ('Niclas', '123');";
            connection.query(query, function (error, result) {
                connection.release();
                if (error) {
                    throw error;
                    console.log('Error in the query');
                }
                else {
                    console.log('Successfully created user');
                }
            });
        }
    });
}

saveUser = function(data, callback) {
    var saveUserDTO = {message: ''};
    pool.getConnection(function(error, connection) {
        if(error) {
            throw error;
            connection.release();
            console.log('Error connecting to database');
            saveUserDTO.message = 'Database connection error.';
            callback(saveUserDTO);
        }
        else {
            console.log('Connected to database');
            var query = "INSERT INTO users(username, password) VALUES(?, ?);";
            var userObj = JSON.parse(data);
            connection.query(query, [userObj.username, userObj.password], function (error, result) {
                connection.release();
                if (error) {
                    throw error;
                    console.log('Error in the query');
                    saveUserDTO.message = 'Database error.';
                }
                else {
                    console.log('Successfully created user ' + data);
                    saveUserDTO.message = 'User created.';
                    getAllUsers();
                }
                callback(saveUserDTO);
            });
        }
    });
}

logIn = function(data, callback) {
    var logInDTO = {loggedIn: false, id: -1, message: ''};
    pool.getConnection(function(error, connection) {
        if(error) {
            throw error;
            connection.release();
            console.log('Error connecting to database');
            logInDTO.message = 'Database connection error.';
            callback(logInDTO);
        }
        else {
            console.log('Connected to database');
            var query = "SELECT id FROM users WHERE username = ? AND password = ?;";
            var userObj = JSON.parse(data);
            connection.query(query, [userObj.username, userObj.password], function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                    logInDTO.message = 'Database error.';
                }
                else {
                    logInDTO.loggedIn = (result.length > 0);
                    if(logInDTO.loggedIn === true) {
                        logInDTO.id = result[0].id;
                    }
                    else {
                        logInDTO.message = 'Wrong username or password.';
                    }
                }
                callback(logInDTO);
            });
        }
    });
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
        console.log('Received user creation request for: ' + data);
        saveUser(data, function(saveUserDTO) {
            console.log(saveUserDTO);
            response.end(JSON.stringify(saveUserDTO));
        });
    });
}

postUser = function(request, response) { //login
    request.on('data', function(data) {
        console.log('Received login request for: ' + data);
        logIn(data, function(logInDTO) {
            console.log(logInDTO);
            response.end(JSON.stringify(logInDTO));
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