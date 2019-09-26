import * as Utils from '../js/services/utils';
import * as Log from 'loglevel';

describe('Utils getNumber tests', () => {

    test('Get number OK', () => {
        expect(Utils.getNumber(10)).toBe(10);
        expect(typeof Utils.getNumber(10)).toBe('number');
    });

    test('Zero is OK', () => {
        expect(Utils.getNumber(0)).toBe(0);
        expect(typeof Utils.getNumber(0)).toBe('number');
        expect(Utils.getNumber('0')).toBe(0);
        expect(typeof Utils.getNumber('0')).toBe('number');
    });

    test('One is OK', () => {
        expect(Utils.getNumber('1')).toBe(1);
        expect(Utils.getNumber(1)).toBe(1);
    });

    test('Float is OK', () => {
        expect(Utils.getNumber('100.003')).toBe(100.003);
        expect(Utils.getNumber(11.56)).toBe(11.56);
    });

    test('Nan', () => {
        expect(Utils.getNumber('not a number')).toBe(0);
        expect(typeof Utils.getNumber('not a number')).toBe('number');
    });

    test('Invalid alpha number', () => {
        expect(Utils.getNumber('1a')).toBe(0);
        expect(Utils.getNumber('a1')).toBe(0);
        expect(Utils.getNumber('aa')).toBe(0);
        expect(Utils.getNumber('1 a')).toBe(0);
        expect(Utils.getNumber('a 1')).toBe(0);
        expect(Utils.getNumber('a a')).toBe(0);
        expect(Utils.getNumber('1 1')).toBe(0);
    });

    test('Invalid number null', () => {
        expect(Utils.getNumber(null)).toBe(0);
    });

    test('Invalid number undefined', () => {
        // tslint:disable-next-line: prefer-const
        let x;
        expect(Utils.getNumber(x)).toBe(0);
        expect(Utils.getNumber(undefined)).toBe(0);
    });

    test('Invalid number object', () => {
        const x = {};
        expect(Utils.getNumber(x)).toBe(0);
    });

    test('Invalid number list', () => {
        const x = [];
        expect(Utils.getNumber(x)).toBe(0);
    });
});

describe('Utils removeURIParam tests', () => {

    test('Remove simple query param', () => {
        expect(Utils.removeURIParam('http://example.com/?foo=1&mykey=23', 'mykey')).toBe('http://example.com/?foo=1');
        expect(Utils.removeURIParam('http://example.com/?mykey=1&foo=23', 'mykey')).toBe('http://example.com/?foo=23');
    });

    test('Query param with space', () => {
        expect(Utils.removeURIParam('http://example.com/?foo=1&my%20key=23', 'my key')).toBe('http://example.com/?foo=1');
        expect(Utils.removeURIParam('http://example.com/?my%20key=1&foo=23', 'my key')).toBe('http://example.com/?foo=23');
    });

    test('No such query param', () => {
        const actual = 'http://example.com/?foo=1&mykey=23';
        expect(Utils.removeURIParam(actual, 'nosuchkey')).toBe(actual);
    });

    test('Single query param', () => {
        const actual = 'http://example.com/?foo=1';
        expect(Utils.removeURIParam(actual, 'foo')).toBe('http://example.com/');
    });

    test('Single query param no trailing slash', () => {
        const actual = 'http://example.com?foo=1';
        expect(Utils.removeURIParam(actual, 'foo')).toBe('http://example.com/');
    });

    test('HTTPS Single query param', () => {
        const actual = 'https://example.com/?foo=1';
        expect(Utils.removeURIParam(actual, 'foo')).toBe('https://example.com/');
    });

    test('Duplicate query param', () => {
        const actual = 'http://example.com/?foo=1&foo=23';
        expect(Utils.removeURIParam(actual, 'foo')).toBe('http://example.com/');
    });

    test('Bad keys', () => {
        const actual = 'http://example.com/?foo=1&mykey=23';
        expect(Utils.removeURIParam(actual, '')).toBe(actual);
        expect(Utils.removeURIParam(actual, null)).toBe(actual);
        expect(Utils.removeURIParam(actual, undefined)).toBe(actual);
    });

    test('URL encoded', () => {
        const uri = 'http://example.com/?foo=1&mykey=23';
        const actual = encodeURI(uri);
        expect(Utils.removeURIParam(actual, 'nosuchkey')).toBe(uri);
        expect(Utils.removeURIParam(actual, 'foo')).toBe('http://example.com/?mykey=23');
    });

    test.skip('Ampersands', () => {
        const uri = 'http://example.com/?foo=1&amp;mykey=23';
        const actual = encodeURI(uri);
        expect(Utils.removeURIParam(actual, 'nosuchkey')).toBe(uri);
        expect(Utils.removeURIParam(actual, 'foo')).toBe('http://example.com/?mykey=23');
    });

    test('Invalid URL', () => {
        const actual = 'junk/?foo=1';
        // TODO - Is this correct ? Maybe I should get 'junk/' back ?
        expect(Utils.removeURIParam(actual, 'foo')).toBe('https://localhost/junk/');
    });

    test('Null URL', () => {
        expect(Utils.removeURIParam(null, 'foo')).toBe(null);
    });

    test('Undefined URL', () => {
        expect(Utils.removeURIParam(undefined, 'foo')).toBe(null);
    });

    test('Empty URL', () => {
        expect(Utils.removeURIParam('', 'foo')).toBe(null);
    });
});

