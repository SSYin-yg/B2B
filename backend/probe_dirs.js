const path = require('path');
const fse = require('fs-extra');
process.chdir('/var/www/B2B/backend');
const { createStrapi } = require('@strapi/strapi');
const app = createStrapi({ appDir: '/var/www/B2B/backend' });
app.load().then(() => {
  console.log('dirs.dist:', JSON.stringify(app.dirs.dist, null, 2));
  console.log('dirs.dist.root:', app.dirs.dist.root);
  const candidate1 = path.resolve(app.dirs.dist.root, 'build');
  console.log('resolve(dist,build):', candidate1, 'exists:', fse.pathExistsSync(candidate1));
  const candidate2 = path.resolve('/var/www/B2B/backend/node_modules/@strapi/admin/dist/server/server/src/routes', '../../build');
  console.log('resolve(__dirname/../../build):', candidate2, 'exists:', fse.pathExistsSync(candidate2));
  app.destroy().catch(()=>{});
  setTimeout(() => process.exit(0), 1000);
}).catch(err => {
  console.error('error:', err.message);
  process.exit(1);
});
