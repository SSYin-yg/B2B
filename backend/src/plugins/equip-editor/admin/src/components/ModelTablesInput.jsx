import React, { useMemo, useState } from 'react';
import { Field } from '@strapi/design-system';

/* ============================================================
 * 型号参数表 · 可视化网格编辑器（custom field Input）
 *
 * 数据结构（与原 equip.model-table 组件一致，便于迁移与复用）：
 * [
 *   {
 *     title_zh, title_en,
 *     columns: [{ name_zh, name_en }],
 *     rows:    [{ cells: [{ value_zh, value_en }] }],
 *     notes:   [{ text_zh, text_en }]
 *   }
 * ]
 * ============================================================ */

function str(v) {
  return v === null || v === undefined ? '' : String(v);
}

function clone(v) {
  return JSON.parse(JSON.stringify(v === null || v === undefined ? [] : v));
}

/** 任意输入（undefined / JSON 字符串 / 数组）→ 规整的表格数组 */
function normalizeTables(value) {
  let v = value;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch (e) {
      v = null;
    }
  }
  if (!Array.isArray(v)) return [];
  return v.map((t) => ({
    title_zh: str(t && t.title_zh),
    title_en: str(t && t.title_en),
    columns: Array.isArray(t && t.columns)
      ? t.columns.map((c) => ({ name_zh: str(c && c.name_zh), name_en: str(c && c.name_en) }))
      : [],
    rows: Array.isArray(t && t.rows)
      ? t.rows.map((r) => ({
          cells: Array.isArray(r && r.cells)
            ? r.cells.map((c) => ({ value_zh: str(c && c.value_zh), value_en: str(c && c.value_en) }))
            : [],
        }))
      : [],
    notes: Array.isArray(t && t.notes)
      ? t.notes.map((n) => ({ text_zh: str(n && n.text_zh), text_en: str(n && n.text_en) }))
      : [],
  }));
}

/* ---------- 轻量样式（不依赖额外样式文件） ---------- */
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
  card: {
    border: '1px solid #dcdce4',
    borderRadius: '4px',
    marginBottom: '12px',
    background: '#ffffff',
    overflow: 'hidden',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 12px',
    background: '#f6f6f9',
    borderBottom: '1px solid #dcdce4',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 600,
    fontSize: '13px',
  },
  cardBody: { padding: '12px' },
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
  titleInput: { flex: '1 1 200px' },
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
  noteItem: { display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' },
  noteNo: { fontSize: '12px', color: '#8e8ea9', padding: '7px 0 0 2px', minWidth: '16px' },
  noteInput: { flex: 1 },
  hintSmall: { fontSize: '11px', color: '#8e8ea9', marginTop: '2px', marginBottom: '8px' },
};

function TinyBtn({ title, onClick, disabled, style, children }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled} style={{ ...S.btnGhost, ...(style || {}) }}>
      {children}
    </button>
  );
}

