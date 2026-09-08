'use strict';
const path = require('path');
const { createStrapi } = require('@strapi/core');

(async () => {
  process.chdir(path.resolve(__dirname, '..'));
  const appContext = await createStrapi({ appDir: process.cwd() }).load();
  const strapi = appContext;
  try {
    const existing = await strapi.documents('api::site-setting.site-setting').findFirst();
    const payload = {
      site_name_zh: '矿联矿机',
      site_name_en: 'MINELINK EQUIPMENT',
      site_description_zh: '面向全球矿业客户的设备采购与服务平台',
      site_description_en: 'Mining equipment sourcing & service platform for global customers'
    };
    if (existing && existing.documentId) {
      await strapi.documents('api::site-setting.site-setting').update({
        documentId: existing.documentId,
        data: payload
      });
      console.log('UPDATED site-setting documentId=' + existing.documentId);
    } else {
      const created = await strapi.documents('api::site-setting.site-setting').create({ data: payload });
      console.log('CREATED site-setting documentId=' + created.documentId);
    }
    const after = await strapi.documents('api::site-setting.site-setting').findFirst();
    console.log('FINAL:', JSON.stringify(after, null, 2));
  } catch (err) {
    console.error('seed error:', err);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
