/**
 * Created by janisharali on 06/03/16.
 */
const Query = require('./../helpers/query');
const Promise = require('bluebird');
const Model = require('./model');
const Timestamp = require('./../helpers/timestamp');

class UserAccess extends Model {

    constructor(userId, accessToken, refreshToken, location) {
        super();
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

    static getFromUser(userId) {
        let sql = "SELECT * FROM user_access WHERE user_id  = ? ";
        return super.get(sql, userId, this, "User do not exists");
    }

    static getFromToken(accessToken) {
        let sql = "SELECT * FROM user_access WHERE access_token  = ? ";
        return super.get(sql, accessToken, this, "User do not exists");
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
        super._updatedAt = new Timestamp().getYMDHMS();

        let userAccess = new UserAccess(userId, null, null, location);
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