import React, { useMemo, useState } from 'react';
import { Field } from '@strapi/design-system';

/* ============================================================
 * 普通表格 · 可视化网格编辑器（custom field：plugin::equip-editor.plain-table）
 *
 * 数据结构：
 * {
 *   columns: [{ name_zh, name_en }],
 *   rows:    [{ cells: [{ value_zh, value_en }] }]
 * }
 *
 * 能力：添加/删除/重命名列、添加/删除/拖动排序行、
 *       单元格直接编辑、中文页/英文页内容切换。
 * ============================================================ */

function str(v) {
  return v === null || v === undefined ? '' : String(v);
}

function clone(v) {
  return JSON.parse(JSON.stringify(v === null || v === undefined ? {} : v));
}

/** 任意输入（undefined / JSON 字符串 / 对象）→ 规整的单表格对象 */
function normalizeTable(value) {
  let v = value;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch (e) {
      v = null;
    }
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) v = {};
  return {
    columns: Array.isArray(v.columns)
      ? v.columns.map((c) => ({ name_zh: str(c && c.name_zh), name_en: str(c && c.name_en) }))
      : [],
    rows: Array.isArray(v.rows)
      ? v.rows.map((r) => ({
          cells: Array.isArray(r && r.cells)
            ? r.cells.map((c) => ({ value_zh: str(c && c.value_zh), value_en: str(c && c.value_en) }))
            : [],
        }))
      : [],
  };
}

