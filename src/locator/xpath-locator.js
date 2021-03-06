/* global document XPathResult */

const locator = {
  build(tree, element, type) {
    const item = tree[0];
    const tag = Object.keys(item)[0];
    const p = item[tag].reduce(
      (subpath, attr) => (
        subpath === '' ? this._getSubpath(subpath, attr, tag) : subpath
      ),
      ''
    );
    const path = `/${p}`;
    if (!element) return path;
    if (this._found(['@id', '@for'], path)) return path;
    if (this._found(['@name'], path) && this._found(['select'], type)) return path;

    const { count, index } = this._getIndex(path, element);
    return ((count > 1) && (index > 1)) ? `xpath=(${path})[${index}]` : path;
  },

  _found(attributes, path) {
    return attributes.some(attr => path.includes(attr));
  },

  _getIndex(path, element) {
    let index = 1; // 1 - unique tag
    let count = 1; // 1 - unique element

    let node;
    const nodes = document.evaluate(`.${path}`, document.body, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    while (node = nodes.iterateNext()) {
      if (node === element) { index = count; }
      count += 1;
    }
    return { count, index };
  },

  _getSubpath(subpath, attr, tag) {
    const pattern = /.[0-9]{10}./;
    const javaPattern = /.javascript./;
    if (attr.id != null && pattern.test(attr.id)) return `/${tag}`;
    if (attr.for != null) return `/${tag}[@for="${attr.for}"]`;
    if ((attr.class != null) && (attr.class.length > 0)) return `/${tag}[@class="${attr.class}"]`;
    if (attr.title != null) return `/${tag}[@title="${attr.title}"]`;
    if (attr.href != null && !javaPattern.test(attr.href)) return `/${tag}[@href="${attr.href}"]`;
    if (attr.name != null) return `/${tag}[@name="${attr.name}"]`;
    if (attr.id != null && !pattern.test(attr.id)) return `/${tag}[@id="${attr.id}"]`;
    if (attr.rel != null) return `/${tag}[@rel="${attr.rel}"]`;
    if (attr.index != null) return `/${tag}`;
    return '';
  }
};

if (typeof exports !== 'undefined') exports.locator = locator;
