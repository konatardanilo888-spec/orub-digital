'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' };

function saveUploadedImage(file) {
  if (!file || !file.data || !file.data.length) return null;
  let ext = ALLOWED_EXT[file.mimeType];
  if (!ext) {
    const fromName = path.extname(file.filename || '').toLowerCase();
    ext = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(fromName) ? fromName : '.jpg';
  }
  const name = crypto.randomBytes(12).toString('hex') + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.data);
  return '/uploads/' + name;
}

module.exports = { saveUploadedImage, UPLOAD_DIR };
