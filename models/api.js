/**
 * Created by janisharali on 06/03/16.
 */

const Promise = require('bluebird');
const Query = require('./../helpers/query');
const QueryMap = require('./../helpers/query').QueryMap;
const Model = require('./model');
const NoSuchEntityExistsError = require('./../helpers/error').NoSuchEntityExistsError;

class API extends Model {

    constructor(apiKey, versionCode) {
        super('apis');
        this._apiKey = apiKey;
        this._versionCode = versionCode;
    }

    copy({id, api_key, platform_id, version_code, version_name, status, created_at, updated_at}) {

        super.copy({id, status, created_at, updated_at});

        this._apiKey = api_key;
        this._platformId = platform_id;
        this._versionCode = version_code;
        this._versionName = version_name;

        return this;
    }

    validate() {
        /**
         *  It selects all the enabled platforms, which is made available for the given apis.
         *  Then it selects the api_keys which is assigned for the api version
         *  that matches with the provided api_key
         *  with whe condition that the api is enabled.
         *  Finally it is checks whether the fetched api_key has been assigned for any of the fetched platforms.
         */
        let sql = "SELECT apis.*, t1.id FROM "
            + "(SELECT * FROM platforms WHERE platforms.status = 1) as t1 "
            + "INNER JOIN apis "
            + "ON apis.api_key = ? "
            + "AND apis.version_code = ? "
            + "AND apis.status = 1 "
            + "AND apis.platform_id = t1.id";

        return Query.builder(this._tableName)
            .rawSQL(sql)
            .values(this._apiKey)
            .values(this._versionCode)
            .build()
            .execute()
            .then(results => {
                return new Promise((resolve, reject) => {
                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError("API key is invalid"));
                    }

                    return resolve(this.copy(results[0]))
                })
            })
    };

    get _apiKey() {
        return this.api_key;
    }

    set _apiKey(apiKey) {
        this.api_key = apiKey;
    }

    get _platformId() {
        return this.platform_id;
    }

    set _platformId(platformId) {
        this.platform_id = platformId;
    }

    get _versionCode() {
        return this.version_code;
    }

    set _versionCode(versionCode) {
        this.version_code = versionCode;
    }

    get _versionName() {
        return this.version_name;
    }

    set _versionName(versionName) {
        this.version_name = versionName;
    }
}

module.exports = API;