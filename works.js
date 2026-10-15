// CSVの1行を読む。引用符で囲まれたカンマや、二重の引用符にも対応。
function parseCSVLine(line) {
  const values = [];
  let value = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    if (character === '"') {
      if (inQuotes && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  if (inQuotes) throw new Error('CSVの引用符が閉じられていません。');
  values.push(value.trim());
  return values;
}

const grid = document.querySelector('#works-grid');
const statusText = document.querySelector('#works-status');
const yearFilter = document.querySelector('#year-filter');
const i18n = window.PortfolioI18n;
let works = [];
let worksState = 'loading';
let currentCategory = 'ALL';
const categoryButtons = [...document.querySelectorAll('.filters button[data-category]')];
const categoryOrder = categoryButtons.map(button => button.dataset.category);
const symbols = { NAIL: '♡', DANCE: '♫', ART: '✿', PR: '✉', 'DESIGN / DATA': '✦' };

// CSVの文章はtextContentを使って安全に表示する。
function createCard(work, { overview = false } = {}) {
  const workTitle = i18n.workText(work, 'title');
  const card = document.createElement('article');
  card.className = 'work-card';
  const visual = document.createElement('div');
  visual.className = 'work-visual';
  visual.dataset.category = work.category;
  const symbol = document.createElement('span');
  symbol.className = 'placeholder-symbol';
  symbol.setAttribute('aria-hidden', 'true');
  symbol.textContent = symbols[work.category] || '♡';
  const category = document.createElement('span');
  category.className = 'placeholder-category';
  category.textContent = i18n.category(work.category);
  visual.append(symbol, category);
  if (work.video) {
    const video = document.createElement('video');
    video.controls = !overview;
    video.playsInline = true;
    video.preload = 'metadata';
    if (overview) {
      video.setAttribute('tabindex', '-1');
      video.setAttribute('aria-hidden', 'true');
    }
    video.style.objectPosition = work.position || '50% 50%';
    video.setAttribute('aria-label', i18n.t('videoLabel', { title: workTitle }));
    video.textContent = i18n.t('videoUnsupported');
    video.addEventListener('error', () => {
      video.remove();
      category.textContent = i18n.t('videoUnavailable');
    });
    video.src = overview ? `${work.video}#t=0.1` : work.video;
    visual.append(video);
  } else if (work.image) {
    const image = document.createElement('img');
    image.alt = workTitle;
    // hidden と遅延読み込みを併用すると、読み込み開始を待ったままになる。
    // カードの表示領域を保ち、読み込みに失敗したときだけ画像を取り除く。
    image.loading = 'lazy';
    image.style.objectPosition = work.position || '50% 50%';
    image.addEventListener('error', () => {
      console.error('作品画像を読み込めません。装飾を表示します:', work.image);
      image.remove();
    });
    image.src = work.image;
    visual.append(image);
    if (work.image2 && !overview) {
      visual.classList.add('work-visual--pair');
      const secondImage = document.createElement('img');
      secondImage.alt = i18n.t('alternateAngle', { title: workTitle });
      secondImage.loading = 'lazy';
      secondImage.style.objectPosition = work.position2 || '50% 50%';
      secondImage.addEventListener('error', () => {
        console.error('作品画像を読み込めません:', work.image2);
        secondImage.remove();
        visual.classList.remove('work-visual--pair');
      });
      image.addEventListener('error', () => visual.classList.remove('work-visual--pair'));
      secondImage.src = work.image2;
      visual.append(secondImage);
    }
  }
  const content = document.createElement('div');
  content.className = 'work-content';
  const meta = document.createElement('div');
  meta.className = 'work-meta';
  const tag = document.createElement('span');
  tag.textContent = i18n.category(work.category);
  const year = document.createElement('span');
  year.className = 'work-year';
  year.textContent = work.year;
  meta.append(tag, year);
  const title = document.createElement('h3');
  title.textContent = workTitle;
  const description = document.createElement('p');
  description.textContent = i18n.workText(work, 'description');
  content.append(meta, title, description);
  // リンクが登録されている作品だけ詳細リンクを表示。
  if (work.link && !overview) {
    const url = new URL(work.link, window.location.href);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const link = document.createElement('a');
      link.className = 'work-link';
      link.href = work.link;
      link.textContent = i18n.t('viewWork');
      content.append(link);
    }
  }
  card.append(visual, content);
  return card;
}

function workCountLabel(count) {
  return i18n.t(count === 1 ? 'workCountSingle' : 'workCount', { count });
}

function focusWorks() {
  const title = document.querySelector('#works-title');
  title.setAttribute('tabindex', '-1');
  title.focus({ preventScroll: true });
  document.querySelector('#works').scrollIntoView({ block: 'start' });
}

function createCategoryCard(category, categoryWorks) {
  // 年の絞り込み結果から、新しい作品を代表サムネイルに選ぶ。
  const representative = [...categoryWorks].sort((a, b) => Number(b.year) - Number(a.year))[0];
  const card = createCard(representative, { overview: true });
  card.classList.add('category-card');
  const visual = card.querySelector('.work-visual');
  const content = card.querySelector('.work-content');
  const name = i18n.category(category === 'PR' ? 'PR / Branding' : category);
  const title = document.createElement('h3');
  title.textContent = name;
  const count = document.createElement('p');
  count.className = 'category-work-count';
  count.textContent = workCountLabel(categoryWorks.length);
  const hint = document.createElement('span');
  hint.className = 'category-view-hint';
  hint.textContent = i18n.t('viewCategoryWorks');
  const arrow = document.createElement('span');
  arrow.className = 'category-view-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  hint.append(arrow);
  content.replaceChildren(title, count, hint);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'category-entry';
  button.setAttribute('data-target-category', category);
  button.setAttribute('aria-label', `${name} / ${workCountLabel(categoryWorks.length)} / ${i18n.t('viewCategoryWorks')}`);
  button.addEventListener('click', () => {
    selectCategory(category);
    focusWorks();
  });
  card.replaceChildren();
  button.append(visual, content);
  card.append(button);
  return card;
}

function renderWorks() {
  const visibleWorks = works.filter(work =>
    (currentCategory === 'ALL' || work.category === currentCategory) &&
    (yearFilter.value === 'ALL' || work.year === yearFilter.value)
  );
  grid.replaceChildren();
  const overview = currentCategory === 'ALL';
  grid.classList.toggle('category-overview-grid', overview);
  document.querySelector('#portfolio-categories').hidden = !overview;
  let categoryCount = 0;
  if (overview) {
    categoryOrder.filter(category => category !== 'ALL').forEach(category => {
      const categoryWorks = visibleWorks.filter(work => work.category === category);
      if (categoryWorks.length) {
        grid.append(createCategoryCard(category, categoryWorks));
        categoryCount++;
      }
    });
  } else {
    visibleWorks.forEach(work => grid.append(createCard(work)));
  }
  updateCategoryNavigation();
  statusText.textContent = worksState === 'error' ? i18n.t('loadError')
    : worksState === 'loading' ? i18n.t('作品を読み込んでいます…')
    : visibleWorks.length ? `${overview ? i18n.t('categoryCount', { count: categoryCount }) + ' / ' : ''}${workCountLabel(visibleWorks.length)} / ${i18n.category(currentCategory)} / ${yearFilter.value === 'ALL' ? i18n.t('ALL YEARS') : yearFilter.value}` : i18n.t('emptyWorks');
}

async function loadWorks() {
  try {
    const response = await fetch("works.csv");
    if (!response.ok) throw new Error(`CSVの取得に失敗しました: ${response.status}`);
    const csv = (await response.text()).replace(/^\uFEFF/, '').trim();
    const lines = csv.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSVに作品がありません。');
    const headers = parseCSVLine(lines[0]);
    const required = ['title', 'category', 'year', 'description', 'image', 'link'];
    if (!required.every(header => headers.includes(header))) throw new Error('CSVの必須列が不足しています。');
    works = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      if (values.length !== headers.length) throw new Error('CSVの列数を確認してください。');
      const work = {};
      headers.forEach((header, index) => { work[header] = values[index]; });
      if (!work.title || !work.category || !Number.isFinite(Number(work.year))) throw new Error('作品名・カテゴリー・制作年を確認してください。');
      return work;
    });
    const years = [...new Set(['2026', '2025', '2024', ...works.map(work => work.year)])].sort((a, b) => Number(b) - Number(a));
    const selectedYear = yearFilter.value;
    yearFilter.replaceChildren(new Option(i18n.t('ALL YEARS'), 'ALL'), ...years.map(year => new Option(year, year)));
    yearFilter.value = years.includes(selectedYear) ? selectedYear : 'ALL';
    worksState = 'ready';
    renderWorks();
  } catch (error) {
    console.error('作品の読み込みエラー:', error);
    worksState = 'error';
    renderWorks();
  }
}

