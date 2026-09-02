/* Minelink i18n + geo language detection */
(function(){

  const I18N = {
    zh: {
      // Topbar & Nav
      "topbar.tagline": "专业矿用设备采购与服务平台",
      "nav.home": "首页",
      "nav.catalog": "设备目录",
      "nav.solutions": "行业方案",
      "nav.service": "服务支持",
      "nav.faq": "常见问题",
      "nav.about": "关于我们",
      "nav.quote": "获取报价",
      // Hero
      "hero.eyebrow": "mining equipment marketplace",
      "hero.title": "让每一台设备，成为矿山的可靠生产力",
      "hero.copy": "覆盖露天开采、井下采掘、破碎筛分与智能运输全流程，为全球矿业客户提供可信赖的设备采购与全周期支持。",
      "hero.cta1": "立即获取方案",
      "hero.cta2": "浏览设备",
      "metric.models": "在售设备型号",
      "metric.countries": "服务覆盖国家与地区",
      "metric.years": "矿业行业服务经验",
      "metric.response": "快速响应机制",
      "metric.unit.countries": "个",
      "metric.unit.years": "年+",
      "metric.unit.hours": "小时",
      // Products
      "products.label": "FEATURED EQUIPMENT",
      "products.title": "为高产能而生的核心装备",
      "products.desc": "从移动破碎到筛分输送，目录已收录 31 款成熟矿山设备，覆盖骨料与矿石加工关键流程。",
      "products.catalogLink": "查看完整设备目录",
      // Solutions
      "solutions.label": "SOLUTIONS FOR EVERY MINE",
      "solutions.title": "不只卖设备，更懂矿山作业",
      "solutions.copy": "围绕您的矿种、产能、工况与预算，提供从设备组合到落地交付的全流程支持。",
      "solutions.s1": "金属矿山开采方案",
      "solutions.s2": "砂石骨料生产线",
      "solutions.s3": "煤矿井下装备配套",
      "solutions.s4": "尾矿处理与环保改造",
      "solutions.link": "了解行业解决方案",
      "solutions.stamp": "从矿山现场到设备交付\n每一步都有专业团队参与",
      // Service
      "service.label": "WHY MINELINK",
      "service.title": "让复杂采购，变得更确定",
      "service.copy": "用标准化流程与当地化服务，降低设备采购、跨境交付和后期运维中的不确定性。",
      "service.1.title": "专业选型顾问",
      "service.1.copy": "按矿种与作业工况核验参数，输出适配的设备组合及采购建议。",
      "service.2.title": "透明交易保障",
      "service.2.copy": "供应商资质审核、关键节点验货与清晰合同条款，全程可追溯。",
      "service.3.title": "全球交付服务",
      "service.3.copy": "支持出口报关、海陆联运、安装指导与备件保障，设备安心落地。",
      // Buyers
      "buyers.title": "服务于全球矿业客户",
      "buyers.copy": "与大型矿山、工程承包商、设备经销商共同创造长期价值。",
      // CTA
      "cta.title": "正在规划新的矿山项目？",
      "cta.copy": "留下您的采购需求，顾问将在 24 小时内与您联系。",
      "cta.btn": "提交采购需求 →",
      // Footer
      "footer.copy": "面向全球矿业客户的设备采购与服务平台，让优质矿机触达每一座需要它的矿山。",
      "footer.catalog": "设备目录",
      "footer.mobile": "移动破碎站",
      "footer.crushing": "破碎制砂设备",
      "footer.screening": "筛分输送设备",
      "footer.washing": "洗砂设备",
      "footer.parts": "易损件配件",
      "footer.support": "服务支持",
      "footer.select": "设备选型",
      "footer.inspect": "验货交付",
      "footer.aftersale": "售后运维",
      "footer.spare": "备件供应",
      "footer.faq": "常见问题",
      "footer.contact": "联系我们",
      "footer.location": "中国 · 上海 · 全球服务",
      "footer.privacy": "隐私政策",
      "footer.terms": "使用条款",
      "footer.home": "返回首页",
      // Modal
      "modal.title": "获取专属设备方案",
      "modal.copy": "请留下联系方式与采购意向，我们将安排矿机顾问为您服务。",
      "modal.name": "您的姓名 *",
      "modal.phone": "联系电话 / WhatsApp *",
      "modal.email": "工作邮箱",
      "modal.product": "请选择意向设备",
      "modal.opt1": "露天采掘设备",
      "modal.opt2": "井下采矿设备",
      "modal.opt3": "破碎筛分设备",
      "modal.opt4": "输送与辅助设备",
      "modal.opt5": "其他需求",
      "modal.region": "项目所在国家 / 地区",
      "modal.submit": "提交需求",
      "modal.note": "提交即表示您同意我们为本次咨询联系您。",
      "modal.success": "需求已提交，我们会在 24 小时内联系您。",
      // Catalog page
      "catalog.breadcrumb": "首页　/　设备目录",
      "catalog.eyebrow": "EQUIPMENT CATALOG",
      "catalog.title": "矿山破碎筛分设备目录",
      "catalog.copy": "收录 31 款矿山设备与易损件，覆盖移动破碎、固定破碎制砂、筛分洗砂、输送给料等核心环节。点击设备即可发起报价咨询。",
      "catalog.all": "全部设备",
      "catalog.mobile": "移动破碎站",
      "catalog.crushing": "破碎制砂",
      "catalog.screening": "筛分输送",
      "catalog.washing": "洗砂设备",
      "catalog.parts": "易损件",
      "catalog.search": "搜索设备名称",
      "catalog.result": "当前展示",
      "catalog.units": "款设备",
      "catalog.empty": "未找到匹配设备，请尝试更换关键词。",
      "catalog.inquiry": "MODEL INQUIRY",
      "catalog.quote": "获取报价",
      "catalog.cta.title": "找不到适合的设备？",
      "catalog.cta.copy": "告诉我们矿石类型、产能与场地条件，我们将为您推荐合适的设备组合。",
      "catalog.cta.btn": "提交采购需求 →",
      // FAQ page
      "faq.breadcrumb": "首页　/　常见问题",
      "faq.eyebrow": "FAQ",
      "faq.title": "常见问题",
      "faq.copy": "关于设备类型、出口市场、订购、付款、运输、认证与售后支持，快速了解我们能为您提供什么。",
      "faq.q1": "你们生产哪些类型的采矿机械？",
      "faq.a1": "设备类型涵盖破碎、筛分、给料、洗砂、脱水、输送等设备及耐磨配件等多个环节。适配采石场、矿山开采、砂石骨料、建材加工等多类项目场景。",
      "faq.q2": "你们的出口产品销往哪些国家和地区？",
      "faq.a2": "我们的破碎设备、矿山机械及耐磨配件可出口至全球多个国家和地区，主要市场包括亚洲、欧洲、北美、南美、中东、非洲及大洋洲。",
      "faq.q3": "最低订购量（MOQ）是多少？",
      "faq.a3": "起订量依产品品类、规格及定制需求有所区别：标准整机设备 1 台即可起订；配件及定制产品数量可灵活协商。",
      "faq.q4": "如何获得报价？",
      "faq.a4": "通过邮件或在线聊天联系，提供设备型号、产量、进出料粒度及物料特性等信息，或配件图纸。如果您需要整套解决方案，可由团队为您定制。",
      "faq.q5": "你们接受哪些付款方式？",
      "faq.a5": "常用付款方式包括：T/T 电汇、L/C 信用证。如有特殊付款需求，欢迎联系我们，我们可以根据具体订单情况协商合适的付款方案。",
      "faq.q6": "你们的运输条款是什么？",
      "faq.a6": "支持海运、空运及陆运等。常用贸易条款包括 EXW、FOB、CIF 和 DDP 等。我们会根据产品重量、体积和目的港情况协助客户选择合适的运输方式，并提供装箱、出口报关及相关运输文件支持。",
      "faq.q7": "你们的产品有哪些质量认证？",
      "faq.a7": "符合 ISO 9001 标准，可根据需求提供 CE 合规文件、材质证明及检测报告。不同产品和出口国家的认证及技术要求可能有所不同，请在询价时提供设备型号、产品类型及目的国。",
      "faq.q8": "你们提供安装和售后支持吗？",
      "faq.a8": "提供安装手册、操作说明、远程技术指导以及故障分析排查服务。如遇到设备运行或配件使用问题，我们的技术团队可协助客户进行故障分析并提供解决方案。",
      "faq.q9": "可以根据具体要求定制设备吗？",
      "faq.a9": "完全支持根据客户的技术参数、图纸、样品及实际工况进行设备与配件的定制生产。",
      "faq.q10": "在下大订单之前，我该如何验证质量？",
      "faq.a10": "可行采购样品或小批量货品，完成质量验证；大宗订单支持第三方检验，并提供材质与检测报告。",
      "faq.cta.title": "还有其他问题？",
      "faq.cta.copy": "留下您的采购需求，顾问将在 24 小时内与您联系。",
      "faq.cta.btn": "提交采购需求 →"
    },
    en: {
      "topbar.tagline": "Mining Equipment Sourcing & Service Platform",
      "nav.home": "Home",
      "nav.catalog": "Equipment",
      "nav.solutions": "Solutions",
      "nav.service": "Support",
      "nav.faq": "FAQ",
      "nav.about": "About",
      "nav.quote": "Get a Quote",
      "hero.eyebrow": "Mining Equipment Marketplace",
      "hero.title": "Reliable machines.\nReal productivity for every mine.",
      "hero.copy": "From open-pit and underground extraction to crushing, screening and transport — we help global mining teams source proven equipment and stay supported for the full lifecycle.",
      "hero.cta1": "Request a solution",
      "hero.cta2": "Browse equipment",
      "metric.models": "Models available",
      "metric.countries": "Countries & regions",
      "metric.years": "Years in mining",
      "metric.response": "Response time",
      "metric.unit.countries": "",
      "metric.unit.years": "+",
      "metric.unit.hours": "h",
      "products.label": "Featured equipment",
      "products.title": "Built for high-capacity operations",
      "products.desc": "Thirty-one proven models spanning mobile crushing through screening and conveying — covering the full aggregate and ore processing flow.",
      "products.catalogLink": "View full catalog",
      "solutions.label": "Solutions for every mine",
      "solutions.title": "Equipment advice grounded in real mining work",
      "solutions.copy": "We match machines to your ore, capacity, site conditions and budget — from package design through delivery and commissioning.",
      "solutions.s1": "Metal mine extraction",
      "solutions.s2": "Sand & aggregate lines",
      "solutions.s3": "Underground coal support",
      "solutions.s4": "Tailings & green upgrades",
      "solutions.link": "Explore solutions",
      "solutions.stamp": "From site survey to delivery.\nSpecialists at every step.",
      "service.label": "Why Minelink",
      "service.title": "Procurement you can plan around",
      "service.copy": "Clear process and local support cut uncertainty across sourcing, cross-border delivery and after-sales.",
      "service.1.title": "Selection advisors",
      "service.1.copy": "We check duty and ore data, then recommend machine combinations that fit the job.",
      "service.2.title": "Transparent deals",
      "service.2.copy": "Qualified suppliers, staged inspection and plain contract terms — fully traceable.",
      "service.3.title": "Global delivery",
      "service.3.copy": "Export clearance, sea and land logistics, installation guidance and spare parts support.",
      "buyers.title": "Trusted by mining teams worldwide",
      "buyers.copy": "Long-term partnerships with mines, contractors and equipment distributors.",
      "cta.title": "Planning a new project?",
      "cta.copy": "Share your requirements — an advisor will reply within 24 hours.",
      "cta.btn": "Submit inquiry →",
      "footer.copy": "A global platform for mining equipment procurement — quality machines for every site that needs them.",
      "footer.catalog": "Catalog",
      "footer.mobile": "Mobile crushing",
      "footer.crushing": "Crushing & sand",
      "footer.screening": "Screening & conveying",
      "footer.washing": "Sand washing",
      "footer.parts": "Wear parts",
      "footer.support": "Support",
      "footer.select": "Selection advice",
      "footer.inspect": "Inspection & delivery",
      "footer.aftersale": "After-sales",
      "footer.spare": "Spare parts",
      "footer.faq": "FAQ",
      "footer.contact": "Contact",
      "footer.location": "Shanghai · Global service",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms",
      "footer.home": "Home",
      "modal.title": "Request a tailored plan",
      "modal.copy": "Leave your details and requirements. A mining equipment advisor will follow up.",
      "modal.name": "Full name *",
      "modal.phone": "Phone / WhatsApp *",
      "modal.email": "Work email",
      "modal.product": "Equipment interest",
      "modal.opt1": "Open-pit mining",
      "modal.opt2": "Underground mining",
      "modal.opt3": "Crushing & screening",
      "modal.opt4": "Conveying & auxiliaries",
      "modal.opt5": "Other",
      "modal.region": "Project country / region",
      "modal.submit": "Submit",
      "modal.note": "By submitting, you agree to be contacted about this inquiry.",
      "modal.success": "Received. We will contact you within 24 hours.",
      "catalog.breadcrumb": "Home  /  Equipment",
      "catalog.eyebrow": "Equipment catalog",
      "catalog.title": "Crushing & screening equipment",
      "catalog.copy": "Thirty-one machines and wear parts for mobile crushing, fixed crushing, sand making, screening, washing and conveying. Select a model to request a quote.",
      "catalog.all": "All",
      "catalog.mobile": "Mobile",
      "catalog.crushing": "Crushing",
      "catalog.screening": "Screening",
      "catalog.washing": "Washing",
      "catalog.parts": "Parts",
      "catalog.search": "Search models",
      "catalog.result": "Showing",
      "catalog.units": "models",
      "catalog.empty": "No matches. Try a different keyword.",
      "catalog.inquiry": "Inquiry",
      "catalog.quote": "Get quote",
      "catalog.cta.title": "Need a different setup?",
      "catalog.cta.copy": "Tell us ore type, capacity and site conditions — we will propose a suitable package.",
      "catalog.cta.btn": "Submit inquiry →",
      "faq.breadcrumb": "Home  /  FAQ",
      "faq.eyebrow": "FAQ",
      "faq.title": "Frequently asked questions",
      "faq.copy": "Equipment scope, export markets, MOQ, quotes, payment, shipping, certifications and after-sales.",
      "faq.q1": "What equipment do you supply?",
      "faq.a1": "Crushing, screening, feeding, sand washing, dewatering, conveying and wear parts — for quarries, mines, aggregates and building materials projects.",
      "faq.q2": "Where do you export?",
      "faq.a2": "Worldwide — Asia, Europe, North and South America, the Middle East, Africa and Oceania.",
      "faq.q3": "What is the minimum order quantity?",
      "faq.a3": "Standard complete machines from one unit. Parts and custom items are flexible by agreement.",
      "faq.q4": "How do I request a quote?",
      "faq.a4": "Email or chat with model, capacity, feed and product size, and material data — or part drawings. Full-line packages can be engineered to your site.",
      "faq.q5": "Which payment terms do you accept?",
      "faq.a5": "T/T and L/C are standard. Other terms can be discussed per order.",
      "faq.q6": "What shipping options are available?",
      "faq.a6": "Sea, air and land. Common Incoterms: EXW, FOB, CIF, DDP. We support packing, export customs and shipping documents.",
      "faq.q7": "What certifications can you provide?",
      "faq.a7": "ISO 9001. CE files, material certificates and test reports on request. Requirements vary by product and destination — share model, type and country when you inquire.",
      "faq.q8": "Do you support installation and after-sales?",
      "faq.a8": "Yes — manuals, remote guidance and troubleshooting. Our team helps diagnose issues on machines and wear parts.",
      "faq.q9": "Can you customize equipment?",
      "faq.a9": "Yes. We build to your parameters, drawings, samples and site conditions.",
      "faq.q10": "How can I verify quality before a large order?",
      "faq.a10": "Samples or small batches for evaluation. Large orders can include third-party inspection with material and test reports.",
      "faq.cta.title": "Still have questions?",
      "faq.cta.copy": "Share your requirements — an advisor will reply within 24 hours.",
      "faq.cta.btn": "Submit inquiry →"
    }
  };

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.zh;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.documentElement.classList.toggle('lang-en', lang === 'en');
    document.documentElement.classList.toggle('lang-zh', lang !== 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Skip containers that only wrap other i18n nodes
      if (el.querySelector('[data-i18n]')) return;
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else if (el.tagName === 'OPTION') {
          el.textContent = dict[key];
        } else {
          const text = dict[key];
          if (text.indexOf('\n') >= 0) {
            el.innerHTML = text.split('\n').join('<br />');
          } else {
            el.textContent = text;
          }
        }
      }
    });
    // Update lang buttons
    document.querySelectorAll('.lang-btn').forEach(b => {
      const active = b.dataset.lang === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.setItem('minelink-lang', lang); } catch(e) {}
    try { document.dispatchEvent(new CustomEvent('minelink:lang', { detail: { lang: lang } })); } catch(e) {}
  }

  
  function langFromCountry(code) {
    var zhCountries = { CN:1, TW:1, HK:1, MO:1, SG:1 };
    return zhCountries[(code || '').toUpperCase()] ? 'zh' : 'en';
  }

  function detectLangByIP() {
    try {
      var saved = localStorage.getItem('minelink-lang');
      if (saved === 'zh' || saved === 'en') return Promise.resolve(saved);
    } catch (e) {}
    try {
      var cached = sessionStorage.getItem('minelink-geo-lang');
      if (cached === 'zh' || cached === 'en') return Promise.resolve(cached);
    } catch (e) {}
    return fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined })
      .then(function(res) { if (!res.ok) throw new Error('geo'); return res.json(); })
      .then(function(data) {
        var lang = langFromCountry(data && data.country_code);
        try { sessionStorage.setItem('minelink-geo-lang', lang); } catch (e) {}
        return lang;
      })
      .catch(function() { return 'zh'; });
  }

  function init() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { applyLang(btn.dataset.lang); });
    });
    detectLangByIP().then(function(lang) { applyLang(lang); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for catalog dynamic render
  window.MinelinkI18n = { applyLang, I18N, t: (key) => {
    const lang = (function(){ try { return localStorage.getItem('minelink-lang') || 'zh'; } catch(e){ return 'zh'; }})();
    return (I18N[lang] || I18N.zh)[key] || key;
  }};

})();
