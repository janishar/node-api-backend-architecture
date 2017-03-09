/**
 * Created by janisharali on 06/03/16.
 */

const Model = require('./model');
const debug = new (require('./../helpers/debug'))();

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

        this._id = id;

        let queryConditionMap = new Map();
        queryConditionMap.set('id', this._id);
        return super.getOne(queryConditionMap, this)
    }

    update() {
        let queryConditionMap = new Map();
        queryConditionMap.set('id', this._id);
        return super.update(queryConditionMap);
    }

    remove() {
        let queryConditionMap = new Map();
        queryConditionMap.set('id', this._id);
        return super.update(queryConditionMap);
    }

    updateInTx() {
        let queryConditionMap = new Map();
        queryConditionMap.set('id', this._id);
        return super.update(queryConditionMap);
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