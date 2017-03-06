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

class Response {

    constructor(statusCode, message) {
        this._statusCode = statusCode;
        this._message = message;
    }

    set _statusCode(code) {
        this.status_code = code;
    }

    get _statusCode() {
        return this.status_code;
    }

    set _message(message) {
        this.message = message;
    }

    get _message() {
        return this.message;
    }

    getResObj() {
        return this;
    }

    send(res, status) {
        const resObj = this.getResObj();
        res.status(status).json(resObj);
        fileLog.logResponse(res, resObj)
    }
}

class AccessTokenErrorResponse extends Response {

    constructor(message) {
        super('invalid_access_token', (message || 'Access token invalid'));
    }

    send(res) {
        res.setHeader("instruction", "refresh_token");
        res.status(401).json(this.getResObj());
    }
}

class AuthFailureResponse extends Response {

    constructor(message) {
        super('failed', (message || 'Authentication Failure'));
    }

    send(res) {
        res.status(401).json(this.getResObj());
    }
}

class NotFoundResponse extends Response {

    constructor(message, url) {
        super('failed', (message || 'Not Found'));
        this._url = url;
    }

    get _url(){
        return this.url;
    }

    set _url(url){
        this.url = url;
    }

    getResObj() {
        return {
            status_code: this._statusCode,
            url: this._url,
            message: this._message
        };
    }

    send(res) {
        this._url = res.req.originalUrl;
        res.status(404).json(this.getResObj());
    }
}

class ForbiddenResponse extends Response {

    constructor(message) {
        super('failed', (message || 'Forbidden'));
    }

    send(res) {
        res.status(403).json(this.getResObj());
    }
}

class BadRequestResponse extends Response {

    constructor(message) {
        super('failed', (message || 'Bad Parameters'));
    }

    send(res) {
        super.send(res, 400)
    }
}

class InternalErrorResponse extends Response {

    constructor(message) {
        super('failed', (message || 'Internal Error'));
    }

    send(res) {
        super.send(res, 500)
    }
}

class CustomErrorResponse extends Response {

    constructor(statusCode, message) {
        super((statusCode || 'failed'), (message || 'Internal Error'));
    }

    send(res, status) {
        super.send(res, (status || 500))
    }
}

class SuccessResponse extends Response {

    constructor(message, data) {
        super('success', message);
        this._data = data;
    }

    set _data(data) {
        this.data = data;
    }

    get _data() {
        return this.data;
    }

    send(res) {
        const resObj = this.getResObj();
        res.status(200).json(resObj);
        fileLog.logResponse(res, resObj)
    }

    getResObj() {
        return {
            status_code: this._statusCode,
            message: this._message,
            data: this._data
        };
    }
}

class LoginResponse extends Response {

    constructor(message, user, accessToken, refreshToken) {
        super('success', message);

        this._user = user;
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
    }

    get _user() {
        return this.user;
    }

    set _user(user) {
        this.user = user;
    }

    get _accessToken() {
        return this.accessToken;
    }

    set _accessToken(accessToken) {
        this.accessToken = accessToken;
    }

    get _refreshToken() {
        return this.refreshToken;
    }

    set _refreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }

    getResObj() {
        return {
            status_code: this._statusCode,
            user_id: this._user._id,
            access_token: this._accessToken,
            refresh_token: this._refreshToken,
            user_name: this._user._name,
            email: this._user._email,
            google_profile_pic_url: this._user._googleProfilePic,
            fb_profile_pic_url: this._user._fbProfilePic,
            message: this._message
        };
    }

    send(res) {
        res.status(200).json(this.getResObj());
    }
}

class TokenRefreshResponse extends Response {

    constructor(message, accessToken, refreshToken) {
        super('success', message);
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
    }

    set _accessToken(accessToken) {
        this.accessToken = accessToken;
    }

    get _accessToken() {
        return this.accessToken;
    }

    set _refreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }

    get _refreshToken() {
        return this.refreshToken;
    }

    getResObj() {
        return {
            status_code: this._statusCode,
            access_token: this._accessToken,
            refresh_token: this._refreshToken,
            message: this._message
        };
    }

    send(res) {
        res.status(200).json(this.getResObj());
    }
}

class LanguageCorrectionResponse extends Response {

    constructor(data) {
        super('success', "success");
        this._data = data;
    }

    set _data(data) {
        this.data = data;
    }

    get _data() {
        return this.data;
    }

    getResObj() {
        try{
            this._data = JSON.parse(this._data);

            if(this._data !== undefined
                && this._data.software !== undefined
                && this._data.software.name !== undefined){
                this._data.software.name = 'Mindorks NextGen Private Limited'
            }
            return this._data

        }catch (err){
            return this._data
        }
    }

    send(res) {
        const resObj = this.getResObj();
        res.status(200).json(resObj);
        fileLog.logResponse(res, resObj)
    }
}

class SuccessResponseWithoutData extends Response {

    constructor(message) {
        super('success', message);
    }

    send(res) {
        super.send(res, 200)
    }
}

module.exports = Response;
module.exports.AccessTokenErrorResponse = AccessTokenErrorResponse;
module.exports.AuthFailureResponse = AuthFailureResponse;
module.exports.NotFoundResponse = NotFoundResponse;
module.exports.ForbiddenResponse = ForbiddenResponse;
module.exports.InternalErrorResponse = InternalErrorResponse;
module.exports.CustomErrorResponse = CustomErrorResponse;
module.exports.SuccessResponse = SuccessResponse;
module.exports.LoginResponse = LoginResponse;
module.exports.TokenRefreshResponse = TokenRefreshResponse;
module.exports.LanguageCorrectionResponse = LanguageCorrectionResponse;
module.exports.SuccessResponseWithoutData = SuccessResponseWithoutData;
module.exports.BadRequestResponse = BadRequestResponse;