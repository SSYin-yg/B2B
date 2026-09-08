'use strict';

/**
 * 自定义询盘路由：
 *  - POST /api/inquiry        公开提交询盘
 *  - POST /api/inquiry/resend 对已有询盘重发通知邮件（需 x-retry-key 头）
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/inquiry',
      handler: 'inquiry.submit',
      config: {},
    },
    {
      method: 'POST',
      path: '/inquiry/resend',
      handler: 'inquiry.resend',
      config: {},
    },
  ],
};
