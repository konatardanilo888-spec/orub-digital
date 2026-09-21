'use strict';

class Router {
  constructor() {
    this.routes = []; // { method, pattern: RegExp, keys: [], handler }
  }

  _add(method, path, handler) {
    const keys = [];
    const pattern = new RegExp('^' + path.replace(/\/:([A-Za-z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return '/([^/]+)';
    }) + '/?$');
    this.routes.push({ method, pattern, keys, handler });
  }

  get(path, handler) { this._add('GET', path, handler); }
  post(path, handler) { this._add('POST', path, handler); }

  match(method, pathname) {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = r.pattern.exec(pathname);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { handler: r.handler, params };
      }
    }
    return null;
  }
}

module.exports = { Router };
