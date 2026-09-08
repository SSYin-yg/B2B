'use strict';

const nodemailer = require('nodemailer');
const { createCoreController } = require('@strapi/strapi').factories;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function buildMailBody(data, submittedAt) {
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const rows = [
    ['设备', data.equipment],
    ['客户姓名', data.customer_name],
    ['Email', data.email || '—'],
    ['WhatsApp / 电话', data.whatsapp || '—'],
    ['国家 / 地区', data.country],
    ['需求描述', data.message],
    ['提交时间', submittedAt],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v || '—'}`).join('\n');
  const html = [
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">',
    '<h2 style="margin:0 0 12px">官网新询盘</h2>',
    '<table cellpadding="8" cellspacing="0" border="1" bordercolor="#e0e0e0" style="border-collapse:collapse;min-width:420px">',
    rows
      .map(
        ([k, v]) =>
          `<tr><td bgcolor="#f6f7f9" style="font-weight:600">${esc(k)}</td><td>${esc(v || '—')}</td></tr>`
      )
      .join(''),
    '</table>',
    `<p style="color:#888;margin-top:14px">此邮件由官网询盘系统自动发送，询盘已同步保存于后台（Inquiry）。</p>`,
    '</div>',
  ].join('\n');
  return { subject: `【官网询盘】${data.equipment} - ${data.customer_name}`, text, html };
}

async function sendMail(data, submittedAt) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const sales = process.env.SALES_EMAIL;

  if (!host || !user || !pass || !sales) {
    strapi.log.warn('[inquiry] SMTP 未配置（SMTP_HOST/SMTP_USER/SMTP_PASS/SALES_EMAIL），询盘仅入库。');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const { subject, text, html } = buildMailBody(data, submittedAt);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: user,
      to: sales,
      subject,
      text,
      html,
    });
    return { sent: true, reason: null };
  } finally {
    transporter.close();
  }
}

module.exports = createCoreController('api::inquiry.inquiry', ({ strapi }) => {
  // 写入邮件日志（失败不影响主流程）
  async function logMail(opts) {
    try {
      await strapi.documents('api::maillog.maillog').create({
        data: {
          type: opts.type || 'inquiry',
          to: opts.to || '',
          cc: opts.cc || '',
          bcc: opts.bcc || '',
          subject: opts.subject || '',
          status: opts.status || 'pending',
          error_message: opts.errorMessage || '',
          inquiry_id: opts.inquiryId ? String(opts.inquiryId) : '',
        },
      });
    } catch (e) {
      strapi.log.error('[mail-log] 写入失败: ' + (e && e.message ? e.message : e));
    }
  }

  return {
    /**
     * POST /api/inquiry
     * 流程：后端校验 → 写入 Inquiry → SMTP 发送销售邮件 → 记录邮件日志 → 返回结果
     * 原则：先存库，再发邮件；SMTP 失败不影响询盘保存。
     */
    async submit(ctx) {
      const body = (ctx.request && ctx.request.body) || {};

      const data = {
        equipment: str(body.equipment),
        customer_name: str(body.customer_name),
        email: str(body.email),
        whatsapp: str(body.whatsapp),
        country: str(body.country),
        message: str(body.message),
      };

      /* ---- 后端校验 ---- */
      const invalid = [];
      if (!data.customer_name) invalid.push('customer_name');
      if (!data.whatsapp && !data.email) invalid.push('contact');
      if (data.email && !EMAIL_RE.test(data.email)) invalid.push('email');
      if (!data.country) invalid.push('country');
      if (!data.message) invalid.push('message');
      if (!data.equipment) invalid.push('equipment');

      if (invalid.length) {
        return ctx.badRequest('VALIDATION_ERROR', { fields: invalid });
      }

      /* ---- 先存库 ---- */
      const submittedAt = new Date();
      let entry;
      try {
        entry = await strapi.documents('api::inquiry.inquiry').create({
          data: {
            equipment: data.equipment,
            customer_name: data.customer_name,
            email: data.email || null,
            whatsapp: data.whatsapp || null,
            country: data.country,
            message: data.message,
            submitted_at: submittedAt,
            email_sent: false,
            mail_status: 'pending',
          },
        });
      } catch (err) {
        strapi.log.error('[inquiry] 数据库写入失败: ' + (err && err.message ? err.message : err));
        return ctx.internalServerError('INQUIRY_SAVE_FAILED');
      }

      /* ---- 再发邮件（失败不影响询盘）---- */
      let emailSent = false;
      let mailStatus = 'failed';
      let errorReason = null;
      try {
        const result = await sendMail(
          data,
          submittedAt.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
        );
        emailSent = result.sent;
        mailStatus = result.sent ? 'sent' : (result.reason === 'smtp_not_configured' ? 'skipped' : 'failed');
        errorReason = result.reason;
        if (!result.sent && result.reason !== 'smtp_not_configured') {
          strapi.log.warn('[inquiry] 邮件发送失败（询盘已入库）: ' + result.reason);
        }
      } catch (err) {
        mailStatus = 'failed';
        errorReason = err && err.message ? err.message : 'exception';
        strapi.log.error('[inquiry] 邮件发送异常（询盘已入库）: ' + errorReason);
      }

      // 记录邮件日志（审计 + 重试依据）
      await logMail({
        type: 'inquiry',
        to: process.env.SALES_EMAIL || '',
        subject: `【官网询盘】${data.equipment} - ${data.customer_name}`,
        status: mailStatus,
        errorMessage: errorReason || '',
        inquiryId: entry.documentId,
      });

      try {
        await strapi.documents('api::inquiry.inquiry').update({
          documentId: entry.documentId,
          data: { email_sent: emailSent, mail_status: mailStatus },
        });
      } catch (err) {
        strapi.log.error('[inquiry] 邮件状态更新失败: ' + (err && err.message ? err.message : err));
      }

      ctx.body = {
        submitted: true,
        emailSent,
        documentId: entry.documentId,
      };
    },

    /**
     * POST /api/inquiry/retry
     * 对已有询盘重新发送通知邮件（不新建 Inquiry）。
     * 通过 x-retry-key 头校验，避免公网滥用。
     */
    async resend(ctx) {
      const key = ctx.request && ctx.request.header && ctx.request.header['x-retry-key'];
      if (!key || key !== process.env.RETRY_KEY) {
        return ctx.unauthorized('INVALID_RETRY_KEY');
      }

      const body = (ctx.request && ctx.request.body) || {};
      const documentId = body.documentId || (ctx.params && ctx.params.id);
      if (!documentId) {
        return ctx.badRequest('MISSING_DOCUMENT_ID');
      }

      let entry;
      try {
        entry = await strapi.documents('api::inquiry.inquiry').findOne({ documentId });
      } catch (err) {
        return ctx.notFound('INQUIRY_NOT_FOUND');
      }
      if (!entry) {
        return ctx.notFound('INQUIRY_NOT_FOUND');
      }

      const data = {
        equipment: entry.equipment || '',
        customer_name: entry.customer_name || '',
        email: entry.email || '',
        whatsapp: entry.whatsapp || '',
        country: entry.country || '',
        message: entry.message || '',
      };

      const submittedAt = entry.submitted_at
        ? new Date(entry.submitted_at).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
        : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

      let emailSent = false;
      let mailStatus = 'failed';
      let errorReason = null;
      try {
        const result = await sendMail(data, submittedAt);
        emailSent = result.sent;
        mailStatus = result.sent ? 'sent' : (result.reason === 'smtp_not_configured' ? 'skipped' : 'failed');
        errorReason = result.reason;
      } catch (err) {
        mailStatus = 'failed';
        errorReason = err && err.message ? err.message : 'exception';
      }

      // 写入新的邮件日志（不新建 Inquiry）
      await logMail({
        type: 'inquiry',
        to: process.env.SALES_EMAIL || '',
        subject: `【官网询盘】${data.equipment} - ${data.customer_name}`,
        status: mailStatus,
        errorMessage: errorReason || '',
        inquiryId: documentId,
      });

      try {
        await strapi.documents('api::inquiry.inquiry').update({
          documentId,
          data: { email_sent: emailSent, mail_status: mailStatus },
        });
      } catch (err) {
        strapi.log.error('[inquiry] 重试后状态更新失败: ' + (err && err.message ? err.message : err));
      }

      ctx.body = {
        retried: true,
        emailSent,
        mailStatus,
        documentId,
      };
    },
  };
});
