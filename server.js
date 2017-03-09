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

/**
 * Module dependencies.
 */
const express = require('express');
const mysql = require("mysql");
const config = require('./config.json');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();
const http = require('http').Server(app);

global.LOG_ERR = true;
global.LOG_RES = true;
global.LOG_REQ = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

global.DB_POOL = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.pwd,
    database: config.database.db,
    connectionLimit: 25,
    supportBigNumbers: true
});

app.set('port', process.env.PORT || config.port);
app.use(require('./routes.js'));
http.listen(app.get('port'));