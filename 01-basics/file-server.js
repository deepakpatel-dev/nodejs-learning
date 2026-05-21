const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Get the file path from the URL
  const filePath = path.join(__dirname, req.url);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    // Get file stats
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.statusCode = 500;
        res.end('Server error');
        return;
      }

      // Set appropriate headers
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Create read stream and pipe to response
      const stream = fs.createReadStream(filePath);

      // Handle errors
      stream.on('error', (err) => {
        console.error('Error reading file:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Error reading file');
        }
      });

      // Pipe the file to the response
      stream.pipe(res);
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`File server running at http://localhost:${PORT}/`);
});
