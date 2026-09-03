/**
 * 询盘表单统一提交模块
 * 绑定页面上的 #leadForm，提交到 Strapi 询盘接口 POST /api/inquiry
 * 前端校验 + 提交状态显示；后端会再次校验。
 * 可通过 window.MINELINK_API_BASE 覆盖接口前缀（默认同源）。
 */
(function () {
  'use strict';

  var API_BASE = window.MINELINK_API_BASE || '';

  function $(id) { return document.getElementById(id); }

  function isEn() {
    try { return (localStorage.getItem('minelink-lang') || 'zh') === 'en'; } catch (e) { return false; }
  }

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  function bind() {
    var form = $('leadForm');
    if (!form || form.getAttribute('data-inquiry-bound') === '1') return;
    form.setAttribute('data-inquiry-bound', '1');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var en = isEn();
      var errEl = $('formError');
      var success = $('success');
      var btn = form.querySelector('button[type="submit"]');

      var data = {
        customer_name: field(form, 'customer_name'),
        whatsapp: field(form, 'whatsapp'),
        email: field(form, 'email'),
        country: field(form, 'country'),
        message: field(form, 'message'),
        equipment: field(form, 'equipment')
      };

      /* ---- 前端校验（与后端一致） ---- */
      var problems = [];
      if (!data.customer_name) problems.push(en ? 'Please enter your name.' : '请填写姓名。');
      if (!data.whatsapp && !data.email) problems.push(en ? 'Please provide WhatsApp/phone or email.' : '请至少填写 WhatsApp/电话或邮箱之一。');
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) problems.push(en ? 'Email format is invalid.' : '邮箱格式不正确。');
      if (!data.country) problems.push(en ? 'Please enter your country / region.' : '请填写项目所在国家 / 地区。');
      if (!data.message) problems.push(en ? 'Please describe your requirements.' : '请填写需求描述。');
      if (!data.equipment) problems.push(en ? 'Please select the equipment.' : '请选择意向设备。');

      if (errEl) {
        if (problems.length) {
          errEl.textContent = problems.join(en ? ' ' : ' ');
          errEl.style.display = 'block';
          return;
        }
        errEl.style.display = 'none';
      }

      /* ---- 提交状态 ---- */
      var origText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = en ? 'Submitting...' : '提交中...';
      }

      fetch(API_BASE + '/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (r) {
          if (r.ok && r.json && r.json.submitted) {
            if (success) success.style.display = 'block';
            if (errEl) errEl.style.display = 'none';
            if (btn) btn.textContent = en ? 'Submitted' : '已提交';
          } else {
            throw new Error('submit failed');
          }
        })
        .catch(function () {
          if (errEl) {
            errEl.textContent = en ? 'Failed to submit inquiry. Please try again.' : '提交失败，请稍后重试。';
            errEl.style.display = 'block';
          }
          if (btn) {
            btn.disabled = false;
            btn.textContent = origText;
          }
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
