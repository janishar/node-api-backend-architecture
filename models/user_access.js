/**
 * Created by janisharali on 06/03/16.
 */
const Query = require('./../helpers/query');
const Promise = require('bluebird');
const Model = require('./model');
const Timestamp = require('./../helpers/timestamp');
const KeyStore = require('./key_store');
const QueryMap = require('./../helpers/query').QueryMap;

class UserAccess extends Model {

    constructor(userId, accessToken, refreshToken, location) {
        super('user_access');
        this._userId = userId;
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this._location = location;
    }

    copy({id, user_id, access_token, refresh_token, last_logged_location, status, updated_at, created_at}) {

        super.copy({id, status, created_at, updated_at});

        this._userId = user_id;
        this._accessToken = access_token;
        this._refreshToken = refresh_token;
        this._location = last_logged_location;

        return this;
    }

    getFromUser(userId) {
        return super.getOne(new QueryMap().put('user_id', userId));
    }

    getFromToken(accessToken) {
        return super.getOne(new QueryMap().put('access_token', accessToken));
    }

    update() {
        return Query.transaction(connection => {

            return super.updateInTx(connection, new QueryMap().put('user_id', this._userId))
                .then(useraccess => {

                    let keyStore = new KeyStore(
                        this._userId,
                        this._accessToken,
                        this._refreshToken
                    );

                    return keyStore.createInTx(connection)
                })
                .then(keystore => {
                    return Promise.resolve(this)
                })
        });
    }

    static removeKeys(userId, location) {
        let userAccess = new UserAccess(userId, null, null, location);
        return userAccess.update(new QueryMap().put('user_id', userId));
    }

    updateInTx(connection) {
        return super.updateInTx(connection ,new QueryMap().put('user_id', this._userId));
    }

    get _userId() {
        return this.user_id;
    }

    set _userId(userId) {
        return this.user_id = userId;
    }

    get _accessToken() {
        return this.access_token;
    }

    set _accessToken(accessToken) {
        return this.access_token = accessToken;
    }

    get _refreshToken() {
        return this.refresh_token;
    }

    set _refreshToken(refreshToken) {
        return this.refresh_token = refreshToken;
    }

    get _location() {
        return this.last_logged_location;
    }

    set _location(location) {
        return this.last_logged_location = location;
    }
}

module.exports = UserAccess;