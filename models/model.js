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
const QueryMap = require('./../helpers/query').QueryMap;
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

        this._createdAt = new Timestamp().getYMDHMS();
        this._updatedAt = this._createdAt;

        return Query.builder(this._tableName)
            .insert()
            .values(this.getValues())
            .build()
            .execute()
            .then(result => {
                return this.parseCreateResult(result);
            })
    }

    update(whereAndQueryMap) {

        this._updatedAt = new Timestamp().getYMDHMS();

        return Query.builder(this._tableName)
            .update()
            .values(this.getValues())
            .whereAndQueryMap(whereAndQueryMap)
            .build()
            .execute()
            .then(result => {
                return this.parseUpdateResult(result);
            })
    }

    updateById(){
        this._updatedAt = new Timestamp().getYMDHMS();
        return this.update(new QueryMap().put('id', this._id))
    }

    remove(whereAndQueryMap) {
        return Query.builder(this._tableName)
            .remove()
            .whereAndQueryMap(whereAndQueryMap)
            .build()
            .execute()
            .then(result => {
                return this.parseRemoveResult(result);
            })
    }

    removeById(){
        return this.remove(new QueryMap().put('id', this._id))
    }

    createInTx(connection) {

        this._createdAt = new Timestamp().getYMDHMS();
        this._updatedAt = this._createdAt;

        return Query.builder(this._tableName)
            .insert()
            .values(this.getValues())
            .build()
            .executeInTx(connection)
            .then(result => {
                return this.parseCreateResult(result);
            })
    }

    updateInTx(connection, whereAndQueryMap) {

        this._updatedAt = new Timestamp().getYMDHMS();

        return Query.builder(this._tableName)
            .update()
            .values(this.getValues())
            .whereAndQueryMap(whereAndQueryMap)
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
    }

    getOne(whereAndQueryMap) {
        return Query.builder(this._tableName)
            .select()
            .whereAndQueryMap(whereAndQueryMap)
            .limit(1)
            .build()
            .execute()
            .then(results => {
                return this.parseGetResultsForOne(results)
            })
    }

    getById(id){
        return this.getOne(new QueryMap().put('id', id), this)
    }

    getAll(whereAndQueryMap) {

        return Query.builder(this._tableName)
            .select()
            .whereAndQueryMap(whereAndQueryMap)
            .build()
            .execute()
            .then(results => {
                return this.parseGetResults(results);
            })
    }

    getAsPage(offset, count) {
        return super.getPaginated(offset, count, new QueryMap().put('status', 1));
    }

    /**
     *  offset starts from 0 for the api:
     *  it specifies the rows to fetch after x rows
     *  count specifies the number of rows to fetch from the offset
     */
    getPaginated(offset, count, whereAndQueryMap) {

        return Query.builder(this._tableName)
            .select()
            .whereAndQueryMap(whereAndQueryMap)
            .limit(count, offset)
            .build()
            .execute()
            .then(results => {
                this.parseGetResults(results)
            })
    }

    parseCreateResult(result){
        return new Promise((resolve, reject) => {

            if (result.insertId === undefined || result.insertId === null) {
                return reject(new InternalError());
            }

            this._id = result.insertId;

            return resolve(this)
        })
    }

    parseUpdateResult(result){
        return new Promise((resolve, reject) => {

            if (!(result.affectedRows > 0)) {
                return reject(new InternalError());
            }

            return resolve(this)
        })
    }

    parseRemoveResult(result){
        return new Promise((resolve, reject) => {

            if (!(result.affectedRows > 0)) {
                return reject(new InternalError());
            }

            return resolve(true)
        })
    }

    parseGetResults(results){
        return new Promise((resolve, reject) => {
            if (results[0] === undefined) {
                return reject(new NoSuchEntityExistsError());
            }

            let array = [];

            for (let i = 0; i < results.length; i++) {
                array.push(new this.constructor().copy(results[i]))
            }

            debug.logAsJSON('results', results);
            debug.logAsJSON('array', array);

            return resolve(array)
        })
    }

    parseGetResultsForOne(results){
        return new Promise((resolve, reject) => {
            if (results[0] === undefined) {
                return reject(new NoSuchEntityExistsError());
            }
            return resolve(new this.constructor().copy(results[0]));
        })
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