'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // 幂等授予 public 角色所需权限：设备列表/详情只读 + 询盘提交
    const wanted = [
      'api::equipment.equipment.find',
      'api::equipment.equipment.findOne',
      'api::inquiry.inquiry.submit',
    ];
    try {
      const roles = await strapi.query('plugin::users-permissions.role').findMany({
        where: { type: 'public' },
      });
      const pub = roles && roles[0];
      if (!pub) {
        strapi.log.warn('[bootstrap] 未找到 public 角色，跳过权限授予');
        return;
      }
      const existing = await strapi.query('plugin::users-permissions.permission').findMany({
        where: { role: pub.id },
      });
      for (const action of wanted) {
        if (!existing.some((p) => p.action === action)) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action, role: pub.id },
          });
          strapi.log.info(`[bootstrap] 已授予 public 权限: ${action}`);
        }
      }
    } catch (err) {
      strapi.log.error('[bootstrap] 权限授予失败: ' + (err && err.message ? err.message : err));
    }
  },
};
