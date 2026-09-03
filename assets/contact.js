/* 客服联系按钮组件 - 自包含（CSS+HTML+JS注入），适配PC与移动端，日夜双主题 */
(function(){
  'use strict';

  /* ========== CSS 注入 ========== */
  var css = [
    '/* ========== 主题变量 ========== */',
    '/* 默认：夜间主题（18:00-次日6:00） */',
    ':root{',
    '  --c-green:#25d366;--c-blue:#229ed9;--c-gold:#c89b3c;',
    '  --c-panel-bg:#1c1f26;        /* 抽屉面板背景 */',
    '  --c-card-bg:#262b34;         /* 联系方式卡片背景 */',
    '  --c-line:#353b47;            /* 分隔线/边框 */',
    '  --c-text:#eef1f6;            /* 主文字 */',
    '  --c-muted:#98a2b3;           /* 次要文字 */',
    '  --c-close-bg:#333a46;        /* 关闭按钮背景 */',
    '  --c-grabber:#4a5260;         /* 顶部抓手 */',
    '  --c-card-hover:#2e3540;      /* 卡片悬停 */',
    '  --c-overlay:rgba(8,10,14,.55);/* 遮罩 */',
    '  --c-shadow:rgba(0,0,0,.5);   /* 面板阴影 */',
    '}',
    '/* 日间主题（6:00-18:00） */',
    'body.theme-day{',
    '  --c-panel-bg:#ffffff;',
    '  --c-card-bg:#f6f7f9;',
    '  --c-line:#e7e9ee;',
    '  --c-text:#1a1d24;',
    '  --c-muted:#767f8d;',
    '  --c-close-bg:#eceef2;',
    '  --c-grabber:#d3d7de;',
    '  --c-card-hover:#eef0f4;',
    '  --c-overlay:rgba(15,18,25,.42);',
    '  --c-shadow:rgba(20,28,45,.16);',
    '}',
    '',
    '/* ========== 通用圆形按钮基础（PC 端竖排按钮） ========== */',
    '.contact-btn-circle{position:relative;border:0;cursor:pointer;padding:0;margin:0;text-decoration:none;border-radius:50%;box-shadow:0 8px 24px rgba(0,0,0,.25);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;transition:transform .18s cubic-bezier(.34,1.4,.64,1),box-shadow .18s;will-change:transform}',
    '.contact-btn-circle:hover{transform:translateY(-3px) scale(1.06);box-shadow:0 14px 34px rgba(0,0,0,.32)}',
    '.contact-btn-circle:active{transform:scale(.94)}',
    '.contact-btn-circle:focus-visible{outline:2px solid #4aa3ff;outline-offset:3px}',
    '.contact-btn-circle svg{display:block;width:52%;height:52%;flex:0 0 auto}',
    '.contact-btn-circle.whatsapp{background:var(--c-green)}',
    '.contact-btn-circle.telegram{background:var(--c-blue)}',
    '.contact-btn-circle.email{background:var(--c-gold)}',
    '@media(hover:none) and (pointer:coarse){.contact-btn-circle:hover{transform:none;box-shadow:0 8px 24px rgba(0,0,0,.25)}}',
    '',
    '/* PC 端悬停 tooltip（深色气泡，双主题通用） */',
    '.contact-btn-circle .contact-label{position:absolute;right:calc(100% + 14px);top:50%;transform:translateY(-50%) translateX(10px);background:#23272f;color:#fff;font-size:13px;font-weight:500;padding:9px 15px;border-radius:9px;white-space:nowrap;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .22s,transform .22s;box-shadow:0 8px 22px rgba(0,0,0,.3);line-height:1;z-index:1}',
    '.contact-btn-circle .contact-label::after{content:"";position:absolute;right:-4px;top:50%;transform:translateY(-50%) rotate(45deg);width:9px;height:9px;background:#23272f;border-radius:1px}',
    '.contact-btn-circle:hover .contact-label{opacity:1;visibility:visible;transform:translateY(-50%) translateX(0)}',
    '',
    '/* ========== 移动端：主按钮 ========== */',
    '.contact-launcher{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:1001;width:60px;height:60px;border:0;border-radius:50%;background:var(--c-green);color:#fff;cursor:pointer;box-shadow:0 10px 28px rgba(37,211,102,.35),0 4px 12px rgba(0,0,0,.25);padding:0;touch-action:manipulation;transition:transform .2s cubic-bezier(.34,1.4,.64,1);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.contact-launcher:active{transform:scale(.92)}',
    '.contact-launcher svg{display:block;width:52%;height:52%;flex:0 0 auto}',
    '.contact-launcher::after{content:"";position:absolute;inset:-7px;border:2px solid rgba(37,211,102,.5);border-radius:50%;animation:contactPulse 2.4s ease-out infinite;pointer-events:none}',
    '@media(hover:none) and (pointer:coarse){.contact-launcher:hover{transform:none}}',
    '',
    '/* ========== 移动端：遮罩层 ========== */',
    '.contact-overlay{position:fixed;inset:0;z-index:1000;background:var(--c-overlay);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s ease,visibility .3s;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}',
    '.contact-overlay.is-open{pointer-events:auto;opacity:1;visibility:visible}',
    '',
    '/* ========== 移动端：底部抽屉面板（flex 纵向布局） ========== */',
    '.contact-panel{position:fixed;left:0;right:0;bottom:0;z-index:1002;max-height:82dvh;display:flex;flex-direction:column;background:var(--c-panel-bg);color:var(--c-text);border-radius:24px 24px 0 0;box-shadow:0 -12px 48px var(--c-shadow);opacity:0;visibility:hidden;overflow:hidden;touch-action:pan-y;overscroll-behavior:contain;transform:translateY(100%);transition:transform .38s cubic-bezier(.32,.72,.35,1),opacity .28s ease,visibility .38s;will-change:transform}',
    '.contact-panel.is-open{opacity:1;visibility:visible;transform:translateY(0)}',
    '',
    '/* 顶部抓手 */',
    '.contact-panel::before{content:"";flex:0 0 auto;display:block;width:44px;height:5px;margin:12px auto 2px;border-radius:3px;background:var(--c-grabber)}',
    '',
    '/* 面板头部（显式背景，防止外部样式污染） */',
    '.contact-head{flex:0 0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 20px 16px;background:var(--c-panel-bg);border-bottom:1px solid var(--c-line)}',
    '.contact-title-row{display:flex;align-items:center;gap:9px;margin:0 0 5px}',
    '.contact-head h2{margin:0;font-size:1.15rem;font-weight:700;line-height:1.3;color:var(--c-text)}',
    '/* 在线状态绿点 */',
    '.contact-online{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:600;color:var(--c-green)}',
    '.contact-online::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c-green);box-shadow:0 0 0 3px rgba(37,211,102,.18);animation:contactBlink 2s ease-in-out infinite}',
    '@keyframes contactBlink{0%,100%{opacity:1}50%{opacity:.55}}',
    '.contact-head .contact-sub{margin:0;color:var(--c-muted);font-size:.82rem;line-height:1.45}',
    '/* 关闭按钮 */',
    '.contact-close{width:38px;height:38px;flex:0 0 auto;border:0;border-radius:50%;background:var(--c-close-bg);color:var(--c-text);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .15s;padding:0;margin-top:-2px}',
    '.contact-close:active{transform:scale(.9);background:var(--c-line)}',
    '.contact-close svg{display:block;width:48%;height:48%;flex:0 0 auto}',
    '',
    '/* 联系方式列表 */',
    '.contact-list{flex:1 1 auto;min-height:0;padding:6px 16px 14px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;background:var(--c-panel-bg)}',
    '.contact-item{position:relative;display:flex;align-items:center;gap:14px;margin-bottom:10px;padding:14px 16px;border:1px solid var(--c-line);border-radius:16px;background:var(--c-card-bg);text-decoration:none;color:var(--c-text);touch-action:manipulation;transition:background .18s,border-color .18s,transform .18s;flex:0 0 auto;box-sizing:border-box;overflow:hidden}',
    '.contact-item:last-child{margin-bottom:0}',
    '.contact-item:active{transform:scale(.98);background:var(--c-card-hover);border-color:var(--c-gold)}',
    '/* 卡片左侧品牌色条 */',
    '.contact-item::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:transparent;transition:background .18s}',
    '.contact-item.whatsapp::before{background:var(--c-green)}',
    '.contact-item.telegram::before{background:var(--c-blue)}',
    '.contact-item.email::before{background:var(--c-gold)}',
    '/* 圆形图标 */',
    '.contact-icon{width:46px;height:46px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;padding:0}',
    '.contact-icon svg{display:block;width:58%;height:58%;flex:0 0 auto}',
    '.whatsapp .contact-icon{background:var(--c-green)}',
    '.telegram .contact-icon{background:var(--c-blue)}',
    '.email .contact-icon{background:var(--c-gold)}',
    '/* 文案 */',
    '.contact-text{min-width:0;flex:1 1 auto}',
    '.contact-text strong{display:block;margin-bottom:3px;font-size:.98rem;font-weight:700;line-height:1.35;color:var(--c-text)}',
    '.contact-text small{display:block;overflow:hidden;color:var(--c-muted);font-size:.82rem;line-height:1.3;text-overflow:ellipsis;white-space:nowrap}',
    '/* 右箭头 */',
    '.contact-arrow{color:var(--c-gold);flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:20px;height:20px;opacity:.75}',
    '.contact-arrow svg{display:block;width:100%;height:100%}',
    '',
    '/* 面板底部（显式背景，防止外部 footer 样式污染） */',
    '.contact-foot{flex:0 0 auto;padding:13px 20px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--c-line);background:var(--c-panel-bg);color:var(--c-muted);font-size:.76rem;line-height:1.45;text-align:center;letter-spacing:.02em}',
    '',
    '/* 脉冲动画 */',
    '@keyframes contactPulse{0%{transform:scale(.9);opacity:.7}70%{transform:scale(1.22);opacity:0}100%{transform:scale(1.22);opacity:0}}',
    '',
    '/* 无障碍：禁用动画 */',
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}',
    'body.contact-open{overflow:hidden}',
    '',
    '/* ========== PC 端（≥1024px）：3 个独立竖排按钮，隐藏抽屉 ========== */',
    '/* 移动端默认隐藏 PC 按钮组（避免外部 nav 元素样式干扰） */',
    '.contact-pc-group{display:none}',
    '@media(min-width:1024px){',
    '  .contact-launcher,.contact-overlay,.contact-panel{display:none!important}',
    '  body.contact-open{overflow:auto}',
    '  .contact-pc-group{display:flex;position:fixed;right:26px;bottom:30px;z-index:1001;flex-direction:column;gap:16px;align-items:center}',
    '  .contact-pc-btn{width:62px;height:62px}',
    '  .contact-pc-btn svg{width:50%;height:50%}',
    '  .contact-pc-btn.whatsapp::after{content:"";position:absolute;inset:-7px;border:2px solid rgba(37,211,102,.45);border-radius:50%;animation:contactPulsePc 2.4s ease-out infinite;pointer-events:none}',
    '  @keyframes contactPulsePc{0%{transform:scale(.9);opacity:.7}70%{transform:scale(1.22);opacity:0}100%{transform:scale(1.22);opacity:0}}',
    '}',
    '',
    '/* ========== 窄屏微调（≤360px） ========== */',
    '@media(max-width:360px){',
    '  .contact-launcher{width:54px;height:54px;right:14px;bottom:calc(14px + env(safe-area-inset-bottom))}',
    '  .contact-head{padding:12px 16px 14px}',
    '  .contact-head h2{font-size:1.05rem}',
    '  .contact-list{padding:4px 12px 12px}',
    '  .contact-item{gap:12px;padding:12px 14px;border-radius:14px}',
    '  .contact-icon{width:42px;height:42px}',
    '  .contact-text strong{font-size:.92rem}',
    '  .contact-text small{font-size:.78rem}',
    '  .contact-foot{padding:11px 16px calc(12px + env(safe-area-inset-bottom));font-size:.72rem}',
    '}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ========== SVG 图标 ========== */
  var SVG = {
    launcher: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.99.97 4.29L1 23l6.71-.97C9.01 22.64 10.46 23 12 23c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.1 0-2.17-.23-3.14-.65l-.48-.21-3.96.57.57-3.96-.21-.48C4.23 14.17 4 13.1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/><circle cx="9" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.128-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.793.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.99 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.482-.18 1.898-.962 6.502-1.36 8.627-.168.9-.504 1.201-.828 1.23-.704.065-1.239-.464-1.922-.913-1.067-.7-1.67-1.137-2.71-1.822-1.198-.788-.421-1.224.262-1.93.176-.183 3.247-2.977 3.307-3.23.007-.032.014-.151-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.348-.479.329-.913.49-1.302.48-.428-.008-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.79.027-.217.322-.44.886-.67 3.478-1.516 5.786-2.515 6.923-2.997.329-.137 1.175-.434 1.175-.434.058-.021.125-.03.184-.03z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>'
  };

  /* ========== 联系方式数据 ========== */
  var CONTACTS = {
    whatsapp: { href: 'https://wa.me/8613262197959', label: 'WhatsApp', value: '+86 13262197959', tip: 'WhatsApp 在线咨询' },
    telegram: { href: 'https://t.me/gang_yuan', label: 'Telegram', value: '@gang_yuan', tip: 'Telegram 联系我们' },
    email:    { href: 'mailto:SALYZH15@gmail.com', label: 'Email', value: 'SALYZH15@gmail.com', tip: '发送邮件咨询' }
  };

  /* ========== HTML 注入 ========== */
  function buildHtml(){
    var h = '';
    /* PC 端：3 个独立竖排按钮（用 div 避免外部 nav 元素样式污染） */
    h += '<div class="contact-pc-group" role="navigation" aria-label="快速联系">';
    ['whatsapp','telegram','email'].forEach(function(key){
      var c = CONTACTS[key];
      var target = key === 'email' ? '' : ' target="_blank" rel="noopener"';
      h += '<a class="contact-btn-circle contact-pc-btn ' + key + '" href="' + c.href + '"' + target + ' aria-label="' + c.tip + '">' + SVG[key] + '<span class="contact-label">' + c.tip + '</span></a>';
    });
    h += '</div>';

    /* 移动端：主按钮 + 遮罩 + 抽屉（全部用 div，避免外部 header/footer 元素样式污染） */
    h += '<button class="contact-launcher" id="contactLauncher" type="button" aria-label="打开客服" aria-expanded="false" aria-controls="contactPanel">' + SVG.launcher + '</button>';
    h += '<div class="contact-overlay" id="contactOverlay" aria-hidden="true"></div>';
    h += '<div class="contact-panel" id="contactPanel" role="dialog" aria-modal="true" aria-labelledby="contactTitle" aria-hidden="true">';
    h +=   '<div class="contact-head">';
    h +=     '<div>';
    h +=       '<div class="contact-title-row"><h2 id="contactTitle">联系我们</h2><span class="contact-online">在线</span></div>';
    h +=       '<p class="contact-sub">通常在 24 小时内回复</p>';
    h +=     '</div>';
    h +=     '<button class="contact-close" id="contactClose" type="button" aria-label="关闭">' + SVG.close + '</button>';
    h +=   '</div>';
    h +=   '<div class="contact-list" role="list">';
    ['whatsapp','telegram','email'].forEach(function(key){
      var c = CONTACTS[key];
      var target = key === 'email' ? '' : ' target="_blank" rel="noopener"';
      h +=   '<a class="contact-item ' + key + '" href="' + c.href + '"' + target + ' role="listitem">';
      h +=     '<span class="contact-icon">' + SVG[key] + '</span>';
      h +=     '<span class="contact-text"><strong>' + c.label + '</strong><small>' + c.value + '</small></span>';
      h +=     '<span class="contact-arrow" aria-hidden="true">' + SVG.arrow + '</span>';
      h +=   '</a>';
    });
    h +=   '</div>';
    h +=   '<div class="contact-foot">Henan Panshi Import and Export Trading Co., Ltd.</div>';
    h += '</div>';
    return h;
  }

  function init(){
    var box = document.createElement('div');
    box.innerHTML = buildHtml();
    while(box.firstChild){ document.body.appendChild(box.firstChild); }
    bindEvents();
    initTheme();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ========== 主题系统：纯设备本地时间判断，无网络请求 ========== */
  /* 规则：06:00–17:59 日间(theme-day)，18:00–次日05:59 夜间(默认) */
  function isDaytime(){
    var hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  }
  function applyTheme(){
    var day = isDaytime();
    document.body.classList.toggle('theme-day', day);
    document.body.classList.toggle('theme-night', !day);
  }
  function initTheme(){
    applyTheme();                       /* 立即应用，无延迟 */
    setInterval(applyTheme, 30000);     /* 每 30 秒检查一次，跨越 6:00/18:00 自动切换 */
    /* 页面从后台切回前台时立即刷新（避免长时间挂起后主题过时） */
    document.addEventListener('visibilitychange', function(){
      if(!document.hidden) applyTheme();
    });
  }

  /* ========== 移动端抽屉打开/关闭 ========== */
  function bindEvents(){
    var launcher = document.getElementById('contactLauncher');
    var panel = document.getElementById('contactPanel');
    var overlay = document.getElementById('contactOverlay');
    var closer = document.getElementById('contactClose');
    var lastFocus = null, tx = 0, ty = 0, dragging = false;

    function open(){
      if(!panel || panel.classList.contains('is-open')) return;
      lastFocus = document.activeElement;
      panel.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.classList.add('contact-open');
      panel.setAttribute('aria-hidden','false');
      if(launcher) launcher.setAttribute('aria-expanded','true');
      setTimeout(function(){ if(closer) closer.focus(); }, 380);
    }
    function close(){
      if(!panel || !panel.classList.contains('is-open')) return;
      panel.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.classList.remove('contact-open');
      panel.setAttribute('aria-hidden','true');
      if(launcher) launcher.setAttribute('aria-expanded','false');
      setTimeout(function(){
        if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        else if(launcher) launcher.focus();
      }, 380);
    }

    if(launcher) launcher.addEventListener('click', open);
    if(closer) closer.addEventListener('click', close);
    if(overlay) overlay.addEventListener('click', close);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && panel && panel.classList.contains('is-open')){
        e.preventDefault(); close();
      }
    });

    /* 触摸下滑关闭 */
    if(panel){
      panel.addEventListener('touchstart', function(e){
        var t = e.changedTouches[0];
        tx = t.clientX; ty = t.clientY;
        dragging = panel.classList.contains('is-open');
      }, { passive: true });
      panel.addEventListener('touchmove', function(e){
        if(!dragging || !panel.classList.contains('is-open')) return;
        var t = e.touches[0];
        var dy = t.clientY - ty;
        var dx = Math.abs(t.clientX - tx);
        if(dy > 0 && dy > dx){
          e.preventDefault();
          var dd = Math.min(dy, 300);
          panel.style.transition = 'none';
          panel.style.transform = 'translateY(' + dd + 'px)';
          overlay.style.transition = 'none';
          overlay.style.opacity = String(Math.max(0, 0.5 * (1 - dd / 300)));
        }
      }, { passive: false });
      panel.addEventListener('touchend', function(e){
        var t = e.changedTouches[0];
        var dy = t.clientY - ty;
        var dx = Math.abs(t.clientX - tx);
        var closeIt = dragging && dy > 0 && dy > dx && dy >= 90;
        panel.style.transition = '';
        panel.style.transform = '';
        overlay.style.transition = '';
        overlay.style.opacity = '';
        if(closeIt) close();
        dragging = false;
      }, { passive: true });
    }
  }
})();
