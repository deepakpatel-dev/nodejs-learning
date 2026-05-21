const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const url = require('url');
const querystring = require('querystring');

// ─── url.parse ────────────────────────────────────────────
describe('url.parse()', () => {
  const FULL_URL = 'http://user:pass@example.com:8080/path/to/page?name=john&age=30#section1';

  test('parses protocol', () => {
    assert.equal(url.parse(FULL_URL).protocol, 'http:');
  });

  test('parses auth (user:pass)', () => {
    assert.equal(url.parse(FULL_URL).auth, 'user:pass');
  });

  test('parses hostname and port separately', () => {
    const parsed = url.parse(FULL_URL);
    assert.equal(parsed.hostname, 'example.com');
    assert.equal(parsed.port, '8080');
  });

  test('parses pathname', () => {
    assert.equal(url.parse(FULL_URL).pathname, '/path/to/page');
  });

  test('query is a string by default', () => {
    assert.equal(typeof url.parse(FULL_URL).query, 'string');
    assert.equal(url.parse(FULL_URL).query, 'name=john&age=30');
  });

  test('query is an object when parseQueryString=true', () => {
    const parsed = url.parse(FULL_URL, true);
    // querystring.parse returns a null-prototype object; spread to compare as plain object
    assert.deepEqual({ ...parsed.query }, { name: 'john', age: '30' });
  });

  test('parses hash fragment', () => {
    assert.equal(url.parse(FULL_URL).hash, '#section1');
  });

  test('slashesDenoteHost: treats //host/path correctly', () => {
    const parsed = url.parse('//example.com/path', false, true);
    assert.equal(parsed.host, 'example.com');
    assert.equal(parsed.pathname, '/path');
  });

  test('handles URL without auth, port, or hash', () => {
    const parsed = url.parse('https://example.com/page');
    assert.equal(parsed.auth, null);
    assert.equal(parsed.port, null);
    assert.equal(parsed.hash, null);
  });
});

// ─── url.format ───────────────────────────────────────────
describe('url.format()', () => {
  test('formats a basic URL object', () => {
    const result = url.format({
      protocol: 'https',
      host: 'example.com',
      pathname: '/search',
    });
    assert.equal(result, 'https://example.com/search');
  });

  test('includes query string from query object', () => {
    const result = url.format({
      protocol: 'https',
      host: 'example.com',
      pathname: '/search',
      query: { q: 'node', page: '2' },
    });
    assert.equal(result, 'https://example.com/search?q=node&page=2');
  });

  test('round-trip: parse then format restores original URL', () => {
    const original = 'http://user:pass@example.com:8080/path?name=john#top';
    assert.equal(url.format(url.parse(original)), original);
  });

  test('search takes precedence over query when both are provided', () => {
    const result = url.format({
      protocol: 'https',
      host: 'example.com',
      search: '?a=1',
      query: { b: '2' },    // ignored when search is present
    });
    assert.equal(result, 'https://example.com?a=1');
  });
});

// ─── url.resolve ──────────────────────────────────────────
describe('url.resolve()', () => {
  test('resolves a relative segment against a file path', () => {
    assert.equal(
      url.resolve('http://example.com/a/b/c', 'd'),
      'http://example.com/a/b/d'
    );
  });

  test('resolves an absolute path (drops current path)', () => {
    assert.equal(
      url.resolve('http://example.com/a/b/c', '/d'),
      'http://example.com/d'
    );
  });

  test('resolves relative segment when base ends with /', () => {
    assert.equal(
      url.resolve('http://example.com/a/b/', 'd'),
      'http://example.com/a/b/d'
    );
  });

  test('resolves ../ to parent directory', () => {
    assert.equal(
      url.resolve('http://example.com/a/b/', '../d'),
      'http://example.com/a/d'
    );
  });

  test('absolute target URL completely replaces base', () => {
    assert.equal(
      url.resolve('http://example.com/a/b', 'http://other.com/x'),
      'http://other.com/x'
    );
  });
});

