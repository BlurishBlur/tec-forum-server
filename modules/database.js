#!/usr/bin/env node

var mysql = require('mysql');
var config = require('../cfg/config.json');
var pool = mysql.createPool(
    config.database
);

function query(sqlQuery, args, DTO, callback, action) {
    pool.getConnection(function(error, connection) {
        if (error) {
            connection.release();
            console.log('Error connecting to database');
        } else {
            console.log('Connected to database');
            connection.query(sqlQuery, args, function(error, result) {
                connection.release();
                if (error) {
                    //throw error;
                    console.log('Error in the query');
                } else {
                    action(DTO, result);
                    //console.log(result);
                }
                callback(DTO);
            });
        }
    });
}

module.exports = {

    getUserComments: function(queryObj, callback) { // skal returnere alle kommentarer en bruger har lavet, + titlen på tråden de er i.
        var sqlQuery = 'SELECT * FROM comments WHERE authorId = ?;';
        var args = queryObj.id;
        var DTO = [];

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            for (var i = 0; i < result.length; i++) {
                DTO.push({
                    id: result[i].id,
                    threadId: result[i].threadId,
                    authorId: result[i].authorId,
                    content: result[i].content,
                    creationDate: result[i].creationDate
                });
            }
        });
    }, 

    getUserThreads: function(queryObj, callback) {
        var sqlQuery = 'SELECT * FROM threads ' +
            'LEFT JOIN (SELECT comments.threadId, COUNT(*) AS commentCount FROM lascari_net_db.comments GROUP BY comments.threadId) comments ON threads.id = comments.threadId ' +
            'WHERE authorId = ? ' +
            'OR (NOT EXISTS (SELECT * FROM threads WHERE authorId = ?) ' +
            'AND authorId = (SELECT id FROM users WHERE username = ?));';
        var args = [queryObj.id, queryObj.id, queryObj.id];
        var DTO = [];

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            for (var i = 0; i < result.length; i++) {
                DTO.push({
                    id: result[i].id,
                    categoryId: result[i].categoryId,
                    authorId: result[i].authorId,
                    title: result[i].title,
                    content: result[i].content,
                    creationDate: result[i].creationDate,
                    commentCount: result[i].commentCount
                });
            }
        });
    },

    getThread: function(queryObj, callback) {
        var sqlQuery = 'SELECT threads.id, threads.authorId, users.username, threads.title, threads.content, threads.creationDate FROM lascari_net_db.threads ' +
            'LEFT JOIN (SELECT users.id, users.username FROM lascari_net_db.users) users ON users.id = threads.authorId ' +
            'WHERE threads.id=?;';
        var args = queryObj.id;
        var DTO = {};

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            if (result.length > 0) {
                DTO.id = result[0].id;
                DTO.authorId = result[0].authorId;
                DTO.author = result[0].username;
                DTO.title = result[0].title;
                DTO.content = result[0].content;
                DTO.creationDate = result[0].creationDate;
            }
        });
    },

    getThreadComments: function(queryObj, callback) {
        var sqlQuery = 'SELECT comments.id, comments.threadId, comments.authorId, users.username, comments.content, comments.creationDate FROM lascari_net_db.comments ' +
            'LEFT JOIN (SELECT users.id, users.username FROM lascari_net_db.users) users ON comments.authorId = users.id ' +
            'WHERE comments.threadId = ?;';
        var args = queryObj.id;
        var DTO = [];

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].creationDate);
                var temp;
                temp = date.getHours() + ':' + date.getMinutes() + ' | ' + date.getDate() + ' ' + date.toLocaleString('en-US', { month: "long" }) + ' ' + date.getFullYear();
                DTO.push({ id: result[i].id, 
                    authorId: result[i].authorId, 
                    author: result[i].username, 
                    content: result[i].content, 
                    creationDate: temp });
            }
        });
    },

    getUser: function(queryObj, callback) {
        var sqlQuery = 'SELECT * FROM users WHERE id = ? ' +
            'OR (NOT EXISTS (SELECT * FROM users WHERE id = ?) AND username = ?);';
        var args = [queryObj.id, queryObj.id, queryObj.id];
        var DTO = {};

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            if (result.length > 0) {
                DTO.id = result[0].id;
                DTO.username = result[0].username;
                DTO.creationDate = result[0].creationDate;
            }
        });
    },

    getThreadsInCategory: function(queryObj, callback) {
        var sqlQuery = 'SELECT * FROM threads WHERE categoryId = ?;';
        var args = queryObj.id;
        var DTO = [];

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            for (var i = 0; i < result.length; i++) {
                DTO.push({
                    id: result[i].id,
                    categoryId: result[i].categoryId,
                    authorId: result[i].authorId,
                    title: result[i].title,
                    content: result[i].content,
                    creationDate: result[i].creationDate
                });
            }
        });
    },

    getCategories: function(callback) {
        var sqlQuery = 'SELECT categories.id, categories.title, categories.description, threads.threadsPerCategory, comments.commentsPerCategory FROM lascari_net_db.categories ' +
            'LEFT JOIN (SELECT threads.id, threads.categoryId, COUNT(*) AS threadsPerCategory FROM lascari_net_db.threads GROUP BY threads.categoryId) threads ' +
            'ON categories.id=threads.categoryId ' +
            'LEFT JOIN (SELECT threads.categoryId, COUNT(*) AS commentsPerCategory FROM lascari_net_db.threads ' +
            'LEFT JOIN lascari_net_db.comments ON threads.id = comments.threadId WHERE comments.id AND comments.threadId IS NOT NULL ' +
            'GROUP BY threads.categoryId) comments ' +
            'ON categories.id = comments.categoryId';
        var args = [];
        var DTO = [];

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            for (var i = 0; i < result.length; i++) {
                var postsCount;
                var commentsCount;
                result[i].threadsPerCategory == undefined ? postsCount = 0 : postsCount = result[i].threadsPerCategory;
                result[i].commentsPerCategory == undefined ? commentsCount = 0 : commentsCount = result[i].commentsPerCategory;
                DTO.push({
                    id: result[i].id,
                    title: result[i].title,
                    description: result[i].description,
                    postsCount: postsCount,
                    commentsCount: commentsCount
                });
            }
        });
    },

    deleteUser: function(data, callback) {
        var sqlQuery = "DELETE FROM users WHERE username = ? AND id = ?;";
        var args = [userObj.username, userObj.id];
        var DTO = {};

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            console.log('Successfully deleted user ' + data);
            DTO.message = 'User deleted.';
        });
    },

    saveUser: function(data, callback) {
        var sqlQuery = "INSERT INTO users(username, password) VALUES(?, ?);";
        var userObj = JSON.parse(data);
        var args = [userObj.username, userObj.password];
        var DTO = {};

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            console.log('Successfully created user ' + data);
            DTO.message = 'User created.';
        });
    },

    saveComment: function(data, callback) {
        pool.getConnection(function(error, connection) {
            if(error) {
                throw error;
                connection.release();
            } else {
                var query = "INSERT INTO comments(threadId, authorId, content) VALUES(?, ?, ?)";
                var commentObj = JSON.parse(data);
                connection.query(query, [commentObj.threadId, commentObj.authorId, commentObj.comment], function(error, result) {
                    connection.release();
                    if (error) {
                        throw error;
                        console.log('Error in the query');
                    } else {
                        console.log('Successfully');
                    }
                    callback(""+error);
                })
            }
        })
    },

    logIn: function(data, callback) {
        var sqlQuery = "SELECT id FROM users WHERE username = ? AND password = ?;";
        var userObj = JSON.parse(data);
        var args = [userObj.username, userObj.password];
        var DTO = {};

        query(sqlQuery, args, DTO, callback, function(DTO, result) {
            DTO.loggedIn = (result.length > 0);
            if (DTO.loggedIn === true) {
                DTO.id = result[0].id;
            } else {
                DTO.message = 'Wrong username or password.';
            }
        });
    }

}