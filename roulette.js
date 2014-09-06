/**
 * Exports the Roulette class
 *
 * @module roulette
 */
(function(name, context, definition) {
    if(typeof module !== 'undefined' && module.exports) module.exports = definition();
    else if(typeof define === 'function' && define.amd) define(definition);
    else context[name] = definition();
})('Roulette', this, function() {
    function defaultCompare(a, b) {
        return a === b;
    }

    function makeItem(item, tally, probability) {
        return {
            item: item,
            tally: tally,
            probability: probability
        }
    }

    /**
     * A collection class that retrieves elements by probability using the
     * roulette method
     *
     * @class Roulette
     * @constructor
     * @param {Object} [opts] Options
     * TODO: Implement aliases for string items
     */
    function Roulette(opts) {
        /**
         * Number of items
         *
         * @property length
         * @type Number
         * @default 0
         */
        this.length = 0;

        /**
         * Whether addition and removal of items automatically initializes
         * probabilities
         *
         * @property autoinit
         * @type Boolean
         * @default false
         */
        this.autoinit = opts && 'autoinit' in opts ? !!opts.autoinit : false;

        // Private properties

        /**
         * Item data. Each item will be expressed as an object with the form:
         *  { item, tally, probability }
         *
         * @property _data
         * @private
         * @type Array
         */
        this._data = [];
        this._total = 0;
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
         */
        add: function(item) {
            var idx = this.indexOf(item);

            if(idx < 0) {
                // item doesn't exist
                this._data.push(makeItem(item, 1, 0));
                this.length = this._data.length;
                this._total++;
            } else {
                // item exists - just increase probability
                this._data[idx].tally++;
                this._total++;
            }

            if(this.autoinit) this.setWeights();

            return this;
        },

        /**
         * Decrease an item's probability. Remove if probability is zero
         *
         * @method remove
         * @chainable
         * @param {any} item Item to remove
         * TODO: can't subtract from length, because it is used for searching
         * TODO: Somehow fill in empty indices created by item removal... or
         * never remove them...
         */
        remove: function(item) {
            var idx = this.indexOf(item);
            if(idx < 0) return this;
            if(this._data[idx].tally > 0) {
                this._data[idx].tally--;
                this._total--;
            }

            if(!this._data[idx].tally) {
            }
            
            if(this.autoinit) this.setWeights();

            return this;
        },

        /**
         * Remove an item entirely from the collection
         *
         * @method purge
         * @chainable
         * @param {any} item Item to remove
         * TODO: Finish implementing this
         */
        purge: function(item) {
            var idx = this.indexOf(item);
            if(idx < 0) return this;
            var n = this._data[idx].tally;
            this._total -= n;
            this._data.splice(idx, 1);
            this.length = this._data.length;
            this.setWeights();
            return this;
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
                var e = this._data[i].item;
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
            return idx >= 0 ? this._data[idx].item : null;
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

            if(typeof idx == "number") {
                if(idx >= this.length || idx < 0) return null;
                return this._data[idx].item;
            }

            var rn = Math.random();
            if(rn >= 1) return this._data[this.length - 1].item;
            if(rn <= 0) return this._data[0].item;
            for (var i = 0, l = this.length; i < l; i ++) {
                var prob = this._data[i].probability;
                if(prob > rn) return this._data[i].item;
            }

            return null;
        },

        /**
         * Set the probabilities
         *
         * @method setWeights
         * @chainable
         * TODO: is there any better way to do this?
         */
        setWeights: function() {
            if(!this._total) return this;
            for (var i = 0, l = this.length; i < l; i ++) {
                var c = this._data[i].tally;
                var prob = c / this._total;
                this._data[i].probability = i ? this._data[i - 1].probability + prob : prob;
            }
            return this;
        },

        /**
         * Set comparison function
         *
         * @method setCompare
         * @chainable
         * @param {Function} fn Comparison function
         */
        setCompare: function(fn) {
            this._compare = fn;
            return this;
        }
    };

    return Roulette;
});
