const https = require('https');

const cloudName = 'daso8d86f';
const uploadPreset = 'wernova';

// A tiny 1x1 transparent PNG data URI
const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const payload = `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="file"\r\n\r\n` +
  `${dummyImage}\r\n` +
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="upload_preset"\r\n\r\n` +
  `${uploadPreset}\r\n` +
  `--${boundary}--`;

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${cloudName}/image/upload`,
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', (e) => console.error(e));
req.write(payload);
req.end();
