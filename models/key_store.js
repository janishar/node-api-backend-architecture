/**
 * Created by janisharali on 14/02/17.
 */
const Model = require('./model');
const config = require('./../../config.json');
const QueryMap = require('./../helpers/query').QueryMap;

class KeyStore extends Model {

    constructor(userId, accessTokenKey, refreshTokenKey) {
        super('key_store');
        this._clientId = userId;
        this._accessTokenKey = accessTokenKey;
        this._refreshTokenKey = refreshTokenKey;
    }

    copy({id, client_id, key, sub_key, validity_duration, status, created_at, updated_at}) {

        super.copy({id, status, created_at, updated_at});

        this._clientId = client_id;
        this._refreshTokenKey = key;
        this._accessTokenKey = sub_key;
        this._validityDuration = validity_duration;

        return this;
    }

    create() {
        this._validityDuration = config.refresh_token_validity_days * 24 * 60 * 60;//time in millis
        return super.create();
    }

    createInTx(connection) {
        this._validityDuration = config.refresh_token_validity_days * 24 * 60 * 60;//time in millis
        return super.createInTx(connection);
    }

    deleteByUserIdAndAccessTokenKey() {
        return super.remove(new QueryMap().put('client_id', this._clientId).put('sub_key', this._accessTokenKey))
    }

    getByUserIdAndAccessTokenKey(userId, accessTokenKey) {
        return super.getAll(new QueryMap().put('client_id', userId).put('sub_key', accessTokenKey));
    }

    getByUserIdAndAccessTokenKeyAndRefreshTokenKey(userId, accessTokenKey, refreshTokenKey) {
        return super.getOne(
            new QueryMap()
                .put('client_id', userId)
                .put('sub_key', accessTokenKey)
                .put('key_store.key', refreshTokenKey)
        );
    }

    get _clientId() {
        return this.client_id;
    }

    set _clientId(clientId) {
        this.client_id = clientId;
    }

    get _refreshTokenKey() {
        return this.key;
    }

    set _refreshTokenKey(refreshTokenKey) {
        this.key = refreshTokenKey;
    }

    get _accessTokenKey() {
        return this.sub_key;
    }

    set _accessTokenKey(accessTokenKey) {
        this.sub_key = accessTokenKey;
    }

    get _validityDuration() {
        return this.validity_duration;
    }

    set _validityDuration(validityDuration) {
        this.validity_duration = validityDuration;
    }
}

module.exports = KeyStore;