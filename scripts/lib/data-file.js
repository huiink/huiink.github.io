const fs = require('fs');
const path = require('path');

function readSourceData(hexo, filename, fallback = '') {
  const filePath = path.join(hexo.base_dir, 'source', '_data', filename);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : fallback;
}

function readSourceJson(hexo, filename, fallback = {}) {
  const source = readSourceData(hexo, filename, '');
  if (!source.trim()) return fallback;
  return JSON.parse(source);
}

module.exports = {
  readSourceData,
  readSourceJson
};
