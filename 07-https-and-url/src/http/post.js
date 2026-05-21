// ─────────────────────────────────────────────
//  HTTPS POST Request
//  Sends JSON data and reads the response
// ─────────────────────────────────────────────
const https = require('https');
const { URL } = require('url');

const TARGET_URL = 'https://jsonplaceholder.typicode.com/posts';

function httpsPost(targetUrl, body) {
  const url = new URL(targetUrl);
  const postData = JSON.stringify(body);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData), // must match exact byte size
      'User-Agent': 'NodeLearning/1.0',
      'Accept': 'application/json'
    }
  };

  console.log(`\n[POST] Sending to: ${url}`);
  console.log('[POST] Body:', body);

  // https.request() is used for POST (https.get() can't send a body)
  const req = https.request(options, (res) => {
    console.log(`[POST] Status: ${res.statusCode}`);
    console.log('[POST] Response headers:', res.headers);

    let responseData = '';
    res.setEncoding('utf8');

    res.on('data', (chunk) => { responseData += chunk; });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('[POST] Response body:', parsed);
      } catch (e) {
        console.error('[POST] JSON parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => console.error('[POST] Network error:', e.message));

  req.setTimeout(15000, () => {
    req.destroy(new Error('[POST] Request timed out after 15 seconds'));
  });

  req.write(postData); // send the body
  req.end();           // signal end of request
}

httpsPost(TARGET_URL, {
  title: 'Learning Node.js',
  body: 'HTTPS POST requests are straightforward once you understand the flow.',
  userId: 1
});
