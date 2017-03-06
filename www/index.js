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
var router = express.Router();
var path = require('path');

router.get('/about',
    (req, res, next) => res.sendFile(path.join(__dirname, './public/html', 'about.html')));

router.get('/post',
    (req, res, next) => res.sendFile(path.join(__dirname, './public/html', 'post.html')));

router.get('/contact',
    (req, res, next) => res.sendFile(path.join(__dirname, './public/html', 'contact.html')));

router.get('/',
    (req, res, next) => res.sendFile(path.join(__dirname, './public/html', 'index.html')));

module.exports = router;