describe('Utils setURIParam tests', () => {

    test('Simple bare URL add param', () => {
        expect(Utils.setURIParam('http://example.com/', 'foo', 2)).toBe('http://example.com/?foo=2');
        expect(Utils.setURIParam('https://example.com/', 'foo', 2)).toBe('https://example.com/?foo=2');
        // Sans trailing /
        expect(Utils.setURIParam('http://example.com', 'foo', 2)).toBe('http://example.com/?foo=2');
        expect(Utils.setURIParam('https://example.com', 'foo', 2)).toBe('https://example.com/?foo=2');
    });

    test.skip('Check invalid params', () => {
        expect(Utils.setURIParam('http://example.com/', '', 2)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', {}, 2)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', [], 2)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', null, 2)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', undefined, 2)).toBe('http://example.com/');

        expect(Utils.setURIParam('http://example.com/', 'x', '')).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', 'x', null)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', 'x', undefined)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', 'x', {})).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', 'x', [])).toBe('http://example.com/');

        expect(Utils.setURIParam('http://example.com/', null, null)).toBe('http://example.com/');
        expect(Utils.setURIParam('http://example.com/', undefined, undefined)).toBe('http://example.com/');
    });

    test('Try adding duplicate params', () => {
        expect(Utils.setURIParam('http://example.com/?foo=23', 'foo', 2)).toBe('http://example.com/?foo=2');
        expect(Utils.setURIParam('https://example.com/?bar=12&foo=thing', 'foo', 2)).toBe('https://example.com/?bar=12&foo=2');
    });

    test('Check params that need encoding', () => {
        expect(Utils.setURIParam('http://example.com/', 'spacy param', 2)).toBe('http://example.com/?spacy%20param=2');
        expect(Utils.setURIParam('https://example.com/', 'foo', 'spacy value')).toBe('https://example.com/?foo=spacy%20value');
    });

    test('Try adding param to existing duplicates', () => {
        expect(Utils.setURIParam('http://example.com/?foo=23&bar=hello&foo=other', 'foo', 2)).toBe('http://example.com/?foo=2&bar=hello');
        expect(Utils.setURIParam('https://example.com/?bar=12&foo=thing&foo=other', 'foo', 2)).toBe('https://example.com/?bar=12&foo=2');
    });
});

