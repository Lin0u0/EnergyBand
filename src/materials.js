// OLED 材料数据库
export const MATERIALS_DATABASE = {
    // 电极材料
    electrodes: [
        { id: 'ito', name: 'ITO', fullName: '氧化铟锡', workFunction: -4.7, type: 'electrode', category: 'electrode', color: '#f59e0b' },
        { id: 'al', name: 'Al', fullName: '铝', workFunction: -4.3, type: 'electrode', category: 'electrode', color: '#6b7280' },
        { id: 'ag', name: 'Ag', fullName: '银', workFunction: -4.6, type: 'electrode', category: 'electrode', color: '#9ca3af' },
        { id: 'au', name: 'Au', fullName: '金', workFunction: -5.1, type: 'electrode', category: 'electrode', color: '#fbbf24' },
        { id: 'mg_ag', name: 'Mg:Ag', fullName: '镁银合金', workFunction: -3.7, type: 'electrode', category: 'electrode', color: '#d1d5db' },
        { id: 'lif_al', name: 'LiF/Al', fullName: '氟化锂/铝', workFunction: -2.9, type: 'electrode', category: 'electrode', color: '#9ca3af' },
        { id: 'ca', name: 'Ca', fullName: '钙', workFunction: -2.9, type: 'electrode', category: 'electrode', color: '#e5e7eb' },
        { id: 'CZT', name: 'CZT', fullName: '碲锌镉', workFunction: -4.3, type: 'electrode', category: 'electrode', color: '#e5e7eb' },
    ],

    // 空穴注入层材料 (HIL)
    hil: [
        { id: 'hatcn', name: 'HAT-CN', fullName: '六氮杂三亚苯六甲腈', homo: -9.5, lumo: -5.5, type: 'hil', category: 'hil', color: '#ec4899' },
        { id: 'pedot_pss', name: 'PEDOT:PSS', fullName: '聚噻吩-聚苯乙烯磺酸盐', homo: -5.2, lumo: -3.4, workFunction: -5.0, type: 'hil', category: 'hil', color: '#f472b6' },
        { id: 'moo3', name: 'MoO₃', fullName: '三氧化钼', homo: -9.7, lumo: -6.7, type: 'hil', category: 'hil', color: '#db2777' },
        { id: 'cuf', name: 'CuF', fullName: '氟化亚铜', homo: -5.9, lumo: -2.3, type: 'hil', category: 'hil', color: '#be185d' },
    ],

    // 空穴传输层材料 (HTL)
    htl: [
        { id: 'npb', name: 'NPB', fullName: 'N,N\'-二苯基-N,N\'-二(1-萘基)-1,1\'-联苯-4,4\'-二胺', homo: -5.4, lumo: -2.3, t1: 2.3, type: 'htl', category: 'htl', color: '#f472b6' },
        { id: 'tapc', name: 'TAPC', fullName: '4,4\'-环己基二[N,N-二(4-甲基苯基)苯胺]', homo: -5.5, lumo: -2.0, t1: 2.87, type: 'htl', category: 'htl', color: '#f9a8d4' },
        { id: 'tcta', name: 'TCTA', fullName: '三(4-咔唑-9-基苯基)胺', homo: -5.7, lumo: -2.4, t1: 2.76, type: 'htl', category: 'htl', color: '#ec4899' },
        { id: 'cbp', name: 'CBP', fullName: '4,4\'-二(9-咔唑基)联苯', homo: -6.0, lumo: -2.6, t1: 2.56, type: 'host', category: 'htl', color: '#d946ef' },
        { id: 'tpd', name: 'TPD', fullName: 'N,N\'-二苯基-N,N\'-二(3-甲基苯基)-1,1\'-联苯-4,4\'-二胺', homo: -5.4, lumo: -2.3, t1: 2.34, type: 'htl', category: 'htl', color: '#e879f9' },
        { id: 'mtdata', name: 'm-MTDATA', fullName: '4,4\',4\'\'-三(3-甲基苯基苯氨基)三苯胺', homo: -5.1, lumo: -1.9, type: 'htl', category: 'htl', color: '#fda4af' },
    ],

    // 电子阻挡层材料 (EBL)
    ebl: [
        { id: 'tcta_ebl', name: 'TCTA', fullName: '三(4-咔唑-9-基苯基)胺', homo: -5.7, lumo: -2.4, t1: 2.76, type: 'ebl', category: 'ebl', color: '#fb923c' },
        { id: 'tapc_ebl', name: 'TAPC', fullName: '4,4\'-环己基二[N,N-二(4-甲基苯基)苯胺]', homo: -5.5, lumo: -2.0, t1: 2.87, type: 'ebl', category: 'ebl', color: '#fdba74' },
        { id: 'cdbp', name: 'CDBP', fullName: '4,4\'-二(9-咔唑基)-2,2\'-二甲基联苯', homo: -6.0, lumo: -2.5, t1: 2.79, type: 'ebl', category: 'ebl', color: '#f97316' },
        { id: 'mcp', name: 'mCP', fullName: '1,3-二(9-咔唑基)苯', homo: -5.9, lumo: -2.4, t1: 2.9, type: 'ebl', category: 'ebl', color: '#ea580c' },
    ],

    // 发光层材料 (EML) - 主体材料
    eml_host: [
        { id: 'cbp_host', name: 'CBP', fullName: '4,4\'-二(9-咔唑基)联苯', homo: -6.0, lumo: -2.6, t1: 2.56, type: 'host', category: 'eml', color: '#22c55e' },
        { id: 'tcta_host', name: 'TCTA', fullName: '三(4-咔唑-9-基苯基)胺', homo: -5.7, lumo: -2.4, t1: 2.76, type: 'host', category: 'eml', color: '#4ade80' },
        { id: 'mcp_host', name: 'mCP', fullName: '1,3-二(9-咔唑基)苯', homo: -5.9, lumo: -2.4, t1: 2.9, type: 'host', category: 'eml', color: '#86efac' },
        { id: 'cdbp_host', name: 'CDBP', fullName: '4,4\'-二(9-咔唑基)-2,2\'-二甲基联苯', homo: -6.0, lumo: -2.5, t1: 2.79, type: 'host', category: 'eml', color: '#16a34a' },
        { id: 'dpepo', name: 'DPEPO', fullName: '双[2-(二苯基膦)苯基]醚氧化物', homo: -6.1, lumo: -2.0, t1: 3.0, type: 'host', category: 'eml', color: '#15803d' },
        { id: 'ppo21', name: 'PPO21', fullName: '2,8-双(二苯基膦氧基)二苯并呋喃', homo: -6.2, lumo: -2.2, t1: 3.0, type: 'host', category: 'eml', color: '#166534' },
        { id: 'tpbi_host', name: 'TPBi', fullName: '1,3,5-三(1-苯基-1H-苯并咪唑-2-基)苯', homo: -6.2, lumo: -2.7, t1: 2.74, type: 'host', category: 'eml', color: '#14532d' },
    ],

    // 发光层材料 (EML) - 掺杂材料 (磷光)
    eml_dopant_phos: [
        { id: 'irppy3', name: 'Ir(ppy)₃', fullName: '三(2-苯基吡啶)合铱', homo: -5.4, lumo: -2.7, t1: 2.42, type: 'dopant', category: 'eml', color: '#22c55e', emission: 'green' },
        { id: 'irppy2acac', name: 'Ir(ppy)₂(acac)', fullName: '双(2-苯基吡啶)(乙酰丙酮)合铱', homo: -5.3, lumo: -2.6, t1: 2.42, type: 'dopant', category: 'eml', color: '#4ade80', emission: 'green' },
        { id: 'firpic', name: 'FIrpic', fullName: '双[2-(4,6-二氟苯基)吡啶-N,C²′]吡啶甲酸合铱', homo: -5.8, lumo: -2.9, t1: 2.65, type: 'dopant', category: 'eml', color: '#3b82f6', emission: 'blue' },
        { id: 'ir_bt_2acac', name: 'Ir(bt)₂(acac)', fullName: '双(2-苯基苯并噻唑)(乙酰丙酮)合铱', homo: -5.2, lumo: -3.0, t1: 2.19, type: 'dopant', category: 'eml', color: '#f59e0b', emission: 'yellow' },
        { id: 'pqir', name: 'PQIr', fullName: '铱(III)双(2-苯基喹啉)(乙酰丙酮)', homo: -5.2, lumo: -3.1, t1: 2.1, type: 'dopant', category: 'eml', color: '#ef4444', emission: 'red' },
        { id: 'ir_piq_3', name: 'Ir(piq)₃', fullName: '三(1-苯基异喹啉)合铱', homo: -5.1, lumo: -3.0, t1: 1.95, type: 'dopant', category: 'eml', color: '#dc2626', emission: 'red' },
        { id: 'ptoeP', name: 'PtOEP', fullName: '铂(II)八乙基卟啉', homo: -5.3, lumo: -3.0, t1: 1.91, type: 'dopant', category: 'eml', color: '#b91c1c', emission: 'red' },
    ],

    // 发光层材料 (EML) - 掺杂材料 (荧光)
    eml_dopant_fluo: [
        { id: 'c545t', name: 'C545T', fullName: '10-(2-苯并咪唑基)-1,1,7,7-四甲基-2,3,6,7-四氢-1H,5H,11H-[1]吡喃[2,3-f]嘧啶[1,6-a]喹嗪-11-酮', homo: -5.3, lumo: -2.9, s1: 2.4, type: 'dopant', category: 'eml', color: '#22c55e', emission: 'green' },
        { id: 'dsa_ph', name: 'DSA-Ph', fullName: '4,4\'-双(2-(4-(N,N-二苯基氨基)苯基)乙烯基)联苯', homo: -5.5, lumo: -2.8, s1: 2.7, type: 'dopant', category: 'eml', color: '#3b82f6', emission: 'blue' },
        { id: 'rubrene', name: 'Rubrene', fullName: '5,6,11,12-四苯基并四苯', homo: -5.4, lumo: -3.2, s1: 2.3, type: 'dopant', category: 'eml', color: '#f59e0b', emission: 'yellow' },
        { id: 'dcjtb', name: 'DCJTB', fullName: '4-(二氰基亚甲基)-2-叔丁基-6-(1,1,7,7-四甲基久咯尼定基-9-乙烯基)-4H-吡喃', homo: -5.3, lumo: -3.3, s1: 2.0, type: 'dopant', category: 'eml', color: '#ef4444', emission: 'red' },
        { id: 'perylene', name: 'Perylene', fullName: '苝', homo: -5.5, lumo: -2.9, s1: 2.85, type: 'dopant', category: 'eml', color: '#60a5fa', emission: 'blue' },
    ],

    // 发光层材料 (EML) - 掺杂材料 (TADF)
    eml_dopant_tadf: [
        { id: '4czipn', name: '4CzIPN', fullName: '1,2,3,5-四(咔唑-9-基)-4,6-二氰基苯', homo: -5.8, lumo: -3.4, t1: 2.4, s1: 2.5, deltaEST: 0.1, type: 'dopant', category: 'eml', color: '#22c55e', emission: 'green' },
        { id: 'pxz_trz', name: 'PXZ-TRZ', fullName: '2-(9,9-二苯基吖啶-10(9H)-基)-4,6-二苯基-1,3,5-三嗪', homo: -5.5, lumo: -3.0, t1: 2.4, s1: 2.5, deltaEST: 0.08, type: 'dopant', category: 'eml', color: '#4ade80', emission: 'green' },
        { id: 'dmac_trz', name: 'DMAC-TRZ', fullName: '9,9-二甲基-9,10-二氢吖啶-10-基)(4,6-二苯基-1,3,5-三嗪', homo: -5.5, lumo: -3.1, t1: 2.55, s1: 2.6, deltaEST: 0.05, type: 'dopant', category: 'eml', color: '#38bdf8', emission: 'sky-blue' },
        { id: 'dabna1', name: 'DABNA-1', fullName: '多共振TADF', homo: -5.5, lumo: -2.6, t1: 2.7, s1: 2.8, deltaEST: 0.1, type: 'dopant', category: 'eml', color: '#3b82f6', emission: 'blue' },
    ],

    // 空穴阻挡层材料 (HBL)
    hbl: [
        { id: 'bcp', name: 'BCP', fullName: '2,9-二甲基-4,7-联苯-1,10-菲咯啉', homo: -6.5, lumo: -3.0, t1: 2.5, type: 'hbl', category: 'hbl', color: '#38bdf8' },
        { id: 'tpbi_hbl', name: 'TPBi', fullName: '1,3,5-三(1-苯基-1H-苯并咪唑-2-基)苯', homo: -6.2, lumo: -2.7, t1: 2.74, type: 'hbl', category: 'hbl', color: '#0ea5e9' },
        { id: 'b3pympm', name: 'B3PYMPM', fullName: '双(3-(3,5-二吡啶-3-基苯基)苯基)苯', homo: -6.8, lumo: -3.2, t1: 2.7, type: 'hbl', category: 'hbl', color: '#0284c7' },
        { id: 'balq', name: 'BAlq', fullName: '双(2-甲基-8-羟基喹啉)合(4-苯基苯酚)铝', homo: -5.9, lumo: -2.9, t1: 2.4, type: 'hbl', category: 'hbl', color: '#0369a1' },
    ],

    // 电子传输层材料 (ETL)
    etl: [
        { id: 'tpbi_etl', name: 'TPBi', fullName: '1,3,5-三(1-苯基-1H-苯并咪唑-2-基)苯', homo: -6.2, lumo: -2.7, t1: 2.74, type: 'etl', category: 'etl', color: '#60a5fa' },
        { id: 'bphen', name: 'BPhen', fullName: '4,7-联苯-1,10-菲咯啉', homo: -6.4, lumo: -3.0, type: 'etl', category: 'etl', color: '#3b82f6' },
        { id: 'alq3', name: 'Alq₃', fullName: '三(8-羟基喹啉)合铝', homo: -5.8, lumo: -3.0, t1: 2.0, type: 'etl', category: 'etl', color: '#2563eb' },
        { id: 'b4pyppm', name: 'B4PYPPM', fullName: '3,3\'-[5\'-[3-(3-吡啶基)苯基][1,1\':3\',1\'\'-三联苯]-3,3\'\'-二基]二吡啶', homo: -6.8, lumo: -3.2, type: 'etl', category: 'etl', color: '#1d4ed8' },
        { id: 'tm3pyP26pyb', name: 'Tm3PyP26PyB', fullName: '1,3,5-三(3-(3-吡啶基)苯基)苯', homo: -6.7, lumo: -3.0, type: 'etl', category: 'etl', color: '#1e40af' },
    ],

    // 电子注入层材料 (EIL)
    eil: [
        { id: 'lif', name: 'LiF', fullName: '氟化锂', workFunction: -2.9, type: 'eil', category: 'eil', color: '#a78bfa' },
        { id: 'liq', name: 'Liq', fullName: '8-羟基喹啉锂', homo: -5.3, lumo: -3.5, type: 'eil', category: 'eil', color: '#8b5cf6' },
        { id: 'cs2co3', name: 'Cs₂CO₃', fullName: '碳酸铯', workFunction: -2.2, type: 'eil', category: 'eil', color: '#7c3aed' },
        { id: 'ca_eil', name: 'Ca', fullName: '钙', workFunction: -2.9, type: 'eil', category: 'eil', color: '#6d28d9' },
        { id: 'ba', name: 'Ba', fullName: '钡', workFunction: -2.5, type: 'eil', category: 'eil', color: '#5b21b6' },
    ],

    // 自定义材料（动态添加）
    custom: [],
};