// ─── new URL (WHATWG) ─────────────────────────────────────
describe('new URL()', () => {
  const FULL_URL = 'http://user:pass@example.com:8080/path/to/page?name=john&age=30#section1';

  test('parses protocol', () => {
    assert.equal(new URL(FULL_URL).protocol, 'http:');
  });

  test('parses username and password separately', () => {
    const u = new URL(FULL_URL);
    assert.equal(u.username, 'user');
    assert.equal(u.password, 'pass');
  });

  test('parses hostname and port', () => {
    const u = new URL(FULL_URL);
    assert.equal(u.hostname, 'example.com');
    assert.equal(u.port, '8080');
  });

  test('parses pathname, search and hash', () => {
    const u = new URL(FULL_URL);
    assert.equal(u.pathname, '/path/to/page');
    assert.equal(u.search, '?name=john&age=30');
    assert.equal(u.hash, '#section1');
  });

  test('resolves relative URL against a base', () => {
    const u = new URL('/products?id=42', 'https://shop.example.com');
    assert.equal(u.href, 'https://shop.example.com/products?id=42');
  });

  test('throws on invalid URL without a base', () => {
    assert.throws(() => new URL('/relative/path'), { name: 'TypeError' });
  });

  test('searchParams.get() retrieves a value', () => {
    const u = new URL(FULL_URL);
    assert.equal(u.searchParams.get('name'), 'john');
    assert.equal(u.searchParams.get('age'), '30');
  });

  test('searchParams.set() mutates the query', () => {
    const u = new URL(FULL_URL);
    u.searchParams.set('age', '99');
    assert.equal(u.searchParams.get('age'), '99');
  });

  test('searchParams.append() adds a new key', () => {
    const u = new URL(FULL_URL);
    u.searchParams.append('city', 'NYC');
    assert.equal(u.searchParams.get('city'), 'NYC');
  });

  test('searchParams.delete() removes a key', () => {
    const u = new URL(FULL_URL);
    u.searchParams.delete('name');
    assert.equal(u.searchParams.get('name'), null);
  });

  test('searchParams.has() checks existence', () => {
    const u = new URL(FULL_URL);
    assert.equal(u.searchParams.has('name'), true);
    assert.equal(u.searchParams.has('missing'), false);
  });
});

// ─── querystring.parse ────────────────────────────────────
describe('querystring.parse()', () => {
  // querystring.parse returns null-prototype objects; use {...result} to compare as plain objects
  test('parses a simple query string', () => {
    assert.deepEqual({ ...querystring.parse('name=john&age=30') }, { name: 'john', age: '30' });
  });

  test('repeated keys become an array', () => {
    const result = querystring.parse('hobby=coding&hobby=gaming');
    assert.deepEqual([...result.hobby], ['coding', 'gaming']);
  });

  test('decodes percent-encoded values', () => {
    const result = querystring.parse('city=New%20York');
    assert.equal(result.city, 'New York');
  });

  test('custom separator and equality sign', () => {
    const result = querystring.parse('name|john;age|30', ';', '|');
    assert.deepEqual({ ...result }, { name: 'john', age: '30' });
  });

  test('maxKeys limits the number of parsed keys', () => {
    const result = querystring.parse('a=1&b=2&c=3', '&', '=', { maxKeys: 2 });
    assert.deepEqual({ ...result }, { a: '1', b: '2' });
  });

  test('empty string returns empty object', () => {
    assert.deepEqual({ ...querystring.parse('') }, {});
  });

  test('key with no value becomes empty string', () => {
    const result = querystring.parse('flag=&name=john');
    assert.equal(result.flag, '');
  });
});

// ─── querystring.stringify ────────────────────────────────
describe('querystring.stringify()', () => {
  test('stringifies a simple object', () => {
    assert.equal(querystring.stringify({ name: 'john', age: '30' }), 'name=john&age=30');
  });

  test('encodes spaces as %20', () => {
    assert.equal(querystring.stringify({ name: 'jane doe' }), 'name=jane%20doe');
  });

  test('array values expand to repeated keys', () => {
    assert.equal(querystring.stringify({ tags: ['js', 'node'] }), 'tags=js&tags=node');
  });

  test('custom separator and equality sign', () => {
    assert.equal(querystring.stringify({ a: '1', b: '2' }, ';', '|'), 'a|1;b|2');
  });

  test('overriding encodeURIComponent disables encoding', () => {
    const result = querystring.stringify(
      { path: '/a/b' },
      '&', '=',
      { encodeURIComponent: (v) => v }
    );
    assert.equal(result, 'path=/a/b');
  });

  test('round-trip: stringify then parse restores object', () => {
    const original = { name: 'john', age: '30', city: 'New York' };
    const str = querystring.stringify(original);
    const parsed = { ...querystring.parse(str) };
    assert.deepEqual(parsed, original);
  });

  test('empty object returns empty string', () => {
    assert.equal(querystring.stringify({}), '');
  });
});
