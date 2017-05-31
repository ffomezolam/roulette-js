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
    // utility function for determining data types
    function is(t, o) {
        t = t.toLowerCase();
        var type = Object.prototype.toString.call(o).toLowerCase().slice(8, -1);
        return type == t;
    }

    function defaultCompare(a, b) {
        return a === b;
    }

    function makeItem(item, tally, probability) {
        return {
            item: item,
            tally: tally,
            probability: probability,
            pcum: 0
        }
    }

    /**
     * A collection class that retrieves elements by probability using the
     * roulette method. Possible options:
     *
     *      autocalibrate (bool) - whether to automatically calibrate probabilities (default true)
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
         * @default true
         */
        this.autocalibrate = opts && 'autocalibrate' in opts ? !!opts.autocalibrate : true;

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
        this._aliases = {};
        this._weight = 1;
    }

    Roulette.select = function(list, weights) {
    };

    /**
     * Add an item to the collection
     *
     * @method add
     * @chainable
     * @param {any} item* Item(s) to add
     */
    Roulette.prototype.add = function(item) {
        if(arguments.length > 1) {
            var autocal = this.autocalibrate;
            if(autocal) this.autocalibrate = false; // turn off autocalibration during multiple additions

            for(var i = 0, l = arguments.length; i < l; i++) {
                this.add(arguments[i]);
            }

            if(autocal) {
                this.autocalibrate = true;
                this.calibrate();
            }
        } else {
            var idx = this.indexOf(item);

            if(idx < 0) {
                // item doesn't exist
                this._data.push(makeItem(item, 1, 0));
                this.length = this._data.length;
                this._total++;

                // add alias if appropriate
                if(is('string', item) || is('number', item)) this._aliases[item] = this.length - 1;
            } else {
                // item exists - just increase probability
                this._data[idx].tally++; // increase item tally
                this._total++; // increase total tally
            }

            if(this.autocalibrate) this.calibrate();
        }

        return this;
    };

    /**
     * Decrease an item's probability. Remove if probability is zero
     *
     * @method remove
     * @chainable
     * @param {any} item* Item(s) to remove
     */
    Roulette.prototype.remove = function(item) {
        if(arguments.length > 1) {
            var autocal = this.autocalibrate;
            if(autocal) this.autocalibrate = false;

            for(var i = 0, l = arguments.length; i < l; i++) {
                this.remove(arguments[i]);
            }

            if(autocal) {
                this.autocalibrate = true;
                this.calibrate();
            }
        } else {
            var idx = this.indexOf(item);
            if(idx < 0) return this;
            if(this._data[idx].tally > 0) {
                this._data[idx].tally--;
                this._total--;
            }

            if(!this._data[idx].tally) {
                this._data.splice(idx, 1);
                this.length = this._data.length;

                // item needs to be removed
                if(is('string', item) || is('number', item)) {
                    delete this._aliases[item];
                    this._realias(idx);
                }
            }

            if(this.autocalibrate) this.calibrate();
        }

        return this;
    };

    /**
     * Remove an item entirely from the collection
     *
     * @method purge
     * @chainable
     * @param {any} item Item to remove
     */
    Roulette.prototype.purge = function(item) {
        var idx = this.indexOf(item);
        if(idx < 0) return this;

        var n = this._data[idx].tally;
        this._total -= n;
        this._data.splice(idx, 1);
        this.length = this._data.length;
        if(is('string', item) || is('number', item)) {
            delete this._aliases[item];
            this._realias(idx);
        }

        if(this.autocalibrate) this.calibrate();

        return this;
    };

    /**
     * Reset aliases if applicable
     *
     * @method _realias
     * @private
     * @chainable
     * @param {Number} [s] Index to start at
     */
    Roulette.prototype._realias = function(s) {
        if(!is('number', s) || s < 0) s = 0;
        if(s > this.length - 1) return this;
        for(var i = s, l = this.length; i < l; i++) {
            var item = this._data[i].item;
            this._aliases[item] = i;
        }
        return this;
    };

    /**
     * Search for an item and return its index or -1 if not found
     *
     * @method indexOf
     * @param {any} item Item
     * @return {Number} Item index or -1 if not found
     * TODO: Linear search rulez
     */
    Roulette.prototype.indexOf = function(item) {
        if(!this.length) return -1;

        if(is('string', item) || is('number', item))
            return item in this._aliases ? this._aliases[item] : -1;

        for (var i = 0, l = this.length; i < l; i ++) {
            var e = this._data[i].item;
            if(e == null) continue;
            if(this._compare(item, e)) return i;
        }

        return -1;
    };

    /**
     * Check if item exists
     *
     * @method has
     * @param {any} item Item
     * @return {Boolean} Whether item exists in collection
     */
    Roulette.prototype.has = function(item) {
        return !!(this.indexOf(item) >= 0);
    };

    /**
     * Get an item randomly by weight
     *
     * @method get
     * @param {Number} [weight] Weight adjustment
     * @return {any} Item
     * TODO: Linear search rulez agayne
     */
    Roulette.prototype.get = function(weight) {
        if((typeof weight == "Number") && weight != this._weight) {
            this.calibrate(weight);
        }

        var rn = Math.random();
        if(rn >= 1) return this._data[this.length - 1].item;
        if(rn <= 0) return this._data[0].item;
        for (var i = 0, l = this.length; i < l; i ++) {
            var prob = this._data[i].pcum;
            console.log('prob of ' + this._data[i].item + ': ', prob);
            if(prob > rn) return this._data[i].item; // pick first item which exceeds throw
        }

        return null;
    };

    /**
     * Get an item by index
     *
     * @method index
     * @param {Number} idx Item
     * @return {any} Item
     */
    Roulette.prototype.index = function(idx) {
        if(!this.length) return null;
        if(is('number', idx)) {
            if(idx >= 0 && idx < this.length) return this._data[idx].item;
            return null;
        }

        return null;
    };

    /**
     * Adjust the probabilities
     *
     * @method calibrate
     * @chainable
     * @param {Number} [weight] Adjust the weight of the probabilities
     * generated (e.g. 0 is just random, 2 is double weighted). Default 1
     */
    Roulette.prototype.calibrate = function(weight) {
        if(!this._total) return this;
        if(typeof weight == "undefined") weight = 1;

        if(weight < 0) weight = 0;
        else if(weight > 100) weight = 100;

        this._weight = weight; // record what weight we're using

        var probabilities = [];

        // get probabilities
        for (var i = 0, l = this.length; i < l; i ++) {
            var c = this._data[i].tally;
            var prob = c / this._total;

            probabilities[i] = prob;
        }

        // TODO: figure out scaling
        for(var i = 0, l = this.length; i < l; i++) {
            this._data[i].probability = prob;
            this._data[i].pcum = i ? this._data[i - 1].pcum + prob : prob;
        }

        return this;
    };

    /**
     * Set comparison function
     *
     * @method setCompare
     * @chainable
     * @param {Function} fn Comparison function
     */
    Roulette.prototype.setCompare = function(fn) {
        this._compare = fn;
        return this;
    };

    return Roulette;
});
