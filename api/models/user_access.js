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
 * Created by janisharali on 25/03/07.
 */
'use strict';
const Query = require('./../helpers/query');
const Promise = require('bluebird');
const Model = require('./model');
const Timestamp = require('./../helpers/timestamp');

class UserAccess extends Model {

    constructor(userId, accessTokenKey) {
        super();
        this._userId = userId;
        this._accessTokenKey = accessTokenKey;
    }

    copy({id, user_id, access_token_key, status, updated_at, created_at}) {

        super.copy({id, status, created_at, updated_at});

        this._userId = user_id;
        this._accessTokenKey = access_token_key;

        return this;
    }

    static getFromUser(userId) {
        let sql = "SELECT * FROM user_access WHERE user_id  = ? ";
        return super.get(sql, userId, this, "User do not exists");
    }

    static getFromToken(accessTokenKey) {
        let sql = "SELECT * FROM user_access WHERE access_token  = ? ";
        return super.get(sql, accessTokenKey, this, "User do not exists");
    }

    createInTx(connection) {
        this._createdAt = new Timestamp().getYMDHMS();
        this._updatedAt = this._createdAt;

        let sql = 'INSERT INTO user_access SET ? ';
        return super.createInTx(connection, sql, this);
    }

    update() {
        this._updatedAt = new Timestamp().getYMDHMS();

        return Query.executeInTx(connection => {
            let sql = 'UPDATE user_access SET ?  WHERE user_id = ?';

            return super.updateInTx(connection, sql, [this.clean(), this._userId])
        });
    }

    static removeKey(userId) {
        super._updatedAt = new Timestamp().getYMDHMS();

        let userAccess = new UserAccess(userId, null);
        let sql = 'UPDATE user_access SET ? WHERE user_id = ?';

        return userAccess.remove(sql, [userAccess.clean(), userId]);
    }

    updateInTx(connection) {
        this._updatedAt = new Timestamp().getYMDHMS();

        let sql = 'UPDATE user_access SET ?  WHERE user_id = ?';

        return super.updateInTx(connection, sql, [this.clean(), this._userId])
    }

    get _userId() {
        return this.user_id;
    }

    set _userId(userId) {
        return this.user_id = userId;
    }

    get _accessTokenKey() {
        return this.access_token_key;
    }

    set _accessTokenKey(accessTokenKey) {
        return this.access_token_key = accessTokenKey;
    }
}

module.exports = UserAccess;