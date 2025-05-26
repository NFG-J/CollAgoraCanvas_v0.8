const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('createCanvasItem', () => {
  let window, document, canvas, createCanvasItem;

  beforeEach(async () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'file://' + path.dirname(htmlPath) + '/' // allow local script loading
    });

    await new Promise(res => dom.window.addEventListener('DOMContentLoaded', res));

    window = dom.window;
    document = window.document;
    canvas = document.getElementById('canvas');
    createCanvasItem = window.createCanvasItem;
  });

  test('creates editable text element at coordinates', () => {
    createCanvasItem('text', 'Hello', '10px', '20px');
    const item = canvas.querySelector('.canvas-item');
    expect(item).not.toBeNull();
    expect(item.textContent).toBe('Hello');
    expect(item.contentEditable).toBe('true');
    expect(item.style.left).toBe('10px');
    expect(item.style.top).toBe('20px');
  });
});
