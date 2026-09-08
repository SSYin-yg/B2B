'use strict';

/**
 * website-image router
 *
 * 默认 CRUD 路由（find / findOne）用于后台与构建脚本；
 * 额外的 /website-images/map 返回按 key 聚合的映射，方便 build-pages.js 直接使用。
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::website-image.website-image');

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

module.exports = customRouter(defaultRouter, [
  {
    method: 'GET',
    path: '/website-images/map',
    handler: 'api::website-image.website-image.map',
    config: {
      auth: false,
    },
  },
]);
