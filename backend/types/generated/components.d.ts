import type { Schema, Struct } from '@strapi/strapi';

export interface EquipFeature extends Struct.ComponentSchema {
  collectionName: 'components_equip_features';
  info: {
    description: '\u4E00\u6761\u4EA7\u54C1\u7279\u70B9\uFF1B\u7528\u4E8E\u8BBE\u5907\u300C\u4E2D\u6587/\u82F1\u6587\u4EA7\u54C1\u7279\u70B9\u300D\u53EF\u89C6\u5316\u5217\u8868';
    displayName: '\u4EA7\u54C1\u7279\u70B9';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface EquipModelTable extends Struct.ComponentSchema {
  collectionName: 'components_equip_model_tables';
  info: {
    description: '\u53EF\u89C6\u5316\u578B\u53F7\u89C4\u683C\u8868\uFF1A\u8868\u683C\u6807\u9898 + \u8868\u5934\u5217 + \u53C2\u6570\u884C + \u5907\u6CE8\uFF0C\u5168\u90E8\u53EF\u89C6\u5316\u7F16\u8F91';
    displayName: '\u578B\u53F7\u53C2\u6570\u8868';
    icon: 'grid';
  };
  attributes: {
    columns: Schema.Attribute.Component<'sec.spec-column', true>;
    notes: Schema.Attribute.Component<'sec.note', true>;
    rows: Schema.Attribute.Component<'sec.spec-row', true>;
    title_en: Schema.Attribute.String;
    title_zh: Schema.Attribute.String;
  };
}

export interface EquipSpec extends Struct.ComponentSchema {
  collectionName: 'components_equip_specs';
  info: {
    description: '\u4E00\u6761\u4E3B\u8981\u53C2\u6570\uFF08\u53C2\u6570\u540D\u79F0 + \u53C2\u6570\u503C\uFF09\uFF0C\u7528\u4E8E\u8BBE\u5907\u300C\u4E3B\u8981\u53C2\u6570\u300D\u53EF\u89C6\u5316\u5217\u8868';
    displayName: '\u4E3B\u8981\u53C2\u6570';
    icon: 'list';
  };
  attributes: {
    k_en: Schema.Attribute.String;
    k_zh: Schema.Attribute.String;
    v: Schema.Attribute.String;
  };
}

export interface SecGallery extends Struct.ComponentSchema {
  collectionName: 'components_sec_galleries';
  info: {
    description: '\u591A\u5F20\u56FE\u7247\u5E76\u6392\u5C55\u793A\uFF08\u5A92\u4F53\u5E93\u591A\u9009\uFF09\uFF0C\u53EF\u52A0\u7EDF\u4E00\u8BF4\u660E';
    displayName: '\u56FE\u7247\u7EC4';
    icon: 'images';
  };
  attributes: {
    caption_en: Schema.Attribute.String;
    caption_zh: Schema.Attribute.String;
    images: Schema.Attribute.Media<'images', true>;
  };
}

export interface SecHeading extends Struct.ComponentSchema {
  collectionName: 'components_sec_headings';
  info: {
    description: '\u7AE0\u8282\u6807\u9898\uFF08H2/H3\uFF09\uFF0CH2/H3 \u4F1A\u81EA\u52A8\u8FDB\u5165\u53F3\u4FA7 Contents \u76EE\u5F55';
    displayName: '\u6807\u9898';
    icon: 'heading';
  };
  attributes: {
    level: Schema.Attribute.Enumeration<['h2', 'h3']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'h2'>;
    text_en: Schema.Attribute.String;
    text_zh: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SecImage extends Struct.ComponentSchema {
  collectionName: 'components_sec_images';
  info: {
    description: '\u5355\u5F20\u6B63\u6587\u914D\u56FE\uFF08\u53EF\u653E\u5728\u6B63\u6587\u4EFB\u610F\u4F4D\u7F6E\uFF09\uFF0C\u652F\u6301\u66FF\u4EE3\u6587\u5B57\u4E0E\u56FE\u7247\u8BF4\u660E';
    displayName: '\u6B63\u6587\u56FE\u7247';
    icon: 'picture';
  };
  attributes: {
    alt_en: Schema.Attribute.String;
    alt_zh: Schema.Attribute.String;
    caption_en: Schema.Attribute.String;
    caption_zh: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface SecList extends Struct.ComponentSchema {
  collectionName: 'components_sec_lists';
  info: {
    description: '\u8981\u70B9\u5217\u8868\uFF08\u2713 \u52FE\u9009 / \u5706\u70B9 / \u7F16\u53F7\uFF09\uFF0C\u6761\u76EE\u53EF\u589E\u5220\u3001\u53EF\u6392\u5E8F';
    displayName: '\u5217\u8868';
    icon: 'bullet-list';
  };
  attributes: {
    items: Schema.Attribute.Component<'sec.list-item', true> &
      Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['check', 'bullet', 'ordered']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'check'>;
  };
}

export interface SecListItem extends Struct.ComponentSchema {
  collectionName: 'components_sec_list_items';
  info: {
    displayName: '\u5217\u8868\u6761\u76EE';
    icon: 'check';
  };
  attributes: {
    text_en: Schema.Attribute.Text;
    text_zh: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SecNote extends Struct.ComponentSchema {
  collectionName: 'components_sec_notes';
  info: {
    displayName: '\u89C4\u683C\u8868 \u00B7 \u5907\u6CE8';
    icon: 'info-circle';
  };
  attributes: {
    text_en: Schema.Attribute.Text;
    text_zh: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SecRichText extends Struct.ComponentSchema {
  collectionName: 'components_sec_rich_texts';
  info: {
    description: '\u6BB5\u843D\u6B63\u6587\uFF08\u652F\u6301\u52A0\u7C97\u3001\u659C\u4F53\u3001\u94FE\u63A5\u3001\u5F15\u7528\u3001\u5217\u8868\uFF09\uFF0C\u4E2D\u82F1\u6587\u5206\u522B\u7F16\u8F91';
    displayName: '\u6B63\u6587';
    icon: 'pencil';
  };
  attributes: {
    body_en: Schema.Attribute.Blocks;
    body_zh: Schema.Attribute.Blocks;
  };
}

export interface SecSpecCell extends Struct.ComponentSchema {
  collectionName: 'components_sec_spec_cells';
  info: {
    displayName: '\u89C4\u683C\u8868 \u00B7 \u5355\u5143\u683C';
    icon: 'text';
  };
  attributes: {
    value_en: Schema.Attribute.String;
    value_zh: Schema.Attribute.String;
  };
}

export interface SecSpecColumn extends Struct.ComponentSchema {
  collectionName: 'components_sec_spec_columns';
  info: {
    displayName: '\u89C4\u683C\u8868 \u00B7 \u5217';
    icon: 'expand';
  };
  attributes: {
    name_en: Schema.Attribute.String;
    name_zh: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SecSpecRow extends Struct.ComponentSchema {
  collectionName: 'components_sec_spec_rows';
  info: {
    description: '\u4E00\u884C\u53C2\u6570\uFF1B\u5355\u5143\u683C\u6570\u91CF\u5E94\u4E0E\u8868\u5934\u5217\u6570\u4E00\u81F4\uFF08\u6309\u5217\u987A\u5E8F\u586B\u5199\uFF09';
    displayName: '\u89C4\u683C\u8868 \u00B7 \u884C';
    icon: 'align-justify';
  };
  attributes: {
    cells: Schema.Attribute.Component<'sec.spec-cell', true>;
  };
}

export interface SecSpecTable extends Struct.ComponentSchema {
  collectionName: 'components_sec_spec_tables';
  info: {
    description: '\u89C4\u683C/\u578B\u53F7\u53C2\u6570\u8868\uFF1A\u6807\u9898 + \u8868\u5934\u5217 + \u53C2\u6570\u884C + \u5907\u6CE8\uFF0C\u5168\u90E8\u53EF\u89C6\u5316\u7F16\u8F91';
    displayName: '\u89C4\u683C\u8868';
    icon: 'grid';
  };
  attributes: {
    columns: Schema.Attribute.Component<'sec.spec-column', true>;
    notes: Schema.Attribute.Component<'sec.note', true>;
    rows: Schema.Attribute.Component<'sec.spec-row', true>;
    title_en: Schema.Attribute.String;
    title_zh: Schema.Attribute.String;
  };
}

export interface SecTable extends Struct.ComponentSchema {
  collectionName: 'components_sec_tables';
  info: {
    description: '\u53C2\u6570\u5BF9\u6BD4 / \u914D\u7F6E\u5BF9\u6BD4 / \u5C3A\u5BF8\u5BF9\u6BD4 / \u529F\u80FD\u8BF4\u660E\u7B49\u901A\u7528\u8868\u683C\uFF0C\u7F51\u683C\u5316\u53EF\u89C6\u5316\u7F16\u8F91';
    displayName: '\u666E\u901A\u8868\u683C';
    icon: 'grid';
  };
  attributes: {
    caption_en: Schema.Attribute.String;
    caption_zh: Schema.Attribute.String;
    table: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<'plugin::equip-editor.plain-table'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'equip.feature': EquipFeature;
      'equip.model-table': EquipModelTable;
      'equip.spec': EquipSpec;
      'sec.gallery': SecGallery;
      'sec.heading': SecHeading;
      'sec.image': SecImage;
      'sec.list': SecList;
      'sec.list-item': SecListItem;
      'sec.note': SecNote;
      'sec.rich-text': SecRichText;
      'sec.spec-cell': SecSpecCell;
      'sec.spec-column': SecSpecColumn;
      'sec.spec-row': SecSpecRow;
      'sec.spec-table': SecSpecTable;
      'sec.table': SecTable;
    }
  }
}
