'use strict';
const path = require('path');
const { createStrapi } = require('@strapi/core');

(async () => {
  process.chdir(path.resolve(__dirname, '..'));
  const strapi = await createStrapi({ appDir: process.cwd() }).load();
  const targets = ['site_logo', 'site_favicon'];
  try {
    const entries = await strapi.documents('api::website-image.website-image').findMany({ limit: 500 });
    for (const e of entries) {
      if (!targets.includes(e.key)) continue;
      if (e.enabled === true) {
        console.log('skip ' + e.key + ' (already enabled)');
        continue;
      }
      await strapi.documents('api::website-image.website-image').update({
        documentId: e.documentId,
        data: { enabled: true },
      });
      console.log('enabled ' + e.key);
    }
  } catch (err) {
    console.error('toggle error:', err);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
})();
