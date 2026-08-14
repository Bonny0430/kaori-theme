// ============================================================
// kaori-overlay-v3.js — 「四月与小猫」(April & Kitten) 装饰层 v3
// 职责：樱花瓣、右上角薰角色卡(01-kaori.jpg)、左下角小猫(02-cat.jpg)、
//       顶部高能区能量条、🎻 主题开关、作用域化深蓝侧边栏（效果图A）。
// 全部装饰层 pointer-events:none 不挡操作；角色卡/小猫/开关可点击。
// 图片引用：/assets/images/（apply.ps1 会自动从主题目录复制）。
// ============================================================
(function () {
  'use strict';

  if (window.kaoriThemeInjected) return;
  window.kaoriThemeInjected = true;

  var THEME_VERSION = 'v3';
  var IMAGES_PATH = '/assets/images/';

  // ========== 台词文案（顶部与立绘下方各一份，可分别修改）==========
  var TOP_CAPTION = '只要有你在，春天就不会结束';
  var CARD_CAPTION = '即使星光微弱也会照亮前路';

  // ========== 基础工具 ==========
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ========== 樱花瓣（14 片，天蓝/柔粉/暖金三色）==========
  function createPetals() {
    var container = document.createElement('div');
    container.id = 'kaori-petals';
    var kinds = ['sky', 'pink', 'gold'];
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('div');
      p.className = 'kaori-petal';
      p.setAttribute('data-kind', kinds[i % kinds.length]);
      p.style.left = Math.random() * 100 + '%';
      p.style.width = (10 + Math.random() * 8) + 'px';
      p.style.height = p.style.width;
      p.style.setProperty('--fall-duration', (10 + Math.random() * 6) + 's');
      p.style.setProperty('--fall-delay', (Math.random() * 8) + 's');
      p.style.setProperty('--sway', (10 + Math.random() * 20) + 'px');
      p.style.setProperty('--drift', (Math.random() * 40) + 'px');
      container.appendChild(p);
    }
    document.body.appendChild(container);
  }

  // ========== 右侧中部：薰立绘（含台词）==========
  function createCard(host) {
    var card = document.createElement('div');
    card.id = 'kaori-card';

    var img = document.createElement('img');
    img.src = IMAGES_PATH + '01-kaori.jpg';
    img.alt = 'Kaori';
    img.onerror = function () {
      img.style.display = 'none';
      var ph = document.createElement('div');
      ph.style.cssText = 'display:flex;align-items:center;justify-content:center;height:128px;color:#4682B4;font-size:36px;';
      ph.textContent = '🎻';
      card.insertBefore(ph, card.firstChild);
    };
    card.appendChild(img);

    var cap = document.createElement('div');
    cap.className = 'kaori-caption';
    cap.textContent = CARD_CAPTION;
    card.appendChild(cap);

    host.appendChild(card);
  }

  // ========== 小猫头像 ==========
  function createCat(host) {
    var cat = document.createElement('div');
    cat.id = 'kaori-cat';

    var img = document.createElement('img');
    img.src = IMAGES_PATH + '02-cat.jpg';
    img.alt = 'Cat';
    img.onerror = function () {
      cat.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#50C878;font-size:28px;">🐱</div>';
    };
    cat.appendChild(img);

    host.appendChild(cat);
  }

  // ========== 高能区：顶部能量条（效果图B 概念）==========
  var energyTimer = null;

  function findFrame() {
    var root = document.getElementById('root');
    if (!root) return null;
    var found = null;
    (function walk(el) {
      if (found) return;
      var s = getComputedStyle(el);
      if (s.display === 'grid' && s.height === '100%' && s.gridTemplateColumns.split(' ').length >= 2) {
        found = el;
        return;
      }
      for (var i = 0; i < el.children.length; i++) walk(el.children[i]);
    })(root);
    return found;
  }

  function findScrollContainer(root) {
    var best = null;
    var bestH = 0;
    (function scan(el) {
      var s = getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.clientHeight > 200 && el.scrollHeight > el.clientHeight) {
        if (el.scrollHeight > bestH) { bestH = el.scrollHeight; best = el; }
      }
      for (var i = 0; i < el.children.length; i++) scan(el.children[i]);
    })(root);
    return best;
  }

  function countProgress() {
    // 优先：轨迹面板的回合数（tr[data-turn-start="true"] 来自 dsh-client-ui-trajectory）
    var turns = document.querySelectorAll('tr[data-turn-start="true"]').length;
    if (turns > 0) return turns;
    // 回退：中央对话滚动区里带文本的内容块数
    var frame = findFrame();
    if (frame && frame.children.length > 1) {
      var scroll = findScrollContainer(frame.children[1]);
      if (scroll) {
        var n = 0;
        for (var i = 0; i < scroll.children.length; i++) {
          var c = scroll.children[i];
          if (c.textContent && c.textContent.trim().length > 30 && c.getBoundingClientRect().height > 24) n++;
        }
        return n;
      }
    }
    return 0;
  }

  function updateEnergy(fill, bar) {
    var n = countProgress();
    var energy = Math.min(100, 12 + n * 7);
    fill.style.width = energy + '%';
    bar.style.display = n > 0 ? 'block' : 'none';
  }

  function createEnergyBar() {
    var bar = document.createElement('div');
    bar.className = 'kaori-energy';
    bar.style.display = 'none';

    var fill = document.createElement('div');
    fill.className = 'kaori-energy-fill';

    var note = document.createElement('span');
    note.className = 'kaori-energy-note';
    note.textContent = '🎵';

    bar.appendChild(fill);
    bar.appendChild(note);
    document.body.appendChild(bar);

    updateEnergy(fill, bar);

    // 监听消息/回合变化（挂在 body 上，防 SPA 重渲染）
    var observer = new MutationObserver(function () {
      clearTimeout(energyTimer);
      energyTimer = setTimeout(function () { updateEnergy(fill, bar); }, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ========== 🎻 主题开关（返回按钮，由调用方决定放置位置）==========
  function createToggle() {
    var btn = document.createElement('button');
    btn.className = 'kaori-theme-toggle';
    btn.type = 'button';
    btn.title = '切换主题';
    btn.textContent = '🎻';
    btn.addEventListener('click', function () {
      var off = document.body.classList.toggle('kaori-theme-off');
      var link = document.querySelector('link[href*="kaori-kitten.css"]');
      if (link) link.disabled = off;
    });
    return btn;
  }

  // ========== 顶部台词 + 开关（顶部偏右侧，避开头部按钮区）==========
  function placeHeaderDecor(toggle) {
    var cap = document.createElement('span');
    cap.className = 'kaori-top-caption';
    cap.textContent = TOP_CAPTION;

    var wrap = document.createElement('div');
    wrap.className = 'kaori-top-decor';
    wrap.appendChild(cap);
    toggle.style.position = 'static';
    toggle.style.width = '28px';
    toggle.style.height = '28px';
    toggle.style.fontSize = '15px';
    wrap.appendChild(toggle);
    document.body.appendChild(wrap);
    console.log('[Kaori Theme v3] header caption top-right ✓');
    return { row: null, cap: cap, toggle: toggle };
  }

  // ========== 作用域化深蓝侧边栏（效果图A，找不到则安全跳过）==========
  function scopeSidebar() {
    try {
      var frame = findFrame();
      if (!frame || !frame.children.length) return;
      var first = frame.children[0];
      var rect = first.getBoundingClientRect();
      // 首列必须是窄列（侧边栏），且含按钮，才打标
      if (rect.width > 0 && rect.width < 420 && first.querySelector('button')) {
        first.classList.add('kaori-sidebar-v3');
        console.log('[Kaori Theme v3] sidebar scoped ✓');
      } else {
        console.warn('[Kaori Theme v3] sidebar not scoped (heuristic miss)');
      }
    } catch (e) {
      console.warn('[Kaori Theme v3] sidebar scoping skipped:', e);
    }
  }

  // ========== 右侧面板检测：按详情列实际宽度判断（避免属性误判）==========
  function watchDetailsPanel() {
    try {
      var frame = findFrame();
      if (!frame) return;
      var sync = function () {
        var open = false;
        if (frame && frame.children.length > 2) {
          var rect = frame.children[2].getBoundingClientRect();
          open = rect.width > 40; // 详情列真实展开才视为打开
        }
        document.body.classList.toggle('kaori-details-open', open);
      };
      sync();
      new MutationObserver(function () { sync(); }).observe(frame, {
        attributes: true,
        childList: true,
        subtree: true
      });
      window.addEventListener('resize', sync);
    } catch (e) {
      console.warn('[Kaori Theme v3] details watcher skipped:', e);
    }
  }

  // ========== 自动化看板视图检测：切到「自动化」时隐藏底部输入框 ==========
  function watchAutomationView() {
    try {
      var sync = function () {
        // 自动化看板视图出现（.dsh-automation-shell 挂载）→ body 打标，CSS 隐藏 composer
        var onAutomation = !!document.querySelector('.dsh-automation-shell');
        document.body.classList.toggle('kaori-automation-view', onAutomation);
      };
      sync();
      new MutationObserver(function () { sync(); }).observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      console.warn('[Kaori Theme v3] automation watcher skipped:', e);
    }
  }

  // ========== 模态浮层检测：设置/图片预览等浮层打开时隐藏顶部台词装饰 ==========
  function watchModals() {
    try {
      var sync = function () {
        // 设置面板等模态浮层（role=dialog + aria-modal）出现在 DOM → 隐藏顶部装饰
        var modal = !!document.querySelector('[role="dialog"][aria-modal="true"]');
        document.body.classList.toggle('kaori-modal-open', modal);
      };
      sync();
      new MutationObserver(function () { sync(); }).observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      console.warn('[Kaori Theme v3] modal watcher skipped:', e);
    }
  }

  // ========== 运行时诊断（帮助定位配色未生效的问题）==========
  function logDiagnostics() {
    try {
      var s = getComputedStyle(document.body);
      var dark = document.body.hasAttribute('data-ds-dark-theme');
      var link = !!document.querySelector('link[href*="kaori-kitten.css"]');
      var cap = !!document.querySelector('.kaori-top-caption');
      var tablist = !!document.querySelector('[role="tablist"]');
      var frame = !!findFrame();
      var diag = '[Kaori v3 diag] dark=' + dark + ' cssLink=' + link +
        ' | bg-base=' + s.getPropertyValue('--dsw-alias-bg-base') +
        ' | brand=' + s.getPropertyValue('--dsw-alias-brand-primary') +
        ' | layer2=' + s.getPropertyValue('--dsw-alias-bg-layer-2') +
        ' | borderL2=' + s.getPropertyValue('--dsw-alias-border-l2') +
        ' | bodyInline=' + (document.body.getAttribute('style') || 'none') +
        ' | caption=' + cap + ' tablist=' + tablist + ' frame=' + frame;
      var dialogs = document.querySelectorAll('[role="dialog"], [class*="panel"]');
      for (var i = 0; i < dialogs.length && i < 5; i++) {
        var bg = getComputedStyle(dialogs[i]).backgroundColor;
        diag += ' | panel#' + i + ' bg=' + bg;
      }
      console.log(diag);
    } catch (e) {
      console.warn('[Kaori v3 diag] failed:', e);
    }
  }

  // ========== 启动 ==========
  function run() {
    // 延迟确保 DSW 已渲染出框架
    setTimeout(function () {
      createPetals();
      var companions = document.createElement('div');
      companions.className = 'kaori-companions';
      createCard(companions);
      createCat(companions);
      document.body.appendChild(companions);
      createEnergyBar();
      var toggle = createToggle();
      placeHeaderDecor(toggle);
      scopeSidebar();
      watchDetailsPanel();
      watchAutomationView();
      watchModals();
      logDiagnostics();
      console.log('[Kaori Theme v3] 🎻 April & Kitten initialized');
    }, 500);
    // 稍后再报一次诊断（此时设置等浮层可能已挂载）
    setTimeout(logDiagnostics, 3000);
  }

  ready(run);
})();
