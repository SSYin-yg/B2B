/**
 * 设备详情页共享渲染逻辑
 * 各静态设备页通过 window.MineLinkProductInit(id) 调用
 * 处理：多语言渲染、画廊、型号表、相关设备、询价弹窗
 */
(function () {
  var typeZh = { mobile: '移动破碎站', crushing: '破碎制砂', screening: '筛分输送', washing: '洗砂设备', parts: '易损件' };
  var typeEn = { mobile: 'Mobile crushing', crushing: 'Crushing & sand', screening: 'Screening & feed', washing: 'Sand washing', parts: 'Wear parts' };
  // 设备页路径深度：中文 equipment/ → ../  英文 en/equipment/ → ../../
  var isEnPage = location.pathname.indexOf('/en/equipment/') !== -1;
  var basePath = isEnPage ? '../../' : (location.pathname.indexOf('/equipment/') !== -1 ? '../' : '');

  function lang() {
    try { return localStorage.getItem('minelink-lang') || 'zh'; } catch (e) { return 'zh'; }
  }
  function isEn() { return lang() === 'en'; }

  function findProduct(id) {
    /* 静态生成页：优先使用页面内嵌数据（不再依赖 equipment-data.js） */
    if (window.__pageData && window.__pageData.product) {
      var p = window.__pageData.product;
      if (p && p.id === id) {
        return {
          id: p.id,
          en: p.en,
          cn: p.cn,
          type: p.type,
          images: p.images || [],
          desc_zh: p.desc_zh,
          desc_en: p.desc_en,
          features_zh: p.features_zh || [],
          features_en: p.features_en || [],
          specs: p.specs || [],
          modelTables: window.__pageData.modelTables || [],
          related: window.__pageData.related || []
        };
      }
      return null;
    }
    var list = window.MinelinkEquipment || [];
    var found = list.find(function (x) { return x.id === id; }) || null;
    if (found && !found.modelTables && window.MinelinkModelTables && window.MinelinkModelTables[found.id]) {
      found.modelTables = window.MinelinkModelTables[found.id];
    }
    return found;
  }

  function imgPath(src) {
    if (!src) return src;
    return src.indexOf('http') === 0 ? src : basePath + src;
  }

  function imgTag(src, alt) {
    return '<img src="' + imgPath(src) + '" alt="' + (alt || '') + '" loading="lazy" onerror="this.style.display=\'none\';var p=this.nextElementSibling;if(p)p.style.display=\'grid\';" />';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderModelTables(tables) {
    if (!tables || !tables.length) return '';
    var en = isEn();
    return tables.map(function (t) {
      var title = en ? (t.title_en || t.title_zh) : (t.title_zh || t.title_en);
      var cols = t.columns || [];
      var head = cols.map(function (c) {
        return '<th>' + escapeHtml(en ? c.en : c.zh) + '</th>';
      }).join('');
      var body = (t.rows || []).map(function (row) {
        return '<tr>' + row.map(function (cell) {
          return '<td>' + escapeHtml(cell) + '</td>';
        }).join('') + '</tr>';
      }).join('');
      return '<div class="model-table-wrap">' +
        '<div class="block-title">' + escapeHtml(title) + '</div>' +
        '<div class="model-table-scroll"><table class="model-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '</div>';
    }).join('');
  }

  function render(product) {
    var root = document.getElementById('productRoot');
    var bc = document.getElementById('bcName');
    if (!product) {
      document.title = (isEn() ? 'Not found' : '未找到设备') + ' | 矿联矿机';
      bc.textContent = '—';
      root.innerHTML = '<div class="product-missing"><h1>' + (isEn() ? 'Equipment not found' : '未找到设备') + '</h1><p>' + (isEn() ? 'Please return to the catalog and choose a model.' : '请返回设备目录重新选择。') + '</p><a class="primary" href="' + basePath + 'equipment-catalog.html" style="display:inline-block">' + (isEn() ? 'Back to catalog' : '返回设备目录') + '</a></div>';
      return;
    }

    var name = isEn() ? product.en : product.cn;
    var typeLabel = (isEn() ? typeEn : typeZh)[product.type] || product.type;
    var desc = isEn() ? product.desc_en : product.desc_zh;
    var features = isEn() ? product.features_en : product.features_zh;
    var images = (product.images && product.images.length) ? product.images : [];

    document.title = name + ' | 矿联矿机';
    bc.textContent = name;

    var mainImg = images[0] || '';
    var thumbs = images.map(function (src, i) {
      return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-src="' + src + '">' +
        imgTag(src, name) + '<span class="thumb-ph" style="display:none"></span></button>';
    }).join('');

    var featureHtml = (features || []).map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('');
    var specsHtml = (product.specs || []).map(function (s) {
      return '<tr><th>' + escapeHtml(isEn() ? s.k_en : s.k_zh) + '</th><td>' + escapeHtml(s.v) + '</td></tr>';
    }).join('');
    var modelTablesHtml = renderModelTables(product.modelTables);

    /* 相关设备：静态生成页用内嵌 related；旧页面按同类计算 */
    var relatedHtml = '';
    if (product.related && product.related.length) {
      relatedHtml = product.related.map(function (p) {
        var n = isEn() ? p.en : p.cn;
        var t = (isEn() ? typeEn : typeZh)[p.type] || '';
        var img = p.img ? imgTag(p.img, n) + '<span class="ph" style="display:none"></span>' : '<span class="ph"></span>';
        return '<a class="related-card" href="' + encodeURIComponent(p.id) + '.html">' +
          '<div class="rc-art">' + img + '</div>' +
          '<div class="rc-body"><div class="rc-type">' + t + '</div><h3>' + escapeHtml(n) + '</h3></div></a>';
      }).join('');
    } else {
      var related = (window.MinelinkEquipment || []).filter(function (p) {
        return p.type === product.type && p.id !== product.id;
      }).slice(0, 3);
      relatedHtml = related.map(function (p) {
        var n = isEn() ? p.en : p.cn;
        var t = (isEn() ? typeEn : typeZh)[p.type] || '';
        var img = (p.images && p.images[0]) ? imgTag(p.images[0], n) + '<span class="ph" style="display:none"></span>' : '<span class="ph"></span>';
        return '<a class="related-card" href="' + encodeURIComponent(p.id) + '.html">' +
          '<div class="rc-art">' + img + '</div>' +
          '<div class="rc-body"><div class="rc-type">' + t + '</div><h3>' + escapeHtml(n) + '</h3></div></a>';
      }).join('');
    }

    root.innerHTML =
      '<div class="product-layout">' +
        '<div class="gallery">' +
          '<div class="gallery-main" id="galleryMain">' +
            (mainImg ? imgTag(mainImg, name) + '<div class="placeholder" style="display:none">' + product.id.toUpperCase().slice(0, 6) + '</div>' : '<div class="placeholder">' + product.id.toUpperCase().slice(0, 6) + '</div>') +
          '</div>' +
          (thumbs ? '<div class="gallery-thumbs" id="galleryThumbs">' + thumbs + '</div>' : '') +
        '</div>' +
        '<div class="product-info">' +
          '<div class="product-type">' + typeLabel + '</div>' +
          '<h1 class="product-title">' + escapeHtml(name) + '</h1>' +
          '<p class="product-desc">' + escapeHtml(desc) + '</p>' +
          '<div class="product-actions">' +
            '<button type="button" class="primary open-modal" id="quoteThis">' + (isEn() ? 'Get a quote' : '获取报价') + '</button>' +
            '<a class="ghost" href="' + basePath + 'equipment-catalog.html?filter=' + encodeURIComponent(product.type) + '">' + (isEn() ? 'More in this category' : '查看同类设备') + '</a>' +
          '</div>' +
          (featureHtml ? '<div class="block-title">' + (isEn() ? 'Highlights' : '产品特点') + '</div><ul class="feature-list">' + featureHtml + '</ul>' : '') +
          (specsHtml ? '<div class="block-title">' + (isEn() ? 'Key parameters' : '主要参数') + '</div><table class="specs"><tbody>' + specsHtml + '</tbody></table>' : '') +
          '<p class="product-note">' + (isEn()
            ? 'Specifications are typical ranges. Final configuration depends on ore, capacity and site conditions. Request a quote for a tailored proposal.'
            : '以上参数为常见配置区间，最终方案需结合矿石、产能与场地条件确定。提交询价后顾问将为您出具专属配置。') + '</p>' +
        '</div>' +
      '</div>' +
      (modelTablesHtml ? '<div class="model-section">' + modelTablesHtml + '</div>' : '') +
      (relatedHtml ? '<div class="related"><h2>' + (isEn() ? 'Related equipment' : '相关设备') + '</h2><div class="related-grid">' + relatedHtml + '</div></div>' : '');

    var thumbsEl = document.getElementById('galleryThumbs');
    var mainEl = document.getElementById('galleryMain');
    if (thumbsEl && mainEl) {
      thumbsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-src]');
        if (!btn) return;
        thumbsEl.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var src = btn.getAttribute('data-src');
        mainEl.innerHTML = imgTag(src, name) + '<div class="placeholder" style="display:none">' + product.id.toUpperCase().slice(0, 6) + '</div>';
      });
    }

    window.__currentProduct = { en: product.en, cn: product.cn };
  }

  function openModal() {
    var modal = document.getElementById('modal');
    var select = document.getElementById('productSelect');
    var prev = select.querySelector('option[data-dynamic="1"]');
    if (prev) prev.remove();
    var cur = window.__currentProduct;
    if (cur) {
      var opt = document.createElement('option');
      opt.value = cur.en;
      opt.textContent = isEn() ? cur.en : cur.cn;
      opt.setAttribute('data-dynamic', '1');
      select.prepend(opt);
      select.value = cur.en;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    var modal = document.getElementById('modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  var currentId = null;

  function init(id) {
    currentId = id;
    render(findProduct(id));

    document.addEventListener('click', function (e) {
      if (e.target.closest('.open-modal')) openModal();
    });
    var closeBtn = document.getElementById('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    var modalEl = document.getElementById('modal');
    if (modalEl) modalEl.addEventListener('click', function (e) {
      if (e.target.id === 'modal') closeModal();
    });
    /* 询盘表单提交由 assets/inquiry-form.js 统一处理（POST /api/inquiry） */
    var menuToggle = document.getElementById('menuToggle');
    if (menuToggle) menuToggle.addEventListener('click', function () {
      document.getElementById('nav').classList.toggle('open');
    });

    /* 语言切换：设备详情页直接跳转对应语言 URL */
    var langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var targetLang = btn.dataset.lang;
        var slug = currentId;
        if (!slug) return;
        /* 当前页语言与目标语言一致则不跳转 */
        if ((targetLang === 'en' && isEnPage) || (targetLang === 'zh' && !isEnPage)) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        /* 关键：导航前先把目标语言写入 localStorage，避免新页面因
           detectLangByIP 读到旧值而用错误语言渲染（例如从 /en/ 跳到
           /equipment/ 但 localStorage 仍为 'en' 导致中文页显示英文） */
        try { localStorage.setItem('minelink-lang', targetLang); } catch (err) {}
        if (targetLang === 'en') {
          /* 中文 → 英文：../en/equipment/{slug}.html */
          location.href = basePath + 'en/equipment/' + encodeURIComponent(slug) + '.html';
        } else {
          /* 英文 → 中文：../../equipment/{slug}.html */
          location.href = basePath + 'equipment/' + encodeURIComponent(slug) + '.html';
        }
      }, true);
    });

    document.addEventListener('minelink:lang', function () {
      render(findProduct(currentId));
    });
  }

  window.MineLinkProductInit = init;
})();
