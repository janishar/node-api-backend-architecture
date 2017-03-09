/**
 * Created by janisharali on 06/03/16.
 */
const Model = require('./model');
const QueryMap = require('./../helpers/query').QueryMap;

class Platform extends Model {

    constructor(name) {
        super('platforms');
        this._name = name;
    }

    copy(id, name, status, created_at, updated_at) {

        super.copy({id, status, created_at, updated_at});

        this._name = name;

        return this;
    }

    getAllActive() {
        return super.getAll(new QueryMap().put('status', 1));

    }

    get _name() {
        return this.name;
    }

    set _name(name) {
        this.name = name;
    }
}