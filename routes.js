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

/**
 * Created by janisharali on 07/03/17.
 */
'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const app = express();

let Error = require('./helpers/error');
let NotFoundError = require('./helpers/error').NotFoundError;

const accessLogStream = fs.createWriteStream(path.join(__dirname, './log/access.log'), {flags: 'a'});
app.use(logger(':method :url :req[header] :res[header] :status :response-time', {"stream": accessLogStream}));

const fileLog = new (require('./helpers/file_log'))(LOG_REQ, LOG_RES, LOG_ERR);

if (app.get('env') === 'production') {
    global.debug = new (require('./helpers/debug'))(false);
} else {
    global.debug = new (require('./helpers/debug'))(true);
}

global.fileLog = fileLog;

app.use(require('./controllers/v1'));
app.use(require('./controllers/v2'));

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

app.use((err, req, res, next) => {
    debug.log("Error", err);
    Error.handle(err, res);
    fileLog.logError(err);
});

module.exports = app;
