# 05 - Inquiry 询盘管理手册

## 一、概述

询盘系统分为两部分：

| 组成 | 实现 | 位置 |
|------|------|------|
| **前端表单** | HTML 弹窗 + `assets/inquiry-form.js` | 所有页面底部 |
| **后端 API** | Strapi 自定义路由 `POST /api/inquiry` | `src/api/inquiry/routes/submit.js` + `controllers/inquiry.js` |
| **后台管理** | Strapi Inquiry 内容类型 | Admin UI 查看列表 |

数据流：

```
访客填写表单 → POST /api/inquiry
  → Inquiry 内容类型 create（先存库）
  → nodemailer 发送销售邮件（后发邮件，失败不影响入库）
  → 返回 { submitted: true, emailSent: boolean }
```

## 二、Inquiry 内容类型字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| equipment | string | 否 | 意向设备名称（通常是弹窗预填值） |
| customer_name | string | ✅ | 客户姓名 |
| email | email | 否 | 邮箱（与 whatsapp 至少填一个） |
| whatsapp | string | 否 | WhatsApp / 电话 |
| country | string | 否 | 国家 / 地区 |
| message | text | 否 | 需求描述 |
| submitted_at | datetime | — | 由后端自动设置 |
| email_sent | boolean | — | 是否成功发出销售邮件（默认 false） |

**关闭 Draft & Publish**（询盘条目不需要发布流程）。

## 三、前端表单

### 表单位置

所有静态页面底部嵌入统一的询盘弹窗（HTML 写在 `equipment/_template.html` 中，已生成到所有页面）。

### 表单字段

| 前端 name | Strapi 字段 | 校验规则 |
|----------|------------|---------|
| customer_name | customer_name | 必填 |
| email | email | 邮箱格式（regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`） |
| whatsapp | whatsapp | email 与 whatsapp **至少填一个** |
| country | country | 必填 |
| message | message | 必填 |
| equipment | equipment | 必填（由设备页预填） |

### 前端提交逻辑

见 `assets/inquiry-form.js`（POST `/api/inquiry`，含 `Submitting...` / `成功` / `失败` 状态提示）。

### 设备页弹窗预填

`equipment/{slug}.html` 页面加载时，`product-render.js` 会从内嵌数据读取当前设备名称并自动填入表单。

## 四、后端 API

### 接口信息

| 项 | 值 |
|----|-----|
| **URL** | `/api/inquiry` |
| **方法** | `POST` |
| **认证** | **无**（公开访问） |
| **Content-Type** | `application/json` |

### 请求体示例

```json
{
  "equipment": "履带式颚式移动破碎站",
  "customer_name": "张三",
  "email": "zhangsan@example.com",
  "whatsapp": "+86 13800000000",
  "country": "印度尼西亚",
  "message": "需要处理花岗岩，产量约 200t/h，请提供配置建议。"
}
```

### 成功响应

```json
{
  "submitted": true,
  "emailSent": true,
  "documentId": "abc123def456"
}
```

| 字段 | 说明 |
|------|------|
| submitted | 询盘是否已入库 |
| emailSent | SMTP 邮件是否发送成功（如果 SMTP 未配置则为 false） |
| documentId | 入库后的 Strapi documentId（可用于后台定位） |

### 失败响应

| HTTP 状态 | 场景 | 响应体 |
|-----------|------|--------|
| 400 | 参数校验失败 | `{ "status": 400, "name": "ValidationError", "message": "VALIDATION_ERROR", "details": { "fields": ["customer_name", "contact"] } }` |
| 500 | 数据库写入失败 | `{ "status": 500, "name": "InternalServerError", "message": "INQUIRY_SAVE_FAILED" }` |

⚠️ **错误响应不包含** SMTP 密码、数据库堆栈等敏感信息。

### 完整控制器逻辑（`controllers/inquiry.js`）

```
1. 解析请求体（body parser 中间件已处理 JSON）
2. 字段清洗（trim、类型转换）
3. 后端校验
   ├─ customer_name 必须有值
   ├─ email 和 whatsapp 至少一个有值
   ├─ email 格式校验
   ├─ country 必须有值
   ├─ message 必须有值
   └─ equipment 必须有值
4. 先存库 → strapi.documents('api::inquiry.inquiry').create()
   ├─ 写入 submitted_at（当前时间）
   └─ 写入 email_sent: false
5. 再发邮件 → sendMail(data, submittedAt)
   ├─ SMTP_HOST / SMTP_USER / SMTP_PASS / SALES_EMAIL 必须配置
   ├─ 未配置时仅 warn 日志，返回 { sent: false, reason: 'smtp_not_configured' }
   └─ 异常被 catch，不影响询盘保存
6. 如果邮件发送成功，更新 email_sent 为 true
7. 返回成功响应
```

### 先存库还是先发邮件？

**先存库，再发邮件**。原则：**询盘数据丢失比邮件失败更严重**。

- SMTP 未配置 → 询盘照常入库，emailSent=false
- SMTP 超时/失败 → 询盘照常入库，emailSent=false，后台日志有 warn
- 数据库写入失败 → 返回 500，前端提示失败

## 五、后台查看询盘

Strapi Admin → **📦 内容管理器** → **询盘**（Inquiry）→ **List view**

列表页显示所有询盘，最新的排在最上。点击进入详情可看到完整表单内容。

### 建议视图配置

- 默认排序：`submitted_at` desc（最新优先）
- 列表列：customer_name / equipment / country / submitted_at / email_sent
- 筛选：按 email_sent（未发送邮件优先处理）

### 邮件发送状态

Inquiry 详情页中 `email_sent` 字段为 **true** 表示销售邮件已发送；为 **false** 可能是：
- SMTP 未配置
- SMTP 发送失败
- 刚入库还未发送（极罕见）

## 六、角色权限配置

### Public 角色（匿名访客）

必须允许 Inquiry 的 **create** 权限，否则 POST `/api/inquiry` 返回 403。

设置路径：Admin → ⚙️ 设置 → Roles → Public → Inquiry collection type → 勾选 create → 保存。

### Editor / Super Admin

需要 Inquiry 的 **find / findOne** 权限才能查看列表和详情。

## 七、API 测试

### curl

```bash
curl -X POST http://localhost:1337/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "equipment": "履带式颚式移动破碎站",
    "customer_name": "测试客户",
    "email": "test@example.com",
    "whatsapp": "+628123456789",
    "country": "Indonesia",
    "message": "Need a quote"
  }'
```

### PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:1337/api/inquiry" `
  -Method Post -ContentType "application/json" `
  -Body '{"equipment":"crawler-jaw","customer_name":"Test","email":"t@t.com","whatsapp":"+123","country":"US","message":"hi"}'
```

## 八、常见问题

### Q1：提交后返回 403 Forbidden？
A1：Public 角色缺少 Inquiry create 权限。Settings → Roles → Public → Inquiry → 勾选 create。

### Q2：提交后返回 400 但前端没显示错误？
A2：检查 Inquiry create 控制器的 validations 配置。或检查 Controller 是否被中间件覆盖。

### Q3：询盘入库了但没收到邮件？
A3：检查 SMTP 配置。详见 [06-邮件通知配置手册](./06-邮件通知配置手册.md)。

### Q4：能绕过前端校验直接 POST 吗？
A4：可以。后端校验在控制器中执行，前端校验只是 UX 层面的加速反馈。后端校验失败返回 400。

### Q5：Inquiry 表数据丢失？
A5：从备份恢复 SQLite 文件（见 [10-生产环境部署手册](./10-生产环境部署手册.md)）。
