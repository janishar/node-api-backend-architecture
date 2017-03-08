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
const router = express.Router();

let API = require('./../models/api');
let BadRequestResponse = require('./../helpers/response').BadRequestResponse;
let ForbiddenResponse = require('./../helpers/response').ForbiddenResponse;

router.use((req, res, next) => {

    req.checkHeaders('api-key', 'API key in empty').notEmpty();

    if (req.validationErrors()) {
        return new BadRequestResponse("Invalid API Key").send(res);
    }

    if(req.apiVersionCode === undefined){
        return new ForbiddenResponse("Not Allowed").send(res);
    }

    console.log(JSON.stringify(req.headers));
    let api = new API(req.headers['api-key'], req.apiVersionCode);

    api.validate()
        .then(apiEntity => {
            return next();
        })
        .catch(err => next(err));
});

module.exports = router;
