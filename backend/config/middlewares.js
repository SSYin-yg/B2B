module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          // 后台预览 iframe 加载的是与后台同源的静态页（走 nginx 80 端口），
          // 用 'self' 适配任意 IP/端口；content-manager 会把 admin.preview
          // allowedOrigins 拼接到这里，本地 localhost:3000 开发地址仍然可用。
          'frame-src': ["'self'"],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
