/*
 * Copyright (C) 2017 MINDORKS NEXTGEN PRIVATE LIMITED
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://mindorks.com/license/apache-v2
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');

const fileLog = new (require('./../api/helpers/file_log'))();

var app = express();

app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Intercepts all the /v1/* calls and marks it's API version
 */
app.use('/v1', (req, res, next) => {
    req.apiVersionCode = 1;
    next()
});

/**
 * These are public APIs protected by api_key
 */
app.use('/v1', require('./../api/middlewares/public_auth'));

/**
 * ...........................................................................................
 * Intercepts all the /v1/* calls that is bellow this and logs the requests.
 * These are private APIs protected by the access-token
 */
app.use('/v1', (req, res, next) => {
    fileLog.logRequest(req);
    next();
});


//app.get('/v1/blogs', require('./../api/v1/blogs'));
app.use('/', require('./index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(path.join(__dirname, 'public/html', 'error.html'));
});

module.exports = app;
