/**
 * 设备数据中心
 * 完整数据请使用仓库中的 eq-part1.js + eq-part2.js + eq-loader.js
 * 或从本地 attachments 上传完整 equipment-data.js
 */
window.MinelinkEquipment = window.MinelinkEquipment || [];
if (!window.MinelinkEquipment.length && (window.MinelinkEquipmentPart1 || window.MinelinkEquipmentPart2)) {
  window.MinelinkEquipment = [].concat(window.MinelinkEquipmentPart1 || [], window.MinelinkEquipmentPart2 || []);
}
