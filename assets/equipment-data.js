/**
 * 设备数据中心
 * 图片路径约定：assets/images/equipment/{id}.jpg  （主图）
 *               assets/images/equipment/{id}-2.jpg （可选副图）
 *               assets/images/equipment/{id}-3.jpg （可选副图）
 * 没有图片时页面会显示占位图，不影响使用。
 */
window.MinelinkEquipment = [
  {
    id: 'wheeled-jaw',
    en: 'Wheeled Jaw Crushing Station',
    cn: '轮胎式颚破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/wheeled-jaw.jpg', 'assets/images/equipment/wheeled-jaw-2.jpg'],
    desc_zh: '轮胎式颚破移动站集成给料、颚式破碎与输送，适合采石场与露天矿山快速转场。整机可牵引上路，部署快、产能稳定。',
    desc_en: 'Integrated feeding, jaw crushing and conveying on a wheeled chassis for quick site moves. Ideal for quarries and open-pit operations.',
    features_zh: ['整机可牵引转场，部署周期短', '颚腔大开口，适配中硬物料', '可选液压调整排料口', '模块化设计，便于维护'],
    features_en: ['Towable for fast relocation', 'Large jaw opening for medium-hard rock', 'Optional hydraulic CSS adjustment', 'Modular layout for easy service'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 650 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '80–250 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '110–160 kW' },
      { k_zh: '运输尺寸', k_en: 'Transport size', v: '约 14 × 2.8 × 3.8 m' }
    ]
  },
  {
    id: 'wheeled-screen',
    en: 'Wheel-type Mobile Screening Station',
    cn: '轮胎式移动筛分站',
    type: 'mobile',
    images: ['assets/images/equipment/wheeled-screen.jpg'],
    desc_zh: '多层级振动筛与给料、输送一体，可独立作业或与移动破碎站串联，实现分级出料。',
    desc_en: 'Multi-deck vibrating screen with integrated feed and conveyors. Works alone or in line with mobile crushers.',
    features_zh: ['2–4 层筛面可选', '与移动破碎站灵活串联', '轮胎底盘便于转场'],
    features_en: ['2–4 deck options', 'Easy inline with mobile crushers', 'Wheeled chassis for relocation'],
    specs: [
      { k_zh: '筛面层数', k_en: 'Decks', v: '2–4' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '100–400 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '30–75 kW' }
    ]
  },
  {
    id: 'wheeled-multi-cone',
    en: 'Wheel-type Multi-cylinder Cone Mobile Crushing Station',
    cn: '轮胎式多缸圆锥破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/wheeled-multi-cone.jpg'],
    desc_zh: '多缸液压圆锥破主机 + 轮胎移动底盘，适用于中细碎与整形，成品粒形好、产量高。',
    desc_en: 'Multi-cylinder hydraulic cone on a wheeled plant for secondary/tertiary crushing with excellent particle shape.',
    features_zh: ['多缸液压，过铁保护可靠', '成品粒形优', '适合骨料与矿石中细碎'],
    features_en: ['Reliable tramp release', 'Superior product shape', 'Secondary/tertiary aggregate & ore'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 215 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '90–380 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '160–250 kW' }
    ]
  },
  {
    id: 'wheeled-impact',
    en: 'Wheel-type Impact Mobile Crushing Station',
    cn: '轮胎式反击破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/wheeled-impact.jpg'],
    desc_zh: '反击式破碎主机，适合中等硬度物料，成品粒形好，常用于建筑骨料生产线。',
    desc_en: 'Impact crusher plant for medium-hard materials with good cubicity — common in aggregate lines.',
    features_zh: ['成品粒形佳', '适合石灰石、混凝土再生', '转场部署快'],
    features_en: ['Good product cubicity', 'Limestone & recycled concrete', 'Fast deployment'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 500 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '100–300 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '132–200 kW' }
    ]
  },
  {
    id: 'wheeled-single-cone',
    en: 'Wheel-type Single Cylinder Cone Mobile Crushing Station',
    cn: '轮胎式单缸圆锥破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/wheeled-single-cone.jpg'],
    desc_zh: '单缸液压圆锥破移动站，结构简洁、维护方便，适合中硬物料的中细碎。',
    desc_en: 'Single-cylinder hydraulic cone plant — simple structure, easy service for secondary crushing.',
    features_zh: ['液压保护与清腔', '结构简洁易维护', '适合中硬岩'],
    features_en: ['Hydraulic protection & cavity clearing', 'Simple service access', 'Medium-hard rock'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 230 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '80–320 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '132–220 kW' }
    ]
  },
  {
    id: 'crawler-impact-crusher',
    en: 'Crawler Impact Crusher Mobile Crushing Station',
    cn: '履带式反击破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/crawler-impact-crusher.jpg'],
    desc_zh: '履带底盘 + 反击破，可在复杂地形自行开行就位，适合矿山与基建临时生产线。',
    desc_en: 'Tracked impact plant that self-propels into position on rough terrain.',
    features_zh: ['履带自行开行', '适合复杂场地', '成品粒形好'],
    features_en: ['Self-propelled tracks', 'Rough-site capable', 'Good product shape'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 600 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '150–350 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '200–315 kW' }
    ]
  },
  {
    id: 'crawler-jaw',
    en: 'Crawler Jaw Crusher',
    cn: '履带式颚破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/crawler-jaw.jpg', 'assets/images/equipment/crawler-jaw-2.jpg'],
    desc_zh: '履带式颚破移动站是粗碎主力机型，可深入采面作业，减少倒运成本，广泛用于矿山与采石场。',
    desc_en: 'Tracked jaw plant for primary crushing at the face — cuts haul costs in mines and quarries.',
    features_zh: ['履带底盘，复杂地形可开行', '大开口颚腔，粗碎能力强', '可与筛分、圆锥破串联成线', '液压履带驱动，就位灵活'],
    features_en: ['Tracks for rough terrain', 'Large primary jaw opening', 'Inline with screen & cone plants', 'Hydraulic drive for precise positioning'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 800 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '150–500 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '160–250 kW' },
      { k_zh: '整机重量', k_en: 'Weight', v: '约 45–65 t' }
    ]
  },
  {
    id: 'crawler-impact',
    en: 'Crawler Impact Mobile Crushing Station',
    cn: '履带式反击破碎站',
    type: 'mobile',
    images: ['assets/images/equipment/crawler-impact.jpg'],
    desc_zh: '履带反击破，适合石灰石等中硬物料，可完成破碎与初步整形。',
    desc_en: 'Tracked impact station for limestone and medium-hard rock with primary shaping.',
    features_zh: ['履带开行', '适合骨料整形', '转场灵活'],
    features_en: ['Tracked mobility', 'Aggregate shaping', 'Flexible relocation'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 700 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '150–400 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '200–315 kW' }
    ]
  },
  {
    id: 'crawler-cone',
    en: 'Crawler Cone Mobile Crushing Station',
    cn: '履带式圆锥破移动站',
    type: 'mobile',
    images: ['assets/images/equipment/crawler-cone.jpg'],
    desc_zh: '履带圆锥破用于中细碎，常与颚破、筛分站组成完整移动生产线。',
    desc_en: 'Tracked cone plant for secondary/tertiary stages in full mobile lines.',
    features_zh: ['与颚破/筛分串联', '成品粒形稳定', '履带就位'],
    features_en: ['Works with jaw & screen plants', 'Stable product shape', 'Tracked positioning'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 240 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '100–350 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '160–250 kW' }
    ]
  },
  {
    id: 'double-tooth-roll',
    en: 'Double Tooth Roll Crusher',
    cn: '双齿辊破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/double-tooth-roll.jpg'],
    desc_zh: '双齿辊破碎机适合中等硬度物料，粒度均匀、过粉碎少，常用于煤矿、水泥原料等。',
    desc_en: 'Double-tooth roll crusher for medium-hard materials with uniform product and low fines.',
    features_zh: ['过粉碎少', '粒度均匀', '适合煤、焦、石灰石'],
    features_en: ['Low over-crushing', 'Uniform sizing', 'Coal, coke, limestone'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 300 mm' },
      { k_zh: '出料粒度', k_en: 'Product size', v: '可调' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '50–300 t/h' }
    ]
  },
  {
    id: 'heavy-hammer',
    en: 'Heavy Hammer Crusher',
    cn: '重锤式破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/heavy-hammer.jpg'],
    desc_zh: '重锤破可一次完成粗、中碎，适合硬度不高的物料，结构紧凑、投资较低。',
    desc_en: 'Heavy hammer crusher combines primary and secondary duties for softer rock with a compact layout.',
    features_zh: ['一机多级破碎', '结构紧凑', '适合中软物料'],
    features_en: ['Multi-stage in one unit', 'Compact footprint', 'Medium-soft materials'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 600 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '50–400 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '75–250 kW' }
    ]
  },
  {
    id: 'gyratory',
    en: 'Gyratory Crusher',
    cn: '旋回破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/gyratory.jpg'],
    desc_zh: '大型矿山粗碎主力，处理能力大、连续作业稳定，适合硬岩与高产能项目。',
    desc_en: 'Large-scale primary gyratory for hard rock and high-capacity continuous duty.',
    features_zh: ['大产能粗碎', '适合硬岩', '连续稳定运行'],
    features_en: ['High primary capacity', 'Hard-rock capable', 'Continuous duty'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 1200 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '500–3000+ t/h' },
      { k_zh: '适用场景', k_en: 'Application', v: '大型露天矿' }
    ]
  },
  {
    id: 'shaping',
    en: 'Shaping Crusher',
    cn: '整形破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/shaping.jpg'],
    desc_zh: '用于改善骨料粒形，提高针片状控制与成品外观，常接在二级破碎之后。',
    desc_en: 'Improves aggregate cubicity and reduces flaky particles after secondary crushing.',
    features_zh: ['优化粒形', '降低针片状', '可接二级破碎后'],
    features_en: ['Cubicity upgrade', 'Lower flakiness', 'After secondary stage'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 50 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '30–200 t/h' }
    ]
  },
  {
    id: 'multi-cylinder-cone',
    en: 'Multi-Cylinder Hydraulic Cone Crusher',
    cn: '多缸液压圆锥破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/multi-cylinder-cone.jpg'],
    desc_zh: '多缸液压圆锥破，破碎力强、过铁保护可靠，广泛用于中细碎与整形。',
    desc_en: 'Multi-cylinder hydraulic cone with strong crushing force and reliable tramp protection.',
    features_zh: ['多缸液压保护', '成品粒形优', '适合中细碎'],
    features_en: ['Multi-cylinder protection', 'Excellent shape', 'Secondary/tertiary'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 215 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '90–600 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '160–315 kW' }
    ]
  },
  {
    id: 'double-rotor-sand',
    en: 'Double-Rotor Sand Making Machine',
    cn: '双转子制砂机',
    type: 'crushing',
    images: ['assets/images/equipment/double-rotor-sand.jpg'],
    desc_zh: '双转子结构提高冲击破碎与整形效率，适合机制砂与精品骨料。',
    desc_en: 'Dual-rotor design for efficient sand making and premium aggregate shaping.',
    features_zh: ['双转子高效整形', '机制砂产量高', '可调出料细度'],
    features_en: ['Dual-rotor shaping', 'High manufactured-sand output', 'Adjustable fineness'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 50 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '60–200 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '160–320 kW' }
    ]
  },
  {
    id: 'single-cylinder-cone',
    en: 'Single-Cylinder Hydraulic Cone Crusher',
    cn: '单缸液压圆锥破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/single-cylinder-cone.jpg'],
    desc_zh: '单缸液压结构简洁，排料口调整与清腔方便，适合固定式中细碎线。',
    desc_en: 'Single-cylinder hydraulic cone with simple CSS adjustment and cavity clearing.',
    features_zh: ['液压调排料口', '清腔方便', '维护成本低'],
    features_en: ['Hydraulic CSS', 'Easy cavity clear', 'Lower maintenance'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 300 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '50–500 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '75–250 kW' }
    ]
  },
  {
    id: 'vsi',
    en: 'VSI Impact Crusher',
    cn: 'VSI 立轴冲击式破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/vsi.jpg'],
    desc_zh: '立轴冲击破（制砂机）用于制砂与整形，可实现石打石或石打铁工艺。',
    desc_en: 'Vertical shaft impact crusher for sand making and shaping (rock-on-rock or rock-on-iron).',
    features_zh: ['石打石 / 石打铁可选', '机制砂与整形', '细度可调'],
    features_en: ['Rock-on-rock / rock-on-iron', 'Sand & shaping', 'Adjustable fineness'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 50 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '60–520 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '110–500 kW' }
    ]
  },
  {
    id: 'pe-jaw',
    en: 'PE Series Jaw Crusher (Standard)',
    cn: 'PE 系列颚式破碎机（标准型）',
    type: 'crushing',
    images: ['assets/images/equipment/pe-jaw.jpg'],
    desc_zh: '经典固定式颚破，结构可靠、备件通用，适合矿山与采石场粗碎。',
    desc_en: 'Classic fixed jaw crusher with proven structure and common wear parts for primary duty.',
    features_zh: ['结构成熟可靠', '备件通用易购', '适合硬岩粗碎'],
    features_en: ['Proven structure', 'Common wear parts', 'Hard-rock primary'],
    specs: [
      { k_zh: '进料口', k_en: 'Feed opening', v: '多种规格' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '5–800 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '15–200 kW' }
    ]
  },
  {
    id: 'c-jaw',
    en: 'C Type Jaw Crusher',
    cn: 'C 型颚式破碎机',
    type: 'crushing',
    images: ['assets/images/equipment/c-jaw.jpg'],
    desc_zh: 'C 型颚破优化了腔型与机架，破碎效率更高，适合中大型固定生产线。',
    desc_en: 'C-type jaw with optimized chamber and frame for higher efficiency on fixed plants.',
    features_zh: ['优化腔型', '效率更高', '适合固定线'],
    features_en: ['Optimized chamber', 'Higher efficiency', 'Fixed-plant duty'],
    specs: [
      { k_zh: '进料粒度', k_en: 'Feed size', v: '≤ 1000 mm' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '100–1000 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '90–250 kW' }
    ]
  },
  {
    id: 'belt-conveyor',
    en: 'Belt Conveyor',
    cn: '皮带输送机',
    type: 'screening',
    images: ['assets/images/equipment/belt-conveyor.jpg'],
    desc_zh: '矿山常用带式输送机，可按产能与布置定制长度、带宽与倾角。',
    desc_en: 'Standard belt conveyors customized for capacity, length, width and incline.',
    features_zh: ['带宽与长度可定制', '可配防护与清扫', '适配破碎筛分线'],
    features_en: ['Custom width & length', 'Guards & cleaners optional', 'Fits crushing lines'],
    specs: [
      { k_zh: '带宽', k_en: 'Belt width', v: '500–1400 mm' },
      { k_zh: '输送能力', k_en: 'Capacity', v: '按设计' },
      { k_zh: '倾角', k_en: 'Incline', v: '0–18° 常见' }
    ]
  },
  {
    id: 'dewatering-screen',
    en: 'Vibrating Dewatering Screen',
    cn: '振动脱水筛',
    type: 'screening',
    images: ['assets/images/equipment/dewatering-screen.jpg'],
    desc_zh: '用于洗砂后的脱水与细料回收，降低成品含水率。',
    desc_en: 'Dewatering after sand washing to cut product moisture and recover fines.',
    features_zh: ['降低含水率', '细料回收', '可与洗砂机配套'],
    features_en: ['Lower moisture', 'Fines recovery', 'Pairs with sand washers'],
    specs: [
      { k_zh: '筛面规格', k_en: 'Screen size', v: '多种' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '30–200 t/h' }
    ]
  },
  {
    id: 'linear-screen',
    en: 'Linear Vibrating Screen',
    cn: '直线振动筛',
    type: 'screening',
    images: ['assets/images/equipment/linear-screen.jpg'],
    desc_zh: '直线轨迹振动筛，适合分级与脱水，筛分效率高、结构简洁。',
    desc_en: 'Linear-motion screen for classification and dewatering with high efficiency.',
    features_zh: ['直线振动轨迹', '分级 / 脱水', '维护方便'],
    features_en: ['Linear motion', 'Classifying / dewatering', 'Easy service'],
    specs: [
      { k_zh: '层数', k_en: 'Decks', v: '1–3' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '按规格' }
    ]
  },
  {
    id: 'circular-screen',
    en: 'Circular Vibrating Screen',
    cn: '圆振动筛',
    type: 'screening',
    images: ['assets/images/equipment/circular-screen.jpg'],
    desc_zh: '圆振动筛是矿山分级主力，筛孔可选、处理能力大。',
    desc_en: 'Circular vibrating screen — workhorse for mine and quarry classification.',
    features_zh: ['大处理量', '筛孔可配', '多层分级'],
    features_en: ['High throughput', 'Configurable apertures', 'Multi-deck'],
    specs: [
      { k_zh: '层数', k_en: 'Decks', v: '2–4' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '50–600 t/h' }
    ]
  },
  {
    id: 'vibrating-feeder',
    en: 'Vibrating Feeder',
    cn: '振动给料机',
    type: 'screening',
    images: ['assets/images/equipment/vibrating-feeder.jpg'],
    desc_zh: '向破碎机均匀给料，可带预筛功能，减少细料进入破碎腔。',
    desc_en: 'Even feed to crushers with optional grizzly to bypass fines.',
    features_zh: ['均匀给料', '可选预筛', '保护破碎机'],
    features_en: ['Even feed rate', 'Optional grizzly', 'Protects crusher'],
    specs: [
      { k_zh: '给料能力', k_en: 'Feed rate', v: '按型号' },
      { k_zh: '适用设备', k_en: 'Pairs with', v: '颚破 / 旋回破等' }
    ]
  },
  {
    id: 'vibrating-screen',
    en: 'Vibrating Screen',
    cn: '振动筛',
    type: 'screening',
    images: ['assets/images/equipment/vibrating-screen.jpg'],
    desc_zh: '通用振动筛系列，可按物料与分级要求配置筛面与层数。',
    desc_en: 'General vibrating screen range configurable by material and cut sizes.',
    features_zh: ['多层可选', '筛面可换', '适配多工况'],
    features_en: ['Multi-deck options', 'Replaceable decks', 'Wide duty range'],
    specs: [
      { k_zh: '层数', k_en: 'Decks', v: '1–4' },
      { k_zh: '处理能力', k_en: 'Capacity', v: '按规格' }
    ]
  },
  {
    id: 'double-spiral-washer',
    en: 'Double Spiral Sand Washer',
    cn: '双螺旋洗砂机',
    type: 'washing',
    images: ['assets/images/equipment/double-spiral-washer.jpg'],
    desc_zh: '双螺旋洗砂机清洗能力强，适合含泥较高的砂石料。',
    desc_en: 'Double-spiral washer for higher clay content sand and aggregate.',
    features_zh: ['清洗能力强', '适合高含泥', '与脱水筛配套'],
    features_en: ['Strong washing', 'High-clay feeds', 'Pairs with dewatering screen'],
    specs: [
      { k_zh: '处理能力', k_en: 'Capacity', v: '50–200 t/h' },
      { k_zh: '螺旋直径', k_en: 'Spiral dia.', v: '按型号' }
    ]
  },
  {
    id: 'wheel-scoop-washer',
    en: 'Wheel-and-Scoop Sand Washer',
    cn: '轮斗式洗砂机',
    type: 'washing',
    images: ['assets/images/equipment/wheel-scoop-washer.jpg'],
    desc_zh: '轮斗洗砂机结构简单、耗水相对较低，适合中小型砂场。',
    desc_en: 'Bucket-wheel sand washer — simple structure, moderate water use for mid-size plants.',
    features_zh: ['结构简单', '耗水较低', '适合中小产能'],
    features_en: ['Simple design', 'Moderate water use', 'Mid capacity plants'],
    specs: [
      { k_zh: '处理能力', k_en: 'Capacity', v: '20–150 t/h' },
      { k_zh: '装机功率', k_en: 'Power', v: '4–15 kW' }
    ]
  },
  {
    id: 'hammer-shaft',
    en: 'Crusher Hammer Shaft',
    cn: '破碎机锤轴',
    type: 'parts',
    images: ['assets/images/equipment/hammer-shaft.jpg'],
    desc_zh: '破碎机锤轴等核心旋转件，可按图纸或样品定制材质与热处理。',
    desc_en: 'Crusher hammer shafts and rotating parts — material and heat treatment to drawing or sample.',
    features_zh: ['可按图定制', '材质与热处理可选', '适配主流机型'],
    features_en: ['To drawing/sample', 'Material & HT options', 'Fits common models'],
    specs: [
      { k_zh: '材质', k_en: 'Material', v: '按工况' },
      { k_zh: '供货方式', k_en: 'Supply', v: '成品 / 毛坯' }
    ]
  },
  {
    id: 'crusher-liner',
    en: 'Crusher Liner',
    cn: '破碎机衬板',
    type: 'parts',
    images: ['assets/images/equipment/crusher-liner.jpg'],
    desc_zh: '颚板、轧臼壁、破碎壁等耐磨衬板，高锰钢或合金材质可选。',
    desc_en: 'Jaw plates, concaves, mantles and other wear liners in Mn steel or alloy.',
    features_zh: ['高锰钢 / 合金可选', '适配多品牌机型', '可按样板复制'],
    features_en: ['Mn steel / alloy', 'Multi-brand fit', 'Pattern matching'],
    specs: [
      { k_zh: '材质', k_en: 'Material', v: 'Mn13 / Mn18 / 合金' },
      { k_zh: '适用范围', k_en: 'Fits', v: '颚破 / 圆锥破等' }
    ]
  },
  {
    id: 'screen-mesh',
    en: 'Vibrating Screen Mesh',
    cn: '振动筛网',
    type: 'parts',
    images: ['assets/images/equipment/screen-mesh.jpg'],
    desc_zh: '编织网、冲孔板、聚氨酯筛板等，按孔径与材质配套供货。',
    desc_en: 'Woven wire, punched plate and PU panels — aperture and material as required.',
    features_zh: ['多种筛面形式', '孔径可定制', '耐磨寿命长'],
    features_en: ['Multiple panel types', 'Custom apertures', 'Wear life focus'],
    specs: [
      { k_zh: '形式', k_en: 'Type', v: '编织 / 冲孔 / PU' },
      { k_zh: '孔径', k_en: 'Aperture', v: '按分级要求' }
    ]
  },
  {
    id: 'hammer-heads',
    en: 'Crusher Hammer Heads',
    cn: '破碎机锤头',
    type: 'parts',
    images: ['assets/images/equipment/hammer-heads.jpg'],
    desc_zh: '锤式破碎机锤头，高铬或复合材质，提高抗冲击与耐磨寿命。',
    desc_en: 'Hammer crusher heads in high-chrome or composite alloys for impact and wear life.',
    features_zh: ['高铬 / 复合可选', '抗冲击耐磨', '可按机型配套'],
    features_en: ['High-chrome / composite', 'Impact & wear resistant', 'Model-matched'],
    specs: [
      { k_zh: '材质', k_en: 'Material', v: '高铬 / 复合' },
      { k_zh: '适用', k_en: 'Fits', v: '锤破 / 重锤破' }
    ]
  }
];
