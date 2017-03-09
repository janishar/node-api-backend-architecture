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
const app = express();

const fileLog = new (require('./../../helpers/file_log'))();

/**
 *******************************************************************************************
 * Intercepts all the /v1/* calls and marks it's API version
 */
app.use('/v1', (req, res, next) => {
    req.apiVersionCode = 1;
    next()
});

/**
 * ------------------------------------------------------------------------------------------
 * these apis should not be logged
 * These are public APIs protected by api_key
 */
//app.use('/v1', require('./../../middlewares/public_auth'));
//app.use('/v1/login', require('./login'));
//--------------------------------------------------------------------------------------------
/**
 * ...........................................................................................
 * Intercepts all the /v1/* calls that is bellow this and logs the requests.
 * These are private APIs protected by the access-token
 */
app.use('/v1', (req, res, next) => {
    fileLog.logRequest(req);
    next();
});
//app.use('/v1', require('./../../middlewares/private_auth'));
app.use('/v1/feedback', require('./feedback'));
//..............................................................................................
//**********************************************************************************************

module.exports = app;