describe('Utils replaceBrowserUrl tests', () => {

    /*
     * It's not clear what replaceBrowserUrl() is meant to do.
     *
     * It seems to be used to change,
     *
     * https://development.manywho.net/aea6973f-b9dc-4900-a14c-b88305c7a571/play/default
     *      ?flow-id=a9de7297-a592-42e5-aca0-a03cab9f4609&flow-version-id=5a38db5e-c7a5-47b6-8760-045de84345df
     *
     * into
     *
     * https://development.manywho.net/aea6973f-b9dc-4900-a14c-b88305c7a571/play/default
     *      ?join=526a72b6-ad3a-42dc-8102-6775185c43a9
     *
     * Doesn't handle encoded URIs, if no ?query is present in the original URL the returned query params are broken - missing '?'
     *
     * Fortunately it's only used in one place atm. in engine.ts iff Settings.flow('replaceUrl', ...) is set
     */

    // Note we rely on Jest testURL setup - https://jestjs.io/docs/en/configuration#testurl-string as https://localhost/
    test('Change URL in normal circumstances', () => {

        window.history.pushState({}, 'Test Title', 'https://localhost/aeaeae/play/default?flow-id=xxx&flow-version-id=yyy');

        Utils.replaceBrowserUrl({ joinFlowUri: 'https://localhost/aeaeae/play/default?join=zzz', stateToken: {} });

        expect(window.location.pathname).toEqual('/aeaeae/play/default');
        expect(window.location.search).toEqual('?join=zzz');
    });

    test('Check error logged', () => {

        Log.error = jest.fn();
        window.history.pushState({}, 'Test Title', 'https://localhost/test.html?query=true');

        // Changing the domain/protocol is not allowed and throws this error.
        // SecurityError: pushState cannot update history to a URL which differs in components other than in path, query, or fragment.
        Utils.replaceBrowserUrl({ joinFlowUri: 'https://bad-site.com/join.html', stateToken: {} });
        expect(Log.error).toHaveBeenCalled();
    });

    test('Change URL ensure known query params are removed', () => {

        const ignoreParameters = ['tenant-id', 'flow-id', 'flow-version-id', 'navigation-element-id', 'join', 'initialization', 'authorization'];
        window.history.pushState({}, 'Test Title', 'https://localhost/aeaeae/play/default?foo=1&' + ignoreParameters.join('=1&'));

        Utils.replaceBrowserUrl({ joinFlowUri: 'https://localhost/aeaeae/play/default?join=zzz', stateToken: {} });

        expect(window.location.pathname).toEqual('/aeaeae/play/default');
        expect(window.location.search).toEqual('?join=zzz&foo=1');
    });

    test.skip('Change URL no join URI query', () => {

        window.history.pushState({}, 'Test Title', 'https://localhost/test.html?query=true');

        Utils.replaceBrowserUrl({ joinFlowUri: 'https://localhost/join.html', stateToken: {} });

        expect(window.location.pathname).toEqual('/join.html');
        expect(window.location.search).toEqual('?query=true');
    });
});

describe('Utils parseQueryString tests', () => {

    test('No params', () => {
        expect(Utils.parseQueryString('')).toEqual({});
    });

    test('Valid single param', () => {
        const expected = {
            param1: 'value1',
        };
        expect(Utils.parseQueryString('param1=value1')).toEqual(expected);
    });

    test('Valid multiple params', () => {
        const expected = {
            param1: 'value1',
            param2: 'value2',
        };
        expect(Utils.parseQueryString('param1=value1&param2=value2')).toEqual(expected);
    });

    test('Malformed param', () => {
        expect(Utils.parseQueryString('missingequals')).toEqual({});
    });

    test.skip('Check encoded params', () => {
        const expected = {
            param1: 'value1',
            param2: 'value2',
        };
        expect(Utils.parseQueryString(encodeURIComponent('param1=value1&param2=value2'))).toEqual(expected);
        expect(Utils.parseQueryString('param1=value1&amp;param2=value2')).toEqual(expected);
    });

    test.skip('Params with spaces', () => {
        const expected = {
            param1: 'val ue1',
            param2: 'val ue2',
        };
        expect(Utils.parseQueryString('param1=val ue1&param2=val ue2')).toEqual(expected);
        expect(Utils.parseQueryString('param1=val%20ue1&param2=val%20ue2')).toEqual(expected);
    });
});

