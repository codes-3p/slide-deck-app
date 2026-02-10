const http = require('http');
const https = require('https');
const { URL } = require('url');

const RENDERER_URL = process.env.PPTX_RENDERER_URL || 'http://localhost:5001';

function httpRequestJson(urlString, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = lib.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          return resolve(buffer);
        }
        return reject(
          new Error(
            `PPTX renderer HTTP ${res.statusCode}: ${buffer.toString('utf8')}`
          )
        );
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

/**
 * Chama o microserviço de renderização PPTX.
 * @param {Object} params
 * @param {string} params.templatePath - Caminho absoluto para o template PPTX.
 * @param {string} params.deckTitle
 * @param {Array} params.slides
 * @returns {Promise<Buffer>} buffer PPTX final
 */
async function renderWithTemplate({ templatePath, deckTitle, slides }) {
  if (!templatePath) {
    throw new Error('templatePath em falta para renderização PPTX.');
  }
  const body = {
    templatePath,
    deckTitle: deckTitle || '',
    slides: slides || []
  };
  const url = `${RENDERER_URL}/render`;
  const buffer = await httpRequestJson(url, body);
  return buffer;
}

module.exports = {
  renderWithTemplate
};

