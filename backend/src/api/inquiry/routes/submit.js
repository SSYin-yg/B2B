'use strict';

/**
 * 自定义询盘提交路由：POST /api/inquiry
 * 公开访问（权限由 bootstrap 授予 public 角色）
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/inquiry',
      handler: 'inquiry.submit',
      config: {},
    },
  ],
};