/* ---------- 轻量样式（与 ModelTablesInput 保持一致） ---------- */
const S = {
  wrap: { width: '100%' },
  empty: {
    border: '1px dashed #c9c5f4',
    borderRadius: '4px',
    padding: '16px',
    textAlign: 'center',
    color: '#666687',
    background: '#f6f6f9',
  },
  rowFlex: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#32324d', marginRight: '4px', whiteSpace: 'nowrap' },
  input: {
    boxSizing: 'border-box',
    border: '1px solid #dcdce4',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '13px',
    color: '#32324d',
    background: '#fff',
    minWidth: '80px',
  },
  cellInput: { width: '100%', minWidth: '90px' },
  btn: {
    border: '1px solid #c9c5f4',
    borderRadius: '4px',
    background: '#f0effd',
    color: '#271fe0',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnGhost: {
    border: '1px solid #dcdce4',
    borderRadius: '4px',
    background: '#fff',
    color: '#32324d',
    padding: '4px 7px',
    fontSize: '12px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  btnDanger: {
    border: '1px solid #f6c9c9',
    borderRadius: '4px',
    background: '#fff2f2',
    color: '#b72b1a',
    padding: '4px 7px',
    fontSize: '12px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  btnActive: {
    border: '1px solid #271fe0',
    borderRadius: '4px',
    background: '#271fe0',
    color: '#fff',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  gridWrap: { overflowX: 'auto', border: '1px solid #dcdce4', borderRadius: '4px', marginBottom: '10px' },
  grid: { borderCollapse: 'collapse', width: '100%', minWidth: '480px' },
  th: {
    background: '#f6f6f9',
    borderBottom: '1px solid #dcdce4',
    padding: '6px 8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#32324d',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  td: { borderBottom: '1px solid #ececee', padding: '4px 6px' },
  dragRow: { background: '#f0effd', opacity: 0.6 },
};

function TinyBtn({ title, onClick, disabled, style, children }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled} style={{ ...S.btnGhost, ...(style || {}) }}>
      {children}
    </button>
  );
}

/* ---------- 主组件 ---------- */
export default function PlainTableInput(props) {
  const { name, value, onChange, label, hint, error, required, disabled } = props;
  const table = useMemo(() => normalizeTable(value), [value]);

  const [lang, setLang] = useState('zh');
  const [dragRow, setDragRow] = useState(null); // ri
  const k = lang;

  const emit = (next) => onChange({ target: { name, type: 'json', value: next } });

  const mutate = (fn) => {
    const next = clone(table);
    fn(next);
    emit(next);
  };

  /* ---------- 列 ---------- */
  const addColumn = () =>
    mutate((t) => {
      t.columns.push({ name_zh: '', name_en: '' });
      t.rows.forEach((r) => r.cells.push({ value_zh: '', value_en: '' }));
    });
  const removeColumn = (ci) =>
    mutate((t) => {
      t.columns.splice(ci, 1);
      t.rows.forEach((r) => r.cells.splice(ci, 1));
    });
  const renameColumn = (ci, v) =>
    mutate((t) => {
      if (t.columns[ci]) t.columns[ci]['name_' + k] = v;
    });

  /* ---------- 行 ---------- */
  const addRow = () =>
    mutate((t) => {
      t.rows.push({ cells: t.columns.map(() => ({ value_zh: '', value_en: '' })) });
    });
  const removeRow = (ri) =>
    mutate((t) => {
      t.rows.splice(ri, 1);
    });
  const moveRowTo = (from, to) =>
    mutate((t) => {
      if (from === to || to < 0 || to >= t.rows.length) return;
      const x = t.rows.splice(from, 1)[0];
      t.rows.splice(to, 0, x);
    });
  const setCell = (ri, ci, v) =>
    mutate((t) => {
      const c = t.rows[ri] && t.rows[ri].cells[ci];
      if (c) c['value_' + k] = v;
    });

  const labelText =
    typeof label === 'string' ? label : (label && (label.defaultMessage || label.id)) || '普通表格';
  const colCount = table.columns.length;

  return (
    <Field.Root name={name} hint={hint} error={error} required={required}>
      <Field.Label>{labelText}</Field.Label>

      <div style={S.wrap}>
        {colCount === 0 && table.rows.length === 0 ? (
          <div style={S.empty}>
            <div style={{ marginBottom: '8px' }}>暂无表格。点击下方按钮创建表格（默认 1 列，可随时增删）。</div>
            <button type="button" style={S.btn} onClick={addColumn} disabled={disabled}>
              + 创建表格
            </button>
          </div>
        ) : (
          <>
            {/* 语言切换 */}
            <div style={S.rowFlex}>
              <span style={S.label}>编辑内容</span>
              <button
                type="button"
                style={k === 'zh' ? S.btnActive : S.btn}
                onClick={() => setLang('zh')}
                disabled={disabled}
              >
                中文页内容
              </button>
              <button
                type="button"
                style={k === 'en' ? S.btnActive : S.btn}
                onClick={() => setLang('en')}
                disabled={disabled}
              >
                英文页内容
              </button>
              <span style={{ fontSize: '11px', color: '#8e8ea9' }}>（切换后编辑对应语言页面展示的文字）</span>
            </div>

            {/* 表头列编辑 */}
            <div style={S.rowFlex}>
              <span style={S.label}>表头列：</span>
              {table.columns.map((c, ci) => (
                <span key={ci} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <input
                    style={{ ...S.input, width: '110px' }}
                    placeholder={k === 'zh' ? '列名（中文）' : 'Column (EN)'}
                    value={k === 'zh' ? c.name_zh : c.name_en}
                    onChange={(e) => renameColumn(ci, e.target.value)}
                    disabled={disabled}
                  />
                  <TinyBtn title="删除该列（各行对应单元格同步删除）" onClick={() => removeColumn(ci)} disabled={disabled || colCount <= 1}>
                    ✕
                  </TinyBtn>
                </span>
              ))}
              <button type="button" style={S.btn} onClick={addColumn} disabled={disabled}>
                + 添加列
              </button>
            </div>

            {/* 数据行网格 */}
            <div style={S.gridWrap}>
              <table style={S.grid}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: '86px' }}>行操作</th>
                    {table.columns.map((c, ci) => (
                      <th key={ci} style={S.th}>
                        {k === 'zh' ? c.name_zh || `列${ci + 1}` : c.name_en || c.name_zh || `Col ${ci + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, ri) => (
                    <tr
                      key={ri}
                      style={dragRow === ri ? S.dragRow : undefined}
                      draggable
                      onDragStart={(e) => {
                        setDragRow(ri);
                        try {
                          e.dataTransfer.effectAllowed = 'move';
                        } catch (err) {
                          /* noop */
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragRow !== null && dragRow !== ri) moveRowTo(dragRow, ri);
                        setDragRow(null);
                      }}
                    >
                      <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                        <span title="拖动排序" style={{ cursor: 'grab', color: '#8e8ea9', marginRight: '2px' }}>
                          ☰
                        </span>
                        <TinyBtn title="上移" onClick={() => moveRowTo(ri, ri - 1)} disabled={disabled || ri === 0}>
                          ↑
                        </TinyBtn>
                        <TinyBtn title="下移" onClick={() => moveRowTo(ri, ri + 1)} disabled={disabled || ri === table.rows.length - 1}>
                          ↓
                        </TinyBtn>
                        <TinyBtn title="删除该行" style={S.btnDanger} onClick={() => removeRow(ri)} disabled={disabled}>
                          ✕
                        </TinyBtn>
                      </td>
                      {table.columns.map((c, ci) => {
                        const cell = (r.cells && r.cells[ci]) || {};
                        return (
                          <td key={ci} style={S.td}>
                            <input
                              style={S.cellInput}
                              placeholder={k === 'zh' ? '内容（中文）' : 'Value (EN)'}
                              value={k === 'zh' ? str(cell.value_zh) : str(cell.value_en)}
                              onChange={(e) => setCell(ri, ci, e.target.value)}
                              disabled={disabled}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {table.rows.length === 0 && (
                    <tr>
                      <td style={{ ...S.td, color: '#8e8ea9', fontSize: '12px' }} colSpan={colCount + 1}>
                        暂无数据行，点击下方「+ 添加行」。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={S.rowFlex}>
              <button type="button" style={S.btn} onClick={addRow} disabled={disabled}>
                + 添加行
              </button>
              <span style={{ fontSize: '11px', color: '#8e8ea9' }}>行可拖动 ☰ 排序，或用 ↑ ↓ 微调</span>
            </div>
          </>
        )}
      </div>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
}
