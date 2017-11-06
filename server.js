#!/usr/bin/env node

var http = require('http');

var config = require('./cfg/config.json');
var router = require('./modules/router.js');
var database = require('./modules/database.js');
var util = require('./modules/util.js');
var url = require('url');

router.get('/users', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getUser(urlParts.query, function(userDTO) {
        response.end(JSON.stringify(userDTO));
    });
})

router.get('/dashboard', function(request, response) {
    database.getDashboard(function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
})

router.get('/thread', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadById(urlParts.query, function(threadDTO) {
        response.end(JSON.stringify(threadDTO));
    });
})

router.get('/threads', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadsSearch(urlParts.query, function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
})

router.get('/thread/comments', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadComments(urlParts.query, function(commentsDTO) {
        response.end(JSON.stringify(commentsDTO));
    });
})

router.get('/mytopics', function (request, response) {
    var urlParts = url.parse(request.url, true);
    database.getMytopics(urlParts.query, function(mytopicsDTO) {
        response.end(JSON.stringify(mytopicsDTO));
    });
})

router.get('/categoryName', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getCategoryName(urlParts.query, function(categoryNameDTO) {
        response.end(JSON.stringify(categoryNameDTO));
    });
})

router.get('/categories', function(request, response) {
    database.getCategories(function(categoriesDTO) {
        response.end(JSON.stringify(categoriesDTO));
    });
})

router.get('/categories/threads', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getThreadsInCategory(urlParts.query, function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
})

router.get('/users/threads', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getUserThreads(urlParts.query, function(threadsDTO) {
        response.end(JSON.stringify(threadsDTO));
    });
})

router.get('/users/comments', function(request, response) {
    var urlParts = url.parse(request.url, true);
    database.getUserComments(urlParts.query, function(commentsDTO) {
        response.end(JSON.stringify(commentsDTO));
    });
})

router.put('/users', function(request, response) {
    request.on('data', function(data) {
        console.log('Received user creation request for: ' + data);
        database.saveUser(data, function(saveUserDTO) {
            console.log(saveUserDTO);
            response.end(JSON.stringify(saveUserDTO));
        });
    });
})

router.put('/thread/submitComment', function(request, response) {
    request.on('data', function(data) {
        database.saveComment(data, function(error) {
            console.log("Comment received!");
            response.end(error);
        });
    });
})

router.post('/users', function(request, response) {
    request.on('data', function(data) {
        console.log('Received login request for: ' + data);
        database.logIn(data, function(logInDTO) {
            console.log(logInDTO);
            response.end(JSON.stringify(logInDTO));
        });
    });
})

router.post('/change', function(request, response) {
    request.on('data', function(data) {
        console.log('Received change request for: ' + data);
        database.changePassword(data, function(changeDTO) {
            console.log(changeDTO);
            response.end(JSON.stringify(changeDTO));
        });
    });
})

router.delete('/users', function(request, response) {
    request.on('data', function(data) {
        console.log('Received delete request for: ' + data);
        database.deleteUser(data, function(deleteDTO) {
            console.log(deleteDTO);
            response.end(JSON.stringify(deleteDTO));
        });
    });
})

var server = http.createServer(function(request, response) {
    console.log("[" + util.getTime() + "] Received request for " + request['method'] + request.url);

    router.handleRequest(request, response);
});

server.listen(config.server.port, config.server.host, function() {
    console.log("[" + util.getTime() + "] Listening to http://%s:%s", config.server.host, config.server.port);
});