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

module.exports = createCoreController('api::inquiry.inquiry', ({ strapi }) => ({
  /**
   * POST /api/inquiry
   * 流程：后端校验 → 写入 Inquiry → SMTP 发送销售邮件 → 返回结果
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
        },
      });
    } catch (err) {
      strapi.log.error('[inquiry] 数据库写入失败: ' + (err && err.message ? err.message : err));
      return ctx.internalServerError('INQUIRY_SAVE_FAILED');
    }

    /* ---- 再发邮件（失败不影响询盘） ---- */
    let emailSent = false;
    try {
      const result = await sendMail(
        data,
        submittedAt.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
      emailSent = result.sent;
      if (!result.sent && result.reason !== 'smtp_not_configured') {
        strapi.log.warn('[inquiry] 邮件发送失败（询盘已入库）: ' + result.reason);
      }
    } catch (err) {
      strapi.log.error('[inquiry] 邮件发送异常（询盘已入库）: ' + (err && err.message ? err.message : err));
    }

    if (emailSent) {
      try {
        await strapi.documents('api::inquiry.inquiry').update({
          documentId: entry.documentId,
          data: { email_sent: true },
        });
      } catch (err) {
        strapi.log.error('[inquiry] email_sent 状态更新失败: ' + (err && err.message ? err.message : err));
      }
    }

    ctx.body = {
      submitted: true,
      emailSent,
      documentId: entry.documentId,
    };
  },
}));
