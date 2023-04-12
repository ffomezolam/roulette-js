/**
* Roulette.js
*
* Exports the Roulette class
*/

import {roulette} from './helpers.js';

/**
 * Helper function for getting options from opts object
 */
function getopt(opt, opts, def, bool = false) {
    // no options provided
    if(!opts) {
        // default provided - return default
        if(def) return def;

        // no default - return undefined
        return undefined
    }

    // option not specified - return default
    if(!(opt in opts)) return def

    // bool flag is false - return option as is
    if(!bool) return opts[opt]

    // bool flag is true - enforce boolean return
    return !!opts[opt]
}

/**
 * Helper function to brute-force hash non-primitives.
 *
 * This essentially turns non-primitives into a string representation of their
 * properties. This differs from json.stringify in that object properties are
 * sorted so there should be no problem with comparing hashes of objects with
 * the same properties in different order
 */
function hash(o, s = "") {
    let type = typeof(o);

    if(type == 'boolean' || type == 'number' || type == 'string') {
        // primitives hash to string of themselves
        return String(o);
    } else if(Array.isArray(o)) {
        // array test
        s = '[';
        for(let i = 0; i < o.length; i++) {
            s += hash(o[i]) + ',';
        }
        s += ']';
    } else {
        // object test
        s = '{';
        let props = Object.keys(o)
        // sort properties to maintain consistency over similar objects
        props.sort()
        for(let i = 0; i < props.length; i++) {
            let p = props[i]
            s += p + ':' + hash(o[p]) + ',';
        }
        s += '}';
    }
    return s
}

/**
 * Helper function to test equality for non-primitives
 *
 * Inspired by git.github.com/nicbell/6081098
 *
 * NOTE: I'm still deciding how to best handle complex items.
 * Currently, objects and arrays are compared by internal primitive values.
 */
function equal(a, b) {
    // null equals null and undefined equals undefined
    if(a === null && b === null) return true;
    if(a === undefined && b === undefined) return true;

    // unequal types are not equal
    if(typeof(a) != typeof(b)) return false;

    // if primitive type, compare values
    let type = typeof(a);
    if(type == 'boolean' || type == 'number' || type == 'string') {
        return a == b;
    }

    // array test
    if(Array.isArray(a)) {
        // array type test
        if(!Array.isArray(b)) return false;

        // array length test
        if(a.length != b.length) return false;

        // test elements
        for(let i = 0; i < a.length; i++) {
            if(!equal(a[i], b[i])) return false;
        }

        return true;
    } else {
        // object test

        // test for properties
        for(var p in a) {
            if(a.hasOwnProperty(p) != b.hasOwnProperty(p)) return false;

            if(!equal(a[p], b[p])) return false;
        }

        // test for missed properties
        for(var p in b) {
            if(typeof(a[p]) == 'undefined') return false;
        }

        return true;
    }
}

/**
 * A collection class that retrieves elements by probability using the
 * roulette method.
 *
 * Can pass an optional comparison function to use when comparing items.
 * Default is deep equality of primitives.
 * Pass `{ comparison: <function> }` to set an alternate comparison function.
 */
class Roulette {
    constructor(opts) {
        /** Number of items */
        this.length = 0;

        /**
        * Instance options
        * @private
        */
        this._opts = {
            /** Comparison function */
            comparison: getopt('comparison', opts, equal)
        }

        /**
         * Collection items
         * @private
         */
        this._items = [];

        /**
         * Item counts
         * @private
         */
        this._counts = [];
    }

    /**
     * Add an item to the collection. Returns item count.
     *
     * @param {any} item - item to add
     */
    add(item) {
        let idx = this.indexOf(item);

        // item doesn't exist - add
        if(idx < 0) {
            this._items.push(item);
            this._counts.push(1);
            this.length++;
            return this._items.length - 1;
        }

        // item exists - increase count
        this._counts[idx]++;

        return this._counts[idx];
    }

    /**
     * Remove single instance of item. Returns item count or -1.
     *
     * @param {any} item - item to remove
     */
    remove(item) {
        let idx = this.indexOf(item);

        if(idx < 0) return 0; // item doesn't exist
        if(this._counts[idx] <= 0) return 0; // item has 0 count

        this._counts[idx]--; // subtract 1 from count
        if(this._counts[idx] < 0) this._counts[idx] = 0; // min count is 0

        // return item count
        return this._counts[idx];
    }

    /**
     * Remove item entirely by setting count to 0.
     * Does not delete item from collection.
     * Returns index of item.
     *
     * @param {any} item - item to purge
     */
    purge(item) {
        let idx = this.indexOf(item);

        if(idx < 0) return -1; // item doesn't exist

        this._counts[idx] = 0;

        return idx;
    }

    /**
     * Delete item from collection, shifting others. Changes indexing.
     * Probably useful to prevent un-collectable references.
     * Returns index of splice or -1.
     *
     * @param {any} item - item to delete
     */
    delete(item) {
        let idx = this.indexOf(item);
        if(idx < 0) return -1; // item doesn't exist

        // splice arrays to remove item and count
        this._items.splice(idx, 1);
        this._counts.splice(idx, 1);

        return idx; // return index of item removed
    }


    /**
     * Check if has item. Will return true if item count is 0.
     *
     * NOTE: may need optimization to avoid linear search
     *
     * @param {any} item - item to test for
     */
    has(item) {
        let idx = this.indexOf(item);

        if(idx < 0) return false;

        return true;
    }

    /**
     * Get index of item or -1 if not found.
     *
     * NOTE: may need optimization to avoid linear search
     *
     * @param {any} item - item to test for
     */
    indexOf(item) {
        for(let i = 0; i < this._items.length; i++) {
            if(this._opts.comparison(item, this._items[i])) return i;
        }

        return -1;
    }

    /**
     * Get item at index or undefined if out of range
     *
     * @param {int} idx - index
     */
    at(idx) {
        // index out of bounds check
        if(idx < 0 || idx >= this._items.length) {
            return undefined;
        }

        return this._items[idx];
    }

    /**
     * Get item count.
     *
     * @param {any} item - item to test for
     */
    countOf(item) {
        let idx = this.indexOf(item);

        if(idx < 0) return 0; // item doesn't exist

        return this._counts[idx];
    }

    /**
     * Get item count at index.
     *
     * @param {int} idx - index
     */
    countAt(idx) {
        // index out of bounds check
        if(idx < 0 || idx >= this._items.length) {
            return 0;
        }

        return this._counts[idx];
    }

    /**
     * Get item by weighted random selection
     *
     * @param {number} weight - exponential weight adjustment
     */
    get(weight = 1) {
        let items = [];
        let weights = [];

        // get active items
        for(let i = 0; i < this._counts.length; i++) {
            if(this._counts[i]) {
                // item exists and has instances
                items.push(this._items[i]);
                weights.push(this._counts[i]);
            }
        }

        // adjust weights if necessary
        if(weight != 1) {
            for(let i = 0; i < weights.length; i++) {
                weights[i] = weights[i] ** weight;
            }
        }

        // get random item
        return roulette(items, weights)
    }
}

let _private = {
    getopt,
    equal,
    hash
}

export {Roulette, _private}
