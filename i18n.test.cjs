// Node標準機能だけで、翻訳と既存の操作を検証する軽量DOMテスト。
// レイアウト・画像デコード・実ブラウザの検証は対象外。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const decode = text => text.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replaceAll('&amp;', '&');

class TextNode {
  constructor(value, parent) { this.nodeValue = value; this.parentElement = parent; this.nodeType = 3; }
  get textContent() { return this.nodeValue; }
}
class Element {
  constructor(tag, attributes = {}) {
    this.tagName = tag; this.attributes = attributes; this.children = []; this.nodeType = 1;
    this.dataset = Object.fromEntries(Object.entries(attributes).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]));
    this.style = {}; this.listeners = {}; this.hidden = 'hidden' in attributes; this.value = attributes.value || '';
    this.classList = {
      contains: value => this.className.split(/\s+/).includes(value),
      toggle: (value, active) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        (active ?? !classes.has(value)) ? classes.add(value) : classes.delete(value);
        this.className = [...classes].join(' ');
      },
      add: value => this.classList.toggle(value, true), remove: value => this.classList.toggle(value, false)
    };
  }
  get className() { return this.attributes.class || ''; }
  set className(value) { this.attributes.class = value; }
  append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
  replaceChildren(...nodes) { this.children.forEach(n => { n.parentElement = null; }); this.children = []; this.append(...nodes); if (this.tagName === 'select') this.value = nodes[0]?.value; }
  get textContent() { return this.children.map(n => n.textContent).join(''); }
  set textContent(value) { this.replaceChildren(new TextNode(String(value), this)); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  hasAttribute(key) { return key in this.attributes; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  removeAttribute(key) { delete this.attributes[key]; }
  matches(selector) {
    for (const attribute of selector.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)) {
      if (!this.hasAttribute(attribute[1]) || (attribute[2] !== undefined && this.getAttribute(attribute[1]) !== attribute[2])) return false;
    }
    const plain = selector.replace(/\[[^\]]*\]/g, '');
    const tag = plain.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && tag !== this.tagName) return false;
    const id = plain.match(/#([\w-]+)/)?.[1];
    if (id && this.getAttribute('id') !== id) return false;
    return [...plain.matchAll(/\.([\w-]+)/g)].every(m => this.classList.contains(m[1]));
  }
  closest(selectors) { for (let e = this; e; e = e.parentElement) if (selectors.split(',').some(s => e.matches(s.trim()))) return e; return null; }
  querySelectorAll(selectors) {
    const results = [];
    const match = (element, selector) => {
      const parts = selector.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/);
      if (!element.matches(parts.pop())) return false;
      let parent = element.parentElement;
      while (parts.length) {
        const part = parts.pop();
        if (part === '>') { if (!parent?.matches(parts.pop())) return false; parent = parent.parentElement; }
        else { while (parent && !parent.matches(part)) parent = parent.parentElement; if (!parent) return false; parent = parent.parentElement; }
      }
      return true;
    };
    const walk = element => { for (const child of element.children) if (child.nodeType === 1) { if (selectors.split(',').some(s => match(child, s))) results.push(child); walk(child); } };
    walk(this); return results;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners[event.type] || []) fn(event); }
  click() { this.dispatchEvent({ type: 'click', currentTarget: this }); }
  remove() { this.parentElement.children = this.parentElement.children.filter(n => n !== this); }
  focus(options) { this.focusOptions = options; }
  scrollIntoView(options) { this.scrollOptions = options; }
  getBoundingClientRect() { return { top: 1000 }; }
}
function parseHTML(html) {
  const document = new Element('document'); const stack = [document];
  for (const token of html.match(/<[^>]+>|[^<]+/g)) {
    if (/^<!/.test(token)) continue;
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/)[1];
      const attrs = Object.fromEntries([...token.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].slice(1).map(m => [m[1], m[2] ?? '']));
      const element = new Element(tag, attrs); stack.at(-1).append(element);
      if (!['meta', 'link', 'img', 'br', 'input'].includes(tag)) stack.push(element);
    } else stack.at(-1).append(new TextNode(decode(token), stack.at(-1)));
  }
  document.documentElement = document.querySelector('html'); document.body = document.querySelector('body');
  document.createElement = tag => new Element(tag);
  document.createTreeWalker = element => {
    const nodes = []; const visit = e => e.children.forEach(n => n.nodeType === 3 ? nodes.push(n) : visit(n)); visit(element);
    let index = -1; return { currentNode: null, nextNode() { this.currentNode = nodes[++index]; return !!this.currentNode; } };
  };
  document.querySelector('#year-filter').value = 'ALL';
  Object.defineProperty(document, 'title', { get: () => document.querySelector('title').textContent, set: value => { document.querySelector('title').textContent = value; } });
  return document;
}
async function boot(storage = new Map(), csvFailure = false) {
  const document = parseHTML(read('index.html'));
  const context = {
    document, console, URL, NodeFilter: { SHOW_TEXT: 4 }, CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    Option: function(text, value) { const e = new Element('option', { value }); e.textContent = text; return e; },
    fetch: async () => ({ ok: !csvFailure, status: csvFailure ? 404 : 200, text: async () => read('works.csv') })
  };
  context.window = { innerWidth: 375, innerHeight: 800, location: { href: 'https://example.github.io/portfolio/' }, addEventListener() {} };
  vm.createContext(context); vm.runInContext(read('i18n.js'), context); vm.runInContext(read('works.js'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { document, context, run: code => vm.runInContext(code, context), i18n: context.window.PortfolioI18n };
}
(async () => {
  const storage = new Map(); const app = await boot(storage); const { document: doc, run, i18n } = app;
  assert.equal(i18n.language, 'ja'); assert.equal(doc.querySelectorAll('.work-card').length, 5);
  assert.equal(doc.querySelectorAll('.category-card').length, 5);
  assert.equal(doc.querySelector('[data-target-category="NAIL"] .category-work-count').textContent, '7作品');
  assert.equal(doc.querySelectorAll('.category-card img').length, 4);
  assert.equal(doc.querySelectorAll('.category-card video').length, 1);
  assert.equal(doc.querySelector('.category-card video').controls, false);
  assert.equal(doc.querySelector('#portfolio-categories').hidden, false);
  const mediaBefore = doc.querySelectorAll('img').map(e => e.getAttribute('src') || e.src).sort();
  const diaryLinks = doc.querySelectorAll('.process-photo a').map(e => e.getAttribute('href'));
  assert.equal(diaryLinks.length, 7);
  const roles = doc.querySelector('.roles');
  assert.equal(roles.querySelectorAll('.role-name').length, 1);
  assert.equal(roles.querySelector('.role-name').textContent, 'Rei');
  assert(!roles.textContent.includes('Rei Hayasaka'));
  assert.equal(roles.querySelectorAll('.role-list li').length, 3);
  assert.equal(roles.querySelector('dt').textContent, 'Choreography / Composition');
  assert.equal(roles.querySelector('dd [lang="ko"]').textContent, '그 레아');
  assert(doc.querySelector('.language-switcher').closest('#sidebar'));
  for (const locale of ['en', 'ko', 'zh', 'ja']) {
    doc.querySelector(`[data-language="${locale}"]`).click();
    assert.equal(i18n.language, locale); assert.equal(storage.get('portfolio-language'), locale);
    assert.equal(doc.documentElement.lang, locale === 'zh' ? 'zh-CN' : locale);
    assert.equal(doc.querySelectorAll('[data-language][aria-pressed="true"]').length, 1);
    assert.equal(doc.querySelectorAll('.category-card').length, 5);
    assert.equal(doc.querySelector('[data-target-category="NAIL"] .category-work-count').textContent, i18n.t('workCount', { count: 7 }));
    assert.equal(doc.querySelector('[data-target-category="DANCE"] .category-work-count').textContent, i18n.t('workCountSingle'));
    const chineseLabels = { ja: '中国語（勉強中）', en: 'Chinese — Currently Learning', ko: '중국어 — 공부 중', zh: '中文 — 学习中' };
    assert.equal(doc.querySelector('.chinese-learning').textContent, chineseLabels[locale]);
    if (locale === 'ja') assert(!/Currently Learning|Learning/.test(doc.querySelector('.languages').textContent));
    assert.equal(roles.querySelector('.role-name').textContent, 'Rei');
    assert(!roles.textContent.includes('Rei Hayasaka'));
    assert.equal(roles.querySelector('dt').textContent, i18n.t('Choreography / Composition'));
    assert.equal(roles.querySelector('dd [lang="ko"]').textContent, '그 레아');
    assert.equal(roles.querySelector('.role-description').textContent, i18n.t('韓国関連の振付・作曲活動で使用している活動名。'));
    assert.equal(doc.querySelector('.hero-description').textContent.includes(i18n.t('だれかの毎日をちょっと特別に。')), true);
    assert.equal(doc.querySelector('#nail-process-title').textContent, i18n.t('Nail の制作過程'));
    assert.equal(doc.querySelector('#contact-message').textContent, i18n.t('連絡先は準備中です。公開までお待ちください ♡'));
    for (const work of run('works')) {
      for (const field of ['title', 'description']) assert(work[`${field}_${locale}`], `${field}_${locale}`);
      const card = run('createCard')(work);
      assert.equal(card.querySelector('h3').textContent, work[`title_${locale}`]);
      assert.equal(card.querySelector('.work-content p').textContent, work[`description_${locale}`]);
    }
    assert.deepEqual(doc.querySelectorAll('img').map(e => e.getAttribute('src') || e.src).sort(), mediaBefore);
    assert.deepEqual(doc.querySelectorAll('.process-photo a').map(e => e.getAttribute('href')), diaryLinks);
  }
  // 概要カードからの移動と、年で絞ったときの自動集計。
  doc.querySelector('[data-target-category="NAIL"]').click();
  assert.equal(run('currentCategory'), 'NAIL');
  assert.equal(doc.querySelectorAll('.work-card').length, 7);
  assert.equal(doc.querySelector('#portfolio-categories').hidden, true);
  run("selectCategory('ALL')");
  doc.querySelector('#year-filter').value = '2024';
  doc.querySelector('#year-filter').dispatchEvent({ type: 'change' });
  assert.equal(doc.querySelectorAll('.category-card').length, 1);
  assert.equal(doc.querySelector('.category-work-count').textContent, i18n.t('workCount', { count: 4 }));
  doc.querySelector('[data-target-category="NAIL"]').click();
  assert.equal(doc.querySelector('#year-filter').value, '2024');
  assert.equal(doc.querySelectorAll('.work-card').length, 4);
  run("selectCategory('ALL')");
  doc.querySelector('#year-filter').value = '2026';
  doc.querySelector('#year-filter').dispatchEvent({ type: 'change' });
  assert.equal(doc.querySelectorAll('.category-card').length, 5);
  doc.querySelector('[data-target-category="ART"]').click();
  assert.equal(run('currentCategory'), 'ART');
  assert.equal(doc.querySelectorAll('.work-card').length, 1);
  // CSVの作品を追加すると概要の件数も追従する。
  run("works.push({...works.find(work => work.category === 'NAIL'), title: 'Fixture', year: '2026'}); selectCategory('ALL')");
  assert.equal(doc.querySelector('[data-target-category="NAIL"] .category-work-count').textContent, i18n.t('workCount', { count: 2 }));
  run('works.pop()');
  doc.querySelector('#year-filter').value = '2025'; run("selectCategory('NAIL')");
  assert.equal(doc.querySelectorAll('.work-card').length, 2);
  i18n.setLanguage('ko'); assert.equal(run('currentCategory'), 'NAIL'); assert.equal(doc.querySelector('#year-filter').value, '2025');
  assert.equal(doc.querySelectorAll('.work-card').length, 2);
  assert.equal(doc.querySelector('#bottom-category-current').textContent, '네일');
  doc.querySelector('.works-bottom-nav [data-category-step="1"]').click();
  assert.equal(run('currentCategory'), 'DANCE'); assert.equal(doc.querySelector('#year-filter').value, '2025');
  assert.equal(doc.querySelectorAll('.work-card').length, 0); assert.equal(doc.querySelector('#works-status').textContent, i18n.t('emptyWorks'));
  assert.equal(doc.querySelector('#works').scrollOptions.block, 'start');
  doc.querySelector('.interests [data-category="NAIL"]').click(); assert.equal(doc.querySelector('#year-filter').value, 'ALL');
  assert.equal(doc.querySelectorAll('.work-card').length, 7); assert.equal(doc.querySelectorAll('.work-visual--pair img').length, 2);
  doc.querySelector('.menu-toggle').click(); i18n.setLanguage('zh');
  assert.equal(doc.querySelector('.menu-toggle').getAttribute('aria-label'), i18n.t('メニューを閉じる'));
  doc.querySelector('#contact-button').click(); i18n.setLanguage('en'); assert.equal(doc.querySelector('#contact-message').hidden, false);
  i18n.setLanguage('ko'); const refreshed = await boot(storage); assert.equal(refreshed.i18n.language, 'ko');
  assert.equal(refreshed.document.documentElement.lang, 'ko');
  const invalid = await boot(new Map([['portfolio-language', 'invalid']])); assert.equal(invalid.i18n.language, 'ja');
  const blocked = await boot({ get() { throw Error('Storage unavailable'); }, set() { throw Error('Storage unavailable'); } });
  blocked.i18n.setLanguage('zh'); assert.equal(blocked.i18n.language, 'zh');
  const failure = await boot(new Map(), true); failure.i18n.setLanguage('ko'); assert.equal(failure.document.querySelector('#works-status').textContent, failure.i18n.t('loadError'));
  // 全固定文言の辞書漏れも確認。人名、言語コード、記号、年は翻訳しない。
  const original = parseHTML(read('index.html'));
  const walker = original.createTreeWalker(original.documentElement);
  const unchanged = /^(?:REI HAYASAKA(?: \| Creative Portfolio)?|REI|HAYASAKA|Rei|Rei Hayasaka|그 레아|JP|EN|KR|CN|PR|中文|© 2026 REI HAYASAKA|[\d\s⌂♙□▤✉♡🍒🎀✦☰→←—]+)$/u;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, title, .language-switcher')) continue;
    const text = node.nodeValue.trim();
    if (text && !unchanged.test(text)) assert.notEqual(i18n.t(text), text, `Missing Korean translation: ${text}`);
  }
  for (const work of run('works')) for (const key of ['image', 'image2', 'video']) if (work[key]) assert(fs.existsSync(path.join(root, work[key])));
  for (const file of ['index.html', 'i18n.js', 'works.js', 'works.csv', 'style.css']) {
    assert(!/東京都市大学|デザイン・データ科学部|NEWEST|OLDEST/.test(read(file)));
  }
  console.log('PASS: 4 languages, CSV translations, saved/reloaded language, storage restrictions, menu, Roles names, category/year state, top/bottom navigation, media/Diary preservation, and translated errors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
