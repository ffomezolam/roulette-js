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
     * roulette method. Possible options:
     *
     *      autocalibrate (bool) - whether to automatically calibrate probabilities
     *      aliases (bool) - whether to use string-only values for faster searching
     *
     * @class Roulette
     * @constructor
     * @param {Object} [opts] Options
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
         * Whether addition and removal of items automatically calibrates
         * probabilities
         *
         * @property autocalibrate
         * @type Boolean
         * @default false
         */
        this.autocalibrate = opts && 'autocalibrate' in opts ? !!opts.autocalibrate : false;

        /**
         * Whether to use string aliases. Requires strictly string or numeral
         * inputs. Will throw away non-stringifiable inputs.
         *
         * @property aliases
         * @type Boolean
         * @default false
         */
        this.aliases = opts && 'aliases' in opts ? !!opts.aliases : false;

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
        this._aliases = this.aliases ? {} : null;
    }

    Roulette.prototype = {
        /**
         * Add an item to the collection
         *
         * @method add
         * @chainable
         * @param {any} item* Item(s) to add
         */
        add: function(item) {
            if(arguments.length > 1) {
                var autocal = this.autocalibrate;
                if(autocal) this.autocalibrate = false; // turn off autocalibration during multiple additions

                for(var i = 0, l = arguments.length; i < l; i++) {
                    this.add(arguments[i]);
                }

                if(autocal) this.autocalibrate = true;
            } else {
                // don't allow non-string inputs if aliasing
                if(this.aliases && (typeof item != 'string' && typeof item != 'number')) return this;

                var idx = this.indexOf(item);

                if(idx < 0) {
                    // item doesn't exist
                    this._data.push(makeItem(item, 1, 0));
                    this.length = this._data.length;
                    this._total++;

                    // add alias if appropriate
                    if(this.aliases) this._aliases[item] = this.length - 1
                } else {
                    // item exists - just increase probability
                    this._data[idx].tally++;
                    this._total++;
                }

                if(this.autocalibrate) this.calibrate();
            }

            return this;
        },

        /**
         * Decrease an item's probability. Remove if probability is zero
         *
         * @method remove
         * @chainable
         * @param {any} item* Item(s) to remove
         */
        remove: function(item) {
            if(arguments.length > 1) {
                var autocal = this.autocalibrate;
                if(autocal) this.autocalibrate = false;

                for(var i = 0, l = arguments.length; i < l; i++) {
                    this.remove(arguments[i]);
                }

                if(autocal) this.autocalibrate = true;
            } else {
                var idx = this.indexOf(item);
                if(idx < 0) return this;
                if(this._data[idx].tally > 0) {
                    this._data[idx].tally--;
                    this._total--;
                }

                if(!this._data[idx].tally) {
                    // item needs to be removed
                    if(this.aliases) {
                        delete this._aliases[item];
                        this._realias(idx);
                    }
                    this._data.splice(idx, 1);
                    this.length = this._data.length;
                }
                
                if(this.autocalibrate) this.calibrate();
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
            var idx = this.indexOf(item);
            if(idx < 0) return this;

            var n = this._data[idx].tally;
            this._total -= n;
            this._data.splice(idx, 1);
            this.length = this._data.length;
            if(this.aliases) {
                delete this._aliases[item];
                this._realias(idx);
            }
            
            if(this.autocalibrate) this.calibrate();

            return this;
        },

        /**
         * Reset aliases if applicable
         *
         * @method _realias
         * @private
         * @chainable
         * @param {Number} [s] Index to start at
         */
        _realias: function(s) {
            if(typeof s != 'number' || s < 0) s = 0;
            if(s > this.length - 1) return this;
            for(var i = s, l = this.length; i < l; i++) {
                var item = this._data[i].item;
                this._aliases[item] = i;
            }
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

            if(this.aliases) return item in this._aliases ? this._aliases[item] : -1;

            for (var i = 0, l = this.length; i < l; i ++) {
                var e = this._data[i].item;
                if(e == null) continue;
                if(this._compare(item, e)) return i;
            }

            return -1;
        },

        /**
         * Check if item exists
         *
         * @method has
         * @param {any} item Item
         * @return {Boolean} Whether item exists in collection
         */
        has: function(item) {
            return !!(this.indexOf(item) >= 0);
        },

        /**
         * Get an item by index or randomly by weight
         *
         * @method get
         * @param {Number} [idx] Item
         * @return {any} Item
         * TODO: Linear search rulez agayne
         */
        get: function(idx) {
            if(!this.length) return null;
            if(typeof idx == 'number' && idx >= 0 && idx < this.length) return this._data[idx].item;

            var rn = Math.random();
            if(rn >= 1) return this._data[this.length - 1].item;
            if(rn <= 0) return this._data[0].item;
            for (var i = 0, l = this.length; i < l; i ++) {
                var prob = this._data[i].probability;
                if(prob > rn) return this._data[i].item; // pick first item which exceeds throw
            }

            return null;
        },

        /**
         * Adjust the probabilities
         *
         * @method calibrate
         * @chainable
         * TODO: is there any better way to do this?
         */
        calibrate: function() {
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
