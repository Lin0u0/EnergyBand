// OLED 能带图绘制工具 - 主应用
import {
    MATERIALS_DATABASE,
    LAYER_TYPES,
    getAllMaterials,
    getMaterialsByCategory,
    getMaterialById,
    getMaterialsForLayerType,
    getDopantMaterials
} from './materials.js';

import './styles.css';

class OLEDEnergyBandApp {
    constructor() {
        this.layers = [];
        this.selectedLayerId = null;
        this.canvas = document.getElementById('energyBandCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };

        this.settings = {
            showWorkFunction: true,
            showMaterialName: true,
            showEnergyValues: true,
            showThickness: true,
            showTriplet: true,
            vacuumAlign: false,
        };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.bindEvents();
        this.loadDefaultDevice();
        this.renderMaterialsList('all');
        this.render();
    }

    setupCanvas() {
        const resize = () => {
            const container = document.getElementById('canvasContainer');
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = container.clientWidth * dpr;
            this.canvas.height = container.clientHeight * dpr;
            this.canvas.style.width = container.clientWidth + 'px';
            this.canvas.style.height = container.clientHeight + 'px';
            this.ctx.scale(dpr, dpr);
            this.render();
        };
        resize();
        window.addEventListener('resize', resize);
    }

    bindEvents() {
        document.getElementById('addLayer').addEventListener('click', () => this.openAddLayerModal());
        document.getElementById('confirmAddLayer').addEventListener('click', () => this.addLayerFromModal());

        document.getElementById('enableCoevaporation').addEventListener('change', (e) => {
            document.getElementById('coevaporationConfig').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('newLayerType').addEventListener('change', (e) => {
            this.updateMaterialOptionsForLayerType(e.target.value);
        });

        document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => this.closeAllModals());
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMaterialsList(e.target.dataset.category);
            });
        });

        document.getElementById('materialSearch').addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            this.renderMaterialsList(activeCategory, e.target.value);
        });

        ['showWorkFunction', 'showMaterialName', 'showEnergyValues', 'showThickness', 'showTriplet', 'vacuumAlign'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', (e) => {
                    this.settings[id] = e.target.checked;
                    this.render();
                });
            }
        });

        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        document.getElementById('zoomIn').addEventListener('click', () => { this.zoom = Math.min(3, this.zoom * 1.2); this.render(); });
        document.getElementById('zoomOut').addEventListener('click', () => { this.zoom = Math.max(0.3, this.zoom / 1.2); this.render(); });
        document.getElementById('resetView').addEventListener('click', () => { this.zoom = 1; this.panX = 0; this.panY = 0; this.render(); });

        document.getElementById('exportPng').addEventListener('click', () => this.exportPNG());
        document.getElementById('exportSvg').addEventListener('click', () => this.exportSVG());

        document.getElementById('closeDetail').addEventListener('click', () => {
            this.selectedLayerId = null;
            this.renderLayersList();
            this.renderLayerDetail();
        });

        document.getElementById('confirmAddMaterial').addEventListener('click', () => this.addCustomMaterial());

        document.getElementById('saveConfig').addEventListener('click', () => this.saveConfig());
        document.getElementById('loadConfig').addEventListener('click', () => {
            document.getElementById('configFileInput').click();
        });
        document.getElementById('configFileInput').addEventListener('change', (e) => this.loadConfig(e));
    }

    loadDefaultDevice() {
        this.layers = [
            { id: this.generateId(), type: 'anode', materials: [{ id: 'ito', ratio: 100 }], thickness: 150 },
            { id: this.generateId(), type: 'hil', materials: [{ id: 'hatcn', ratio: 100 }], thickness: 10 },
            { id: this.generateId(), type: 'htl', materials: [{ id: 'npb', ratio: 100 }], thickness: 40 },
            { id: this.generateId(), type: 'ebl', materials: [{ id: 'tcta_ebl', ratio: 100 }], thickness: 10 },
            { id: this.generateId(), type: 'eml', materials: [{ id: 'cbp_host', ratio: 90 }, { id: 'irppy3', ratio: 10 }], thickness: 30 },
            { id: this.generateId(), type: 'hbl', materials: [{ id: 'tpbi_hbl', ratio: 100 }], thickness: 10 },
            { id: this.generateId(), type: 'etl', materials: [{ id: 'tpbi_etl', ratio: 100 }], thickness: 40 },
            { id: this.generateId(), type: 'eil', materials: [{ id: 'lif', ratio: 100 }], thickness: 1 },
            { id: this.generateId(), type: 'cathode', materials: [{ id: 'al', ratio: 100 }], thickness: 100 },
        ];
        this.renderLayersList();
    }

    generateId() {
        return 'layer_' + Math.random().toString(36).substr(2, 9);
    }

    renderLayersList() {
        const container = document.getElementById('layersList');
        if (this.layers.length === 0) {
            container.innerHTML = `
                <div class="empty-layers">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="3" y1="15" x2="21" y2="15"/>
                    </svg>
                    <p>暂无器件层</p>
                    <p>点击"添加层"开始配置</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.layers.map((layer) => {
            const layerConfig = LAYER_TYPES[layer.type];
            const materialNames = layer.materials.map(m => {
                const mat = getMaterialById(m.id);
                return mat ? (layer.materials.length > 1 ? `${mat.name}(${m.ratio}%)` : mat.name) : m.id;
            }).join(' : ');

            return `
                <div class="layer-item ${this.selectedLayerId === layer.id ? 'selected' : ''}" 
                     data-id="${layer.id}" draggable="true">
                    <div class="layer-color" style="background: ${layerConfig.color}"></div>
                    <div class="layer-drag-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                            <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                        </svg>
                    </div>
                    <div class="layer-info">
                        <div class="layer-type">${layerConfig.name}</div>
                        <div class="layer-materials">${materialNames}</div>
                        <div class="layer-thickness">${layer.thickness} nm</div>
                    </div>
                    <div class="layer-actions">
                        <button class="layer-action-btn edit" data-id="${layer.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="layer-action-btn delete" data-id="${layer.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.bindLayerListEvents(container);
    }

    bindLayerListEvents(container) {
        container.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.layer-action-btn')) {
                    this.selectLayer(item.dataset.id);
                }
            });
            item.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
            item.addEventListener('dragover', (e) => this.handleDragOver(e, item));
            item.addEventListener('dragleave', (e) => this.handleDragLeave(e, item));
            item.addEventListener('drop', (e) => this.handleDrop(e, item));
            item.addEventListener('dragend', () => this.handleDragEnd());
        });

        container.querySelectorAll('.layer-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLayer(btn.dataset.id);
            });
        });

        container.querySelectorAll('.layer-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectLayer(btn.dataset.id);
            });
        });
    }

    selectLayer(layerId) {
        this.selectedLayerId = layerId;
        this.renderLayersList();
        this.renderLayerDetail();
        this.render();
    }

    deleteLayer(layerId) {
        this.layers = this.layers.filter(l => l.id !== layerId);
        if (this.selectedLayerId === layerId) {
            this.selectedLayerId = null;
            this.renderLayerDetail();
        }
        this.renderLayersList();
        this.render();
    }

    renderLayerDetail() {
        const container = document.getElementById('layerDetailContent');
        const layer = this.layers.find(l => l.id === this.selectedLayerId);

        if (!layer) {
            container.innerHTML = '<p class="empty-state">选择一个层以查看详情</p>';
            return;
        }

        const layerConfig = LAYER_TYPES[layer.type];

        let html = `
            <div class="detail-section">
                <div class="detail-section-title">层类型</div>
                <div style="color: ${layerConfig.color}; font-weight: 600;">${layerConfig.name}</div>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">厚度</div>
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="number" class="form-input" id="layerThicknessInput" value="${layer.thickness}" min="1" max="1000">
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">材料组成</div>
        `;

        layer.materials.forEach((m) => {
            const mat = getMaterialById(m.id);
            if (!mat) return;

            html += `
                <div class="detail-material-card">
                    <div class="detail-material-name">${mat.name}</div>
                    ${layer.materials.length > 1 ? `<div class="detail-material-ratio">${m.ratio}%</div>` : ''}
                    <div class="detail-energy-grid">
                        ${mat.homo ? `<div class="detail-energy-item"><div class="detail-energy-label">HOMO</div><div class="detail-energy-value homo">${mat.homo} eV</div></div>` : ''}
                        ${mat.lumo ? `<div class="detail-energy-item"><div class="detail-energy-label">LUMO</div><div class="detail-energy-value lumo">${mat.lumo} eV</div></div>` : ''}
                        ${mat.t1 ? `<div class="detail-energy-item"><div class="detail-energy-label">T₁</div><div class="detail-energy-value t1">${mat.t1} eV</div></div>` : ''}
                        ${mat.workFunction ? `<div class="detail-energy-item"><div class="detail-energy-label">功函数</div><div class="detail-energy-value">${mat.workFunction} eV</div></div>` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        document.getElementById('layerThicknessInput').addEventListener('change', (e) => {
            layer.thickness = parseInt(e.target.value) || 1;
            this.renderLayersList();
            this.render();
        });
    }

    renderMaterialsList(category, searchQuery = '') {
        const container = document.getElementById('materialsList');
        let materials = getMaterialsByCategory(category);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            materials = materials.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.fullName.toLowerCase().includes(query)
            );
        }

        container.innerHTML = materials.map(m => `
            <div class="material-item" data-id="${m.id}" draggable="true">
                <div class="material-info">
                    <div class="material-name">${m.name}</div>
                    <div class="material-levels">
                        ${m.homo ? `HOMO: ${m.homo}` : ''}${m.lumo ? ` / LUMO: ${m.lumo}` : ''}
                        ${m.workFunction ? `WF: ${m.workFunction} eV` : ''}
                    </div>
                </div>
                <span class="material-tag ${m.type}">${m.type}</span>
            </div>
        `).join('');

        container.innerHTML += `
            <div class="material-item" id="addCustomMaterial" style="justify-content: center; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span style="margin-left: 8px;">添加自定义材料</span>
            </div>
        `;

        document.getElementById('addCustomMaterial').addEventListener('click', () => {
            this.openCustomMaterialModal();
        });
    }

    openAddLayerModal() {
        const modal = document.getElementById('addLayerModal');
        modal.classList.add('active');
        document.getElementById('newLayerType').value = 'eml';
        document.getElementById('enableCoevaporation').checked = false;
        document.getElementById('coevaporationConfig').style.display = 'none';
        document.getElementById('newLayerThickness').value = 30;
        this.updateMaterialOptionsForLayerType('eml');
    }

    updateMaterialOptionsForLayerType(layerType) {
        const materials = getMaterialsForLayerType(layerType);
        const hostSelect = document.getElementById('newLayerMaterial');
        const dopant1Select = document.getElementById('dopant1Material');
        const dopant2Select = document.getElementById('dopant2Material');

        document.getElementById('coevaporationGroup').style.display = layerType === 'eml' ? 'block' : 'none';

        const hostMaterials = materials.filter(m => m.type === 'host' || m.type === 'electrode' || !['dopant'].includes(m.type));
        hostSelect.innerHTML = hostMaterials.map(m => `<option value="${m.id}">${m.name} (${m.fullName})</option>`).join('');

        const dopants = getDopantMaterials();
        dopant1Select.innerHTML = dopants.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        dopant2Select.innerHTML = '<option value="">不使用</option>' + dopants.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    addLayerFromModal() {
        const type = document.getElementById('newLayerType').value;
        const mainMaterialId = document.getElementById('newLayerMaterial').value;
        const thickness = parseInt(document.getElementById('newLayerThickness').value) || 30;
        const enableCoevap = document.getElementById('enableCoevaporation').checked;

        const materials = [{ id: mainMaterialId, ratio: 100 }];

        if (enableCoevap && type === 'eml') {
            const dopant1Id = document.getElementById('dopant1Material').value;
            const dopant1Ratio = parseInt(document.getElementById('dopant1Ratio').value) || 10;
            const dopant2Id = document.getElementById('dopant2Material').value;
            const dopant2Ratio = parseInt(document.getElementById('dopant2Ratio').value) || 0;

            let hostRatio = 100 - dopant1Ratio - dopant2Ratio;
            if (hostRatio < 0) hostRatio = 0;

            materials[0].ratio = hostRatio;
            if (dopant1Id) materials.push({ id: dopant1Id, ratio: dopant1Ratio });
            if (dopant2Id && dopant2Ratio > 0) materials.push({ id: dopant2Id, ratio: dopant2Ratio });
        }

        const newLayer = { id: this.generateId(), type, materials, thickness };
        const typeOrder = ['anode', 'hil', 'htl', 'ebl', 'eml', 'hbl', 'etl', 'eil', 'cathode'];
        const newTypeIndex = typeOrder.indexOf(type);
        let insertIndex = this.layers.length;

        for (let i = 0; i < this.layers.length; i++) {
            const layerTypeIndex = typeOrder.indexOf(this.layers[i].type);
            if (layerTypeIndex > newTypeIndex) {
                insertIndex = i;
                break;
            }
        }

        this.layers.splice(insertIndex, 0, newLayer);
        this.closeAllModals();
        this.renderLayersList();
        this.render();
    }

    openCustomMaterialModal() {
        document.getElementById('customMaterialModal').classList.add('active');
    }

    addCustomMaterial() {
        const name = document.getElementById('customMaterialName').value.trim();
        const homo = parseFloat(document.getElementById('customMaterialHomo').value);
        const lumo = parseFloat(document.getElementById('customMaterialLumo').value);
        const t1 = parseFloat(document.getElementById('customMaterialT1').value) || null;
        const type = document.getElementById('customMaterialType').value;

        if (!name) { alert('请输入材料名称'); return; }
        if (isNaN(homo) && isNaN(lumo)) { alert('请至少输入 HOMO 或 LUMO 能级'); return; }

        const newMaterial = {
            id: 'custom_' + Math.random().toString(36).substr(2, 9),
            name, fullName: name,
            homo: isNaN(homo) ? null : homo,
            lumo: isNaN(lumo) ? null : lumo,
            t1, type,
            category: type === 'electrode' ? 'electrode' : 'eml',
            color: '#6b7280',
        };

        MATERIALS_DATABASE.custom.push(newMaterial);
        this.closeAllModals();
        this.renderMaterialsList('all');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }

    // 拖拽相关
    handleDragStart(e, item) {
        this.draggedLayerId = item.dataset.id;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.id);
        setTimeout(() => { item.style.opacity = '0.4'; }, 0);
    }

    handleDragOver(e, item) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (item.dataset.id !== this.draggedLayerId) {
            document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('drag-over'));
            item.classList.add('drag-over');
        }
    }

    handleDrop(e, targetItem) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = targetItem.dataset.id;

        document.querySelectorAll('.layer-item').forEach(el => {
            el.classList.remove('drag-over');
            el.style.opacity = '';
        });

        if (!this.draggedLayerId || this.draggedLayerId === targetId) return;

        const fromIndex = this.layers.findIndex(l => l.id === this.draggedLayerId);
        const toIndex = this.layers.findIndex(l => l.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return;

        const [movedLayer] = this.layers.splice(fromIndex, 1);
        this.layers.splice(toIndex, 0, movedLayer);
        this.draggedLayerId = null;
        this.renderLayersList();
        this.render();
    }

    handleDragEnd() {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
            item.style.opacity = '';
        });
        this.draggedLayerId = null;
    }

    handleDragLeave(e, item) {
        item.classList.remove('drag-over');
    }

    // 画布交互
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.3, Math.min(3, this.zoom * delta));
        this.render();
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.panX += dx;
        this.panY += dy;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.render();
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 渲染能带图
    render() {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.width / dpr;
        const height = this.canvas.height / dpr;

        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(0, 0, width, height);

        if (this.layers.length === 0) {
            ctx.fillStyle = '#6b6b80';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('添加器件层以生成能带图', width / 2, height / 2);
            return;
        }

        ctx.save();
        ctx.translate(width / 2 + this.panX, height / 2 + this.panY);
        ctx.scale(this.zoom, this.zoom);

        const totalWidth = this.layers.reduce((sum, l) => {
            const isElectrode = l.type === 'anode' || l.type === 'cathode';
            return sum + (isElectrode ? 80 : Math.max(50, l.thickness * 1.0));
        }, 0);
        const layerHeight = 280;
        const startX = -totalWidth / 2;

        let minEnergy = -2, maxEnergy = -8;
        this.layers.forEach(layer => {
            layer.materials.forEach(m => {
                const mat = getMaterialById(m.id);
                if (mat) {
                    if (mat.homo) { minEnergy = Math.max(minEnergy, mat.homo); maxEnergy = Math.min(maxEnergy, mat.homo); }
                    if (mat.lumo) { minEnergy = Math.max(minEnergy, mat.lumo); maxEnergy = Math.min(maxEnergy, mat.lumo); }
                    if (mat.workFunction) { minEnergy = Math.max(minEnergy, mat.workFunction); maxEnergy = Math.min(maxEnergy, mat.workFunction); }
                }
            });
        });

        const energyToY = (energy) => {
            const range = minEnergy - maxEnergy;
            const normalized = (minEnergy - energy) / range;
            return -layerHeight / 2 + normalized * layerHeight;
        };

        this.drawGrid(ctx, startX, totalWidth, layerHeight, energyToY, minEnergy, maxEnergy);

        let currentX = startX;
        this.layers.forEach((layer, index) => {
            const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
            const layerWidth = isElectrode ? 80 : Math.max(50, layer.thickness * 1.0);
            const layerConfig = LAYER_TYPES[layer.type];
            const isSelected = layer.id === this.selectedLayerId;
            this.drawLayer(ctx, layer, currentX, layerWidth, layerHeight, energyToY, layerConfig, isSelected, index);
            currentX += layerWidth;
        });

        this.drawEnergyAxis(ctx, startX - 60, layerHeight, energyToY, minEnergy, maxEnergy);
        ctx.restore();
    }

    drawGrid(ctx, startX, totalWidth, layerHeight, energyToY, minEnergy, maxEnergy) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let e = Math.floor(maxEnergy); e <= Math.ceil(minEnergy); e++) {
            const y = energyToY(e);
            ctx.beginPath();
            ctx.moveTo(startX - 80, y);
            ctx.lineTo(startX + totalWidth + 20, y);
            ctx.stroke();
        }
    }

    drawEnergyAxis(ctx, x, layerHeight, energyToY, minEnergy, maxEnergy) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, energyToY(minEnergy) - 10);
        ctx.lineTo(x, energyToY(maxEnergy) + 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, energyToY(maxEnergy) + 10);
        ctx.lineTo(x - 5, energyToY(maxEnergy) + 20);
        ctx.lineTo(x + 5, energyToY(maxEnergy) + 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#a0a0b5';

        for (let e = Math.floor(maxEnergy); e <= Math.ceil(minEnergy); e++) {
            const y = energyToY(e);
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.stroke();
            ctx.fillText(`${e} eV`, x - 10, y - 5);
        }
    }

    drawLayer(ctx, layer, x, width, height, energyToY, layerConfig, isSelected) {
        const centerX = x + width / 2;
        const materials = layer.materials.map(m => ({ ...m, data: getMaterialById(m.id) })).filter(m => m.data);
        if (materials.length === 0) return;

        const mainMat = materials[0].data;
        const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
        const isEML = layer.type === 'eml' && materials.length > 1;

        // 选中高亮
        if (isSelected) {
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x, -height / 2 - 40, width, height + 80);
            ctx.setLineDash([]);
        }

        if (isElectrode) {
            // 电极：不画框，只画功函数线，名称写在能级前
            this.drawElectrode(ctx, layer, x, width, height, energyToY, layerConfig, mainMat, centerX);
        } else if (isEML) {
            // EML：主体和掺杂分别用两个框表示
            this.drawEMLLayer(ctx, layer, x, width, height, energyToY, layerConfig, materials, isSelected, centerX);
        } else {
            // 普通有机层
            this.drawOrganicLayer(ctx, layer, x, width, height, energyToY, layerConfig, materials, isSelected, centerX);
        }

        // 层类型标签（顶部）
        // 层类型标签（顶部）
        ctx.fillStyle = layerConfig.color;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(layerConfig.shortName, centerX, -height / 2 - 25);

        // 厚度显示在各自的绘制函数中处理
    }

    // 绘制电极 - 不画框，名称写在能级前面
    drawElectrode(ctx, layer, x, width, height, energyToY, layerConfig, mainMat, centerX) {
        const wfY = mainMat.workFunction ? energyToY(mainMat.workFunction) : null;

        if (wfY !== null) {
            const lineX = x + 4;
            const lineWidth = width - 8;

            // 功函数能级线
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(lineX, wfY);
            ctx.lineTo(lineX + lineWidth, wfY);
            ctx.stroke();

            // 材料名称写在能级线前面（左侧）- 不旋转
            if (this.settings.showMaterialName) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(mainMat.name, centerX, wfY - 8);
            }

            // 功函数数值
            if (this.settings.showEnergyValues) {
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${mainMat.workFunction} eV`, centerX, wfY + 4);
            }

            // 厚度（在材料名称下方）
            if (this.settings.showThickness) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${layer.thickness}nm`, centerX, wfY + 18);
            }
        }
    }

    // 绘制 EML 层 - 大框（host）包含小框（dopant）
    drawEMLLayer(ctx, layer, x, width, height, energyToY, layerConfig, materials, isSelected, centerX) {
        const hostMat = materials.find(m => m.data.type === 'host')?.data || materials[0].data;
        const dopantMats = materials.filter(m => m.data.type === 'dopant').map(m => m.data);

        // 绘制 host 外层大框（使用整个宽度）
        if (hostMat.homo && hostMat.lumo) {
            const hostHomoY = energyToY(hostMat.homo);
            const hostLumoY = energyToY(hostMat.lumo);

            // host 大框填充
            ctx.fillStyle = this.hexToRgba(layerConfig.color, isSelected ? 0.35 : 0.2);
            ctx.fillRect(x + 2, hostLumoY, width - 4, hostHomoY - hostLumoY);
            ctx.strokeStyle = layerConfig.color;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(x + 2, hostLumoY, width - 4, hostHomoY - hostLumoY);

            // host HOMO/LUMO 线（比框短）
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x + 1.5, hostHomoY);
            ctx.lineTo(x + width - 1.5, hostHomoY);
            ctx.stroke();

            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(x + 1.5, hostLumoY);
            ctx.lineTo(x + width - 1.5, hostLumoY);
            ctx.stroke();

            // host 名称显示在左侧边缘（如果有 dopant）
            // (Host Name rendering moved to end of function)

            // host T1 能级
            if (this.settings.showTriplet && hostMat.t1) {
                const t1Energy = hostMat.homo + hostMat.t1;
                const t1Y = energyToY(t1Energy);
                ctx.strokeStyle = '#8b5cf6';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(x + 6, t1Y);
                ctx.lineTo(x + width - 6, t1Y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // 在 host 大框内部绘制 dopant 小框
        if (dopantMats.length > 0) {
            // Dopant 变窄且右对齐，留出左侧空间给 Host 名称
            const dopantRatio = 0.65;
            const rightPadding = 4;
            const innerWidth = (width - 4) * dopantRatio;
            const innerX = (x + width - 2) - rightPadding - innerWidth;

            dopantMats.forEach((dopant, di) => {
                if (!dopant.homo || !dopant.lumo) return;

                const dopantHomoY = energyToY(dopant.homo);
                const dopantLumoY = energyToY(dopant.lumo);

                // dopant 小框使用不同颜色区分
                const dopantColors = ['#ec4899', '#a855f7', '#06b6d4']; // 粉色、紫色、青色
                const dopantColor = dopant.color || dopantColors[di % dopantColors.length];

                // 小框填充
                ctx.fillStyle = this.hexToRgba(dopantColor, isSelected ? 0.45 : 0.3);
                ctx.fillRect(innerX, dopantLumoY, innerWidth, dopantHomoY - dopantLumoY);

                // 小框边框
                ctx.strokeStyle = dopantColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(innerX, dopantLumoY, innerWidth, dopantHomoY - dopantLumoY);

                // dopant HOMO/LUMO 线（比框短）
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(innerX + 1, dopantHomoY);
                ctx.lineTo(innerX + innerWidth - 1, dopantHomoY);
                ctx.stroke();

                ctx.strokeStyle = '#3b82f6';
                ctx.beginPath();
                ctx.moveTo(innerX + 1, dopantLumoY);
                ctx.lineTo(innerX + innerWidth - 1, dopantLumoY);
                ctx.stroke();

                // dopant 名称（在小框中心）
                if (this.settings.showMaterialName) {
                    const dopantCenterY = (dopantHomoY + dopantLumoY) / 2;
                    const dopantCenterX = innerX + innerWidth / 2;
                    ctx.save();
                    ctx.translate(dopantCenterX, dopantCenterY);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                    ctx.font = 'bold 9px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dopant.name, 0, 0);
                    ctx.restore();
                }

                // dopant T1 能级
                if (this.settings.showTriplet && dopant.t1) {
                    const t1Energy = dopant.homo + dopant.t1;
                    const t1Y = energyToY(t1Energy);
                    ctx.strokeStyle = '#8b5cf6';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.moveTo(innerX + 5, t1Y);
                    ctx.lineTo(innerX + innerWidth - 5, t1Y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            });
        }

        // 厚度（在材料名称下方）
        if (this.settings.showThickness && hostMat.homo && hostMat.lumo) {
            const fillCenterY = (energyToY(hostMat.homo) + energyToY(hostMat.lumo)) / 2;

            // 如果有 dopant，厚度文字对齐到 dopant 框中间
            let textX = centerX;
            if (dopantMats.length > 0) {
                const dopantRatio = 0.65;
                const rightPadding = 4;
                const innerWidth = (width - 4) * dopantRatio;
                const innerX = (x + width - 2) - rightPadding - innerWidth;
                textX = innerX + innerWidth / 2;
            }

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`${layer.thickness}nm`, textX, fillCenterY + 8);
        }

        // Host 名称显示 - 移到最后绘制以防遮挡
        // 需要重新获取 hostHomoY/hostLumoY，或在此逻辑中重新计算
        if (hostMat.homo && hostMat.lumo) {
            const hostHomoY = energyToY(hostMat.homo);
            const hostLumoY = energyToY(hostMat.lumo);

            if (this.settings.showMaterialName) {
                if (dopantMats.length > 0) {
                    // 有 dopant 时，host 名称显示在左侧留白区域中心
                    // 左侧留白区域是从 x 到 innerX
                    // innerX 定义在上面作用域，这里需要重新根据逻辑估算，或者简单地使用 x + width * 0.175 (大约是左侧35%的一半)
                    // 更精确的做法：
                    const dopantRatio = 0.65;
                    const rightPadding = 6;
                    const innerWidth = (width - 4) * dopantRatio;
                    // const innerX = (x + width - 2) - rightPadding - innerWidth;
                    // 左侧剩余空间宽度 = width - 4 - innerWidth - rightPadding (approx)
                    // 实际上左侧留白是从 x+2 到 innerX

                    const leftSpaceCenter = x + ((width - 4) * (1 - dopantRatio)) / 2;

                    ctx.save();
                    ctx.translate(leftSpaceCenter, (hostHomoY + hostLumoY) / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.font = 'bold 9px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(hostMat.name, 0, 0);
                    ctx.restore();
                } else {
                    // 没有 dopant 时居中显示
                    const fillCenterY = (hostHomoY + hostLumoY) / 2;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.font = 'bold 9px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(hostMat.name, centerX, fillCenterY);
                }
            }

            if (this.settings.showEnergyValues) {
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ef4444';
                ctx.fillText(`${hostMat.homo} eV`, centerX, hostHomoY + 12);
                ctx.fillStyle = '#3b82f6';
                ctx.fillText(`${hostMat.lumo} eV`, centerX, hostLumoY - 6);
            }
        }
    }

    // 绘制普通有机层
    drawOrganicLayer(ctx, layer, x, width, height, energyToY, layerConfig, materials, isSelected, centerX) {
        const mat = materials[0].data;

        if (mat.homo && mat.lumo) {
            const homoY = energyToY(mat.homo);
            const lumoY = energyToY(mat.lumo);

            // 半透明填充
            const alpha = isSelected ? 0.4 : 0.25;
            ctx.fillStyle = this.hexToRgba(layerConfig.color, alpha);
            ctx.fillRect(x + 2, lumoY, width - 4, homoY - lumoY);

            // 边框
            ctx.strokeStyle = layerConfig.color;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(x + 2, lumoY, width - 4, homoY - lumoY);

            // HOMO/LUMO 线（比框短）
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x + 1.5, homoY);
            ctx.lineTo(x + width - 1.5, homoY);
            ctx.stroke();

            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(x + 1.5, lumoY);
            ctx.lineTo(x + width - 1.5, lumoY);
            ctx.stroke();

            // 材料名称 - 水平显示
            if (this.settings.showMaterialName) {
                const fillCenterY = (homoY + lumoY) / 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(mat.name, centerX, fillCenterY);
            }

            // 能级数值（水平居中）
            if (this.settings.showEnergyValues) {
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ef4444';
                ctx.fillText(`${mat.homo} eV`, centerX, homoY + 12);
                ctx.fillStyle = '#3b82f6';
                ctx.fillText(`${mat.lumo} eV`, centerX, lumoY - 6);
            }

            // T1 能级
            if (this.settings.showTriplet && mat.t1 && layer.type === 'eml') {
                const t1Energy = mat.homo + mat.t1;
                const t1Y = energyToY(t1Energy);
                ctx.strokeStyle = '#8b5cf6';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(x + 6, t1Y);
                ctx.lineTo(x + width - 6, t1Y);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 厚度（在材料名称下方）
            if (this.settings.showThickness) {
                const fillCenterY = (homoY + lumoY) / 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${layer.thickness}nm`, centerX, fillCenterY + 8);
            }
        } else if (mat.workFunction) {
            // 处理像 LiF 这样只有功函数的材料
            const wfY = energyToY(mat.workFunction);

            // 半透明填充 - 去掉
            // const alpha = isSelected ? 0.4 : 0.25;
            // ctx.fillStyle = this.hexToRgba(layerConfig.color, alpha);
            // ctx.fillRect(x + 2, -height / 2, width - 4, height);

            // 边框 - 去掉
            // ctx.strokeStyle = layerConfig.color;
            // ctx.lineWidth = isSelected ? 2 : 1;
            // ctx.strokeRect(x + 2, -height / 2, width - 4, height);

            // 功函数线
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(x + 1.5, wfY);
            ctx.lineTo(x + width - 1.5, wfY);
            ctx.stroke();

            // 材料名称
            if (this.settings.showMaterialName) {
                const textY = wfY - 8;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(mat.name, centerX, textY);
            }

            // 能级数值
            if (this.settings.showEnergyValues) {
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#f59e0b';
                ctx.fillText(`${mat.workFunction} eV`, centerX, wfY + 4);
            }

            // 厚度
            if (this.settings.showThickness) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${layer.thickness}nm`, centerX, wfY + 16);
            }
        }
    }

    exportPNG() {
        if (this.layers.length === 0) { alert('请先添加器件层'); return; }

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const padding = 20;
        const totalWidth = this.layers.reduce((sum, l) => {
            const isElectrode = l.type === 'anode' || l.type === 'cathode';
            return sum + (isElectrode ? 60 : Math.max(40, l.thickness * 0.8));
        }, 0);

        const layerHeight = 280;
        const exportWidth = totalWidth + 100 + padding * 2;
        const exportHeight = layerHeight + 80 + padding * 2;

        tempCanvas.width = exportWidth * 2;
        tempCanvas.height = exportHeight * 2;
        tempCtx.scale(2, 2);

        let minEnergy = -2, maxEnergy = -8;
        this.layers.forEach(layer => {
            layer.materials.forEach(m => {
                const mat = getMaterialById(m.id);
                if (mat) {
                    if (mat.homo) { minEnergy = Math.max(minEnergy, mat.homo); maxEnergy = Math.min(maxEnergy, mat.homo); }
                    if (mat.lumo) { minEnergy = Math.max(minEnergy, mat.lumo); maxEnergy = Math.min(maxEnergy, mat.lumo); }
                    if (mat.workFunction) { minEnergy = Math.max(minEnergy, mat.workFunction); maxEnergy = Math.min(maxEnergy, mat.workFunction); }
                }
            });
        });

        const energyToY = (energy) => {
            const range = minEnergy - maxEnergy;
            const normalized = (minEnergy - energy) / range;
            return padding + 40 + normalized * layerHeight;
        };

        const axisX = padding + 50;
        tempCtx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
        tempCtx.lineWidth = 1.5;
        tempCtx.beginPath();
        tempCtx.moveTo(axisX, energyToY(minEnergy) - 5);
        tempCtx.lineTo(axisX, energyToY(maxEnergy) + 5);
        tempCtx.stroke();

        tempCtx.font = '10px Inter, sans-serif';
        tempCtx.textAlign = 'right';
        tempCtx.fillStyle = '#666666';
        for (let e = Math.floor(maxEnergy); e <= Math.ceil(minEnergy); e++) {
            const y = energyToY(e);
            tempCtx.beginPath();
            tempCtx.moveTo(axisX - 3, y);
            tempCtx.lineTo(axisX + 3, y);
            tempCtx.stroke();
            tempCtx.fillText(`${e} eV`, axisX - 8, y + 3);
        }

        let currentX = axisX + 20;
        this.layers.forEach((layer) => {
            const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
            const layerWidth = isElectrode ? 60 : Math.max(40, layer.thickness * 0.8);
            const layerConfig = LAYER_TYPES[layer.type];
            this.drawLayerExport(tempCtx, layer, currentX, layerWidth, layerHeight, energyToY, layerConfig, padding);
            currentX += layerWidth;
        });

        const link = document.createElement('a');
        link.download = 'oled_energy_band.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    drawLayerExport(ctx, layer, x, width, height, energyToY, layerConfig, padding) {
        const centerX = x + width / 2;
        const materials = layer.materials.map(m => ({ ...m, data: getMaterialById(m.id) })).filter(m => m.data);
        if (materials.length === 0) return;

        const mainMat = materials[0].data;
        const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
        const isEML = layer.type === 'eml' && materials.length > 1;

        if (isElectrode) {
            const wfY = mainMat.workFunction ? energyToY(mainMat.workFunction) : null;
            if (wfY !== null) {
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 3, wfY);
                ctx.lineTo(x + width - 3, wfY);
                ctx.stroke();

                ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(mainMat.name, centerX, wfY - 6);
            }
        } else if (isEML) {
            const hostMat = materials.find(m => m.data.type === 'host')?.data || materials[0].data;
            const dopantMats = materials.filter(m => m.data.type === 'dopant').map(m => m.data);

            const hostHomoY = energyToY(hostMat.homo);
            const hostLumoY = energyToY(hostMat.lumo);

            // Host Box
            ctx.fillStyle = this.hexToRgba(layerConfig.color, 0.3);
            ctx.fillRect(x + 1, hostLumoY, width - 2, hostHomoY - hostLumoY);
            ctx.strokeStyle = layerConfig.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, hostLumoY, width - 2, hostHomoY - hostLumoY);

            // Host Lines
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x + 1, hostHomoY);
            ctx.lineTo(x + width - 1, hostHomoY);
            ctx.stroke();

            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(x + 1, hostLumoY);
            ctx.lineTo(x + width - 1, hostLumoY);
            ctx.stroke();

            if (dopantMats.length > 0) {
                const dopantRatio = 0.65;
                const rightPadding = 4;
                const innerWidth = (width - 4) * dopantRatio;
                const innerX = (x + width - 2) - rightPadding - innerWidth;

                dopantMats.forEach((dopant, di) => {
                    const dopantHomoY = energyToY(dopant.homo);
                    const dopantLumoY = energyToY(dopant.lumo);
                    const dopantColors = ['#ec4899', '#a855f7', '#06b6d4'];
                    const dopantColor = dopant.color || dopantColors[di % dopantColors.length];

                    ctx.fillStyle = this.hexToRgba(dopantColor, 0.35);
                    ctx.fillRect(innerX, dopantLumoY, innerWidth, dopantHomoY - dopantLumoY);

                    ctx.strokeStyle = dopantColor;
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(innerX, dopantLumoY, innerWidth, dopantHomoY - dopantLumoY);

                    // Dopant Lines
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(innerX + 1, dopantHomoY);
                    ctx.lineTo(innerX + innerWidth - 1, dopantHomoY);
                    ctx.stroke();

                    ctx.strokeStyle = '#3b82f6';
                    ctx.beginPath();
                    ctx.moveTo(innerX + 1, dopantLumoY);
                    ctx.lineTo(innerX + innerWidth - 1, dopantLumoY);
                    ctx.stroke();

                    // Dopant Name
                    ctx.save();
                    ctx.translate(innerX + innerWidth / 2, (dopantHomoY + dopantLumoY) / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
                    ctx.font = 'bold 8px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dopant.name, 0, 0);
                    ctx.restore();
                });

                // Host Name (Left Space Alignment)
                const leftSpaceCenter = x + ((width - 4) * (1 - dopantRatio)) / 2;
                ctx.save();
                ctx.translate(leftSpaceCenter, (hostHomoY + hostLumoY) / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
                ctx.font = 'bold 8px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(hostMat.name, 0, 0);
                ctx.restore();
            } else {
                ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
                ctx.font = 'bold 8px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(hostMat.name, centerX, (hostHomoY + hostLumoY) / 2 + 3);
            }

            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`${hostMat.homo} eV`, centerX, hostHomoY + 12);
            ctx.fillStyle = '#3b82f6';
            ctx.fillText(`${hostMat.lumo} eV`, centerX, hostLumoY - 6);

        } else if (mainMat.workFunction && !mainMat.homo) {
            // LiF like rendering for export
            const wfY = energyToY(mainMat.workFunction);

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x + 1.5, wfY);
            ctx.lineTo(x + width - 1.5, wfY);
            ctx.stroke();

            ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(mainMat.name, centerX, wfY - 8);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textBaseline = 'hanging';
            ctx.fillText(`${mainMat.workFunction} eV`, centerX, wfY + 4);

        } else {
            const mat = materials[0].data;
            if (mat.homo && mat.lumo) {
                const homoY = energyToY(mat.homo);
                const lumoY = energyToY(mat.lumo);
                ctx.fillStyle = this.hexToRgba(layerConfig.color, 0.35);
                ctx.fillRect(x + 1, lumoY, width - 2, homoY - lumoY);
                ctx.strokeStyle = layerConfig.color;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 1, lumoY, width - 2, homoY - lumoY);

                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(x + 1, homoY);
                ctx.lineTo(x + width - 1, homoY);
                ctx.stroke();

                ctx.strokeStyle = '#3b82f6';
                ctx.beginPath();
                ctx.moveTo(x + 1, lumoY);
                ctx.lineTo(x + width - 1, lumoY);
                ctx.stroke();

                ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(mat.name, centerX, (homoY + lumoY) / 2 + 3);

                ctx.font = 'bold 8px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ef4444';
                ctx.fillText(`${mat.homo} eV`, centerX, homoY + 12);
                ctx.fillStyle = '#3b82f6';
                ctx.fillText(`${mat.lumo} eV`, centerX, lumoY - 6);
            }
        }

        ctx.fillStyle = layerConfig.color;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(layerConfig.shortName, centerX, padding + 25);

        // Thickness Display
        let thickX = centerX;
        if (isEML && materials.length > 1) {
            const dopantRatio = 0.65;
            const rightPadding = 4;
            const innerWidth = (width - 4) * dopantRatio;
            const innerX = (x + width - 2) - rightPadding - innerWidth;
            thickX = innerX + innerWidth / 2;
        }

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textBaseline = 'hanging';
        ctx.fillText(`${layer.thickness}nm`, thickX, padding + height + 55);
    }

    exportSVG() {
        if (this.layers.length === 0) { alert('请先添加器件层'); return; }

        const padding = 20;
        const totalWidth = this.layers.reduce((sum, l) => {
            const isElectrode = l.type === 'anode' || l.type === 'cathode';
            return sum + (isElectrode ? 60 : Math.max(40, l.thickness * 0.8));
        }, 0);

        const layerHeight = 280;
        const width = totalWidth + 100 + padding * 2;
        const height = layerHeight + 80 + padding * 2;

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

        // Add white background for better visibility (since export colors are dark)
        svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`;

        let minEnergy = -2, maxEnergy = -8;
        this.layers.forEach(layer => {
            layer.materials.forEach(m => {
                const mat = getMaterialById(m.id);
                if (mat) {
                    if (mat.homo) { minEnergy = Math.max(minEnergy, mat.homo); maxEnergy = Math.min(maxEnergy, mat.homo); }
                    if (mat.lumo) { minEnergy = Math.max(minEnergy, mat.lumo); maxEnergy = Math.min(maxEnergy, mat.lumo); }
                    if (mat.workFunction) { minEnergy = Math.max(minEnergy, mat.workFunction); maxEnergy = Math.min(maxEnergy, mat.workFunction); }
                }
            });
        });

        const energyToY = (energy) => {
            const range = minEnergy - maxEnergy;
            const normalized = (minEnergy - energy) / range;
            return padding + 40 + normalized * layerHeight;
        };

        const axisX = padding + 50;
        svgContent += `<line x1="${axisX}" y1="${energyToY(minEnergy) - 5}" x2="${axisX}" y2="${energyToY(maxEnergy) + 5}" stroke="rgba(100, 100, 100, 0.8)" stroke-width="1.5"/>`;

        for (let e = Math.floor(maxEnergy); e <= Math.ceil(minEnergy); e++) {
            const y = energyToY(e);
            svgContent += `<line x1="${axisX - 3}" y1="${y}" x2="${axisX + 3}" y2="${y}" stroke="rgba(100, 100, 100, 0.8)" stroke-width="1.5"/>`;
            svgContent += `<text x="${axisX - 8}" y="${y + 3}" fill="#666666" font-family="Inter, sans-serif" font-size="10" text-anchor="end">${e} eV</text>`;
        }

        let currentX = axisX + 20;
        this.layers.forEach((layer) => {
            const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
            const layerWidth = isElectrode ? 60 : Math.max(40, layer.thickness * 0.8);
            const layerConfig = LAYER_TYPES[layer.type];

            svgContent += this.drawLayerSVG(layer, currentX, layerWidth, layerHeight, energyToY, layerConfig, padding);

            currentX += layerWidth;
        });

        svgContent += '</svg>';

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'oled_energy_band.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    drawLayerSVG(layer, x, width, height, energyToY, layerConfig, padding) {
        let svg = '';
        const centerX = x + width / 2;
        const materials = layer.materials.map(m => ({ ...m, data: getMaterialById(m.id) })).filter(m => m.data);
        if (materials.length === 0) return '';

        const mainMat = materials[0].data;
        const isElectrode = layer.type === 'anode' || layer.type === 'cathode';
        const isEML = layer.type === 'eml' && materials.length > 1;

        if (isElectrode) {
            const wfY = mainMat.workFunction ? energyToY(mainMat.workFunction) : null;
            if (wfY !== null) {
                svg += `<line x1="${x + 3}" y1="${wfY}" x2="${x + width - 3}" y2="${wfY}" stroke="#f59e0b" stroke-width="2"/>`;
                svg += `<text x="${centerX}" y="${wfY - 6}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle">${mainMat.name}</text>`;
            }
        } else if (isEML) {
            const hostMat = materials.find(m => m.data.type === 'host')?.data || materials[0].data;
            const dopantMats = materials.filter(m => m.data.type === 'dopant').map(m => m.data);

            const hostHomoY = energyToY(hostMat.homo);
            const hostLumoY = energyToY(hostMat.lumo);

            // Host Box
            svg += `<rect x="${x + 1}" y="${hostLumoY}" width="${width - 2}" height="${hostHomoY - hostLumoY}" fill="${layerConfig.color}" fill-opacity="0.3"/>`;
            svg += `<rect x="${x + 1}" y="${hostLumoY}" width="${width - 2}" height="${hostHomoY - hostLumoY}" fill="none" stroke="${layerConfig.color}" stroke-width="1.5"/>`;

            // Host Lines
            svg += `<line x1="${x + 1}" y1="${hostHomoY}" x2="${x + width - 1}" y2="${hostHomoY}" stroke="#ef4444" stroke-width="2"/>`;
            svg += `<line x1="${x + 1}" y1="${hostLumoY}" x2="${x + width - 1}" y2="${hostLumoY}" stroke="#3b82f6" stroke-width="2"/>`;

            if (dopantMats.length > 0) {
                const dopantRatio = 0.65;
                const rightPadding = 4;
                const innerWidth = (width - 4) * dopantRatio;
                const innerX = (x + width - 2) - rightPadding - innerWidth;

                dopantMats.forEach((dopant, di) => {
                    const dopantHomoY = energyToY(dopant.homo);
                    const dopantLumoY = energyToY(dopant.lumo);
                    const dopantColors = ['#ec4899', '#a855f7', '#06b6d4'];
                    const dopantColor = dopant.color || dopantColors[di % dopantColors.length];

                    svg += `<rect x="${innerX}" y="${dopantLumoY}" width="${innerWidth}" height="${dopantHomoY - dopantLumoY}" fill="${dopantColor}" fill-opacity="0.35"/>`;
                    svg += `<rect x="${innerX}" y="${dopantLumoY}" width="${innerWidth}" height="${dopantHomoY - dopantLumoY}" fill="none" stroke="${dopantColor}" stroke-width="1"/>`;

                    svg += `<line x1="${innerX + 1}" y1="${dopantHomoY}" x2="${innerX + innerWidth - 1}" y2="${dopantHomoY}" stroke="#ef4444" stroke-width="2"/>`;
                    svg += `<line x1="${innerX + 1}" y1="${dopantLumoY}" x2="${innerX + innerWidth - 1}" y2="${dopantLumoY}" stroke="#3b82f6" stroke-width="2"/>`;

                    // Dopant Name
                    svg += `<text x="${innerX + innerWidth / 2}" y="${(dopantHomoY + dopantLumoY) / 2}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90, ${innerX + innerWidth / 2}, ${(dopantHomoY + dopantLumoY) / 2})">${dopant.name}</text>`;
                });

                // Host Name (Left Space)
                const leftSpaceCenter = x + ((width - 4) * (1 - dopantRatio)) / 2;
                svg += `<text x="${leftSpaceCenter}" y="${(hostHomoY + hostLumoY) / 2}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90, ${leftSpaceCenter}, ${(hostHomoY + hostLumoY) / 2})">${hostMat.name}</text>`;

            } else {
                // Host Name (Center)
                svg += `<text x="${centerX}" y="${(hostHomoY + hostLumoY) / 2 + 3}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${hostMat.name}</text>`;
            }

            svg += `<text x="${centerX}" y="${hostHomoY + 12}" fill="#ef4444" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${hostMat.homo} eV</text>`;
            svg += `<text x="${centerX}" y="${hostLumoY - 6}" fill="#3b82f6" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${hostMat.lumo} eV</text>`;

        } else if (mainMat.workFunction && !mainMat.homo) {
            // LiF like
            const wfY = energyToY(mainMat.workFunction);
            svg += `<line x1="${x + 1.5}" y1="${wfY}" x2="${x + width - 1.5}" y2="${wfY}" stroke="#f59e0b" stroke-width="2.5"/>`;
            svg += `<text x="${centerX}" y="${wfY - 8}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="10" text-anchor="middle" dominant-baseline="auto">${mainMat.name}</text>`;
            svg += `<text x="${centerX}" y="${wfY + 4}" fill="#f59e0b" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="hanging">${mainMat.workFunction} eV</text>`;
        } else {
            const homoY = energyToY(mainMat.homo);
            const lumoY = energyToY(mainMat.lumo);

            svg += `<rect x="${x + 1}" y="${lumoY}" width="${width - 2}" height="${homoY - lumoY}" fill="${layerConfig.color}" fill-opacity="0.35"/>`;
            svg += `<rect x="${x + 1}" y="${lumoY}" width="${width - 2}" height="${homoY - lumoY}" fill="none" stroke="${layerConfig.color}" stroke-width="1.5"/>`;

            svg += `<line x1="${x + 1}" y1="${homoY}" x2="${x + width - 1}" y2="${homoY}" stroke="#ef4444" stroke-width="2.5"/>`;
            svg += `<line x1="${x + 1}" y1="${lumoY}" x2="${x + width - 1}" y2="${lumoY}" stroke="#3b82f6" stroke-width="2.5"/>`;

            svg += `<text x="${centerX}" y="${(homoY + lumoY) / 2}" fill="rgba(50, 50, 50, 0.9)" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${mainMat.name}</text>`;

            svg += `<text x="${centerX}" y="${homoY + 12}" fill="#ef4444" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${mainMat.homo} eV</text>`;
            svg += `<text x="${centerX}" y="${lumoY - 6}" fill="#3b82f6" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="middle">${mainMat.lumo} eV</text>`;
        }

        // Layer Label
        svg += `<text x="${centerX}" y="${padding + 25}" fill="${layerConfig.color}" font-family="Inter, sans-serif" font-weight="bold" font-size="9" text-anchor="middle" dominant-baseline="auto">${layerConfig.shortName}</text>`;

        // Thickness
        let thickX = centerX;
        if (isEML && materials.length > 1) {
            const dopantRatio = 0.65;
            const rightPadding = 4;
            const innerWidth = (width - 4) * dopantRatio;
            const innerX = (x + width - 2) - rightPadding - innerWidth;
            thickX = innerX + innerWidth / 2;
        }

        svg += `<text x="${thickX}" y="${padding + height + 55}" fill="rgba(50, 50, 50, 0.8)" font-family="Inter, sans-serif" font-size="9" text-anchor="middle" dominant-baseline="hanging">${layer.thickness}nm</text>`;

        return svg;
    }

    saveConfig() {
        const config = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            layers: this.layers,
            settings: this.settings,
            customMaterials: MATERIALS_DATABASE.custom || []
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `oled_config_${new Date().toISOString().slice(0, 10)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    loadConfig(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                if (config.layers) this.layers = config.layers;
                if (config.settings) {
                    this.settings = { ...this.settings, ...config.settings };
                    Object.keys(this.settings).forEach(key => {
                        const el = document.getElementById(key);
                        if (el) el.checked = this.settings[key];
                    });
                }
                if (config.customMaterials?.length > 0) {
                    MATERIALS_DATABASE.custom = config.customMaterials;
                }

                this.selectedLayerId = null;
                this.renderLayersList();
                this.renderLayerDetail();
                this.renderMaterialsList('all');
                this.render();
                alert('配置导入成功！');
            } catch (err) {
                alert('配置文件格式错误：' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OLEDEnergyBandApp();
});
