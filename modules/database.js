#!/usr/bin/env node
var mysql = require('mysql');
var config = require('../cfg/config.json');
var pool = mysql.createPool(
    config.database
);

module.exports = {

    getUserThreads: function(queryObj, callback) {
        var threadsDTO = [];
        pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var query = 'SELECT * FROM threads ' + 
            'LEFT JOIN (SELECT comments.threadId, COUNT(*) AS commentCount FROM lascari_net_db.comments GROUP BY comments.threadId) comments ON threads.id = comments.threadId ' +            
            'WHERE authorId = ? ' + 
            'OR (NOT EXISTS (SELECT * FROM threads WHERE authorId = ?) ' + 
            'AND authorId = (SELECT id FROM users WHERE username = ?));';
            connection.query(query, [queryObj.id, queryObj.id, queryObj.id], function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    console.log(result);
                    for (var i = 0; i < result.length; i++) {
                        threadsDTO.push( {id: result[i].id, categoryId: result[i].categoryId, 
                            authorId: result[i].authorId, title: result[i].title, 
                            content: result[i].content, creationDate: result[i].creationDate,
                            commentCount: result[i].commentCount} );
                    }
                }
                callback(threadsDTO);
            });
        }
        });
    }, 

    getThread: function(queryObj, callback) {
        var threadDTO = {};
        pool.getConnection(function(error, connection) {
            if(error) {
                connection.release();
                console.log('Error connection to database');
            }
            else {
                console.log('Connection to database');
                var sqlQuery = 'SELECT threads.id, threads.authorId, users.username, threads.title, threads.content, threads.creationDate FROM lascari_net_db.threads ' +
                'LEFT JOIN (SELECT users.id, users.username FROM lascari_net_db.users) users ON users.id = threads.authorId ' +
                'WHERE threads.id=?;';
                connection.query(sqlQuery, queryObj.id, function(error, result) {
                    connection.release();
                    if(error) {
                        throw error;
                        console.log('Error in the query');
                    }
                    else if (result.length > 0) {
                        threadDTO.id = result[0].id;
                        threadDTO.authorId = result[0].authorId;
                        threadDTO.author = result[0].username;
                        threadDTO.title = result[0].title;
                        threadDTO.content = result[0].content;
                        threadDTO.creationDate = result[0].creationDate;
                    }
                    callback(threadDTO);
                });
            }
        });
    },

    getThreadComments: function(queryObj, callback) {
        var commentsDTO = [];
        pool.getConnection(function(error, connection) {
            if(error) {
                connection.release();
                console.log('Error connection to database');
            }
            else {
                console.log('Connection to database');
                var sqlQuery = 'SELECT comments.id, comments.threadId, comments.authorId, users.username, comments.content, comments.creationDate FROM lascari_net_db.comments ' +
                'LEFT JOIN (SELECT users.id, users.username FROM lascari_net_db.users) users ON comments.authorId = users.id ' + 
                'WHERE comments.threadId = ?;';
                connection.query(sqlQuery, queryObj.id, function(error, result) {
                    connection.release();
                    if(error) {
                        throw error;
                        console.log('Error in the query');
                    }
                    else {
                        for (var i = 0; i < result.length; i++) { 
                            var date = new Date(result[i].creationDate);
                            var temp;
                            temp = date.getHours() + ':' + date.getMinutes() + ' | ' + date.getDate() + ' ' + date.toLocaleString('en-US', { month: "long" }) + ' ' + date.getFullYear();                
                            commentsDTO.push( { id: result[i].id, authorId: result[i].authorId, author: result[i].username, content: result[i].content, creationDate: temp} );
                         }
                    }
                    callback(commentsDTO);
                });
            }
        });
    },

    getUser: function(queryObj, callback) {
        var userDTO = {};
        pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var sqlQuery = 'SELECT * FROM users WHERE id = ? ' + 
            'OR (NOT EXISTS (SELECT * FROM users WHERE id = ?) AND username = ?);';
            connection.query(sqlQuery, [queryObj.id, queryObj.id, queryObj.id], function (error, result) {
                connection.release();
                if (error) {
                    throw error;
                    console.log('Error in the query');
                }
                else if (result.length > 0) {
                    //console.log(result);
                    userDTO.id = result[0].id;
                    userDTO.username = result[0].username;
                    userDTO.creationDate = result[0].creationDate;
                }
                callback(userDTO);
            });
        }
        });
    }, 

    getThreadsInCategory: function(queryObj, callback) {
        var threadsDTO = [];
        pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');
            var query = 'SELECT * FROM threads WHERE categoryId = ?;';
            connection.query(query, queryObj.id, function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    //console.log(result);
                    for (var i = 0; i < result.length; i++) {
                        threadsDTO.push( {id: result[i].id, categoryId: result[i].categoryId, 
                            authorId: result[i].authorId, title: result[i].title, 
                            content: result[i].content, creationDate: result[i].creationDate} );
                    }
                }
                callback(threadsDTO);
            });
        }
        });
    }, 

    getCategories: function(callback) {
        var categoriesDTO = [];
        pool.getConnection(function(error, connection) {
        if(error) {
            connection.release();
            console.log('Error connecting to database');
        }
        else {
            console.log('Connected to database');

            var sqlQuery = 'SELECT categories.id, categories.title, categories.description, threads.threadsPerCategory, comments.commentsPerCategory FROM lascari_net_db.categories ' +
            'LEFT JOIN (SELECT threads.id, threads.categoryId, COUNT(*) AS threadsPerCategory FROM lascari_net_db.threads GROUP BY threads.categoryId) threads ' +
            'ON categories.id=threads.categoryId ' +
            'LEFT JOIN (SELECT threads.categoryId, COUNT(*) AS commentsPerCategory FROM lascari_net_db.threads ' +
            'LEFT JOIN lascari_net_db.comments ON threads.id = comments.threadId WHERE comments.id AND comments.threadId IS NOT NULL ' +
            'GROUP BY threads.categoryId) comments ' +
            'ON categories.id = comments.categoryId';
            connection.query(sqlQuery, function (error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                }
                else {
                    //console.log(result);
                    for (var i = 0; i < result.length; i++) {
                        var postsCount;
                        var commentsCount;
                        result[i].threadsPerCategory == undefined ? postsCount = 0 : postsCount = result[i].threadsPerCategory;
                        result[i].commentsPerCategory == undefined ? commentsCount = 0 : commentsCount = result[i].commentsPerCategory;
                        categoriesDTO.push( {id: result[i].id, title: result[i].title, 
                            description: result[i].description, postsCount: postsCount, commentsCount: commentsCount} );
                    }
                }
                callback(categoriesDTO);
            });
        }
        });
    }, 

    deleteUser: function(data, callback) {
        var deleteUserDTO = {message: ''};
        pool.getConnection(function(error, connection) {
            if(error) {
                throw error;
                connection.release();
                console.log('Error connecting to database');
                deleteUserDTO.message = 'Database connection error.';
                callback(deleteUserDTO);
            }
            else {
                console.log('Connected to database');
                var query = "DELETE FROM users WHERE username = ? AND id = ?;";
                var userObj = JSON.parse(data);
                connection.query(query, [userObj.username, userObj.id], function (error, result) {
                    connection.release();
                    if (error) {
                        throw error;
                        console.log('Error in the query');
                        deleteUserDTO.message = 'Database error.';
                    }
                    else {
                        console.log('Successfully deleted user ' + data);
                        deleteUserDTO.message = 'User deleted.';
                    }
                    callback(deleteUserDTO);
                });
            }
        });
    }, 

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