/* ---------- 主组件 ---------- */
export default function ModelTablesInput(props) {
  const { name, value, onChange, label, hint, error, required, disabled } = props;
  const tables = useMemo(() => normalizeTables(value), [value]);

  const [open, setOpen] = useState({});
  const [lang, setLang] = useState({});
  const [dragRow, setDragRow] = useState(null); // { ti, ri }

  const isOpen = (ti) => (open[ti] !== undefined ? open[ti] : ti === 0);
  const lk = (ti) => (lang[ti] === 'en' ? 'en' : 'zh');

  const emit = (next) => onChange({ target: { name, type: 'json', value: next } });

  const mutate = (fn) => {
    const next = clone(tables);
    fn(next);
    emit(next);
  };

  /* ---------- 表格级 ---------- */
  const addTable = () =>
    mutate((ts) => {
      ts.push({ title_zh: '', title_en: '', columns: [{ name_zh: '', name_en: '' }], rows: [], notes: [] });
      setOpen((o) => ({ ...o, [ts.length - 1]: true }));
    });
  const removeTable = (ti) => {
    if (!window.confirm('确定删除该规格表？删除后需要保存才会生效。')) return;
    mutate((ts) => {
      ts.splice(ti, 1);
    });
    setOpen({});
  };
  const moveTable = (ti, dir) =>
    mutate((ts) => {
      const j = ti + dir;
      if (j < 0 || j >= ts.length) return;
      const x = ts.splice(ti, 1)[0];
      ts.splice(j, 0, x);
    });

  /* ---------- 列 ---------- */
  const addColumn = (ti) =>
    mutate((ts) => {
      const t = ts[ti];
      if (!t) return;
      t.columns.push({ name_zh: '', name_en: '' });
      t.rows.forEach((r) => r.cells.push({ value_zh: '', value_en: '' }));
    });
  const removeColumn = (ti, ci) =>
    mutate((ts) => {
      const t = ts[ti];
      if (!t) return;
      t.columns.splice(ci, 1);
      t.rows.forEach((r) => r.cells.splice(ci, 1));
    });
  const renameColumn = (ti, ci, key, v) =>
    mutate((ts) => {
      const c = ts[ti] && ts[ti].columns[ci];
      if (c) c['name_' + key] = v;
    });

  /* ---------- 行 ---------- */
  const addRow = (ti) =>
    mutate((ts) => {
      const t = ts[ti];
      if (!t) return;
      t.rows.push({ cells: t.columns.map(() => ({ value_zh: '', value_en: '' })) });
    });
  const removeRow = (ti, ri) =>
    mutate((ts) => {
      const t = ts[ti];
      if (t) t.rows.splice(ri, 1);
    });
  const moveRowTo = (ti, from, to) =>
    mutate((ts) => {
      const t = ts[ti];
      if (!t || from === to || to < 0 || to >= t.rows.length) return;
      const x = t.rows.splice(from, 1)[0];
      t.rows.splice(to, 0, x);
    });
  const setCell = (ti, ri, ci, key, v) =>
    mutate((ts) => {
      const c = ts[ti] && ts[ti].rows[ri] && ts[ti].rows[ri].cells[ci];
      if (c) c['value_' + key] = v;
    });

  /* ---------- 备注 ---------- */
  const addNote = (ti) =>
    mutate((ts) => {
      const t = ts[ti];
      if (t) t.notes.push({ text_zh: '', text_en: '' });
    });
  const removeNote = (ti, ni) =>
    mutate((ts) => {
      const t = ts[ti];
      if (t) t.notes.splice(ni, 1);
    });
  const moveNote = (ti, ni, dir) =>
    mutate((ts) => {
      const t = ts[ti];
      if (!t) return;
      const j = ni + dir;
      if (j < 0 || j >= t.notes.length) return;
      const x = t.notes.splice(ni, 1)[0];
      t.notes.splice(j, 0, x);
    });
  const setNote = (ti, ni, key, v) =>
    mutate((ts) => {
      const n = ts[ti] && ts[ti].notes[ni];
      if (n) n['text_' + key] = v;
    });

  const labelText =
    typeof label === 'string' ? label : (label && (label.defaultMessage || label.id)) || '型号参数表';

  return (
    <Field.Root name={name} hint={hint} error={error} required={required}>
      <Field.Label>{labelText}</Field.Label>

      <div style={S.wrap}>
        {tables.length === 0 && (
          <div style={S.empty}>
            <div style={{ marginBottom: '8px' }}>暂无规格表。点击下方按钮添加第一张型号参数表。</div>
            <button type="button" style={S.btn} onClick={addTable} disabled={disabled}>
              + 添加规格表
            </button>
          </div>
        )}

        {tables.map((t, ti) => {
          const k = lk(ti);
          const expanded = isOpen(ti);
          const colCount = t.columns.length;
          return (
            <div style={S.card} key={ti}>
              {/* 卡片头 */}
              <div
                style={S.cardHead}
                onClick={() => setOpen((o) => ({ ...o, [ti]: !expanded }))}
              >
                <span>
                  {expanded ? '▼' : '▶'} 规格表 {ti + 1}：{t.title_zh || t.title_en || '未命名'}（{t.rows.length} 行 ×{' '}
                  {colCount} 列）
                </span>
                <span style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                  <TinyBtn title="上移" onClick={() => moveTable(ti, -1)} disabled={disabled || ti === 0}>
                    ↑
                  </TinyBtn>
                  <TinyBtn title="下移" onClick={() => moveTable(ti, 1)} disabled={disabled || ti === tables.length - 1}>
                    ↓
                  </TinyBtn>
                  <button
                    type="button"
                    style={S.btnDanger}
                    onClick={() => removeTable(ti)}
                    disabled={disabled}
                  >
                    删除
                  </button>
                </span>
              </div>

              {expanded && (
                <div style={S.cardBody}>
                  {/* 表格标题 */}
                  <div style={S.rowFlex}>
                    <span style={S.label}>规格表标题</span>
                    <input
                      style={{ ...S.input, ...S.titleInput }}
                      placeholder="标题（中文），如：双齿辊式破碎机规格"
                      value={t.title_zh}
                      onChange={(e) => mutate((ts) => ts[ti] && (ts[ti].title_zh = e.target.value))}
                      disabled={disabled}
                    />
                    <input
                      style={{ ...S.input, ...S.titleInput }}
                      placeholder="Title (English)"
                      value={t.title_en}
                      onChange={(e) => mutate((ts) => ts[ti] && (ts[ti].title_en = e.target.value))}
                      disabled={disabled}
                    />
                  </div>

                  {/* 语言切换（影响列名 / 单元格 / 备注的编辑目标） */}
                  <div style={S.rowFlex}>
                    <span style={S.label}>编辑内容</span>
                    <button
                      type="button"
                      style={k === 'zh' ? S.btnActive : S.btn}
                      onClick={() => setLang((l) => ({ ...l, [ti]: 'zh' }))}
                      disabled={disabled}
                    >
                      中文页内容
                    </button>
                    <button
                      type="button"
                      style={k === 'en' ? S.btnActive : S.btn}
                      onClick={() => setLang((l) => ({ ...l, [ti]: 'en' }))}
                      disabled={disabled}
                    >
                      英文页内容
                    </button>
                    <span style={{ fontSize: '11px', color: '#8e8ea9' }}>（切换后编辑对应语言页面展示的文字）</span>
                  </div>

                  {/* 表头列编辑 */}
                  <div style={S.rowFlex}>
                    <span style={S.label}>表头列：</span>
                    {t.columns.map((c, ci) => (
                      <span key={ci} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <input
                          style={{ ...S.input, width: '110px' }}
                          placeholder={k === 'zh' ? '列名（中文）' : 'Column (EN)'}
                          value={k === 'zh' ? c.name_zh : c.name_en}
                          onChange={(e) => renameColumn(ti, ci, k, e.target.value)}
                          disabled={disabled}
                        />
                        <TinyBtn title="删除该列（各行对应单元格同步删除）" onClick={() => removeColumn(ti, ci)} disabled={disabled || colCount <= 1}>
                          ✕
                        </TinyBtn>
                      </span>
                    ))}
                    <button type="button" style={S.btn} onClick={() => addColumn(ti)} disabled={disabled}>
                      + 添加列
                    </button>
                  </div>

                  {/* 数据行网格 */}
                  <div style={S.gridWrap}>
                    <table style={S.grid}>
                      <thead>
                        <tr>
                          <th style={{ ...S.th, width: '86px' }}>行操作</th>
                          {t.columns.map((c, ci) => (
                            <th key={ci} style={S.th}>
                              {k === 'zh' ? c.name_zh || `列${ci + 1}` : c.name_en || c.name_zh || `Col ${ci + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((r, ri) => (
                          <tr
                            key={ri}
                            style={dragRow && dragRow.ti === ti && dragRow.ri === ri ? S.dragRow : undefined}
                            draggable
                            onDragStart={(e) => {
                              setDragRow({ ti, ri });
                              try {
                                e.dataTransfer.effectAllowed = 'move';
                              } catch (err) {
                                /* noop */
                              }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragRow && dragRow.ti === ti && dragRow.ri !== ri) moveRowTo(ti, dragRow.ri, ri);
                              setDragRow(null);
                            }}
                          >
                            <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                              <span
                                title="拖动排序"
                                style={{ cursor: 'grab', color: '#8e8ea9', marginRight: '2px' }}
                              >
                                ☰
                              </span>
                              <TinyBtn title="上移" onClick={() => moveRowTo(ti, ri, ri - 1)} disabled={disabled || ri === 0}>
                                ↑
                              </TinyBtn>
                              <TinyBtn
                                title="下移"
                                onClick={() => moveRowTo(ti, ri, ri + 1)}
                                disabled={disabled || ri === t.rows.length - 1}
                              >
                                ↓
                              </TinyBtn>
                              <TinyBtn title="删除该行" style={S.btnDanger} onClick={() => removeRow(ti, ri)} disabled={disabled}>
                                ✕
                              </TinyBtn>
                            </td>
                            {t.columns.map((c, ci) => {
                              const cell = (r.cells && r.cells[ci]) || {};
                              return (
                                <td key={ci} style={S.td}>
                                  <input
                                    style={S.cellInput}
                                    placeholder={k === 'zh' ? '内容（中文）' : 'Value (EN)'}
                                    value={k === 'zh' ? str(cell.value_zh) : str(cell.value_en)}
                                    onChange={(e) => setCell(ti, ri, ci, k, e.target.value)}
                                    disabled={disabled}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {t.rows.length === 0 && (
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
                    <button type="button" style={S.btn} onClick={() => addRow(ti)} disabled={disabled}>
                      + 添加行
                    </button>
                    <span style={{ fontSize: '11px', color: '#8e8ea9' }}>行可拖动 ☰ 排序，或用 ↑ ↓ 微调</span>
                  </div>

                  {/* 备注 */}
                  <div style={{ ...S.label, marginBottom: '6px' }}>备注</div>
                  {t.notes.map((n, ni) => (
                    <div style={S.noteItem} key={ni}>
                      <span style={S.noteNo}>{ni + 1}.</span>
                      <input
                        style={{ ...S.input, ...S.noteInput }}
                        placeholder={k === 'zh' ? '备注（中文），如：以上参数为常规配置。' : 'Note (English)'}
                        value={k === 'zh' ? n.text_zh : n.text_en}
                        onChange={(e) => setNote(ti, ni, k, e.target.value)}
                        disabled={disabled}
                      />
                      <TinyBtn title="上移" onClick={() => moveNote(ti, ni, -1)} disabled={disabled || ni === 0}>
                        ↑
                      </TinyBtn>
                      <TinyBtn title="下移" onClick={() => moveNote(ti, ni, 1)} disabled={disabled || ni === t.notes.length - 1}>
                        ↓
                      </TinyBtn>
                      <TinyBtn title="删除该备注" style={S.btnDanger} onClick={() => removeNote(ti, ni)} disabled={disabled}>
                        ✕
                      </TinyBtn>
                    </div>
                  ))}
                  <button type="button" style={S.btn} onClick={() => addNote(ti)} disabled={disabled}>
                    + 添加备注
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {tables.length > 0 && (
          <button type="button" style={S.btn} onClick={addTable} disabled={disabled}>
            + 添加规格表
          </button>
        )}
      </div>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
}
