const url = require('url');
const querystring = require('querystring');

const SAMPLE_URL = 'http://user:pass@example.com:8080/path/to/page?name=john&age=30#section1';
const divider = (label) => console.log(`\n${'='.repeat(50)}\n${label}\n${'='.repeat(50)}`);

// ─── 1. url.parse ────────────────────────────────────────
divider('1. url.parse(urlString)');
const parsed = url.parse(SAMPLE_URL);
console.log(parsed);

divider('1b. url.parse(urlString, parseQueryString=true)');
const parsedWithQS = url.parse(SAMPLE_URL, true);
console.log(parsedWithQS);
console.log('Query as object:', parsedWithQS.query);

divider('1c. url.parse with slashesDenoteHost=true');
const slashUrl = url.parse('//example.com/path', false, true);
console.log(slashUrl);

// ─── 2. url.format ───────────────────────────────────────
divider('2. url.format(urlObject)');
const formatted = url.format({
  protocol: 'https',
  host: 'example.com',
  pathname: '/search',
  query: { q: 'node.js', page: '2' },
});
console.log('Formatted URL:', formatted);

// Round-trip: parse → format
const roundTrip = url.format(url.parse(SAMPLE_URL));
console.log('Round-trip URL:', roundTrip);

// ─── 3. url.resolve ──────────────────────────────────────
divider('3. url.resolve(from, to)');
const cases = [
  ['http://example.com/a/b/c', 'd'],
  ['http://example.com/a/b/c', '/d'],
  ['http://example.com/a/b/', 'd'],
  ['http://example.com/a/b/', '../d'],
  ['http://example.com/a/b/c', 'http://other.com/x'],
];
cases.forEach(([from, to]) => {
  console.log(`resolve("${from}", "${to}") →`, url.resolve(from, to));
});

// ─── 4. new URL (WHATWG API) ──────────────────────────────
divider('4. new URL(input, [base])');
const whatwg = new URL(SAMPLE_URL);
console.log('href      :', whatwg.href);
console.log('protocol  :', whatwg.protocol);
console.log('username  :', whatwg.username);
console.log('password  :', whatwg.password);
console.log('hostname  :', whatwg.hostname);
console.log('port      :', whatwg.port);
console.log('pathname  :', whatwg.pathname);
console.log('search    :', whatwg.search);
console.log('hash      :', whatwg.hash);
console.log('searchParams:', whatwg.searchParams.toString());

divider('4b. new URL with base');
const relative = new URL('/products?id=42', 'https://shop.example.com');
console.log('Resolved URL:', relative.href);

divider('4c. URLSearchParams manipulation');
const sp = new URL(SAMPLE_URL).searchParams;
sp.append('city', 'NYC');
sp.set('age', '99');
sp.delete('name');
console.log('Modified params:', sp.toString());

// ─── 5. querystring.parse ─────────────────────────────────
divider('5. querystring.parse(str)');
const qs = 'name=john&age=30&hobby=coding&hobby=gaming';
console.log('Parsed QS:', querystring.parse(qs));

divider('5b. querystring.parse with custom sep & eq');
const customQS = 'name|john;age|30';
console.log('Custom sep/eq:', querystring.parse(customQS, ';', '|'));

divider('5c. querystring.parse with options (maxKeys)');
console.log('maxKeys=2:', querystring.parse(qs, '&', '=', { maxKeys: 2 }));

// ─── 6. querystring.stringify ─────────────────────────────
divider('6. querystring.stringify(obj)');
const obj = { name: 'jane doe', age: 25, tags: ['js', 'node'] };
console.log('Stringified:', querystring.stringify(obj));

divider('6b. querystring.stringify with custom sep & eq');
console.log('Custom sep/eq:', querystring.stringify({ a: '1', b: '2' }, ';', '|'));

divider('6c. querystring.stringify with encodeURIComponent override');
console.log(
  'No encoding:',
  querystring.stringify({ path: '/a/b' }, '&', '=', { encodeURIComponent: (v) => v })
);
