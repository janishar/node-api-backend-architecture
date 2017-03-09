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
const Query = require('./../helpers/query');
const Timestamp = require('./../helpers/timestamp');

const InternalError = require('./../helpers/error').InternalError;
const NoSuchEntityExistsError = require('./../helpers/error').NoSuchEntityExistsError;

class Model {

    constructor(tableName, id, status, createdAt, updatedAt) {
        this._tableName = tableName;
        this._id = id;
        this._status = status;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    copy({id, status, created_at, updated_at}) {
        this._id = id;
        this._status = status;
        this._createdAt = created_at;
        this._updatedAt = updated_at;

        return this;
    }

    getValues() {
        let clone = {};
        Object.assign(clone, this);

        delete clone.tableName;

        for (const i in clone) {
            if (typeof clone[i] === 'undefined') {
                delete clone[i];
            }
        }

        return clone;
    }

    create() {
        return Query.builder(this._tableName)
            .insert()
            .values(this.getValues())
            .build()
            .execute()
            .then(result => {
                return new Promise((resolve, reject) => {

                    if (result.insertId === undefined || result.insertId === null) {
                        return reject(new InternalError());
                    }

                    this._id = result.insertId;

                    return resolve(this)
                })
            })
    }

    update(queryConditionMap) {

        return Query.builder(this._tableName)
            .update()
            .values(this.getValues())
            .whereMap(queryConditionMap)
            .build()
            .execute()
            .then(result => {
                return new Promise((resolve, reject) => {

                    if (!(result.affectedRows > 0)) {
                        return reject(new InternalError());
                    }

                    return resolve(this)
                })
            })
    }

    remove(queryConditionMap) {

        return Query.builder(this._tableName)
            .whereMap(queryConditionMap)
            .build()
            .execute()
            .then(result => {
                return new Promise((resolve, reject) => {

                    if (!(result.affectedRows > 0)) {
                        return reject(new InternalError());
                    }

                    return resolve(true)
                })
            })
    }

    createInTx() {
        return Query.transaction(connection => {

            return Query.builder(this._tableName)
                .insert()
                .values(this.getValues())
                .build()
                .executeInTx(connection)
                .then(result => {
                    return new Promise((resolve, reject) => {

                        if (result.insertId === undefined) {
                            return reject(new InternalError());
                        }

                        this._id = result.insertId;

                        resolve(this)
                    });
                })
        })
    }

    updateInTx(queryConditionMap) {
        return Query.transaction(connection => {
            return Query.builder(this._tableName)
                .update()
                .whereMap(queryConditionMap)
                .values(this.getValues())
                .build()
                .executeInTx(connection)
                .then(result => {
                    return new Promise((resolve, reject) => {

                        if (!(result.affectedRows > 0)) {
                            return reject(new InternalError());
                        }

                        return resolve(this)
                    })
                })
        })
    }

    getOne(queryConditionMap) {

        return Query.builder(this._tableName)
            .select()
            .whereMap(queryConditionMap)
            .limit(1)
            .build()
            .execute()
            .then(results => {
                return new Promise((resolve, reject) => {

                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError('No Such Entry'));
                    }

                    return resolve(this.copy(results[0]))
                })
            })
    }

    getAll(queryConditionMap) {

        return Query.builder(this._tableName)
            .select()
            .whereMap(queryConditionMap)
            .build()
            .execute()
            .then(results => {
                return new Promise((resolve, reject) => {
                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError(errMsg));
                    }

                    let array = [];

                    for (let i = 0; i < results.length; i++) {
                        array.push(new this.constructor().copy(results[i]))
                    }

                    return resolve(array)
                })
            })
    }

    /**
     *  offset starts from 0 for the api:
     *  it specifies the rows to fetch after x rows
     *  count specifies the number of rows to fetch from the offset
     */
    getAsPaginated(offset, count, queryConditionMap) {

        return Query.builder(this._tableName)
            .select()
            .whereMap(queryConditionMap)
            .limit(count, offset)
            .build()
            .execute()
            .then(results => {
                return new Promise((resolve, reject) => {
                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError(errMsg));
                    }

                    let array = [];

                    for (let i = 0; i < results.length; i++) {
                        array.push(new this.constructor().copy(results[i]))
                    }

                    return resolve(array)
                })
            })
    }

    batchInsert(sql, values) {
        return Query.transaction(connection => {

            return connection.queryAsync(sql, values)
                .then(result => {

                    return new Promise((resolve, reject) => {
                        if (!(result.affectedRows > 0)) {
                            return reject(new InternalError());
                        }

                        return resolve(true)
                    })
                })
        });
    }

    get _tableName() {
        return this.tableName
    }

    set _tableName(tableName) {
        this.tableName = tableName;
    }

    get _id() {
        return this.id
    }

    set _id(id) {
        this.id = id;
    }

    get _status() {
        return this.status
    }

    set _status(status) {
        this.status = status;
    }

    get _createdAt() {
        return this.created_at
    }

    set _createdAt(createdAt) {
        this.created_at = createdAt;
    }

    get _updatedAt() {
        return this.updated_at
    }

    set _updatedAt(updatedAt) {
        this.updated_at = updatedAt;
    }
}

module.exports = Model;