/* ============================================================
   kaori-overlay.js — 「宫园薰 × 小猫」装饰层 v2
   - 漂浮樱花花瓣（pointer-events: none）
   - 右上角薰主题画卡（图片 + 台词小字）
   - 左下角小猫头像
   图片从 /assets/images/ 加载；缺图自动降级隐藏。
   想换成自己的图：把图片放进 kaori-theme\images\ 并命名
   kaori-portrait.jpg / cat-avatar.png 等（脚本会自动按顺序尝试
   svg → jpg → png → webp），再重跑 apply.ps1。
   ============================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* 依次尝试候选文件名，找到第一个能加载的图片 */
  function createImageWithFallback(candidates, onFail) {
    var img = document.createElement('img');
    var idx = 0;
    img.alt = '';
    img.onerror = function () {
      idx += 1;
      if (idx < candidates.length) {
        img.src = '/assets/images/' + candidates[idx];
      } else if (onFail) {
        onFail();
      }
    };
    img.src = '/assets/images/' + candidates[0];
    return img;
  }

  ready(function () {
    if (document.getElementById('kaori-petals')) return;

    /* ---- 漂浮花瓣层 ---- */
    var layer = document.createElement('div');
    layer.id = 'kaori-petals';
    layer.setAttribute('aria-hidden', 'true');

    var PETALS = 14;
    for (var i = 0; i < PETALS; i++) {
      var p = document.createElement('span');
      p.className = 'kaori-petal';
      var size = 8 + Math.random() * 10; // 8–18px
      p.style.width = size.toFixed(1) + 'px';
      p.style.height = (size * 1.15).toFixed(1) + 'px';
      p.style.left = (Math.random() * 100).toFixed(2) + 'vw';
      p.style.setProperty('--fall-duration', (9 + Math.random() * 9).toFixed(2) + 's');
      p.style.setProperty('--fall-delay', (-Math.random() * 18).toFixed(2) + 's');
      p.style.setProperty('--sway', (12 + Math.random() * 26).toFixed(1) + 'px');
      p.style.setProperty('--drift', (Math.random() * 30 - 15).toFixed(1) + 'px');
      layer.appendChild(p);
    }
    document.body.appendChild(layer);

    /* ---- 右上角：薰主题画卡（图 + 台词） ---- */
    var card = document.createElement('div');
    card.id = 'kaori-card';
    card.setAttribute('aria-hidden', 'true');
    var portrait = createImageWithFallback(
      ['kaori-portrait.svg', 'kaori-portrait.jpg', 'kaori-portrait.png', 'kaori-portrait.webp'],
      function () { card.remove(); }
    );
    var cap = document.createElement('div');
    cap.className = 'kaori-caption';
    cap.textContent = '「或许前路永夜，即便如此我也要前进，因为星光即使微弱也会为我照亮前途。」——宫园薰';
    card.appendChild(portrait);
    card.appendChild(cap);
    document.body.appendChild(card);

    /* ---- 左下角：小猫头像 ---- */
    var cat = createImageWithFallback(
      ['cat-avatar.svg', 'cat-avatar.jpg', 'cat-avatar.png', 'cat-avatar.webp'],
      function () { /* 无图则不加 */ }
    );
    cat.id = 'kaori-cat';
    document.body.appendChild(cat);

    /* 兜底标题 */
    if (document.title.indexOf('薰') === -1) {
      document.title = 'DeepSeek Harness · 薰の小猫';
    }
  });
})();
