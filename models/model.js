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

    constructor(id, status, createdAt, updatedAt) {
        this._id = id;
        this._status = (status || true);
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

    /**
     * Call this method to get the query parameter for such queries which don't require null
     * Most common use case is when update a model and it has id as null.
     */
    clean() {
        let clone = {};
        Object.assign(clone, this);

        for (const i in clone) {
            if (typeof clone[i] === 'undefined') {
                delete clone[i];
            }
        }

        return clone;
    }

    create(sql, obj) {
        return Query.execute(sql, obj.clean())
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (result.insertId === undefined) {
                        return reject(new InternalError());
                    }

                    this._id = result.insertId;

                    return resolve(obj)
                })
            })
    }

    update(sql, queryvalues) {
        return Query.execute(sql, queryvalues)
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (!(result.affectedRows > 0)) {
                        return reject(new InternalError());
                    }

                    return resolve(this)
                })
            })
    }

    remove(sql, queryvalues) {
        return Query.execute(sql, queryvalues)
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (!(result.affectedRows > 0)) {
                        return reject(new InternalError());
                    }

                    return resolve(true)
                })
            })
    }

    createInTx(connection, sql, obj) {
        debug.log(sql);
        return connection.queryAsync(sql, obj.clean())
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (result.insertId === undefined) {
                        return reject(new InternalError());
                    }

                    this._id = result.insertId;

                    resolve(obj)
                });
            })
    }

    updateInTx(connection, sql, queryvalues) {
        return connection.queryAsync(sql, queryvalues)
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (!(result.affectedRows > 0)) {
                        return reject(new InternalError());
                    }

                    return resolve(this)
                })
            })
    }


    static get(sql, queryvalues, Class, errMsg) {
        return Query.execute(sql, queryvalues)
            .then(results => {
                return new Promise((resolve, reject) => {
                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError(errMsg));
                    }

                    return resolve(new Class().copy(results[0]))
                })
            })
    }

    static getAll(sql, queryvalues, Class, errMsg) {
        return Query.execute(sql, queryvalues)
            .then(results => {
                return new Promise((resolve, reject) => {
                    if (results[0] === undefined) {
                        return reject(new NoSuchEntityExistsError(errMsg));
                    }

                    let array = [];

                    for (let i = 0; i < results.length; i++) {
                        array.push(new Class().copy(results[i]))
                    }

                    return resolve(array)
                })
            })
    }

    static batchInsert(sql, values) {
        debug.log(sql);
        return Query.executeInTx(connection => {
            return connection.queryAsync(sql, values)
                .then(result => {
                    return new Promise((resolve, reject) => {
                        if (!(result.affectedRows > 0)) {
                            return reject(new InternalError());
                        }

                        return resolve(true)
                    })
                }).catch(err => {debug.logAsJSON(err); throw err})
        });
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