describe('Utils extend tests', () => {

    test('Simple extend call', () => {
        expect(Utils.extend({ foo:1 }, { bar:1 })).toEqual({ foo:1, bar:1 });
        expect(Utils.extend({ foo:1 }, { bar:1 }, true)).toEqual({ foo:1, bar:1 });
        expect(Utils.extend({ foo:1 }, { bar:1 }, false)).toEqual({ foo:1, bar:1 });
    });

    test('Null object to be extended', () => {
        expect(Utils.extend(null, { bar:1 })).toEqual({});
        expect(Utils.extend(null, { bar:1 }, true)).toEqual({});
        expect(Utils.extend(null, { bar:1 }, false)).toEqual({});
    });

    test('Empty object to be extended', () => {
        expect(Utils.extend({}, { bar:1 })).toEqual({ bar:1 });
        expect(Utils.extend({}, { bar:1 }, true)).toEqual({ bar:1 });
        expect(Utils.extend({}, { bar:1 }, false)).toEqual({ bar:1 });
    });

    test('Object to be extended with nothing', () => {
        expect(Utils.extend({ foo:1 }, null)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, null, true)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, null, false)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, undefined)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, undefined, true)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, undefined, false)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, {})).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, {}, true)).toEqual({ foo:1 });
        expect(Utils.extend({ foo:1 }, {}, false)).toEqual({ foo:1 });
    });

    test.skip('Try to extend object with string', () => {
        expect(Utils.extend({ bar:1 }, 'not an object or array')).toEqual({ bar: 1 });
    });

    test.skip('Try to extend object with array', () => {
        expect(Utils.extend({ bar:1 }, ['ding', 'dong'])).toEqual({ bar: 1, 0:'ding', 1:'dong' });
    });

    test('Try to extend object with array of objects', () => {
        expect(Utils.extend({ bar:1 }, [{ foo:2 }, { doo:3 }])).toEqual({ bar: 1, foo:2, doo:3 });
        expect(Utils.extend({ bar:1 }, [{ foo:2 }, { doo:3 }], true)).toEqual({ bar: 1, foo:2, doo:3 });
    });

    test.skip('Try to extend object with set', () => {
        const map = new Map();
        map.set('name', 'John');
        map.set('id', 11);
        expect(Utils.extend({}, map)).toEqual({ name:'John', id:11 });
    });

    test.skip('Try to extend set with object', () => {
        const map = new Map();
        map.set('name', 'John');
        map.set('id', 11);
        expect(Utils.extend(map, { foo:23 })).toEqual({ name:'John', id:11, foo:23 });
    });

    test('Extend object with duplicates', () => {
        expect(Utils.extend({ bar:1 }, { bar:2 })).toEqual({ bar: 2 });
        expect(Utils.extend({ bar:1 }, { bar:2 }, true)).toEqual({ bar: 2 });
    });

    test('Extend object shallow/deep with nothing checking object equality', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const extra = {};
        expect(actual).toEqual(expected);
        expect(Utils.extend(actual, extra)).toEqual(expected);
        expect(Utils.extend(actual, extra, true)).toEqual(expected);

        // Same object
        expect(Utils.extend(actual, extra)).toBe(actual);
        expect(Utils.extend(actual, extra, true)).toBe(actual);
    });

    test('Extend object shallow', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    // l3 will be removed
                    l3new: 1,
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const extra = { l1: { l2: { l3new: 1 } } } ;
        expect(Utils.extend(actual, extra)).toEqual(expected);
    });

    test('Extend object deep', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    l3: 'data',
                    l3new: 1,
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const extra = { l1: { l2: { l3new: 1 } } } ;
        expect(Utils.extend(actual, extra, true)).toEqual(expected);
    });

    test('Extend object deep 2', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    l3: 'newdata',
                    l3new: 1,
                },
                l2new: 'l2new',
            },
            top: 'value',
            other: 'othervalue',
            l1new: 'foo',
        };
        const extra = { l1new:'foo', l1: { l2new:'l2new', l2: { l3new: 1, l3: 'newdata' } } } ;
        expect(Utils.extend(actual, extra, true)).toEqual(expected);
    });

    test('Extend object shallow 2', () => {

        // Really not sure what the difference between shallow and deep are. No comments or documentation.
        // Seems stange that this test and the deep test above 'Extend object deep 2' behave the same.
        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    l3: 'newdata',
                    l3new: 1,
                },
                l2new: 'l2new',
            },
            top: 'value',
            other: 'othervalue',
            l1new: 'foo',
        };
        const extra = { l1new:'foo', l1: { l2new:'l2new', l2: { l3new: 1, l3: 'newdata' } } } ;
        expect(Utils.extend(actual, extra, false)).toEqual(expected);
    });

    test('Extend object deep array objects', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2: {
                    l3: 'data',
                },
                l2new: 999,
            },
            top: 'value',
            other: 'othervalue',
            l1new: 'foo',
        };
        const extra = [{ l1new:'foo' }, { l1: { l2new:999 } }] ;
        expect(Utils.extend(actual, extra, true)).toEqual(expected);
    });

    test('Extend object shallow array objects', () => {

        const actual = {
            l1: {
                l2: {
                    l3: 'data',
                },
            },
            top: 'value',
            other: 'othervalue',
        };
        const expected = {
            l1: {
                l2new: 999,
            },
            top: 'value',
            other: 'othervalue',
            l1new: 'foo',
        };
        const extra = [{ l1new:'foo' }, { l1: { l2new:999 } }] ;
        expect(Utils.extend(actual, extra, false)).toEqual(expected);
    });
});

