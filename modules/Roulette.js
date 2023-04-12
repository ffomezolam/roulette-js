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
 *
 * NOTE: Should I distinguish between strings and numbers here? Should '2' be
 * the same or different than 2?
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
            s += hash(o[i]);
            if(i < o.length - 1) s += ',';
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
            s += p + ':' + hash(o[p]);
            if(i < props.length - 1) s += ',';
        }
        s += '}';
    }
    return s
}

/**
 * A collection class that retrieves elements by probability using the
 * roulette method.
 */
class Roulette {
    static makeItem(o) {
        return {
            "value": o,
            "count": 1
        }
    }

    constructor(opts) {
        /** Number of items */
        this.length = 0;

        /**
         * Collection items
         * @private
         */
        this._items = {};
    }

    /**
     * Add an item to the collection. Returns item count.
     *
     * @param {any} item - item to add
     */
    add(item) {
        // get item hash
        let itemhash = hash(item)

        if(!(itemhash in this._items)) {
            // item doesn't exist - add
            this._items[itemhash] = Roulette.makeItem(item)
            this.length++;
        } else {
            // item exists - increase count
            this._items[itemhash].count++
        }

        return this._items[itemhash].count
    }

    /**
     * Remove single instance of item. Returns item count or -1.
     *
     * @param {any} item - item to remove
     */
    remove(item) {
        let itemhash = hash(item)

        if(!(itemhash in this._items)) return -1; // item doesn't exist
        if(this._items[itemhash].count <= 0) return 0; // item has 0 count

        this._items[itemhash].count--; // subtract 1 from count
        if(this._items[itemhash].count < 0) this._items[itemhash].count = 0; // min count is 0

        // return item count
        return this._items[itemhash].count;
    }

    /**
     * Remove item entirely by setting count to 0.
     * Does not delete item from collection.
     * Returns 0 on success or -1 if item doesn't exist.
     *
     * @param {any} item - item to purge
     */
    purge(item) {
        let itemhash = hash(item)

        if(!(itemhash in this._items)) return -1; // item doesn't exist

        this._items[itemhash].count = 0;

        return 0
    }

    /**
     * Delete item from collection.
     * Probably useful to prevent un-collectable references.
     * Returns 0 on success or -1 if item doesn't exist.
     *
     * @param {any} item - item to delete
     */
    delete(item) {
        let itemhash = hash(item);

        if(!(itemhash in this._items)) return -1; // item doesn't exist

        // remove item
        delete this._items[itemhash]

        return 0; // return index of item removed
    }


    /**
     * Check if has item. Will return true if item count is 0.
     *
     * @param {any} item - item to test for
     */
    has(item) {
        let itemhash = hash(item)

        if(!(itemhash in this._items)) return false;

        return true;
    }

    /**
     * Get item count.
     * Return -1 if item doesn't exist, otherwise return item count.
     *
     * @param {any} item - item to test for
     */
    countOf(item) {
        let itemhash = hash(item)

        if(!(itemhash in this._items)) return -1; // item doesn't exist

        return this._items[itemhash].count;
    }

    /**
     * Get item by weighted random selection
     *
     * @param {number} weight - exponential weight adjustment
     */
    get(weight = 1) {
        let items = Object.values(this._items).filter(item => item.count > 0)

        // adjust weights and get random item
        return roulette(items.map(item => item.value), items.map(item => item.count ** weight))
    }
}

let _private = {
    getopt,
    hash
}

export {Roulette, _private}
