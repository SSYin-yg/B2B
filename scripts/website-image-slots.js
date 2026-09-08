'use strict';

/**
 * 网站图片槽位注册表（Website Image Mapping）
 *
 * 本文件是「网站图片」的唯一槽位定义，由以下两处共用：
 *   1. backend/scripts/migrate-website-images.js  —— 初始化 / 修复 Strapi 中的 Website Image 条目
 *   2. scripts/build-pages.js                     —— 读取 Strapi 数据并写入静态页面 / CSS
 *
 * 槽位来源：对 /var/www/B2B 现有 HTML / CSS 的实际扫描结果（不凭空创建）。
 * 每个槽位都对应网站上一个真实存在的图片位置。
 *
 * 字段说明：
 *   key        机器唯一标识，禁止随意修改（前端通过 data-wb-img="key" 引用）
 *   name       后台显示名称（运营人员看到的名字）
 *   page       所属页面（后台筛选；中文值，Strapi 5 列表直接显示）
 *   position   页面内位置（后台筛选；中文值）
 *   category   图片分类（后台筛选；中文值）
 *   sort_order 同一位置内的排序（如首页三张 Banner 的顺序）
 *   enabled    是否启用；false 表示该槽位暂不使用，页面保持原样
 *   alt        默认 ALT
 *   caption    默认图片说明
 *   description 后台帮助文字：告诉运营人员这张图用在哪里、建议尺寸
 *   mode       注入方式：
 *                meta      —— 替换 <meta> 的 content（OG / Twitter 分享图）
 *                inline-bg —— 替换元素行内 style 的 background-image（首页 Banner）
 *                css       —— 由生成的 assets/website-images.css 设置 background-image
 *                link      —— 生成 <link rel="icon">（Favicon）
 *   defaultFile  初始化时登记到 Strapi 媒体库的现有文件（相对 assets/images/equipment/）
 *   cssFallback  未配置图片时页面保持的现有样式（保证不破坏当前视觉效果）
 *   cssOverlay   配置图片后叠加在图片之上的渐变遮罩（保证叠字可读、视觉不变）
 */

/* 后台下拉项的枚举值
   Strapi 5 枚举值受 GraphQL 规范约束（^[_A-Za-z][_0-9A-Za-z]*$），不允许中文作为 enum value。
   因此：
     - enum value = 英文（与 schema 一致，DB 可存储）
     - enumNames   = 中文（详情页下拉显示中文）
     - 列表页中文显示由项目级 admin 扩展（CellValue 改写）注入，与 DB 解耦。 */
const PAGE_OPTIONS = [
  { value: 'home', label: '首页' },
  { value: 'solutions', label: '行业方案' },
  { value: 'support', label: '服务支持' },
  { value: 'about', label: '关于我们' },
  { value: 'faq', label: '常见问题' },
  { value: 'catalog', label: '设备目录' },
  { value: 'contact', label: '联系页面' },
  { value: 'global', label: '全局' },
];

const POSITION_OPTIONS = [
  { value: 'hero_banner', label: '顶部 Banner' },
  { value: 'page_header', label: '页头背景' },
  { value: 'solutions_area', label: '行业方案区域' },
  { value: 'product_area', label: '产品区域' },
  { value: 'sidebar', label: '侧边栏' },
  { value: 'header', label: '页头' },
  { value: 'footer', label: '页脚' },
  { value: 'social_share', label: '社交分享图' },
  { value: 'favicon', label: '网站图标' },
  { value: 'other', label: '其他' },
];

const CATEGORY_OPTIONS = [
  { value: 'banner', label: 'Banner' },
  { value: 'product', label: '产品' },
  { value: 'solution', label: '行业方案' },
  { value: 'about', label: '关于我们' },
  { value: 'support', label: '服务支持' },
  { value: 'common', label: '公共资源' },
  { value: 'logo', label: 'Logo' },
  { value: 'other', label: '其他' },
];

/* ---- 首页 Banner / 行业方案配图共用的渐变遮罩（与 home.css 现有写法一致） ---- */
const OVERLAY_SOFT = 'linear-gradient(0deg,rgba(12,25,31,.32),rgba(12,25,31,.12))';
/* ---- 页头（.catalog-hero）叠加图片的遮罩：保留原深蓝渐变基调，压暗以保证白字可读 ---- */
const OVERLAY_HERO = 'linear-gradient(118deg,rgba(12,27,34,.90),rgba(29,51,58,.86))';