// 获取所有材料的平铺列表
export function getAllMaterials() {
    const all = [];
    Object.values(MATERIALS_DATABASE).forEach(categoryMaterials => {
        categoryMaterials.forEach(m => all.push(m));
    });
    return all;
}

// 根据类型获取材料
export function getMaterialsByCategory(category) {
    if (category === 'all') return getAllMaterials();
    if (category === 'eml') {
        return [
            ...MATERIALS_DATABASE.eml_host,
            ...MATERIALS_DATABASE.eml_dopant_phos,
            ...MATERIALS_DATABASE.eml_dopant_fluo,
            ...MATERIALS_DATABASE.eml_dopant_tadf,
        ];
    }
    return MATERIALS_DATABASE[category] || [];
}

// 根据 ID 获取材料
export function getMaterialById(id) {
    return getAllMaterials().find(m => m.id === id);
}

// 获取适合特定层类型的材料
export function getMaterialsForLayerType(layerType) {
    switch (layerType) {
        case 'anode':
        case 'cathode':
            return MATERIALS_DATABASE.electrodes;
        case 'hil':
            return MATERIALS_DATABASE.hil;
        case 'htl':
            return MATERIALS_DATABASE.htl;
        case 'ebl':
            return MATERIALS_DATABASE.ebl;
        case 'eml':
            return [
                ...MATERIALS_DATABASE.eml_host,
                ...MATERIALS_DATABASE.eml_dopant_phos,
                ...MATERIALS_DATABASE.eml_dopant_fluo,
                ...MATERIALS_DATABASE.eml_dopant_tadf,
            ];
        case 'hbl':
            return MATERIALS_DATABASE.hbl;
        case 'etl':
            return MATERIALS_DATABASE.etl;
        case 'eil':
            return MATERIALS_DATABASE.eil;
        default:
            return getAllMaterials();
    }
}

// 获取掺杂材料
export function getDopantMaterials() {
    return [
        ...MATERIALS_DATABASE.eml_dopant_phos,
        ...MATERIALS_DATABASE.eml_dopant_fluo,
        ...MATERIALS_DATABASE.eml_dopant_tadf,
    ];
}

// 层类型配置
export const LAYER_TYPES = {
    anode: { name: '阳极', shortName: 'Anode', color: '#f59e0b' },
    hil: { name: '空穴注入层', shortName: 'HIL', color: '#ec4899' },
    htl: { name: '空穴传输层', shortName: 'HTL', color: '#f472b6' },
    ebl: { name: '电子阻挡层', shortName: 'EBL', color: '#fb923c' },
    eml: { name: '发光层', shortName: 'EML', color: '#22c55e' },
    hbl: { name: '空穴阻挡层', shortName: 'HBL', color: '#38bdf8' },
    etl: { name: '电子传输层', shortName: 'ETL', color: '#60a5fa' },
    eil: { name: '电子注入层', shortName: 'EIL', color: '#a78bfa' },
    cathode: { name: '阴极', shortName: 'Cathode', color: '#6b7280' },
};
