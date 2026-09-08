'use strict';
/* Quick check: read CM config for website-image and dump list layout + metadatas */
const path = require('path');
async function main() {
  const { createStrapi } = require('@strapi/core');
  const appContext = await createStrapi({ appDir: path.join(process.cwd()) }).load();
  const strapi = appContext;
  try {
    const UID = 'api::website-image.website-image';
    const svc = strapi.plugin('content-manager').service('content-types');
    const ct = svc.findContentType(UID);
    const cfg = await svc.findConfiguration(ct);
    console.log('list layout:', JSON.stringify(cfg.layouts.list));
    console.log('edit layout:', JSON.stringify(cfg.layouts.edit));
    console.log('settings:', JSON.stringify(cfg.settings));
    console.log('metadatas.page.list:', JSON.stringify(cfg.metadatas.page && cfg.metadatas.page.list));
    console.log('metadatas.enabled.list:', JSON.stringify(cfg.metadatas.enabled && cfg.metadatas.enabled.list));
    console.log('metadatas.image.mainField:', JSON.stringify(cfg.metadatas.image && cfg.metadatas.image.mainField));
  } finally {
    try { await strapi.destroy(); } catch (_) {}
  }
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });