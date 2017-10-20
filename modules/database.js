#!/usr/bin/env node
var mysql = require('mysql');
var config = require('../cfg/config.json');
var pool = mysql.createPool(
    config.database
);

module.exports = {

    saveUser: function(data, callback) {
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
                    }
                    callback(saveUserDTO);
                });
            }
        });
    }, 

    logIn: function(data, callback) {
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

}