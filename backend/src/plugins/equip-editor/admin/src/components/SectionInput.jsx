import React from 'react';

/**
 * 编辑页分节标题（custom field：plugin::equip-editor.section）
 *
 * 仅用于把较长的编辑页在视觉上分成【基本信息】【产品资料】等区块，
 * 不承载业务数据（对应 schema 中 ui_section_* json 字段，值恒为空）。
 * 标题文本来自内容管理器布局配置中该字段的 label。
 */
export default function SectionInput({ label, hint }) {
  const text =
    typeof label === 'string' ? label : (label && (label.defaultMessage || label.id)) || '';

  const hintText =
    typeof hint === 'string' ? hint : (hint && (hint.defaultMessage || hint.id)) || '';

  return (
    <div
      style={{
        width: '100%',
        margin: '16px 0 6px',
        paddingBottom: '8px',
        borderBottom: '1px solid #dcdce4',
      }}
    >
      <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#32324d' }}>
        {'【' + text + '】'}
      </h2>
      {hintText ? (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8e8ea9' }}>{hintText}</p>
      ) : null}
    </div>
  );
}
