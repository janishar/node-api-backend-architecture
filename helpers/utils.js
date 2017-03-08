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

class Utils{

    static arrayContains(arr, val){

        // Per spec, the way to identify NaN is that it is not equal to itself
        let findNaN = val !== val;
        let indexOf;

        if (!findNaN && typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (val) {
                let i = -1, index = -1;

                for (i = 0; i < arr.length; i++) {
                    let item = arr[i];

                    if ((findNaN && item !== item) || item === val) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(arr, val) > -1;
    }
}

module.exports = Utils;