describe('Utils extendObjectData tests', () => {

    test('Simple merge of two lists of objects', () => {
        const mergedObjectData = [
            {
                developerName: 'property1',
                contentValue: 'value1',
            },
            {
                developerName: 'property2',
                contentValue: 'value2',
            },
            {
                developerName: 'property3',
                objectData: 'objectData1',
            },
        ];

        const objectData = [
            {
                developerName: 'property2',
                contentValue: 'value3',
            },
            {
                developerName: 'property3',
                objectData: 'objectData2',
            },
        ];

        const expected = [
            {
                developerName: 'property1',
                contentValue: 'value1',
            },
            {
                developerName: 'property2',
                contentValue: 'value3',
            },
            {
                developerName: 'property3',
                objectData: 'objectData2',
            },
        ];

        expect(Utils.extendObjectData(mergedObjectData, objectData)).toEqual(expected);
    });

    test('No objectData', () => {
        expect(Utils.extendObjectData([{}], null)).toEqual([{}]);
    });

    test.skip('No mergedObjectData', () => {
        expect(Utils.extendObjectData(null, [{}])).toEqual([{}]);
    });

    test('No objectData or mergedObjectData params', () => {
        expect(Utils.extendObjectData(null, null)).toEqual(null);
    });
});

describe('Utils isNullOrWhitespace tests', () => {

    // Whitespace is the set of blank characters, commonly defined as space, tab, newline and possibly carriage return.

    test('Whitespace only', () => {
        expect(Utils.isNullOrWhitespace('')).toBe(true);
        expect(Utils.isNullOrWhitespace('       ')).toBe(true);
        expect(Utils.isNullOrWhitespace(' \t ')).toBe(true);
        expect(Utils.isNullOrWhitespace(' \n')).toBe(true);
        expect(Utils.isNullOrWhitespace('\r ')).toBe(true);
        expect(Utils.isNullOrWhitespace('\f')).toBe(true);
        expect(Utils.isNullOrWhitespace(' \v ')).toBe(true);
    });

    test('Whitespace mixture', () => {
        expect(Utils.isNullOrWhitespace('a')).toBe(false);
        expect(Utils.isNullOrWhitespace(' aaa ')).toBe(false);
        expect(Utils.isNullOrWhitespace('aaa ')).toBe(false);
        expect(Utils.isNullOrWhitespace('  aaa')).toBe(false);
    });

    test('null check', () => {
        expect(Utils.isNullOrWhitespace(null)).toBe(true);
    });

    test.skip('undefined check', () => {
        expect(Utils.isNullOrWhitespace(undefined)).toBe(false);
    });
});

