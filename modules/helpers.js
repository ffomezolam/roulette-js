/**
 * helpers.js
 *
 * Helper functions for roulette algorithm
 */

/**
 * Function implementing weighted random selection using the roulette method
 *
 * @param {array} items - the items to choose from
 * @param {array} weights - the item weights (non-cumulative)
 * @return {any} the chosen item from items
 */
function roulette(items, weights) {
    if(!weights || !('length' in weights) || !weights.length) {
        weights = [];
        for(let i = 0; i < items.length; i++) {
            weights.push(1);
        }
    } else if(weights.length != items.length) {
        throw new RangeError("items and weights must have same length")
    }

    // get index of chosen item
    let index = choose(weights);

    // return chosen item
    return items[index]
}

/**
 * Helper function to turn absolute weights into cumulative weights
 *
 * @param {array} weights - list of absolute weights
 */
function makeCumulative(weights) {
    let l = weights.length;
    let cweights = [];
    let cweight = 0;

    for(let i = 0; i < l; i++) {
        cweight += weights[i];
        cweights.push(cweight);
    }

    return cweights;
}

/**
 * Helper function to get random integer from 0 to max
 *
 * @param {int} max - maximum random value (non-inclusive)
 * @return {int} random value from 0 to max (not inclusive)
 */
function randomInt(max) {
    return Math.floor( Math.random() * max );
}

/**
 * Helper function to choose an index from weights
 *
 * @param {array} weights - array of weights (non-cumulative)
 * @return {int} index of chosen item from weights
 */
function choose(weights) {
    let cweights = makeCumulative(weights);
    let max = cweights[ cweights.length - 1 ];

    let choice = randomInt(max);

    for(let i = 0; i < cweights.length; i++) {
        let cweight = cweights[i];

        // return index
        if(choice < cweight) {
            return i;
        }
    }

    throw new RangeError("no valid choice from cumulative weights");
}

let _private = {
    makeCumulative,
    randomInt
}
export {roulette, choose, _private}
