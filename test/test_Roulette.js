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

    describe('hash', function() {
        let hash = _private.hash

        it('should return string rep of number primitives', function() {
            assert.equal(hash(1), '1')
        })

        it('should return string rep of boolean primitives', function() {
            assert.equal(hash(true), 'true')
        })

        it('should return string if string primitive', function() {
            assert.equal(hash('i am silly'), 'i am silly')
        })

        it('should return string version of array', function() {
            assert.equal(hash([1,2,3,4]), '[1,2,3,4]')
        })

        it('should return string version of object', function() {
            assert.equal(hash({1:2, 3:4}), '{1:2,3:4}')
        })

        it('should return string version of complex objects', function() {
            assert.equal(hash({'a':1, 'b':[2,3,{'c':4},5],'d':6,'e':7}),'{a:1,b:[2,3,{c:4},5],d:6,e:7}')
        })
    })

    // TODO: Need to test with real complex object, i.e. class
    describe('Roulette', function() {
        let items = [1,2,3,4]

        describe('#constructor', function() {
            let r = new Roulette();

            it('should start with 0 length', function() {
                assert.equal(r.length, 0);
            })
        })

        describe('#add', function() {
            let r = new Roulette();

            it('should expand collection on new item', function() {
                r.add(items[0])
                r.add(items[1])

                assert.equal(r.length, 2);
            })

            it('should not expand collection on existing item', function() {
                r.add(items[1]);

                assert.equal(r.length, 2);
            })

            it('should increase item count if necessary', function() {
                assert.equal(r._items[items[1]].count, 2);
            })

            it('should return item count', function() {
                let count = r.add(items[1]);
                assert.equal(count, 3);
            })
        })

        describe('#remove', function() {
            let r = new Roulette();
            let n = 3;

            for(let i = 0; i < n; i++) {
                r.add(items[1])
            }

            it('should decrease item count', function() {
                r.remove(items[1]);

                assert.equal(r._items[items[1]].count, n - 1);
            })

            it('should not decrease item count below 0', function() {
                for(let i = 0; i < 10; i++) {
                    r.remove(items[1]);
                }
                assert.equal(r._items[items[1]].count, 0);
            })

            it('should not delete item', function() {
                assert.isTrue(items[1] in r._items)
            })

            it('should return item count', function() {
                for(let i = 0; i < 10; i++) {
                    r.remove(items[1])
                }
                r.add(items[1])
                r.add(items[1])
                let count = r.remove(items[1]);
                assert.equal(r._items[items[1]].count, 1);
            })

            it('should return -1 if no item in collection', function() {
                assert.strictEqual(r.remove('d'), -1);
            })
        })

        describe('#purge', function() {
            let r = new Roulette();

            it('should set item count to 0', function() {
                r.add(items[2]);
                r.add(items[2]);
                r.add(items[2]);
                assert.equal(r.countOf(items[2]), 3);

                r.purge(items[2]);
                assert.equal(r.countOf(items[2]), 0);
            })

            it('should return 0 on success', function() {
                r.add(items[2]);
                assert.equal(r.purge(items[2]), 0);
            })

            it('should return -1 if item does not exist', function() {
                assert.equal(r.purge('d'), -1);
            })
        })

        describe('#delete', function() {
            let r = new Roulette();

            for(let i = 0; i < 4; i++) {
                r.delete(items[i])
            }

            for(let i = 0; i < 4; i++) {
                it('should delete item ' + items[i], function() {
                    assert.isFalse(items[i] in r._items)
                })
            }
        })

        describe('#has', function() {
            let r = new Roulette();
            let adds = 2

            for(let i = 0; i < adds; i++) {
                r.add(items[i])
            }

            for(let i = 0; i < adds; i++) {
                it('should return true if item ' + items[i] + ' in collection', function() {
                    assert.isTrue(r.has(items[i]));
                })
            }

            it('should return false if item not in collection', function() {
                assert.isFalse(r.has(items[adds + 1]));
            })

            it('should return true if item has 0 count', function() {
                r.purge(items[0])
                assert.isTrue(r.has(items[0]))
            })
        })

        describe('#countOf', function() {
            let r = new Roulette();
            let n = 2;

            // this will add 1 of item 1, 2 of item 2, etc...
            for(let i = 0; i < n; i++) {
                for(let j = 0; j <= i; j++) {
                    r.add(items[i])
                }
            }

            for(let i = 0; i < n; i++) {
                it('should return item count for item ' + items[i], function() {
                    assert.strictEqual(r.countOf(items[i]), i + 1);
                })
            }

            it('should return -1 if item does not exist', function() {
                assert.strictEqual(r.countOf(items[n+1]), -1);
            })
        })

        describe('#get', function() {
            let r = new Roulette()

            // add items with varying counts
            r.add(items[0]);
            r.add(items[1]);
            r.add(items[1]);
            r.add(items[2]);
            r.add(items[2]);
            r.add(items[2]);

            it('should return items according to weight', function() {
                let counts = {};
                let nruns = 1000;
                let rats = {1:1/6, 2:2/6, 3:3/6}

                // run a lot of times and store counts
                for(let i = 0; i < nruns; i++) {
                    let result = r.get();
                    if(!(result in counts)) counts[result] = 1
                    else counts[result]++
                }

                for(let result in counts) {
                    let rat = counts[result] / nruns;

                    assert.closeTo(rat, rats[result], 0.1)
                }
            })

            // adjust weights and run again
            it('should adjust weights if specified', function() {
                let counts = {};
                let compare_counts = {};
                let nruns = 1000;
                let exp = 2;

                // store item counts adjusted by exponent
                for(let item in r._items) {
                    compare_counts[item] = r._items[item].count ** exp
                }

                // get new total items
                let total = 0;
                for(let item in compare_counts) {
                    total += compare_counts[item]
                }

                // run a lot of times and store result counts
                let result_counts = {}

                for(let i = 0; i < nruns; i++) {
                    let result = r.get(exp);
                    if(!(result in result_counts)) result_counts[result] = 1
                    else result_counts[result]++
                }

                // make ratios from counts
                let rats = {}
                for(let key in compare_counts) {
                    rats[key] = compare_counts[key] / total;
                }

                // test that results are close to actual ratios
                for(let result in result_counts) {
                    let rat = result_counts[result] / nruns;

                    assert.closeTo(rat, rats[result], 0.1);
                }
            })
        })
    })
})
