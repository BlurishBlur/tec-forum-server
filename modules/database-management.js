#!/usr/bin/env node
var mysql = require('mysql');
var config = require('../cfg/config.json');
var pool = mysql.createPool(
    config.database
);

function execute(number) {
    switch(number) {
        case '1':
            getAllUsers();
            break;
        case '2':
            createTestUsers();
            break;
        case '3':
            deleteAllUsers();
            break;
        default:
            console.log('Wrong input');
            break;
    }
}
process.openStdin().addListener("data", function(d) {
    execute(d.toString().trim());
});



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

createTestUsers = function() {
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
                    console.log('Successfully created users');
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