describe('Utils isNullOrUndefined tests', () => {

    test('null check', () => {
        expect(Utils.isNullOrUndefined(null)).toBe(true);
    });

    test('undefined check', () => {
        expect(Utils.isNullOrUndefined(undefined)).toBe(true);
    });

    test('Mixture of non null or undefined params', () => {
        expect(Utils.isNullOrUndefined('a')).toBe(false);
        expect(Utils.isNullOrUndefined([])).toBe(false);
        expect(Utils.isNullOrUndefined({})).toBe(false);
        expect(Utils.isNullOrUndefined(1)).toBe(false);
    });
});

describe('Utils isNullOrEmpty tests', () => {

    test('null check', () => {
        expect(Utils.isNullOrEmpty(null)).toBe(true);
    });

    test.skip('undefined check', () => {
        expect(Utils.isNullOrEmpty(undefined)).toBe(false);
    });

    test('Empty check', () => {
        expect(Utils.isNullOrEmpty('')).toBe(true);
    });

    test('Not empty checks', () => {
        expect(Utils.isNullOrEmpty('a')).toBe(false);
        expect(Utils.isNullOrEmpty(' ')).toBe(false);
        expect(Utils.isNullOrEmpty('       ')).toBe(false);
        expect(Utils.isNullOrEmpty('  xxxx     ')).toBe(false);
        expect(Utils.isNullOrEmpty(' \t ')).toBe(false);
        expect(Utils.isNullOrEmpty(' \n')).toBe(false);
        expect(Utils.isNullOrEmpty('\r ')).toBe(false);
        expect(Utils.isNullOrEmpty('\f')).toBe(false);
        expect(Utils.isNullOrEmpty(' \v ')).toBe(false);
    });
});

// t.is(Utils.isEqual(null, null, true), true);
// t.is(Utils.isEqual('value', 'value', false), true);

describe('Utils isEqual tests', () => {

    test('Equality check', () => {
        expect(Utils.isEqual('a', 'a', true)).toBe(true);
        expect(Utils.isEqual('a', 'a', false)).toBe(true);
    });

    test('Case sensitivity checks', () => {
        expect(Utils.isEqual('a', 'A', true)).toBe(true);
        expect(Utils.isEqual('A', 'A', true)).toBe(true);
        expect(Utils.isEqual('A', 'a', true)).toBe(true);
    });

    test('Case insensitivity checks', () => {
        expect(Utils.isEqual('a', 'A', false)).toBe(false);
        expect(Utils.isEqual('A', 'A', false)).toBe(true);
        expect(Utils.isEqual('A', 'a', false)).toBe(false);
    });

    test('Empty strings', () => {
        expect(Utils.isEqual('', '', false)).toBe(true);
        expect(Utils.isEqual('', '', true)).toBe(true);
    });

    test.skip('null and undefined checks', () => {
        expect(Utils.isEqual('a', null, true)).toBe(false);
        expect(Utils.isEqual(null, 'a', true)).toBe(false);
        expect(Utils.isEqual(null, null, true)).toBe(false);
        expect(Utils.isEqual(null, undefined, true)).toBe(false);
        expect(Utils.isEqual(undefined, null, true)).toBe(false);
        expect(Utils.isEqual(undefined, undefined, true)).toBe(false);
    });

    test('Leading/trailing space', () => {
        expect(Utils.isEqual(' bob', 'bob', false)).toBe(false);
        expect(Utils.isEqual('bob', 'bob ', false)).toBe(false);
    });

    test('Umlauts et al.', () => {
        expect(Utils.isEqual('ä, ö, ü', 'ä, ö, ü', false)).toBe(true);
        expect(Utils.isEqual('tête-à-tête', 'tête-à-tête', false)).toBe(true);
        expect(Utils.isEqual('acute (é), grave (è), circumflex (â, î or ô), tilde (ñ), umlaut and dieresis (ü or ï), and cedilla (ç)',
                             'acute (é), grave (è), circumflex (â, î or ô), tilde (ñ), umlaut and dieresis (ü or ï), and cedilla (ç)', true))
                             .toBe(true);
    });

    test('Case sensitive diacriticals.', () => {
        // Upppr and lower, A grave accent, C cedilla, E acute accent
        expect(Utils.isEqual('À Ç É', 'à ç é', false)).toBe(false);
        expect(Utils.isEqual('À Ç É', 'à ç é', true)).toBe(true);
    });
});

