import {roulette, choose, _private} from "../modules/helpers.js"
import {assert} from 'chai'

describe('>helpers.js', function() {
    describe('randomInt', function() {
        it('should return a result within range 0-max', function() {
            let maxes = [10, 20, 30, 40, 50];

            // run it a lot of times
            for(let x = 0; x < 500; x++) {
                // check that result is within range 0-max
                for(let i = 0; i < maxes.length; i++) {
                    let max = maxes[i];
                    let result = _private.randomInt(max)

                    assert.isAtLeast(result, 0);
                    assert.isBelow(result, max);
                }
            }
        })
    })

    describe('makeCumulative', function() {
        it('should return cumulative weights', function() {
            let weights = [1,2,3,4,5];
            let cumweights = [1,3,6,10,15];
            let result = _private.makeCumulative(weights);

            assert.sameOrderedMembers(result, cumweights);
        })
    })

    describe('choose', function() {
        it('should return an index within range', function() {
            let weights = [1,2,3,4,5]

            // run a lot of times
            for(let i = 0; i < 1000; i++) {
                let result = choose(weights);

                assert.isAtLeast(result, 0);
                assert.isAtMost(result, 4)
            }
        })
    })

    describe('roulette', function() {
        let items = ['a', 'b', 'c', 'd', 'e'];
        let weights = [1,2,3,4,5];
        let counts = { 'a': 0, 'b': 0, 'c': 0, 'd': 0, 'e': 0 }

        it('should return an item within items list', function() {
            for(let i = 0; i < 1000; i++) {
                let result = roulette(items, weights);

                assert.include(items, result);

                counts[result]++;
            }
        })

        it('should have weighted selection', function() {
            assert.closeTo(counts['a'] / counts['e'], 0.2, 0.2);
        })
    })
})
