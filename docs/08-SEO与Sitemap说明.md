# 08 - SEO 与 Sitemap 说明

## 一、SEO 字段映射

Equipment 内容类型有完整的 SEO 字段，`build-pages.js` 会将它们映射到静态页面的 `<head>` 中。

| Strapi 字段 | 模板变量 | HTML 标签 |
|------------|---------|----------|
| seo_title_zh / seo_title_en | `{{SEO_TITLE}}` | `<title>`、`og:title`、`twitter:title` |
| seo_description_zh / seo_description_en | `{{SEO_DESCRIPTION}}` | `<meta name="description">`、`og:description`、`twitter:description` |
| og_image | `{{OG_IMAGE}}` | `og:image`、`twitter:image` |

### 回退规则

当 SEO 字段**为空**时，构建脚本会自动回退：

```javascript
seoTitle = seo_title_zh  || (name_cn + ' | 矿联矿机');
seoTitle = seo_title_en  || (name_en + ' | Minelink Equipment');

seoDescription = seo_description_zh || desc_zh || '';
seoDescription = seo_description_en || desc_en || '';

ogImage = absUrl(og_image || images[0] || 'assets/og-cover.jpg');
```

**最佳实践**：
- 标题控制在 30-60 字符
- 描述控制在 150-160 字符
- OG Image 建议 1200×630px

## 二、Canonical URL

每台设备页都有唯一 canonical URL：

```
中文页: https://ssyin-yg.github.io/B2B/equipment/{slug}.html
英文页: https://ssyin-yg.github.io/B2B/en/equipment/{slug}.html
```

规则：
- 中文页 canonical 指向中文页自身
- 英文页 canonical 指向英文页自身
- 中英文是独立页面，**不互为 canonical**（独立索引）

## 三、hreflang 互链

每台设备页有三条 hreflang：

```html
<link rel="alternate" hreflang="zh-CN" href=".../equipment/{slug}.html">
<link rel="alternate" hreflang="en"    href=".../en/equipment/{slug}.html">
<link rel="alternate" hreflang="x-default" href=".../equipment/{slug}.html">
```

| 页面 | hreflang="zh-CN" | hreflang="en" | hreflang="x-default" |
|------|-----------------|---------------|---------------------|
| 中文页 | 指向自己 | 指向英文页 | 指向中文页 |
| 英文页 | 指向中文页 | 指向自己 | 指向中文页（默认） |

**slug 保持一致**：中英文使用完全相同的 slug（如 `crawler-jaw`），只是 URL 路径不同。

## 四、Open Graph + Twitter Card

每台设备页自动生成：

```html
<meta property="og:type" content="product">
<meta property="og:site_name" content="矿联矿机">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta property="og:locale" content="zh_CN">   <!-- 或 en_US -->
<meta property="og:image" content="...">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

| 页面语言 | og:locale |
|---------|-----------|
| 中文 | `zh_CN` |
| 英文 | `en_US` |

## 五、Product Structured Data（JSON-LD）

每台设备页嵌入 Product schema：

```jsonld
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "履带式颚式移动破碎站",
  "image": [
    "https://ssyin-yg.github.io/B2B/assets/images/equipment/crawler-jaw.jpg"
  ],
  "description": "履带式颚式移动破碎站是一种以颚式破碎机为核心的移动式破碎设备...",
  "url": "https://ssyin-yg.github.io/B2B/equipment/crawler-jaw.html"
}</script>
```

### 为什么不填充 price / brand / SKU？

**严禁虚构**。如果 Strapi 中没有真实字段，就不写进去。Product schema 的**最小必填**是 `name` + `image` + `description` + `url`，已满足。

未来如果 Strapi 新增品牌/SKU/价格字段，可以在 `build-pages.js` 的 `buildProductJsonLd()` 中补充。

## 六、sitemap.xml 结构

由 `build-pages.js` 自动生成，包含 **75 个 URL**：

| 类型 | 数量 | changefreq | priority |
|------|------|-----------|---------|
| 首页 | 1 | weekly | 1.0 |
| 静态页面（catalog / faq / solutions / support / about） | 5 | monthly | 0.7~0.9 |
| 中文设备页 | 31 | monthly | 0.8 |
| 英文设备页 | 31 | monthly | 0.8 |

设备 URL 保持现有格式（`equipment/{slug}.html`），**不包含数据库 ID**。

### 示例片段

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ssyin-yg.github.io/B2B/equipment/crawler-jaw.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ssyin-yg.github.io/B2B/en/equipment/crawler-jaw.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

## 七、robots.txt

已在项目根目录，需保持不修改：

```
User-agent: *
Allow: /
Sitemap: https://ssyin-yg.github.io/B2B/sitemap.xml
```

## 八、SEO Checklist（每次构建后检查）

- [ ] 所有 31 台中文设备页可访问（200）
- [ ] 所有 31 台英文设备页可访问（200）
- [ ] 每页 title 唯一且包含关键词
- [ ] 每页 description 不为空
- [ ] 每页有 canonical URL
- [ ] 中英文页互为 hreflang
- [ ] Product JSON-LD 存在且无语法错误（https://validator.schema.org/）
- [ ] OG Image 可访问
- [ ] sitemap.xml 包含全部 75 个 URL
- [ ] robots.txt 正常
- [ ] 无 404 页面（`curl -I` 检查关键 URL）

## 九、Google Search Console / Bing Webmaster

部署后建议：

1. **注册站点**：分别注册中文和英文根 URL
2. **提交 sitemap**：`https://ssyin-yg.github.io/B2B/sitemap.xml`
3. **提交 hreflang**：在 Search Console 国际化设置中验证
4. **索引覆盖**：定期检查 Indexing → Pages 确认中英文都在索引中