const SLOTS = [
  {
    key: 'home_hero_1',
    name: '首页 Banner 1',
    page: 'home',
    position: 'hero_banner',
    category: 'banner',
    sort_order: 10,
    enabled: true,
    alt: 'Mining equipment working at a construction site',
    caption: '矿山施工现场',
    description: '首页顶部轮播大图的第 1 张（自动轮播，5 秒切换）。建议尺寸 1920×900 以上横图，主体偏左侧以免被标题文字遮挡。',
    mode: 'inline-bg',
    defaultFile: 'Construction site 1.jpg',
  },
  {
    key: 'home_hero_2',
    name: '首页 Banner 2',
    page: 'home',
    position: 'hero_banner',
    category: 'banner',
    sort_order: 20,
    enabled: true,
    alt: 'Mining machinery on site',
    caption: '矿山设备作业现场',
    description: '首页顶部轮播大图的第 2 张。建议尺寸 1920×900 以上横图。',
    mode: 'inline-bg',
    defaultFile: 'Construction site 2.jpg',
  },
  {
    key: 'home_hero_3',
    name: '首页 Banner 3',
    page: 'home',
    position: 'hero_banner',
    category: 'banner',
    sort_order: 30,
    enabled: true,
    alt: 'Mining solutions for quarry and mineral processing',
    caption: '矿山解决方案',
    description: '首页顶部轮播大图的第 3 张。建议尺寸 1920×900 以上横图。',
    mode: 'inline-bg',
    defaultFile: 'Mining Solutions.jpg',
  },
  {
    key: 'home_solutions',
    name: '首页行业方案配图',
    page: 'home',
    position: 'solutions_area',
    category: 'solution',
    sort_order: 40,
    enabled: true,
    alt: 'Mining site with crushing and screening equipment',
    caption: '',
    description: '首页「不只卖设备，更懂矿山作业」区块左侧配图。左侧为图片、右侧为文字，左下角有白色竖线条文字块。建议尺寸 1300×900 以上。未配置时使用现有外链图片，页面外观不变。',
    mode: 'css',
    cssOverlay: OVERLAY_SOFT,
    defaultFile: 'Mining Solutions.jpg',
  },
  {
    key: 'about_side',
    name: '关于我们侧栏配图',
    page: 'about',
    position: 'sidebar',
    category: 'about',
    sort_order: 50,
    enabled: true,
    alt: 'Mining equipment delivery on site',
    caption: '',
    description: '关于我们页面「关于我们」正文右侧的竖图，左下角有黄色竖线条文字块。建议尺寸 800×900 以上竖图。未配置时使用现有外链图片，页面外观不变。',
    mode: 'css',
    cssOverlay: OVERLAY_SOFT,
    defaultFile: 'Mining Solutions.jpg',
  },
  {
    key: 'default_og_image',
    name: '默认分享图 OG Image',
    page: 'global',
    position: 'social_share',
    category: 'common',
    sort_order: 60,
    enabled: true,
    alt: 'Minelink Equipment - mining machinery supplier',
    caption: '',
    description: '全站默认社交分享图：所有页面分享到微信 / Facebook / LinkedIn 时显示的图片。设备详情页若单独设置了 OG 图片则优先使用设备自己的图。建议尺寸 1200×630。',
    mode: 'meta',
    defaultFile: 'Mining Solutions.jpg',
  },
  {
    key: 'site_logo',
    name: '网站 Logo',
    page: 'global',
    position: 'header',
    category: 'common',
    sort_order: 70,
    enabled: false,
    alt: 'Minelink Equipment',
    caption: '',
    description: '网站左上角 Logo（替换六边形色块中的字母 M）。建议透明背景 PNG / WebP，正方形，最短边 200px 以上。未配置时保持现有的「M」字标识。',
    mode: 'css',
  },
  {
    key: 'site_favicon',
    name: '网站图标 Favicon',
    page: 'global',
    position: 'favicon',
    category: 'common',
    sort_order: 80,
    enabled: false,
    alt: '',
    caption: '',
    description: '浏览器标签页上显示的小图标。建议使用 1:1 的 PNG / ICO，尺寸 64×64 或 128×128。未配置时不输出 favicon 标签（与当前一致）。',
    mode: 'link',
  },
  {
    key: 'solutions_hero',
    name: '行业方案页头背景',
    page: 'solutions',
    position: 'page_header',
    category: 'solution',
    sort_order: 90,
    enabled: true,    defaultFile: 'Mining Solutions.jpg',
    mode: 'css',
    cssOverlay: OVERLAY_HERO,
  },
  {
    key: 'about_hero',
    name: '关于我们页头背景',
    page: 'about',
    position: 'page_header',
    category: 'about',
    sort_order: 95,
    enabled: true,    defaultFile: 'Mining Solutions.jpg',
    mode: 'css',
    cssOverlay: OVERLAY_HERO,
  },
  {
    key: 'support_hero',
    name: '服务支持页头背景',
    page: 'support',
    position: 'page_header',
    category: 'support',
    sort_order: 100,
    enabled: true,    defaultFile: 'Mining Solutions.jpg',
    mode: 'css',
    cssOverlay: OVERLAY_HERO,
  },
  {
    key: 'faq_hero',
    name: '常见问题页头背景',
    page: 'faq',
    position: 'page_header',
    category: 'other',
    sort_order: 110,
    enabled: true,    defaultFile: 'Mining Solutions.jpg',
    mode: 'css',
    cssOverlay: OVERLAY_HERO,
  },
  {
    key: 'catalog_hero',
    name: '设备目录页头背景',
    page: 'catalog',
    position: 'page_header',
    category: 'product',
    sort_order: 120,
    enabled: true,    defaultFile: 'Mining Solutions.jpg',
    mode: 'css',
    cssOverlay: OVERLAY_HERO,
  },
];

module.exports = {
  SLOTS,
  PAGE_OPTIONS,
  POSITION_OPTIONS,
  CATEGORY_OPTIONS,
  OVERLAY_SOFT,
  OVERLAY_HERO,
  /* 便于按 key 快速查找 */
  byKey: SLOTS.reduce(function (acc, s) {
    acc[s.key] = s;
    return acc;
  }, {}),
};
