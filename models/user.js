/**
 * Created by janisharali on 06/03/16.
 */
const Query = require('./../helpers/query');
const Promise = require('bluebird');
const Model = require('./model');
const UserAccess = require('./user_access');
const KeyStore = require('./key_store');
const Timestamp = require('./../helpers/timestamp');
const QueryMap = require('./../helpers/query').QueryMap;

class User extends Model {

    constructor(email, name) {
        super('users');
        this._email = email;
        this._name = name;
    }

    copy({id, name, email, pwd, dob, mob_num, google_id, fb_id, email_verification_status,
        google_profile_pic, fb_profile_pic, status, created_at, updated_at}) {

        super.copy({id, status, created_at, updated_at});

        this._email = email;
        this._name = name;
        this._password = pwd;
        this._dob = dob;
        this._phone = mob_num;
        this._googleId = google_id;
        this._fbId = fb_id;
        this._email = email;
        this._isEmailVerified = email_verification_status > 0;
        this._googleProfilePic = google_profile_pic;
        this._fbProfilePic = fb_profile_pic;

        return this;
    }

    google(googleData) {
        this._email = googleData.email;
        this._name = googleData.name;
        this._googleId = googleData.sub;
        this._googleProfilePic = googleData.picture;
        this._isEmailVerified = googleData.email_verified;

        return this;
    }

    fb(fbData) {
        this._email = fbData.email;
        this._name = fbData.name;
        this._fbId = fbData.id;
        this._isEmailVerified = true;

        if (fbData.picture !== undefined
            && fbData.picture.data !== undefined
            && fbData.picture.data.url !== undefined) {
            this._fbProfilePic = fbData.picture.data.url;
        }

        return this;
    }

    create(accessTokenKey, refreshTokenKey, location) {

        return Query.transaction(connection => {

            return super.createInTx(connection)
                .then(user => {
                    let userAccess = new UserAccess(user._id, accessTokenKey, refreshTokenKey, location);
                    return userAccess.createInTx(connection)
                })
                .then(useraccess => {
                    let keyStore = new KeyStore(
                        useraccess._userId,
                        useraccess._accessToken,
                        useraccess._refreshToken
                    );
                    return keyStore.createInTx(connection)
                })
                .then(keystore => {
                    return Promise.resolve(this);
                })
        })
    }

    update(accessTokenKey, refreshTokenKey, location) {

        this._updatedAt = new Timestamp().getYMDHMS();

        return Query.transaction(connection => {

            return super.updateInTx(connection, new QueryMap().put('id', this._id))
                .then(user => {
                    let userAccess = new UserAccess(user._id, accessTokenKey, refreshTokenKey, location);
                    return userAccess.updateInTx(connection, new QueryMap().put('id', this._id))
                })
                .then(useraccess => {
                    let keyStore = new KeyStore(
                        useraccess._userId,
                        useraccess._accessToken,
                        useraccess._refreshToken
                    );
                    return keyStore.createInTx(connection)
                })
                .then(keystore => {
                    return Promise.resolve(this);
                })
        })
    }

    getByEmail(email) {
        return super.getOne(new QueryMap().put('email', email));
    }

    isUserExists(userId) {

        var sql = "SELECT COUNT(*) AS row_count FROM users WHERE id  = ?";

        return Query.builder(this._tableName)
            .rawSQL(sql)
            .values(userId)
            .build()
            .execute()
            .then(results =>{
                return new Promise((resolve, reject) => {
                    if (results[0].row_count > 0) {
                        return promise.resolve(true);
                    }

                    return promise.resolve(false);
                })
            })
    }

    get _name() {
        return this.name;
    }

    set _name(name) {
        return this.name = name;
    }

    get _email() {
        return this.email;
    }

    set _email(email) {
        return this.email = email;
    }

    get _password() {
        return this.pwd;
    }

    set _password(password) {
        return this.pwd = password;
    }

    get _dob() {
        return this.dob;
    }

    set _dob(dob) {
        return this.dob = dob;
    }

    get _phone() {
        return this.mob_num;
    }

    set _phone(phone) {
        return this.mob_num = phone;
    }

    get _googleId() {
        return this.google_id;
    }

    set _googleId(googleId) {
        return this.google_id = googleId;
    }

    get _fbId() {
        return this.fb_id;
    }

    set _fbId(fbId) {
        return this.fb_id = fbId;
    }

    get _isEmailVerified() {
        return this.email_verification_status;
    }

    set _isEmailVerified(isEmailVerified) {
        return this.email_verification_status = isEmailVerified;
    }

    get _googleProfilePic() {
        return this.google_profile_pic;
    }

    set _googleProfilePic(googleProfilePic) {
        return this.google_profile_pic = googleProfilePic;
    }

    get _fbProfilePic() {
        return this.fb_profile_pic;
    }

    set _fbProfilePic(fbProfilePic) {
        return this.fb_profile_pic = fbProfilePic;
    }
}

module.exports = User;