function updateCategoryNavigation() {
  document.querySelector('#bottom-category-current').textContent = i18n.category(currentCategory);
  const index = categoryOrder.indexOf(currentCategory);
  document.querySelectorAll('.works-bottom-nav [data-category-step]').forEach(button => {
    const step = Number(button.dataset.categoryStep);
    const neighbor = categoryOrder[(index + step + categoryOrder.length) % categoryOrder.length];
    button.querySelector('[data-neighbor-category]').textContent = i18n.category(neighbor);
    button.setAttribute('aria-label', i18n.t(step < 0 ? 'previousCategory' : 'nextCategory', { category: i18n.category(neighbor) }));
  });
}

function selectCategory(category) {
  if (!categoryOrder.includes(category)) return;
  currentCategory = category;
  categoryButtons.forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderWorks();
}

categoryButtons.forEach(button => {
  button.addEventListener('click', () => selectCategory(button.dataset.category));
});

document.querySelectorAll('[data-category-step]').forEach(button => {
  button.addEventListener('click', () => {
    const index = categoryOrder.indexOf(currentCategory);
    const next = (index + Number(button.dataset.categoryStep) + categoryOrder.length) % categoryOrder.length;
    selectCategory(categoryOrder[next]);
    if (button.hasAttribute('data-scroll-works')) {
      focusWorks();
    }
  });
});

