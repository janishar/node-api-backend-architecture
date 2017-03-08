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

const config = require('./../config');
const express = require('express');
const router = express.Router();

let JWT = require('./../helpers/jwt');
let UserAccess = require('./../models/user_access');
let AccessTokenErrorResponse = require('./../helpers/response').AccessTokenErrorResponse;
let BadRequestResponse = require('./../helpers/response').BadRequestResponse;
let ForbiddenError = require('./../helpers/error').ForbiddenError;
let AccessTokenError = require('./../helpers/error').AccessTokenError;

router.use(
    (req, res, next) => {

        req.checkHeaders('access-token', 'Access token is empty').notEmpty();
        req.checkHeaders('user-id', "User id is empty").notEmpty();
        req.checkHeaders('user-id', "User id is invalid").isInt();

        const validErr = req.validationErrors();

        if (validErr) {
            return new BadRequestResponse(validErr[0].msg).send(res);
        }

        req.userId = req.headers['user-id'];
        req.accessToken = req.headers['access-token'];

        /**
         * user_access table is used to access the user existence in place of user table
         */
        return UserAccess.getFromUser(req.userId)
            .then(userAccess => {
                if (userAccess._status != 1) {
                    throw new ForbiddenError("Permission Denied");
                }

                if (userAccess._accessToken === undefined || userAccess._accessToken === null) {
                    throw new AccessTokenError("User is Logged out");
                }

                req.userAccess = userAccess;

                // the parameter from header is in string
                return JWT.builder()
                    .token(req.accessToken)
                    .validationParams(parseInt(req.userId), userAccess._accessToken)
                    .build()
                    .validate()
                    .catch(err => {
                        throw new AccessTokenError("Invalid Access Token")
                    })
            })
            .then(payLoad => {
                // rechecking the decoded jwt access_token
                if (!payLoad
                    || !payLoad._userId
                    || !payLoad._suppliedKey
                    || !payLoad._purpose
                    || payLoad._userId != req.userId
                    || payLoad._suppliedKey != req.userAccess._accessToken
                    || payLoad._purpose != config.access_token_purpose){

                    return new AccessTokenErrorResponse("Invalid Access Token").send(res)
                }

                return next();
            })
            .catch(err => next(err));
    });

module.exports = router;

