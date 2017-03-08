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
const debug = new (require('./debug'))();

let InternalError = require('./error').InternalError;

Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

class Query {

    static getSqlConnection() {
        return dbPool.getConnectionAsync().disposer(connection => connection.release());
    }

    static execute(sql, tableData) {

        return Promise.using(Query.getSqlConnection(), connection => {

            debug.log(sql);

            return connection.queryAsync(sql, tableData)
                .catch(e => {

                    debug.log("query err : " + e);

                    fileLog.logError(e);

                    throw new InternalError("Database Error");
                })
        });
    };

    static executeInTx(fn) {

        return Promise.using(dbPool.getConnectionAsync(), connection => {

            var tx = connection.beginTransactionAsync();

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

    static getPlaceholdersForConditionIN(valArray) {

        var sql = "(";

        for (var i = 0; i < valArray.length; i++) {
            switch (i) {
                case 0:
                    sql += "?";
                    break;
                case valArray.length - 1:
                    sql += ",?";
                    break;
                default:
                    sql += ",?";
            }
        }

        sql += ")";
        return sql;
    };
}

module.exports = Query;
