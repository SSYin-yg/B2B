'use strict';

/**
 * website-image controller
 *
 * 只读接口：前台构建脚本（scripts/build-pages.js）通过 GET /api/website-images 读取全量图片配置。
 * 写操作统一走 Strapi Admin（内容 → 网站图片），不在这里开放。
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::website-image.website-image', ({ strapi }) => ({
  /**
   * 按 key 聚合，供静态页面构建使用。
   * GET /api/website-images/map
   * 返回：{ data: { home_hero_1: {...}, ... } }
   */
  async map(ctx) {
    const entries = await strapi.documents('api::website-image.website-image').findMany({
      populate: ['image'],
      sort: { sort_order: 'asc', key: 'asc' },
      limit: 500,
    });
    const out = {};
    for (const e of entries || []) {
      if (!e || !e.key) continue;
      out[e.key] = e;
    }
    ctx.body = { data: out };
  },
}));
