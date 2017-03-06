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

const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const jsonWebToken = Promise.promisifyAll(require('jsonwebtoken'));

let InternalError = require('./error').InternalError;
let InvalidJwtTokenError = require('./error').InvalidJwtTokenError;

const debug = new (require('./../helpers/debug'))();

class JWT {

    static builder() {
        return new Builder();
    }

    get _token() {
        return this.token;
    }

    set _token(token) {
        this.token = token;
    }

    get _payload() {
        return this.payload;
    }

    set _payload(payload) {
        this.payload = payload;
    }

    get _validation() {
        return this.validation;
    }

    set _validation(validation) {
        this.validation = validation;
    }

    static readAuthKey() {
        return fs.readFileAsync(path.join(__dirname, './../../authkey.pem'))
    }

    encode() {
        return JWT.readAuthKey()
            .then(cert => {
                if (!cert) {
                    throw new InternalError("Token generation failure");
                }
                return jsonWebToken.signAsync(this._payload, cert, {algorithm: 'HS256'});
            })
    };

    /**
     * This method checks the token and returns the decoded data when token is valid in all respect
     */
    validate() {
        return JWT.readAuthKey()
            .then(cert => {
                return jsonWebToken.verifyAsync(this._token, cert, this._validation)
            })
            .then(decoded => {
                return Promise.resolve(new JwtPayLoad().copy(decoded));
            })
            .catch(err => {
                if (err.name == 'TokenExpiredError') {
                    throw new InvalidJwtTokenError("Token Expired");
                }
                throw new InvalidJwtTokenError("Token is invalid");
            })
    };

    /**
     * This method checks the token and returns the decoded data even when the token is expired
     */
    decode() {
        return JWT.readAuthKey()
            .then(cert => {
                // token is verified if it was encrypted by the private key
                // and if is still not expired then get the payload
                return jsonWebToken.verifyAsync(this._token, cert, this._validation)
            })
            .then(decoded => {
                return Promise.resolve(new JwtPayLoad().copy(decoded));
            })
            .catch(err => {
                if (err.name == 'TokenExpiredError') {
                    // if the token has expired but was encryped by the private key
                    // then decode it to get the payload
                    const decoded = jsonWebToken.decode(this._token);
                    return Promise.resolve(new JwtPayLoad().copy(decoded));
                }
                else {
                    // throws error if the token has not been encrypted by the private key
                    // or has not been issued for the user
                    throw new InvalidJwtTokenError("Token is invalid");
                }
            })
    };
}

class ValidationParams{

    constructor(userId, suppliedKey){
        this._userId = userId;
        this._suppliedKey = suppliedKey;
    }

    get _userId() {
        return this.audience;
    }

    set _userId(userId) {
        this.audience = userId;
    }

    get _suppliedKey() {
        return this.subject;
    }

    set _suppliedKey(suppliedKey) {
        this.subject = suppliedKey;
    }
}

class Builder {

    constructor() {
        this._jwt = new JWT();
    }

    get _jwt() {
        return this.jwt;
    }

    set _jwt(jwt) {
        this.jwt = jwt;
    }

    validationParams(userId, suppliedKey){
        this._jwt._validation = new ValidationParams(userId, suppliedKey);
        return this;
    }

    token(token) {
        this._jwt._token = token;
        return this;
    }

    payload(userId, suppliedKey, purpose, validity, param) {
        this._jwt._payload = new JwtPayLoad(userId, suppliedKey, purpose, validity, param);
        return this;
    }

    build() {
        return this._jwt;
    }
}

class JwtPayLoad {

    constructor(userId, suppliedKey, purpose, validity, param) {
        this._userId = userId;
        this._suppliedKey = suppliedKey;
        this._purpose = purpose != undefined ? purpose : "";
        this._issuedAt = Math.floor(Date.now() / 1000);
        this._expireAt = validity != undefined
            ? this._issuedAt + (validity * 24 * 60 * 60) // converting it in seconds greater than current time
            : this._issuedAt + (24 * 60 * 60);//1 day;
        this._param = param != undefined ? param : "";
    }

    copy({aud, sub, iss, iat, exp, prm}) {
        this._userId = aud;
        this._suppliedKey = sub;
        this._purpose = iss;
        this._issuedAt = iat;
        this._expireAt = exp;
        this._param = prm;
        return this;
    }

    get _userId() {
        return this.aud;
    }

    set _userId(userId) {
        this.aud = userId;
    }

    get _suppliedKey() {
        return this.sub;
    }

    set _suppliedKey(suppliedKey) {
        this.sub = suppliedKey;
    }

    get _purpose() {
        return this.iss;
    }

    set _purpose(purpose) {
        this.iss = purpose;
    }

    get _issuedAt() {
        return this.iat;
    }

    set _issuedAt(issuedAt) {
        this.iat = issuedAt;
    }

    get _expireAt() {
        return this.exp;
    }

    set _expireAt(expireAt) {
        this.exp = expireAt;
    }

    get _param() {
        return this.prm;
    }

    set _param(param) {
        this.prm = param;
    }
}

module.exports = JWT;