describe('Utils convertToArray tests', () => {

    test('Simple conversion', () => {
        const source = {
            property1: 'value1',
            property2: 'value2',
        };
        const expected = ['value1', 'value2'];
        expect(Utils.convertToArray(source)).toEqual(expected);
    });

    test('Deep conversion', () => {
        const source = {
            property1: {
                subprop: 'value1',
            },
            property2: 'value2',
        };
        const expected = [{ subprop: 'value1' }, 'value2'];
        expect(Utils.convertToArray(source)).toEqual(expected);
    });

    test('null and unedfined check', () => {
        expect(Utils.convertToArray(null)).toBe(null);
        expect(Utils.convertToArray(undefined)).toBe(null);
    });

    test('Empty check', () => {
        expect(Utils.convertToArray({})).toEqual([]);
    });

    test.skip('Dodgy parameters', () => {
        const map = new Map();
        map.set('name', 'John');
        map.set('id', 11);
        expect(Utils.convertToArray(map)).toEqual([]);  // Should do better than this
        expect(Utils.convertToArray(1)).toEqual([]);
        expect(Utils.convertToArray('I am not an object')).toEqual([]);
    });
});

describe('Utils get tests', () => {

    test('Simple get', () => {
        const expected: any = {
            key: 'value',
        };
        const collection = [expected];
        expect(Utils.get(collection, 'value', 'key')).toEqual(expected);
    });

    test('Find keys/values that do not exist', () => {
        const data: any = {
            key: 'value',
        };
        const collection = [data];
        expect(Utils.get(collection, 'no-such-value', 'key')).toEqual(null);
        expect(Utils.get(collection, 'value', 'no-such-key')).toEqual(null);
    });

    test('Find keys/values of different types', () => {
        const collection = [
            { key: 'underscore_value' },
            { 1: 'one' },
            { 0: 'zero' },
            { 'foo bar': 'foobar' },
        ];
        expect(Utils.get(collection, 'no-such-value', 'key')).toEqual(null);
        expect(Utils.get(collection, 'one', 'no-such-key')).toEqual(null);
        expect(Utils.get(collection, 'no-such-value', '1')).toEqual(null);

        expect(Utils.get(collection, 'foobar', 'foo bar')).toEqual({ 'foo bar':'foobar' });
        expect(Utils.get(collection, 'one', '1')).toEqual({ 1:'one' });
        expect(Utils.get(collection, 'zero', '0')).toEqual({ 0:'zero' });
    });

    test.skip('null and undefined checks', () => {
        expect(Utils.get([{ foo:1 }], '', '')).toEqual(null);
        expect(Utils.get([{ foo:1 }], undefined, 'foo')).toEqual(null);
        expect(Utils.get([{ foo:1 }], '1', undefined)).toEqual(null);
        expect(Utils.get([{ foo:1 }], null, 'foo')).toEqual(null);
        expect(Utils.get([{ foo:1 }], '1', null)).toEqual(null);
        expect(Utils.get(null, 'foo', 'bar')).toEqual(null);
        expect(Utils.get(undefined, 'foo', 'bar')).toEqual(null);
    });

    test('Empty check', () => {
        expect(Utils.get([], 'foo', 'bar')).toEqual(null);
    });
});

