/**
 * Created by janisharali on 06/03/16.
 */

const Model = require('./model');
const Query = require('./../helpers/query');
const QueryMap = require('./../helpers/query').QueryMap;
class Feedback extends Model {

    constructor(userId, message, creationMode, providedAt) {

        super('feedbacks');

        this._userId = userId;
        this._message = message;
        this._creationMode = creationMode;
        this._providedAt = providedAt;
    }

    copy({id, user_id, msg, creation_mode, provided_at, status, created_at, updated_at}) {

        super.copy({id, status, created_at, updated_at});

        this._userId = user_id;
        this._message = msg;
        this._creationMode = creation_mode;
        this._providedAt = provided_at;

        return this;
    }

    getOne(id){
        return super.getOne(new QueryMap().put('id', id), this)
    }

    getAll() {
        return super.getAll(new QueryMap().put('status', 1));
    }

    update() {
        return super.update(new QueryMap().put('id', this._id))
    }

    remove() {
        return super.remove(new QueryMap().put('id', this._id))
    }

    updateInTx() {
        return Query.transaction(connection => {
            return super.updateInTx(connection, new QueryMap().put('id', this._id))
        })
    }

    get _userId() {
        return this.user_id
    }

    set _userId(userId) {
        this.user_id = userId;
    }

    get _message() {
        return this.msg
    }

    set _message(message) {
        this.msg = message;
    }

    get _creationMode() {
        return this.creation_mode
    }

    set _creationMode(mode) {
        this.creation_mode = mode;
    }

    get _providedAt() {
        return this.provided_at
    }

    set _providedAt(providedAt) {
        this.provided_at = providedAt;
    }
}

module.exports = Feedback;