#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var app = express();

var jwt = require('jsonwebtoken');
var uuid = require('uuid');

var config = require('./cfg/config.json');
var database = require('./modules/database.js');
var util = require('./modules/util.js');

var secretKey = uuid.v4();

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true, methods: 'GET,HEAD,PUT,POST,DELETE' }));
app.use(cookieParser());

app.use(logger);

function logger(request, response, next) {
    console.log('[%s] Received request for %s%s', util.getTime(), request.method, request.url)
    if (Object.keys(request.query).length !== 0) {
        console.log('Query:', request.query)
    }
    if (Object.keys(request.body).length !== 0) {
        console.log('Body:', request.body)
    }

    next()
}

function authorize(request, response, next) {
    var token = request.headers.authorization
    console.log('Authorizing request with token:', token)
    jwt.verify(token, secretKey, function(error, tok) {
        if (error) {
            console.log('Invalid token.')
            response.sendStatus(403)
        } else {
            next()
        }
    })
}

app.get('/users', authorize, function(request, response) {
    database.getUser(request.query, function(userDTO) {
        response.send(userDTO)
    });
})

app.get('/dashboard', authorize, function(request, response) {
    database.getDashboard(function(threadsDTO) {
        response.send(threadsDTO)
    });
})

app.get('/thread', authorize, function(request, response) {
    database.getThreadById(request.query, function(threadDTO) {
        response.send(threadDTO)
    });
})

app.get('/threads', authorize, function(request, response) {
    database.getThreadsSearch(request.query, function(threadsDTO) {
        response.send(threadsDTO)
    });
})

app.get('/thread/comments', authorize, function(request, response) {
    database.getThreadComments(request.query, function(commentsDTO) {
        response.send(commentsDTO)
    });
})

app.get('/mytopics', authorize, function(request, response) {
    database.getMytopics(request.query, function(mytopicsDTO) {
        response.send(mytopicsDTO)
    });
})

app.get('/categoryName', authorize, function(request, response) {
    database.getCategoryName(request.query, function(categoryNameDTO) {
        response.send(categoryNameDTO)
    });
})

app.get('/categories', authorize, function(request, response) {
    database.getCategories(function(categoriesDTO) {
        response.send(categoriesDTO)
    });
})

app.get('/categories/threads', authorize, function(request, response) {
    database.getThreadsInCategory(request.query, function(threadsDTO) {
        response.send(threadsDTO)
    });
})

app.get('/users/threads', authorize, function(request, response) {
    database.getUserThreads(request.query, function(threadsDTO) {
        response.send(threadsDTO)
    });
})

app.get('/users/comments', authorize, function(request, response) {
    database.getUserComments(request.query, function(commentsDTO) {
        response.send(commentsDTO)
    });
})

app.put('/thread/submitComment', authorize, function(request, response) {
    database.saveComment(request.body, function(error) {
        response.send(error)
    })
})

app.put('/thread', authorize, function(request, response) {
    database.createThread(request.body, function(createThreadDTO) {
        response.send(createThreadDTO)
    })
})

app.put('/users', function(request, response) {
    database.saveUser(request.body, function(saveUserDTO) {
        console.log(saveUserDTO);
        response.send(saveUserDTO)
    })
})

app.post('/users', function(request, response) {
    database.logIn(request.body, function(logInDTO) {
        if (logInDTO.loggedIn === true) {
            var claims = {
                sub: logInDTO.id,
                name: logInDTO.username
            }
            var token = jwt.sign(claims, secretKey)
            console.log('Creating new token:', token)
            response.cookie('auth-token', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false });
        }
        console.log(logInDTO)
        response.send(logInDTO)
    })
})

app.post('/change', authorize, function(request, response) {
    database.changePassword(request.body, function(changeDTO) {
        console.log(changeDTO)
        response.send(changeDTO)
    })
})

app.delete('/users', authorize, function(request, response) {
    database.deleteUser(request.body, function(deleteDTO) {
        console.log(deleteDTO)
        response.send(deleteDTO)
    })
})

var server = app.listen(config.server.port, function() {
    var port = server.address().port

    console.log('[%s] Listening to port %s', util.getTime(), port)
})