/**
 * Exports the Roulette class
 *
 * @module roulette
 */
(function(name, context, definition) {
    if(typeof module !== 'undefined' && module.exports) module.exports = definition(/*require(deps)*/);
    else if(typeof define === 'function' && define.amd) define(/*[deps], */definition);
    else context[name] = definition();
})('Roulette', this, function(/*deps*/) {
    function defaultCompare(a, b) {
        return a === b;
    }

    /**
     * A collection class that retrieves elements by probability using the
     * roulette method
     *
     * @class Roulette
     * @constructor
     * TODO: Implement aliases for string items
     */
    function Roulette() {
        this.length = 0;
        this._tally = [];
        this.total = 0;
        this._wheel = [];
        this._compare = defaultCompare;
        this._aliases = null;
    }

    Roulette.prototype = {
        /**
         * Add an item to the collection
         *
         * @method add
         * @chainable
         * @param {any} item Item to add
         * TODO: Somehow fill in empty indices created by item removal... or
         * never remove them...
         */
        add: function(item) {
            var idx = this.indexOf(item);
            if(idx < 0) {
                // item doesn't exist
                idx = this.length;
                this[idx] = item;
                this.length++;
                this._tally[idx] = 1;
                this.total++;
            } else {
                this._tally[idx]++;
                this.total++;
            }
            return this;
        },

        /**
         * Decrease an item's probability. Remove if probability is zero
         *
         * @method remove
         * @chainable
         * @param {any} item Item to remove
         * TODO: can't subtract from length, because it is used for searching
         */
        remove: function(item) {
            var idx = this.indexOf(item);
            if(idx < 0) return this;
            this._tally[idx]--;
            this.total--;

            if(!this._tally[idx]) {
            }

            return this;
        },

        /**
         * Remove an item entirely from the collection
         *
         * @method purge
         * @chainable
         * @param {any} item Item to remove
         */
        purge: function(item) {
        },

        /**
         * Search for an item and return its index or -1 if not found
         *
         * @method indexOf
         * @param {any} item Item
         * @return {Number} Item index or -1 if not found
         * TODO: Linear search rulez
         */
        indexOf: function(item) {
            if(!this.length) return -1;
            for (var i = 0, l = this.length; i < l; i ++) {
                var e = this[i];
                if(e == null) continue;
                if(this._compare(item, e)) return i;
            }
            return -1;
        },

        /**
         * Search for an item and return it if found
         *
         * @method search
         * @param {any} item Item
         * @return {any} Item or null
         */
        search: function(item) {
            var idx = this.indexOf(item);
            return idx >= 0 ? this[idx] : null;
        },

        /**
         * Get an item by index or randomly by weight
         *
         * @method get
         * @param {Number} [idx] Index
         * @return {any} Item
         * TODO: Linear search rulez agayne
         */
        get: function(idx) {
            if(!this.length) return null;

            if(idx != null) {
                if(idx >= this.length || idx < 0) return null;
                return this[idx];
            }

            var rn = Math.random();
            if(rn >= 1) return this[this.length - 1];
            if(rn <= 0) return this[0];
            for (var i = 0, l = this._wheel.length; i < l; i ++) {
                var prob = this._wheel[i];
                if(prob > rn) return this[i];
            }

            return null;
        },

        /**
         * Initialize the wheel
         *
         * @method setWeights
         * @chainable
         * TODO: is there any better way to do this?
         */
        setWeights: function() {
            if(!this.total) return this;
            for (var i = 0, l = this._tally.length; i < l; i ++) {
                var c = this._tally[i];
                var prob = c / this.total;
                this._wheel[i] = i ? this._wheel[i - 1] + prob : prob;
            }
            return this;
        },

        /**
         * Set comparison function
         *
         * @method setCompare
         * @chainable
         */
        setCompare: function(fn) {
            this._compare = fn;
            return this;
        }
    };

    return Roulette;
});
