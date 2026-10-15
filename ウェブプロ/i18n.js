// 静的な翻訳辞書。外部サービスを使わず、元のテキストノードだけを更新する。
(() => {
  const locales = ['ja', 'en', 'ko', 'zh'];
  const rows = [
    ['本文へ移動', 'Skip to content', '본문으로 이동', '跳至正文'],
    ['Creative Portfolio', 'Creative Portfolio', '크리에이티브 포트폴리오', '创意作品集'],
    ['Home', 'Home', '홈', '首页'], ['About', 'About', '소개', '关于我'],
    ['Works', 'Works', '작품', '作品'], ['Diary', 'Diary', '작업 일지', '创作日记'],
    ['Contact', 'Contact', '연락', '联系'],
    ['Made with love', 'Made with love', '마음을 담아', '用心制作'],
    ['TOKYO, JAPAN / 2026', 'TOKYO, JAPAN / 2026', '일본 도쿄 / 2026', '日本东京 / 2026'],
    ['A LITTLE WORLD OF THINGS I LOVE', 'A LITTLE WORLD OF THINGS I LOVE', '내가 좋아하는 것들의 작은 세계', '收藏热爱的小小世界'],
    ['好きなことで、', 'Doing what I love,', '좋아하는 것으로,', '用热爱的事物，'],
    ['かわいいをつくる', 'creating a little kawaii', '귀여움을 만들어요', '创造可爱'],
    ['かわいいで、', 'A little kawaii,', '작은 귀여움으로,', '用一份可爱，'],
    ['だれかの毎日をちょっと特別に。', 'to make someone’s everyday special.', '누군가의 일상을 조금 특별하게.', '让某个人的日常多一点特别。'],
    ['MY WORKSを見る', 'EXPLORE MY WORKS', '작품 보러 가기', '浏览我的作品'],
    ['JAPANESE UNIVERSITY STUDENT', 'UNIVERSITY STUDENT IN JAPAN', '일본의 대학생', '在日本就读的大学生'],
    ['CREATIVE / DESIGN / DANCE / CULTURE', 'CREATIVE / DESIGN / DANCE / CULTURE', '창작 / 디자인 / 댄스 / 문화', '创作 / 设计 / 舞蹈 / 文化'],
    ['my favorite things…', 'my favorite things…', '내가 좋아하는 것들…', '我喜欢的事物…'],
    ['a little bit of kawaii ♡', 'a little bit of kawaii ♡', '작은 귀여움 한 조각 ♡', '一点点可爱 ♡'],
    ['grow your own way', 'grow your own way', '나만의 방식으로 자라기', '以自己的方式成长'],
    ['collect moments,', 'collect moments,', '순간을 모아,', '收藏瞬间，'],
    ['create happiness.', 'create happiness.', '행복을 만들어요.', '创造幸福。'],
    ['SCROLL TO EXPLORE ↓', 'SCROLL TO EXPLORE ↓', '아래로 더 살펴보기 ↓', '向下探索 ↓'],
    ["01 / HELLO, I'M REI", "01 / HELLO, I'M REI", '01 / 안녕하세요, REI입니다', '01 / 你好，我是REI'],
    ['About me', 'About me', '나의 이야기', '关于我'],
    ['早坂 玲（はやさか れい）です！', 'Hi, I’m Rei Hayasaka!', '안녕하세요, Rei Hayasaka입니다!', '你好，我是早坂 玲（Rei Hayasaka）！'],
    ['都内の大学で、', 'At a university in Tokyo,', '도쿄의 대학에서', '我在东京的一所大学，'],
    ['デザインやデータサイエンスを学んでいます。', 'I study design and data science.', '디자인과 데이터 사이언스를 배우고 있어요.', '学习设计与数据科学。'],
    ['ネイル、ダンス、アート、デザイン、PR・ブランディング、データ分析など、好きなことを組み合わせながら幅広いクリエイティブ活動に挑戦しています。', 'I explore a wide range of creative activities, combining my interests in nails, dance, art, design, PR, branding, and data analysis.', '네일, 댄스, 아트, 디자인, PR·브랜딩, 데이터 분석 등 좋아하는 것들을 연결하며 다양한 창작 활동에 도전하고 있어요.', '我将美甲、舞蹈、艺术、设计、公关与品牌、数据分析等兴趣结合起来，尝试多样的创作活动。'],
    ['「好き」をかたちにして、見る人の心が少し動くようなものをつくることが目標です。', 'My goal is to turn what I love into things that move people, even just a little.', '좋아하는 것을 형태로 만들어, 보는 사람의 마음을 조금 움직이는 작품을 만들고 싶어요.', '我希望将热爱化为作品，让观看的人心中泛起一点涟漪。'],
    ['My Interests', 'My Interests', '관심사', '我的兴趣'],
    ['Nail', 'Nail', '네일', '美甲'], ['Dance', 'Dance', '댄스', '舞蹈'],
    ['Art', 'Art', '아트', '艺术'], ['PR / Branding', 'PR / Branding', 'PR / 브랜딩', '公关 / 品牌'],
    ['Design / Data', 'Design / Data', '디자인 / 데이터', '设计 / 数据'],
    ['Travel', 'Travel', '여행', '旅行'], ['Kawaii things...', 'Kawaii things...', '귀여운 것들...', '可爱的事物…'],
    ['Languages', 'Languages', '언어', '语言'],
    ['Japanese', 'Japanese', '일본어', '日语'], ['English', 'English', '영어', '英语'],
    ['Korean', 'Korean', '한국어', '韩语'],
    ['中国語（勉強中）', 'Chinese — Currently Learning', '중국어 — 공부 중', '中文 — 学习中'],
    ['Roles', 'Roles', '활동', '职业与活动'],
    ['Choreography / Composition', 'Choreography / Composition', '안무 / 작곡', '编舞 / 作曲'],
    ['韓国関連の振付・作曲活動で使用している活動名。', 'Creative name used for Korea-related choreography and composition.', '한국 관련 안무·작곡 활동에 사용하는 활동명입니다.', '用于韩国相关编舞与作曲活动的艺名。'],
    ['Illustrator', 'Illustrator', '일러스트레이터', '插画师'],
    ['Board Director', 'Board Director', '이사', '董事'],
    ['02 / MADE WITH LOVE', '02 / MADE WITH LOVE', '02 / 마음을 담은 작품', '02 / 用心创作'],
    ['My Works', 'My Works', '나의 작품', '我的作品'],
    ['作った作品たち', 'Things I’ve created', '지금까지 만든 작품들', '我的创作'],
    ['ALL', 'ALL', '전체', '全部'], ['NAIL', 'NAIL', '네일', '美甲'],
    ['DANCE', 'DANCE', '댄스', '舞蹈'], ['ART', 'ART', '아트', '艺术'],
    ['PR', 'PR', 'PR', '公关'], ['DESIGN / DATA', 'DESIGN / DATA', '디자인 / 데이터', '设计 / 数据'],
    ['制作年', 'Year', '제작 연도', '创作年份'], ['ALL YEARS', 'ALL YEARS', '모든 연도', '全部年份'],
    ['作品を読み込んでいます…', 'Loading works…', '작품을 불러오는 중…', '正在加载作品…'],
    ['VIEWING', 'VIEWING', '현재 카테고리', '当前分类'],
    ['作品を見るにはJavaScriptを有効にしてください。', 'Please enable JavaScript to view the works.', '작품을 보려면 JavaScript를 활성화해 주세요.', '请启用JavaScript以查看作品。'],
    ['03 / LITTLE EVERYDAY THINGS', '03 / LITTLE EVERYDAY THINGS', '03 / 일상 속 작은 순간들', '03 / 日常小事'],
    ['つくる時間も、好きなもののひとつ。', 'The time spent creating is part of what I love.', '만드는 시간도 내가 좋아하는 것 중 하나.', '创作的时光，也是我热爱的一部分。'],
    ['CREATIVE NOTES / 01', 'CREATIVE NOTES / 01', '창작 노트 / 01', '创作笔记 / 01'],
    ['CREATIVE NOTES / 02', 'CREATIVE NOTES / 02', '창작 노트 / 02', '创作笔记 / 02'],
    ['Nail の制作過程', 'Nail: Creative Process', '네일 제작 과정', '美甲创作过程'],
    ['小さなパーツをひとつずつ。配置ときらめきのバランスを探しながら。', 'One tiny piece at a time, finding the balance between placement and sparkle.', '작은 파츠를 하나씩. 배치와 반짝임의 균형을 찾아가며.', '一个个小配件，寻找布局与闪耀之间的平衡。'],
    ['01 / SMALL PARTS', '01 / SMALL PARTS', '01 / 작은 파츠', '01 / 小配件'],
    ['小さなモチーフから。', 'Starting with tiny motifs.', '작은 모티프부터.', '从小小的造型开始。'],
    ['02 / ARRANGEMENT', '02 / ARRANGEMENT', '02 / 배치', '02 / 布局'],
    ['ストーンの位置を調整。', 'Adjusting each stone’s placement.', '스톤의 위치를 조정해요.', '调整每颗饰钻的位置。'],
    ['03 / FINISHING TOUCHES', '03 / FINISHING TOUCHES', '03 / 마무리', '03 / 最后修饰'],
    ['質感と全体のバランスを確認。', 'Checking texture and overall balance.', '질감과 전체 균형을 확인해요.', '确认质感与整体平衡。'],
    ['04 / ANOTHER ANGLE', '04 / ANOTHER ANGLE', '04 / 다른 각도', '04 / 另一个角度'],
    ['角度を変えて、きらめきを楽しむ。', 'A different angle, a new sparkle.', '각도를 바꿔 반짝임을 즐겨요.', '换个角度，欣赏不一样的光彩。'],
    ['Art の制作過程', 'Art: Creative Process', '아트 제작 과정', '艺术创作过程'],
    ['色を重ねて、光を仕込む。アナログならではの筆致と質感を大切に。', 'Layering color and adding light, with a focus on the brushwork and texture of handmade art.', '색을 쌓고 빛을 더해요. 아날로그 작품만의 붓질과 질감을 소중히.', '叠加色彩，藏入光芒，珍惜手绘独有的笔触与质感。'],
    ['01 / LAYER BY LAYER', '01 / LAYER BY LAYER', '01 / 색을 겹겹이', '01 / 层层上色'],
    ['顔や髪に、少しずつ色を重ねる。', 'Building up color in the face and hair.', '얼굴과 머리카락에 조금씩 색을 쌓아요.', '为脸庞与头发逐步叠加色彩。'],
    ['02 / THE WHOLE PICTURE', '02 / THE WHOLE PICTURE', '02 / 전체 그림', '02 / 整体画面'],
    ['全体の色と構図を整えて。', 'Bringing color and composition together.', '전체 색감과 구도를 다듬어요.', '调整整体配色与构图。'],
    ['03 / A LITTLE SPARKLE', '03 / A LITTLE SPARKLE', '03 / 작은 반짝임', '03 / 一点闪耀'],
    ['瞳はジェルネイルでコーティングし、ストーンと中に仕込んだホログラムで、光を受けてきらめく仕上がりに。髪や瞼には金絵具を重ね、細かな質感までこだわりました。', 'The eyes are coated with nail gel, with stones and holographic pieces inside to catch the light. Gold paint on the hair and eyelids adds another layer of texture and shimmer.', '눈동자는 네일 젤로 코팅하고 스톤과 안쪽의 홀로그램으로 빛을 받아 반짝이게 했어요. 머리카락과 눈꺼풀에는 금색 물감을 더해 섬세한 질감까지 표현했어요.', '瞳孔用美甲凝胶包覆，搭配饰钻和内部的镭射亮片，在光线下闪耀。头发与眼睑叠加金色颜料，细细呈现质感与光泽。'],
    ['04 / SAY HELLO', '04 / SAY HELLO', '04 / 인사를 나눠요', '04 / 打个招呼'],
    ["Let's Connect!", "Let's Connect!", '함께 이야기해요!', '一起交流吧！'],
    ['一緒にかわいい何かをつくりませんか？', 'Let’s create something lovely together.', '함께 귀여운 무언가를 만들어 볼까요?', '一起创造可爱的事物吧！'],
    ['お仕事のご相談・コラボなど、', 'For work inquiries and collaborations,', '작업 의뢰나 협업 문의는', '工作咨询、合作邀约，'],
    ['お気軽にご連絡ください！', 'feel free to get in touch!', '편하게 연락해 주세요!', '欢迎随时联系！'],
    ['連絡先は準備中です。公開までお待ちください ♡', 'Contact details are coming soon. Stay tuned ♡', '연락처는 준비 중이에요. 조금만 기다려 주세요 ♡', '联系方式准备中，敬请期待 ♡'],
    ['表示言語', 'Site language', '표시 언어', '显示语言'],
    ['メニューを開く', 'Open menu', '메뉴 열기', '打开菜单'], ['メニューを閉じる', 'Close menu', '메뉴 닫기', '关闭菜单'],
    ['メインナビゲーション', 'Main navigation', '메인 메뉴', '主导航'], ['フッターナビゲーション', 'Footer navigation', '하단 메뉴', '页脚导航'],
    ['Nail designs collage', 'Nail designs collage', '네일 디자인 콜라주', '美甲设计拼贴'],
    ['Nail design collection', 'Nail design collection', '네일 디자인 모음', '美甲设计合集'],
    ['海辺の岩場と青い空に包まれた後ろ姿', 'A quiet moment among seaside rocks under a blue sky', '푸른 하늘 아래 바닷가 바위에서 보낸 순간', '蓝天下，海边岩石间的宁静瞬间'],
    ['Previous category', 'Previous category', '이전 카테고리', '上一个分类'], ['Next category', 'Next category', '다음 카테고리', '下一个分类'],
    ['作品カテゴリー', 'Work categories', '작품 카테고리', '作品分类'], ['作品一覧のカテゴリ切り替え', 'Browse work categories', '작품 카테고리 이동', '切换作品分类'],
    ['パーツづくりの写真を大きく見る', 'Enlarge the small-parts photo', '파츠 제작 사진 크게 보기', '放大配件制作照片'],
    ['指先に載せた小さな白い立体パーツ', 'A tiny white sculpted part on a fingertip', '손끝에 올린 작은 흰색 입체 파츠', '指尖上的白色立体小配件'],
    ['ストーン配置の写真を大きく見る', 'Enlarge the stone-placement photo', '스톤 배치 사진 크게 보기', '放大饰钻布局照片'],
    ['ピンセットを使い、ネイルにストーンや花を配置している手元', 'Placing stones and flowers on a nail with tweezers', '핀셋으로 네일에 스톤과 꽃을 배치하는 모습', '用镊子在美甲上摆放饰钻与花朵'],
    ['仕上がりの写真を大きく見る', 'Enlarge the finished nail photo', '완성된 네일 사진 크게 보기', '放大美甲完成照片'],
    ['リボンやパール、立体モチーフを組み合わせたネイルの仕上がり', 'Finished nails with ribbons, pearls, and sculpted motifs', '리본과 진주, 입체 모티프를 조합한 완성 네일', '搭配蝴蝶结、珍珠与立体造型的美甲成品'],
    ['別アングルの仕上がりを大きく見る', 'Enlarge the alternate-angle photo', '다른 각도의 완성 사진 크게 보기', '放大另一个角度的完成照片'],
    ['クリアな爪先にリボンやストーンが輝く、別アングルの仕上がり', 'Another angle of clear nails with sparkling ribbons and stones', '투명한 네일 위 리본과 스톤이 반짝이는 다른 각도', '另一角度下，透明甲尖上的蝴蝶结与饰钻闪耀'],
    ['Artの描き込み過程を大きく見る', 'Enlarge the painting-in-progress photo', '그림 작업 과정 크게 보기', '放大绘画过程照片'],
    ['顔や髪から色を重ねている、制作途中のイラスト', 'An illustration in progress, with color layered onto the face and hair', '얼굴과 머리카락부터 색을 쌓아 가는 작업 중인 그림', '从脸庞与头发开始上色的绘画过程'],
    ['Artの全体構図を大きく見る', 'Enlarge the full composition', '작품 전체 구도 크게 보기', '放大作品整体构图'],
    ['背景と衣装へと彩色を進めている作品全体と絵具皿', 'The full painting and palette as coloring moves to the background and clothes', '배경과 의상까지 채색을 진행하는 작품 전체와 팔레트', '正在为背景和服装上色的作品全貌与调色盘'],
    ['瞳と金絵具のディテールを大きく見る', 'Enlarge the eyes and gold-paint details', '눈동자와 금색 물감 디테일 크게 보기', '放大瞳孔与金色颜料细节'],
    ['ジェルとストーンで輝く青い瞳、金絵具を使った髪と瞼のディテール', 'Blue eyes sparkling with gel and stones, with gold-painted hair and eyelids', '젤과 스톤으로 반짝이는 푸른 눈동자, 금색 물감으로 표현한 머리카락과 눈꺼풀', '凝胶与饰钻点亮的蓝色瞳孔，金色颜料描绘的头发与眼睑'],
    ['早坂玲のクリエイティブポートフォリオ。ネイル、ダンス、アート、デザインとデータ分析。', 'Rei Hayasaka’s creative portfolio: nails, dance, art, design, and data analysis.', 'Rei Hayasaka의 크리에이티브 포트폴리오. 네일, 댄스, 아트, 디자인과 데이터 분석.', '早坂玲的创意作品集：美甲、舞蹈、艺术、设计与数据分析。'],
    ['emptyWorks', 'No works match this category and year yet.', '선택한 카테고리와 연도의 작품은 준비 중이에요.', '暂无符合所选分类和年份的作品。'],
    ['loadError', 'Could not load the works. Please check works.csv and open the site through a web server.', '작품을 불러오지 못했어요. works.csv를 확인하고 웹 서버로 열어 주세요.', '无法加载作品，请检查works.csv并通过网页服务器打开。'],
    ['workCount', '{count} works', '작품 {count}개', '{count}件作品'],
    ['workCountSingle', '1 work', '작품 1개', '1件作品'],
    ['categoryCount', '{count} categories', '카테고리 {count}개', '{count}个分类'],
    ['viewCategoryWorks', 'View Works', '작품 보기', '查看作品'],
    ['Explore My Works', 'Explore My Works', '카테고리별로 작품 둘러보기', '探索我的作品分类'],
    ['viewWork', 'View work ↗', '작품 보기 ↗', '查看作品 ↗'],
    ['videoLabel', '{title} video', '{title} 영상', '{title}视频'],
    ['videoUnsupported', 'Video playback is not supported.', '동영상 재생을 지원하지 않아요.', '不支持视频播放。'],
    ['videoUnavailable', 'Video unavailable', '영상을 불러올 수 없어요', '视频无法加载'],
    ['alternateAngle', '{title} / another angle', '{title} / 다른 각도', '{title} / 另一角度'],
    ['previousCategory', 'Previous category: {category}', '이전 카테고리: {category}', '上一个分类：{category}'],
    ['nextCategory', 'Next category: {category}', '다음 카테고리: {category}', '下一个分类：{category}']
  ];
  const japanese = {
    emptyWorks: '選択したカテゴリー・制作年の作品は準備中です。',
    loadError: '作品を読み込めませんでした。works.csvを確認し、Webサーバーで開いてください。',
    workCount: '{count}作品', workCountSingle: '1作品', categoryCount: '{count}カテゴリ',
    viewCategoryWorks: '作品を見る', viewWork: '作品を見る ↗', videoLabel: '{title}の動画',
    videoUnsupported: '動画の再生に対応していません。', videoUnavailable: '動画を読み込めませんでした',
    alternateAngle: '{title} / 別アングル', previousCategory: '前のカテゴリ：{category}', nextCategory: '次のカテゴリ：{category}'
  };
  const dictionary = new Map(rows.map(row => [row[0], row]));
  let language = 'ja';
  try { const stored = localStorage.getItem('portfolio-language'); if (locales.includes(stored)) language = stored; } catch { /* 保存が制限されていても切り替えは可能。 */ }
  function t(key, parameters = {}) {
    let value = (language === 'ja' && japanese[key]) || dictionary.get(key)?.[locales.indexOf(language)] || key;
    for (const [name, replacement] of Object.entries(parameters)) value = value.replaceAll(`{${name}}`, String(replacement));
    return value;
  }
  // 元ノードを保存するので、何度切り替えても入れ子の装飾やイベントを壊さない。
  const textBindings = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, .language-switcher')) continue;
    const key = node.nodeValue.trim();
    if (dictionary.has(key)) textBindings.push({ node, key, original: node.nodeValue });
  }
  const attributeBindings = [];
  document.querySelectorAll('[aria-label], [alt], meta[name="description"]').forEach(element => {
    if (element.closest('.language-switcher button')) return;
    for (const attribute of ['aria-label', 'alt', 'content']) {
      const key = element.getAttribute(attribute);
      if (dictionary.has(key)) attributeBindings.push({ element, attribute, key });
    }
  });
  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.title = `REI HAYASAKA | ${t('Creative Portfolio')}`;
    textBindings.forEach(({ node, key, original }) => { node.nodeValue = original.replace(key, t(key)); });
    attributeBindings.forEach(({ element, attribute, key }) => element.setAttribute(attribute, t(key)));
    document.querySelectorAll('[data-language]').forEach(button => {
      const active = button.dataset.language === language;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  window.PortfolioI18n = {
    get language() { return language; }, t,
    category: category => t(category),
    workText: (work, field) => work[`${field}_${language}`] || work[`${field}_ja`] || work[field] || '',
    setLanguage(next) {
      if (!locales.includes(next)) return;
      language = next;
      try { localStorage.setItem('portfolio-language', language); } catch { /* 表示は継続。 */ }
      applyLanguage();
      document.dispatchEvent(new CustomEvent('portfolio-language-change'));
    }
  };
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => window.PortfolioI18n.setLanguage(button.dataset.language)));
  applyLanguage();
})();
