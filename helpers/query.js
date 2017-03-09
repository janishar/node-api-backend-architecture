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

const Promise = require('bluebird');
let InternalError = require('./error').InternalError;

Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

class Query {

    constructor(queryString, queryData) {
        this._queryString = queryString;
        this._queryData = queryData;
    }

    get _queryString() {
        return this.queryString;
    }

    set _queryString(queryString) {
        this.queryString = queryString;
    }

    get _queryData() {
        return this.queryData;
    }

    set _queryData(queryData) {
        this.queryData = queryData;
    }

    static getSqlConnection() {
        return DB_POOL.getConnectionAsync().disposer(connection => connection.release());
    }

    execute() {
        return Promise.using(Query.getSqlConnection(), connection => {
            return connection.queryAsync(this._queryString, this._queryData)
                .catch(e => {
                    debug.logAsJSON(e);

                    fileLog.logError(e);

                    throw new InternalError("Database Error");
                })
        });
    };

    executeInTx(connection) {
        return connection.queryAsync(this._queryString, this._queryData)
            .catch(e => {
                debug.log("query err : " + e);

                fileLog.logError(e);

                throw new InternalError("Database Error");
            })
    };

    static transaction(fn) {
        return Promise.using(DB_POOL.getConnectionAsync(), connection => {
            let tx = connection.beginTransactionAsync();
            return fn(connection)
                .then(
                    res => {
                        debug.log('connection', 'commit');
                        return connection.commitAsync().thenReturn(res);
                    },
                    err => {
                        debug.log(err);
                        return connection.rollbackAsync()
                            .catch(e => debug.log(e))
                            .thenThrow(new InternalError());
                    })
                .finally(() => connection.release())
        });
    };

    static builder(tableName) {
        return new QueryBuilder(tableName);
    }
}

class QueryBuilder {

    constructor(tableName) {
        this._tableName = tableName;
        this._queryString = '';
        this._queryData = [];
    }

    get _tableName() {
        return this.tableName;
    }

    set _tableName(tableName) {
        this.tableName = tableName;
    }

    get _queryString() {
        return this.queryString;
    }

    set _queryString(queryString) {
        this.queryString = queryString;
    }

    get _queryData() {
        return this.queryData;
    }

    set _queryData(queryData) {
        this.queryData = queryData;
    }

    rawSQL(queryString) {
        this._queryString = queryString;
        return this;
    }

    select(queryMap) {

        this._queryString = 'SELECT ';

        if (queryMap === undefined
            || queryMap === null
            || !(queryMap instanceof QueryMap)) {

            this._queryString += '* ';
        }
        else {

            let count = 0;

            for (var [key, value] of queryMap.entries()) {

                count++;

                this._queryString += key;
                this.values(value);

                if (count < queryMap.size()) {
                    this._queryString += ', ';
                }
            }
        }

        this._queryString += 'FROM ' + this._tableName + ' ';
        return this;
    }

    insert() {
        this._queryString = 'INSERT INTO ' + this._tableName + ' SET ? ';
        return this;
    }

    update() {
        this._queryString = 'UPDATE ' + this._tableName + ' SET ? ';
        return this;
    }

    remove() {
        this._queryString = 'DELETE FROM ' + this._tableName + ' ';
        return this;
    }

    where(columnName, value) {

        this._queryString += 'WHERE ';
        this._queryString += columnName + ' = ? ';
        this.values(value);
        return this
    }

    whereCompare(columnName) {

        this._queryString += 'WHERE ';
        this._queryString += columnName + ' ';
        return this
    }

    equal(value) {
        this._queryString += '= ? ';
        this.values(value);
        return this
    }

    greater(value) {
        this._queryString += '> ? ';
        this.values(value);
        return this
    }

    lesser(value) {
        this._queryString += '< ? ';
        this.values(value);
        return this
    }

    equalOrGreater(value) {
        this._queryString += '>= ? ';
        this.values(value);
        return this
    }

    equalOrLesser(value) {
        this._queryString += '=< ? ';
        this.values(value);
        return this
    }

    notEqual(value) {
        this._queryString += '>< ? ';
        this.values(value);
        return this
    }

    whereId(id) {

        this._queryString += 'WHERE ';
        this._queryString += 'id = ? ';
        this.values(id);
        return this
    }

    whereAndQueryMap(queryMap) {
        if (queryMap !== undefined
            && queryMap !== null
            && queryMap instanceof QueryMap) {

            let isWhereWritten = false;

            for (var [key, value] of queryMap.entries()) {

                if (!isWhereWritten) {

                    this.where(key, value);

                    isWhereWritten = true;
                } else {
                    this.and(key, value)
                }
            }
        }
        return this
    }

    whereOrQueryMap(queryMap) {
        if (queryMap !== undefined
            && queryMap !== null
            && queryMap instanceof QueryMap) {

            let isWhereWritten = false;

            for (var [key, value] of queryMap.entries()) {

                if (!isWhereWritten) {

                    this.where(key, value);

                    isWhereWritten = true;
                } else {
                    this.or(key, value)
                }
            }
        }
        return this
    }

    and(columnName, value) {

        this._queryString += 'AND ';
        this._queryString += columnName + '= ? ';
        this.values(value);
        return this
    }

    andCompare(columnName) {

        this._queryString += 'AND ';
        this._queryString += columnName + ' ';
        return this
    }

    or(columnName, value) {

        this._queryString += 'OR ';
        this._queryString += columnName + '= ? ';
        this.values(value);
        return this
    }

    orCompare(columnName) {

        this._queryString += 'OR ';
        this._queryString += columnName + ' ';
        return this
    }

    descending(columnName) {
        this._queryString += 'ORDER BY ' + columnName + ' DESC ';
        return this
    }

    ascending(columnName) {
        this._queryString += 'ORDER BY ' + columnName + ' ASC ';
        return this
    }

    limit(count, offset) {

        this._queryString += 'LIMIT ';

        if (offset !== undefined && offset !== null) {
            this._queryString += offset + ',';
        }

        this._queryString += count + ' ';
        return this
    }

    values(queryData) {
        this._queryData.push(queryData);
        return this;
    }

    build() {
        debug.logAsJSON(this);
        return new Query(this._queryString, this._queryData);
    }
}

class QueryMap {

    constructor() {
        this.map = new Map();
    }

    get _map() {
        return this.map;
    }

    set _map(map) {
        return this.map = map;
    }

    put(key, value) {
        this.map.set(key, value);
        return this;
    }

    get(key) {
        return this._map.get(key);
    }

    contains(key) {
        return this._map.has(key);
    }

    remove(key) {
        return this._map.delete(key);
    }

    clear() {
        return this._map.clear();
    }

    values() {
        return this._map.values();
    }

    keys() {
        return this._map.keys();
    }

    size() {
        return this._map.size();
    }

    entries() {
        return this._map.entries();
    }
}

module.exports = Query;
module.exports.QueryBuilder = QueryBuilder;
module.exports.QueryMap = QueryMap;