document.querySelectorAll('.interests a[data-category]').forEach(link => {
  link.addEventListener('click', () => {
    // Interests からは、そのカテゴリの全制作年を見られるようにする。
    yearFilter.value = 'ALL';
    selectCategory(link.dataset.category);
  });
});
yearFilter.addEventListener('change', renderWorks);

// スマホのメニューはボタン・背景・Escapeキーで閉じられる。
const menuButton = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('#sidebar');
const overlay = document.querySelector('.menu-overlay');
function setMenu(open) {
  sidebar.classList.toggle('open', open);
  overlay.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', i18n.t(open ? 'メニューを閉じる' : 'メニューを開く'));
  menuButton.textContent = open ? '×' : '☰';
  document.body.style.overflow = open ? 'hidden' : '';
  sidebar.inert = window.innerWidth <= 760 && !open;
}
menuButton.addEventListener('click', () => {
  if (window.innerWidth <= 760) setMenu(!sidebar.classList.contains('open'));
});
overlay.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});
window.addEventListener('resize', () => setMenu(false));
setMenu(false);

// スクロール位置にいちばん近いセクションをメニューで示す。
const sections = document.querySelectorAll('main > section');
function updateNavigation() {
  let current = 'top';
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section.id;
  });
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    const active = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();

const heroImage = document.querySelector('#hero-image');
heroImage.addEventListener('load', () => { heroImage.hidden = false; });
heroImage.addEventListener('error', () => {
  console.error('Hero画像を読み込めません。CSSの球体を表示します。');
  heroImage.hidden = true;
});
if (heroImage.complete && heroImage.naturalWidth > 0) heroImage.hidden = false;

document.querySelector('#contact-button').addEventListener('click', event => {
  const message = document.querySelector('#contact-message');
  message.hidden = !message.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!message.hidden));
});
document.addEventListener('portfolio-language-change', () => {
  categoryButtons.forEach(button => { button.textContent = i18n.category(button.dataset.category); });
  const allYears = yearFilter.querySelector('option[value="ALL"]');
  if (allYears) allYears.textContent = i18n.t('ALL YEARS');
  menuButton.setAttribute('aria-label', i18n.t(sidebar.classList.contains('open') ? 'メニューを閉じる' : 'メニューを開く'));
  renderWorks();
});
loadWorks();
