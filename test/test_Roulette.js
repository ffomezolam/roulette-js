import {assert} from 'chai';

import {Roulette, _private} from '../modules/Roulette.js';

describe('>Roulette.js', function() {
    describe('getopt', function() {
        let getopt = _private.getopt;
        let opts = {
            'a': 1,
            'b': 2,
            'c': '',
            'd': 'neither a borrower nor lender be',
            'test': function() { return ':)' }
        }

        it('should return undefined if no opts and no default', function() {
            let result = getopt('opt');

            assert.isUndefined(result);
        })

        it('should return default if no opts and has default', function() {
            let d = 'a';
            let result = getopt('opt', undefined, d);

            assert.equal(result, d)
        })

        it('should return undefined if option not in opts', function() {
            let result = getopt('f', opts);

            assert.isUndefined(result);
        })

        it('should return default if exists and opt not in opts', function() {
            let opt = 'f';
            let def = 'beans!';
            let result = getopt(opt, opts, def);

            assert.equal(result, def);
        })

        it('should return the value if opt in opts', function() {
            let opt = 'd';
            let result = getopt(opt, opts);

            assert.equal(result, opts[opt]);
        })

        it('should return a boolean if bool flag set', function() {
            assert.isTrue(getopt('d', opts, undefined, true));
            assert.isFalse(getopt('c', opts, undefined, true));
        })
    })

    describe('equal', function() {
        let equal = _private.equal

        it('should return true if numbers are equal', function() {
            assert.isTrue(equal(1, 1));
        })

        it('should return false if numbers are not equal', function() {
            assert.isFalse(equal(1,2));
        })

        it('should return true if strings are equal', function() {
            assert.isTrue(equal('a', 'a'));
            assert.isTrue(equal('ab', 'ab'));
        })

        it('should return false if strings are not equal', function() {
            assert.isFalse(equal('a', 'b'));
            assert.isFalse(equal('ab', 'ba'));
        })

        it('should return true if object contents are equal', function() {
            let o1 = { 'a': 1, 2: 'b' };
            let o2 = { 2: 'b', 'a': 1 };
            let o3 = { 'a': 1, 2: 'b' };

            assert.isTrue(equal(o1, o1));
            assert.isTrue(equal(o1, o2));
            assert.isTrue(equal(o1, o3));
        })

        it('should return false if object contents are not equal', function() {
            let o1 = { 'a': 1, 2: 'b' };
            let o2 = { 'a': 2, 2: 'b' };

            assert.isFalse(equal(o1, o2));
        })

        it('should return true if array contents are equal', function() {
            let a1 = [1,2,3,4,{5:6, 7:8}];
            let a2 = [1,2,3,4,{5:6, 7:8}];

            assert.isTrue(equal(a1, a2));
        })

        it('should return false if array contents are not equal', function() {
            let a1 = [1,2,3,4,5];
            let a2 = [1,2,3,5,4];
            let a3 = [1,2,3,4,{5:6, 7:8}];
            let a4 = [1,2,3,4,{5:6, 7:9}];

            assert.isFalse(equal(a1, a2));
            assert.isFalse(equal(a1, a3));
            assert.isFalse(equal(a3, a4));
        })

        it('should return true if instance contents are equal', function() {
            class C {
                constructor() { this.a = 1, this.b = 2 }
                method(a) { this.c = a }
            }

            let c1 = new C();
            let c2 = new C();

            assert.isTrue(equal(c1, c2));

            c1.a = {1:2, 3:4};
            c2.a = {3:4, 1:2};

            assert.isTrue(equal(c1, c2));
        })

        it('should return false if instance contents are not equal', function() {
            class C {
                constructor() { this.a = 1, this.b = 2 }
                method(a) { this.c = a }
            }

            let c1 = new C();
            let c2 = new C();

            c1.a = 2;

            assert.isFalse(equal(c1, c2));

            c1.a = {1:2, 3:4};
            c2.a = {1:2, 3:5};

            assert.isFalse(equal(c1, c2));

            c1.a = 1;
            c2.a = 1;
            c1.b = 2;
            c2.method(3);

            assert.isFalse(equal(c1, c2));
        })
    })

    describe('Roulette', function() {
        let items = ['a','b','c']
        let r = new Roulette();
        r._items.push(items[0]);
        r._counts.push(1);
        r._items.push(items[1]);
        r._counts.push(2);
        r.length = 2;

        it('should default to equal comparison function', function() {
            assert.strictEqual(r._opts.comparison, _private.equal);
        })

        describe('#has', function() {
            it('should return true if item in collection', function() {
                assert.isTrue(r.has(items[0]));
                assert.isTrue(r.has(items[1]));
            })

            it('should return false if item not in collection', function() {
                assert.isFalse(r.has(items[2]));
            })
        })

        describe('#indexOf', function() {
            it('should return index if item in collection', function() {
                assert.strictEqual(r.indexOf(items[0]), 0);
                assert.strictEqual(r.indexOf(items[1]), 1);
            })

            it('should return -1 if item not in collection', function() {
                assert.strictEqual(r.indexOf(items[2]), -1);
            })
        })

        describe('#at', function() {
            it('should return item at index', function() {
                assert.strictEqual(r.at(0), items[0]);
                assert.strictEqual(r.at(1), items[1]);
            })

            it('should return undefined if out of range', function() {
                assert.isUndefined(r.at(2));
            })
        })

        describe('#countOf', function() {
            it('should return item count', function() {
                assert.strictEqual(r.countOf(items[0]), 1);
                assert.strictEqual(r.countOf(items[1]), 2);
            })

            it('should return 0 if item does not exist', function() {
                assert.strictEqual(r.countOf(items[2]), 0);
            })
        })

        describe('#countAt', function() {
            it('should return count at index', function() {
                assert.strictEqual(r.countAt(0), 1);
                assert.strictEqual(r.countAt(1), 2);
            })

            it('should return 0 if out of range', function() {
                assert.strictEqual(r.countAt(2), 0);
            })
        })

        describe('#add', function() {
            it('should expand collection if necessary', function() {
                r.add(items[2]);
                assert.equal(r.length, 3);
            })

            it('should increase item count if necessary', function() {
                r.add(items[2]);
                assert.equal(r.countOf(items[2]), 2);
            })

            it('should return item count', function() {
                let count = r.add(items[2]);
                assert.equal(count, 3);
            })
        })

        describe('#remove', function() {
            it('should decrease item count', function() {
                r.remove(items[2]);

                assert.equal(r.countOf(items[2]), 2);

                r.remove(items[2]);

                assert.equal(r.countOf(items[2]), 1);

                r.remove(items[2]);

                assert.equal(r.countOf(items[2]), 0);
            })

            it('should not decrease item count below 0', function() {
                r.remove(items[2]);
                assert.equal(r.countOf(items[2]), 0);
            })

            it('should not delete item', function() {
                assert.isTrue(r.has(items[2]));
            })

            it('should return item count', function() {
                let count = r.add(items[2]);
                assert.equal(r.countOf(items[2]), 1);
                count = r.remove(items[2]);
                assert.equal(r.countOf(items[2]), 0);
            })

            it('should return 0 if no item in collection', function() {
                assert.strictEqual(r.remove('d'), 0);
            })
        })

        describe('#purge', function() {
            it('should set item count to 0', function() {
                r.add(items[2]);
                r.add(items[2]);
                r.add(items[2]);
                assert.equal(r.countOf(items[2]), 3);

                r.purge(items[2]);
                assert.equal(r.countOf(items[2]), 0);
            })

            it('should return item index', function() {
                r.add(items[2]);
                assert.equal(r.purge(items[2]), 2);
            })
        })

        describe('#get', function() {
            it('should return items according to weight', function() {
                for(let i = 0; i < 3; i++) {
                    r.purge(items[i]); // purge all items
                }

                // add items with varying counts
                r.add(items[0]);
                r.add(items[1]);
                r.add(items[1]);
                r.add(items[2]);
                r.add(items[2]);
                r.add(items[2]);

                // set up results array to store count of items
                let results = [0,0,0];
                let nresults = 1000;

                // run a lot of times, store counts
                for(let i = 0; i < nresults; i++) {
                    let result = r.get();
                    let idx = r.indexOf(result);
                    results[idx]++;
                }

                // specify ratios of counts for each item
                let ratios = [1/6, 2/6, 3/6];

                // test that results are close to actual ratios
                for(let idx in results) {
                    let rat = results[idx] / nresults;

                    assert.closeTo(rat, ratios[idx], 0.1);
                }
            })

            it('should adjust weights if specified', function() {
                // confirm item counts are correct
                for(let i = 0; i < 3; i++) {
                    assert.equal(r.countOf(items[i]), i+1);
                }

                // store item counts
                let counts = [];
                for(let count of r._counts) {
                    counts.push(count);
                }

                // set up exponent to use for weighting
                let exp = 2;

                // adjust counts by exponent
                for(let idx in counts) {
                    counts[idx] = counts[idx] ** exp;
                }

                // make sure counts are stored correctly
                for(let i = 0; i < 3; i++) {
                    assert.equal(counts[i], r._counts[i] ** exp);
                }

                // get total new counts
                let total = 0;
                for(let count of counts) {
                    total += count;
                }

                let results = [0,0,0];
                let nresults = 1000;

                // run a lot of times, store counts
                for(let i = 0; i < nresults; i++) {
                    let result = r.get(exp);
                    let idx = r.indexOf(result);
                    results[idx]++;
                }

                // get ratios
                let ratios = []
                for(let count of counts) {
                    ratios.push(count / total);
                }

                // test that results are close to actual ratios
                for(let idx in results) {
                    let rat = results[idx] / nresults;

                    assert.closeTo(rat, ratios[idx], 0.1);
                }
            })
        })
    })
})
