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

class Timestamp {

    /**
     * month starts from 1 for Api purposes and starts with 0 for calculation purposes
     * day starts from 1 for all
     */
    constructor(year, month = 1, day = 0, hour = 0, min = 0, sec = 0, millisec = 0) {
        if (year === undefined) {
            var now = new Date();
            this._date = new Date(now.toUTCString().slice(0, -4));
        } else {
            this._date = new Date(Date.UTC(year, month - 1, day, hour, min, sec, millisec));
        }
    }

    get _date() {
        return this.date;
    }

    set _date(date) {
        this.date = date;
    }

    getDateDetails() {
        if (this.dateDetails === undefined) {
            this.dateDetails = new DateDetails(this._date);
        }
        return this.dateDetails;
    }

    getYMD() {
        return this._date.getFullYear() + '-'
            + Timestamp.pad(this._date.getMonth() + 1) + '-'
            + Timestamp.pad(this._date.getDate());
    }

    getYMDHMS(){

        //this._date.toISOString();

        return this._date.getFullYear() + '-'
            + Timestamp.pad(this._date.getMonth() + 1) + '-'
            + Timestamp.pad(this._date.getDate()) + ' '
            + Timestamp.pad(this._date.getHours()) + ':'
            + Timestamp.pad(this._date.getMinutes()) + ':'
            + Timestamp.pad(this._date.getSeconds())
    }

    static convertMysqlTimestamp(mysqlTimestamp){

        // Split timestamp into [ Y, M, D, h, m, s ]
        let t = mysqlTimestamp.split(/[- :]/);

        // Apply each element to the Date function
        return new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));

    }

    /**
     * Add 0 prefix to number less than 10
     */
    static pad(n) {
        return n < 10 ? '0' + n : n
    }
}

class DateDetails {

    constructor(date) {
        this._date = date.getDate();
        this._month = date.getMonth() + 1;
        this._year = date.getFullYear();

        this._weekDay = DateDetails.findDayAsReadable(date);
        this._week = this.findWeek();
    }

    static findDayAsReadable(date) {
        let weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekday[date.getDay()];
    }

    findWeek() {
        let dateOfFirstDayOfMonth = new Date(Date.UTC(this._year, this._month - 1));

        // 0->sun, 6->sat
        // getDay gives the day in that week
        let shiftInFirstDayOfMonthForWeek = dateOfFirstDayOfMonth.getDay();

        let weekNumber = (shiftInFirstDayOfMonthForWeek + this._date) / 7;

        return Math.ceil(weekNumber);
    }

    get _date() {
        return this.date;
    }

    set _date(date) {
        this.date = date;
    }

    get _week() {
        return this.week;
    }

    set _week(week) {
        this.week = week;
    }

    /**
     * sun - sat
     */
    get _weekDay() {
        return this.weekDay;
    }

    set _weekDay(weekDay) {
        this.weekDay = weekDay;
    }

    get _month() {
        return this.month;
    }

    set _month(month) {
        this.month = month;
    }

    get _year() {
        return this.year;
    }

    set _year(year) {
        this.year = year;
    }
}

module.exports = Timestamp;