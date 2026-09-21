'use strict';
/*
 * Minimalni parser za multipart/form-data (upload fajlova), bez spoljašnjih paketa.
 * Vraća { fields: {...}, files: { fieldName: { filename, mimeType, data(Buffer) } } }
 */

function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!match) throw new Error('No boundary found in Content-Type');
  const boundary = '--' + (match[1] || match[2]).trim();
  const boundaryBuf = Buffer.from(boundary, 'utf8');
  const fields = {};
  const files = {};

  const parts = splitBuffer(buffer, boundaryBuf);

  for (const part of parts) {
    if (part.length === 0) continue;
    // Strip leading CRLF
    let body = part;
    if (body[0] === 0x0d && body[1] === 0x0a) body = body.slice(2);

    const headerEnd = body.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerStr = body.slice(0, headerEnd).toString('utf8');
    let content = body.slice(headerEnd + 4);
    // Remove trailing CRLF before next boundary
    if (content.slice(-2).toString() === '\r\n') content = content.slice(0, -2);

    const nameMatch = /name="([^"]+)"/i.exec(headerStr);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];
    const filenameMatch = /filename="([^"]*)"/i.exec(headerStr);

    if (filenameMatch && filenameMatch[1]) {
      const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(headerStr);
      files[fieldName] = {
        filename: filenameMatch[1],
        mimeType: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
        data: content
      };
    } else if (filenameMatch && !filenameMatch[1]) {
      // empty file input, ignore
    } else {
      fields[fieldName] = content.toString('utf8');
    }
  }

  return { fields, files };
}

function splitBuffer(buffer, delimiter) {
  const parts = [];
  let start = 0;
  let idx;
  while ((idx = buffer.indexOf(delimiter, start)) !== -1) {
    if (start !== 0) {
      parts.push(buffer.slice(start, idx));
    }
    start = idx + delimiter.length;
  }
  return parts;
}

module.exports = { parseMultipart };
