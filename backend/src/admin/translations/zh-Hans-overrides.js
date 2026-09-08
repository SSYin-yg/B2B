/**
 * 项目级 Strapi Admin 中文翻译覆盖
 *
 * 两部分内容：
 * 1. 官方 zh-Hans 翻译缺失的系统 UI key 补全
 * 2. 本项目 Equipment / Inquiry / 正文组件的字段标签汉化
 *
 * 字段标签 key 规则（Strapi 5 content-manager 源码确认）：
 *   内容类型字段：content-manager.content-types.{uid}.{field}
 *                （编辑页 FormLayout 与列表页表头共用）
 *   组件字段：    content-manager.components.{componentUid}.{field}
 *   枚举选项：    枚举值本身（全局 key，如 "mobile" / "h2" / "sent"）
 *   组件分类：    组件目录名（如 "sec"）
 *
 * 注意：仅改 Admin 显示，不影响 API 字段名 / 数据库字段名 / slug / 前端。
 *
 * 生成：npm run build-admin-translations 时会自动合并此文件
 * 到 src/admin/translations/zh-Hans.js 末尾（后覆盖前）
 */

export default {
  // ============================================================
  // 一、官方缺失的系统 UI key
  // ============================================================
  'global.home': '主页',
  'global.media-library': '媒体库',
  'global.plugins.cloud': 'Strapi Cloud',
  'global.plugins.cloud.description': '在 Strapi Cloud 上托管您的 Strapi 项目。',
  'global.plugins.users-permissions': '用户 & 权限',
  'global.settings': '设置',
  'global.users': '用户',
  'global.roles': '角色',
  'global.user': '用户',

  // === HomePage widget ===
  'HomePage.widget.last-activity.title': '最近活动',
  'HomePage.widget.deploy-now.title': '准备上线了吗？',
  'HomePage.widget.deploy-now.description': '部署您的项目。',
  'HomePage.widget.deploy-now.button': '立即部署',
  'HomePage.widget.deploy-now.action': '立即部署',
  'global.deploy': '部署',

  // === 插件名（Strapi 动态生成的 key） ===
  'content-manager.plugin.name': '内容管理器',
  'content-manager.plugin.description': '快速查看、编辑和删除数据库中的数据。',
  'content-type-builder.plugin.name': '内容类型构建器',
  'users-permissions.plugin.name': '用户 & 权限',
  'plugin.cloud.name': 'Strapi Cloud',
  'plugin-cloud.plugin.name': 'Strapi Cloud',

  // === Row Actions ===
  'global.rowActions': '行操作',
  'content-manager.containers.List.rowActions': '行操作',
  'content-manager.containers.DynamicTable.row-actions': '行操作',

  // === Settings 子页 ===
  'global.settings.application': '应用信息',
  'global.settings.admin': '管理员面板',
  'global.settings.admin-tokens': 'API 令牌',
  'global.settings.webhooks': 'Webhooks',
  'global.settings.roles': '角色',
  'global.settings.users': '用户',
  'global.settings.media-library': '媒体库设置',
  'global.settings.i18n': '国际化',
  'global.community': '社区',
  'global.community.contributors': '贡献者',

  // === 字段类型 ===
  'content-type-builder.attributes.contentType': '内容类型',

  // === Content Manager 列表操作 ===
  'content-manager.containers.List.published': '已发布',
  'content-manager.containers.List.draft': '草稿',
  'content-manager.containers.List.edit': '编辑',
  'content-manager.containers.List.delete': '删除',
  'content-manager.containers.List.clone': '复制',

  // === 新建/编辑页标题与按钮（官方 zh-Hans 缺失） ===
  'content-manager.containers.edit.title.new': '新建条目',
  'content-manager.HeaderLayout.button.label-add-entry': '新建条目',
  'content-manager.containers.list.autoCloneModal.create': '创建',

  // === Settings 页面 ===
  'Settings.application.header': '应用信息',
  'Settings.application.title': '应用',
  'Settings.application.description': '查看并修改您的 Strapi 应用信息。',
  'Settings.application.info': '信息',
  'Settings.application.detail': '详情',
  'Settings.application.version': 'Strapi 版本',
  'Settings.application.node-version': '节点版本',
  'Settings.application.community': '社区',
  'Settings.project-type.header': '项目类型',
  'settings.application.menu': '应用信息',
  'settings.application.logo': '菜单 logo',
  'settings.application.auth-logo': '认证 logo',
  'settings.application.customisations': '定制',
  'settings.application.customisations.title': '菜单 logo',
  'settings.application.auth-logo.title': '认证 logo',

  // ============================================================
  // 二、组件分类（Dynamic Zone 组件选择器中的分组标题）
  // ============================================================
  sec: '正文组件',

  // ============================================================
  // 三、Equipment（设备）字段标签
  // ============================================================
  'content-manager.content-types.api::equipment.equipment.slug': 'URL 标识',
  'content-manager.content-types.api::equipment.equipment.name_cn': '中文名称',
  'content-manager.content-types.api::equipment.equipment.name_en': '英文名称',
  'content-manager.content-types.api::equipment.equipment.category': '设备分类',
  'content-manager.content-types.api::equipment.equipment.images': '产品图片',
  'content-manager.content-types.api::equipment.equipment.desc_zh': '中文简介',
  'content-manager.content-types.api::equipment.equipment.desc_en': '英文简介',
  'content-manager.content-types.api::equipment.equipment.features_zh': '中文产品特点',
  'content-manager.content-types.api::equipment.equipment.features_en': '英文产品特点',
  'content-manager.content-types.api::equipment.equipment.specs': '主要参数',
  'content-manager.content-types.api::equipment.equipment.model_tables': '型号参数表',
  'content-manager.content-types.api::equipment.equipment.seo_title_zh': 'SEO 标题（中文）',
  'content-manager.content-types.api::equipment.equipment.seo_title_en': 'SEO 标题（英文）',
  'content-manager.content-types.api::equipment.equipment.seo_description_zh': 'SEO 描述（中文）',
  'content-manager.content-types.api::equipment.equipment.seo_description_en': 'SEO 描述（英文）',
  'content-manager.content-types.api::equipment.equipment.og_image': '社交分享图（OG 图片）',
  'content-manager.content-types.api::equipment.equipment.content': '正文内容',

  // ============================================================
  // 四、Inquiry（询盘）字段标签
  // ============================================================
  'content-manager.content-types.api::inquiry.inquiry.equipment': '意向设备',
  'content-manager.content-types.api::inquiry.inquiry.customer_name': '客户姓名',
  'content-manager.content-types.api::inquiry.inquiry.email': '邮箱',
  'content-manager.content-types.api::inquiry.inquiry.whatsapp': 'WhatsApp / 电话',
  'content-manager.content-types.api::inquiry.inquiry.country': '国家 / 地区',
  'content-manager.content-types.api::inquiry.inquiry.message': '留言',
  'content-manager.content-types.api::inquiry.inquiry.submitted_at': '提交时间',
  'content-manager.content-types.api::inquiry.inquiry.email_sent': '邮件已发送',
  'content-manager.content-types.api::inquiry.inquiry.mail_status': '邮件状态',

  // ============================================================
  // 五、正文 Dynamic Zone 组件内部字段标签
  // ============================================================
  // 标题 Heading
  'content-manager.components.sec.heading.level': '级别（H2 / H3）',
  'content-manager.components.sec.heading.text_zh': '标题（中文）',
  'content-manager.components.sec.heading.text_en': '标题（英文）',
  // 富文本 Rich Text
  'content-manager.components.sec.rich-text.body_zh': '正文（中文）',
  'content-manager.components.sec.rich-text.body_en': '正文（英文）',
  // 图片 Image
  'content-manager.components.sec.image.image': '图片',
  'content-manager.components.sec.image.alt_zh': '替代文字（中文）',
  'content-manager.components.sec.image.alt_en': '替代文字（英文）',
  'content-manager.components.sec.image.caption_zh': '图片说明（中文）',
  'content-manager.components.sec.image.caption_en': '图片说明（英文）',
  // 图片组 Gallery
  'content-manager.components.sec.gallery.images': '图片组',
  'content-manager.components.sec.gallery.caption_zh': '图片说明（中文）',
  'content-manager.components.sec.gallery.caption_en': '图片说明（英文）',
  // 列表 List
  'content-manager.components.sec.list.variant': '列表样式',
  'content-manager.components.sec.list.items': '列表条目',
  // 列表条目 List item
  'content-manager.components.sec.list-item.text_zh': '条目（中文）',
  'content-manager.components.sec.list-item.text_en': '条目（英文）',
  // 规格表 Spec table
  'content-manager.components.sec.spec-table.title_zh': '表格标题（中文）',
  'content-manager.components.sec.spec-table.title_en': '表格标题（英文）',
  'content-manager.components.sec.spec-table.columns': '表头列（增删 / 改名 / 排序）',
  'content-manager.components.sec.spec-table.rows': '参数行（增删 / 改单元格 / 排序）',
  'content-manager.components.sec.spec-table.notes': '备注（增删 / 排序）',
  // 规格表-列
  'content-manager.components.sec.spec-column.name_zh': '列名（中文）',
  'content-manager.components.sec.spec-column.name_en': '列名（英文）',
  // 规格表-行
  'content-manager.components.sec.spec-row.cells': '单元格（按列顺序填写）',
  // 规格表-单元格
  'content-manager.components.sec.spec-cell.value_zh': '内容（中文页）',
  'content-manager.components.sec.spec-cell.value_en': '内容（英文页，留空则用中文）',
  // 规格表备注 Note
  'content-manager.components.sec.note.text_zh': '备注（中文）',
  'content-manager.components.sec.note.text_en': '备注（英文）',

  // ============================================================
  // 六、枚举选项中文（key 为枚举原始值，全局生效）
  // ============================================================
  // 设备分类 category
  mobile: '移动破碎',
  crushing: '破碎设备',
  screening: '筛分设备',
  washing: '洗选设备',
  parts: '配件',
  // 标题级别 level
  h2: 'H2（二级标题）',
  h3: 'H3（三级标题）',
  // 列表样式 variant
  check: '✓ 勾选列表',
  bullet: '● 圆点列表',
  ordered: '1. 编号列表',
  // 邮件状态 mail_status
  pending: '待发送',
  sent: '已发送',
  failed: '发送失败',
  skipped: '已跳过',
};