describe('Utils getAll tests', () => {

    test('Simple getAll', () => {
        const map: any = {
            item1: {
                id: 'id',
            },
            item2: {
                id: 'id',
            },
        };
        const expected = [
            {
                id: 'id',
            },
            {
                id: 'id',
            },
        ];

        expect(Utils.getAll(map, 'id', 'id')).toEqual(expected);
    });

    test('Find keys/values that do not exist', () => {
        const map: any = {
            item1: {
                key: 'id',
            },
            item2: {
                id: 'value',
            },
        };
        expect(Utils.getAll(map, 'no-such-value', 'key')).toEqual([]);
        expect(Utils.getAll(map, 'value', 'no-such-key')).toEqual([]);
    });

    test('Find keys/values of different types', () => {
        const collection = [
            { key: 'underscore_value' },
            { 1: 'one' },
            { 0: 'zero' },
            { 'foo bar': 'foobar' },
        ];
        expect(Utils.getAll(collection, 'no-such-value', 'key')).toEqual([]);
        expect(Utils.getAll(collection, 'one', 'no-such-key')).toEqual([]);
        expect(Utils.getAll(collection, 'no-such-value', '1')).toEqual([]);

        expect(Utils.getAll(collection, 'foobar', 'foo bar')).toEqual([{ 'foo bar':'foobar' }]);
        expect(Utils.getAll(collection, 'one', '1')).toEqual([{ 1:'one' }]);
        expect(Utils.getAll(collection, 'zero', '0')).toEqual([{ 0:'zero' }]);
    });

    test('null and undefined checks', () => {
        expect(Utils.getAll([{ foo:1 }], '', '')).toEqual([]);
        expect(Utils.getAll([{ foo:1 }], undefined, 'foo')).toEqual([]);
        expect(Utils.getAll([{ foo:1 }], '1', undefined)).toEqual([]);
        expect(Utils.getAll([{ foo:1 }], null, 'foo')).toEqual([]);
        expect(Utils.getAll([{ foo:1 }], '1', null)).toEqual([]);
        expect(Utils.getAll(null, 'foo', 'bar')).toEqual([]);
        expect(Utils.getAll(undefined, 'foo', 'bar')).toEqual([]);
    });

    test('Empty check', () => {
        expect(Utils.getAll([], 'foo', 'bar')).toEqual([]);
    });
});

describe('Utils getFlowKey tests', () => {

    test('New flow key', () => {
        expect(Utils.getFlowKey('a', 'b', 'c', 'd', 'e')).toEqual('a_b_c_d_e');
        expect(Utils.getFlowKey(null, 'b', 'c', 'd', 'e')).toEqual('_b_c_d_e');
        expect(Utils.getFlowKey('a', null, 'c', 'd', 'e')).toEqual('a__c_d_e');
        expect(Utils.getFlowKey('a', 'b', null, 'd', 'e')).toEqual('a_b__d_e');
        expect(Utils.getFlowKey('a', 'b', 'c', null, 'e')).toEqual('a_b_c__e');
        expect(Utils.getFlowKey('a', 'b', 'c', 'd', null)).toEqual('a_b_c_d_');
        expect(Utils.getFlowKey(null, null, null, null, null)).toEqual('____');
        expect(Utils.getFlowKey('a', 'b', 'c', '', null)).toEqual('a_b_c__');
    });
});

describe('Utils getLookUpKey tests', () => {

    test('Valid flow key', () => {

        const flowKey = 'tenantid_flowid_flowversionid_stateid_element';
        expect(Utils.getLookUpKey(flowKey)).toEqual('tenantid_stateid');
    });

    test.skip('Invalid flow key', () => {
        expect(Utils.getLookUpKey('some junk')).toEqual('');
        expect(Utils.getLookUpKey('tenantid_flowid_whoopsgothiswrong')).toEqual('');
        expect(Utils.getLookUpKey(null)).toEqual('');
        expect(Utils.getLookUpKey(undefined)).toEqual('');
    });
});
