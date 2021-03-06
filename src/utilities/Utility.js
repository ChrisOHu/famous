/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2015
 */

define(function(require, exports, module) {
    /**
     * This namespace holds standalone functionality.
     *  Currently includes name mapping for transition curves,
     *  name mapping for origin pairs, and the after() function.
     *
     * @class Utility
     * @static
     */
    var Utility = {};

    /**
     * Table of direction array positions
     *
     * @property {object} Direction
     * @final
     */
    Utility.Direction = {
        X: 0,
        Y: 1,
        Z: 2
    };

    /**
     * Return wrapper around callback function. Once the wrapper is called N
     *   times, invoke the callback function. Arguments and scope preserved.
     *
     * @method after
     *
     * @param {number} count number of calls before callback function invoked
     * @param {Function} callback wrapped callback function
     *
     * @return {function} wrapped callback with coundown feature
     */
    Utility.after = function after(count, callback) {
        var counter = count;
        return function() {
            counter--;
            if (counter === 0) callback.apply(this, arguments);
        };
    };

    /**
     * Load a URL and return its contents in a callback
     *
     * @method loadURL
     *
     * @param {string} url URL of object
     * @param {function} callback callback to dispatch with content
     */
    Utility.loadURL = function loadURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function onreadystatechange() {
            if (this.readyState === 4) {
                if (callback) callback(this.responseText);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    };

    /**
     * Create a document fragment from a string of HTML
     *
     * @method createDocumentFragmentFromHTML
     *
     * @param {string} html HTML to convert to DocumentFragment
     *
     * @return {DocumentFragment} DocumentFragment representing input HTML
     */
    Utility.createDocumentFragmentFromHTML = function createDocumentFragmentFromHTML(html) {
        var element = document.createElement('div');
        element.innerHTML = html;
        var result = document.createDocumentFragment();
        while (element.hasChildNodes()) result.appendChild(element.firstChild);
        return result;
    };

    /*
     * Trampoline to avoid recursion in JS, see:
     *     http://www.integralist.co.uk/posts/js-recursion.html
     */
    Utility.trampoline = function() {
        var func = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }

        var currentBatch = func.apply(this, args);
        var nextBatch = [];

        while (currentBatch && currentBatch.length > 0) {
            currentBatch.forEach(function(eachFunc) {
                var ret = eachFunc();
                if (ret && ret.length > 0) {
                    nextBatch = nextBatch.concat(ret);
                }
            });

            currentBatch = nextBatch;
            nextBatch = [];
        }
    };

    /*
     *  Deep clone an object using the trampoline technique.
     *
     *  @param target {Object} Object to clone
     *  @return {Object} Cloned object.
     */
    Utility.clone = function clone(target) {
        if (typeof target !== 'object') {
            return target;
        }
        if (target == null || Object.keys(target).length == 0) {
            return target;
        }

        function _clone(b, a) {
            var nextBatch = [];
            for (var key in b) {
                if (typeof b[key] === 'object' && b[key] !== null) {
                    if (b[key] instanceof Array) {
                        a[key] = [];
                    }
                    else {
                        a[key] = {};
                    }
                    nextBatch.push(_clone.bind(null, b[key], a[key]));
                }
                else {
                    a[key] = b[key];
                }
            }
            return nextBatch;
        };

        var ret = target instanceof Array ? [] : {};
        (Utility.trampoline.bind(null, _clone))(target, ret);
        return ret;
    };

    module.exports = Utility;
});
