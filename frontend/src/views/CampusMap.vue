<template>
  <div class="campus-map-container">
    <!-- header 已移除 -->
    
    <div class="controls">
      <div class="filters">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          class="filter-btn" 
          :class="{ active: activeFilter === filter.value }"
          @click="applyFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
      
      
    </div>
    
    <div class="map-section">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color legend-lost"></div>
          <span>丢失物品</span>
        </div>
        <div class="legend-item">
          <div class="legend-color legend-found"></div>
          <span>拾获物品</span>
        </div>
      </div>
      
      <div class="map-container" ref="mapContainer" @mousemove="handleMapMouseMove" @mouseleave="handleMapMouseLeave" @click="handleMapClick">
        <img 
          src="@/assets/campus-map.jpg" 
          alt="校园地图" 
          class="campus-map-image" 
          ref="mapImage" 
          @load="initMapDimensions"
        >
        <template v-if="imageLoaded && mapDimensions.width && mapDimensions.height">
          <div
            v-if="route.query.mode === 'add' && editingPosition"
            class="map-point new"
            :style="{
              position: 'absolute',
              left: toDisplayPos(editingPosition.x, editingPosition.y).x - pointSize / 2 + 'px',
              top: toDisplayPos(editingPosition.x, editingPosition.y).y - pointSize / 2 + 'px',
              zIndex: 20,
              pointerEvents: 'none'
            }"
          >
            <div class="legend-color legend-lost"></div>
          </div>
          <div
            v-for="item in filteredItems"
            :key="item._id"
            class="map-point"
            :style="{
              position: 'absolute',
              left: toDisplayPos(item.coordinates.x, item.coordinates.y).x - pointSize / 2 + 'px',
              top: toDisplayPos(item.coordinates.x, item.coordinates.y).y - pointSize / 2 + 'px',
              zIndex: 1,
              cursor: 'pointer'
            }"
            @click="showItemDetails(item)"
          >
            <div :class="['legend-color', item.type === 'lost' ? 'legend-lost' : 'legend-found']"></div>
          </div>
        </template>
      </div>
      
      <div v-if="selectedItem" class="info-card" :class="{ active: selectedItem }">
        <div class="card-header">
          <div class="item-type" :class="selectedItemTypeClass">
            {{ selectedItemTypeText }}
          </div>
          <button class="close-btn" @click="closeItemDetails">×</button>
        </div>
        <h2 class="item-title">{{ selectedItem?.title }}</h2>
        <div class="item-details">
          <div class="item-detail">
            <div class="detail-icon">👤</div>
            <div class="detail-content">
              <strong>联系人：</strong><span>{{ selectedItem?.user?.username || '匿名' }}</span>
            </div>
          </div>
          <div class="item-detail">
            <div class="detail-icon">📝</div>
            <div class="detail-content">
              <strong>描述：</strong><span>{{ selectedItem?.description }}</span>
            </div>
          </div>
          <div class="item-detail">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <strong>位置：</strong><span>{{ getAreaName(selectedItem?.coordinates) }}</span>
            </div>
          </div>
          <div class="item-detail">
            <div class="detail-icon">🕒</div>
            <div class="detail-content">
              <strong>时间：</strong><span>{{ selectedItem?.date ? (new Date(selectedItem.date)).toLocaleString() : '' }}</span>
            </div>
          </div>
          <div class="item-detail" v-if="selectedItem?.coordinates">
            <div class="detail-icon">🌐</div>
            <div class="detail-content">
              <strong>坐标：</strong>
              <span>{{ selectedItem.coordinates.x.toFixed(4) }}, {{ selectedItem.coordinates.y.toFixed(4) }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
        </div>
      </div>
    </div>
    
    <div class="stats-panel">
      <div class="stat-item">
        <div class="stat-value">{{ totalItemsCount }}</div>
        <div class="stat-label">总物品数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value lost">{{ lostItemsCount }}</div>
        <div class="stat-label">丢失物品</div>
      </div>
      <div class="stat-item">
        <div class="stat-value found">{{ foundItemsCount }}</div>
        <div class="stat-label">拾获物品</div>
      </div>
    </div>
    
    <footer>
      <p>校园失物招领平台 © {{ currentYear }} | 离线地图系统 | 让失物更快回家</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/composables/useApi';
import { useRoute, useRouter } from 'vue-router';

// 使用Auth存储
const authStore = useAuthStore();

// 筛选器
const filters = ref([
  { label: '全部物品', value: 'all' },
  { label: '丢失物品', value: 'lost' },
  { label: '拾获物品', value: 'found' },
  { label: '教学区', value: 'teaching' },
  { label: '生活区', value: 'dorm' },
  { label: '运动区', value: 'sports' }
]);

const activeFilter = ref('all');
const selectedItem = ref(null);
const mapContainer = ref(null);
const mapImage = ref(null);
const mapDimensions = ref({ width: 0, height: 0 });
const mapDisplaySize = ref({ width: 0, height: 0 });
const editingItem = ref(null);
const editingPosition = ref(null);
const isDragging = ref(false);
const items = ref([]);
const pointSize = 12; // 圆点直径，和.legend-color宽高一致
const imageLoaded = ref(false);

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear());

// 计算统计信息
const lostItemsCount = computed(() => items.value.filter(item => item.type === 'lost' && item.status !== 'found').length);
const foundItemsCount = computed(() => items.value.filter(item => item.type === 'found' && item.status !== 'found').length);
const totalItemsCount = computed(() => items.value.filter(item => item.status !== 'found').length);

// 计算筛选后的物品
const filteredItems = computed(() => {
  return items.value.filter(item => {
    if (item.status === 'found') return false;
    if (activeFilter.value === 'all') return true;
    if (activeFilter.value === 'lost') return item.type === 'lost';
    if (activeFilter.value === 'found') return item.type === 'found';
    if (activeFilter.value === 'teaching') {
      return item.coordinates && item.coordinates.x > 1147;
    }
    if (activeFilter.value === 'sports') {
      return item.coordinates && item.coordinates.x >= 0 && item.coordinates.x <= 654 && item.coordinates.y >= 0 && item.coordinates.y <= 751;
    }
    if (activeFilter.value === 'dorm') {
      if (!item.coordinates) return false;
      const isTeaching = item.coordinates.x > 1147;
      const isSports = item.coordinates.x >= 0 && item.coordinates.x <= 654 && item.coordinates.y >= 0 && item.coordinates.y <= 751;
      return !isTeaching && !isSports;
    }
    return true;
  });
});

// 计算选中物品的类型样式
const selectedItemTypeClass = computed(() => {
  if (!selectedItem.value) return '';
  return selectedItem.value.type === 'lost' ? 'type-lost' : 'type-found';
});

// 计算选中物品的类型文本
const selectedItemTypeText = computed(() => {
  if (!selectedItem.value) return '';
  return selectedItem.value.type === 'lost' ? '丢失物品' : '拾获物品';
});

// 应用筛选
const applyFilter = (filter) => {
  activeFilter.value = filter;
};

// 显示物品详情
const showItemDetails = (item) => {
  selectedItem.value = item;
};

// 关闭物品详情
const closeItemDetails = () => {
  selectedItem.value = null;
};

// 初始化地图尺寸
const initMapDimensions = () => {
  if (mapImage.value) {
    mapDimensions.value = {
      width: mapImage.value.naturalWidth,
      height: mapImage.value.naturalHeight
    };
    updateMapDisplaySize();
    imageLoaded.value = true;
    nextTick(() => {
      updateMapDisplaySize();
    });
    if (route.query.mode === 'add') {
      startAddNewItem();
    }
  }
};

// 拖拽逻辑
let dragItem = null
let dragOffset = { x: 0, y: 0 }

function startDrag(e, item) {
  if (!editingItem.value || editingItem.value._id !== item._id) return
  dragItem = item
  const startX = e.clientX
  const startY = e.clientY
  dragOffset = {
    x: startX - item.coordinates.x,
    y: startY - item.coordinates.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  if (!dragItem) return
  const x = e.clientX - dragOffset.x
  const y = e.clientY - dragOffset.y
  editingPosition.value = { x, y }
}

function stopDrag() {
  dragItem = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 编辑位置
const editPosition = (item) => {
  editingItem.value = item;
  editingPosition.value = { ...item.coordinates };
  selectedItem.value = null;
};

// 保存位置
const savePosition = async () => {
  if (editingItem.value && editingPosition.value) {
    await api.put(`/posts/${editingItem.value._id}`, {
      coordinates: editingPosition.value
    });
    editingItem.value = null;
    editingPosition.value = null;
    await loadItems();
  } else if (route.query.mode === 'add' && route.query.from === 'post-create' && editingPosition.value) {
    // 选点模式，回传坐标到发帖页
    localStorage.setItem('postCreateCoordinates', JSON.stringify(editingPosition.value));
    router.push('/posts/create');
  }
};

// 取消位置编辑
const cancelPositionEdit = () => {
  editingItem.value = null;
  editingPosition.value = null;
};

// 添加新物品
const addNewItem = async () => {
  const newItem = {
    type: 'lost', // 或 'found'，可根据实际表单选择
    title: '新添加的物品',
    description: '请添加描述信息',
    contact: '联系人信息',
    coordinates: { x: mapDimensions.value.width / 2, y: mapDimensions.value.height / 2 }
  };
  const res = await api.post('/posts', newItem);
  editingItem.value = res.data;
  editingPosition.value = { ...res.data.coordinates };
  await loadItems();
};

// 标记为已解决
const markAsResolved = async (item) => {
  await api.delete(`/posts/${item._id}`);
  selectedItem.value = null;
  await loadItems();
};

const loadItems = async () => {
  const res = await api.get('/posts');
  items.value = res.data.data;
};

// 组件挂载时初始化
const route = useRoute();
const router = useRouter();
onMounted(() => {
  loadItems();
  window.addEventListener('post-updated', loadItems);
  if (route.query.mode === 'add') {
    startAddNewItem();
  }
  window.addEventListener('resize', updateMapDisplaySize);
});
onBeforeUnmount(() => {
  window.removeEventListener('post-updated', loadItems);
  window.removeEventListener('resize', updateMapDisplaySize);
});

function startAddNewItem() {
  editingItem.value = {};
  editingPosition.value = {
    x: mapDimensions.value.width / 2,
    y: mapDimensions.value.height / 2
  };
}

function handleMapMouseMove(e) {
  if (route.query.mode !== 'add') return;
  const rect = mapContainer.value.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  // 获取图片实际显示区域
  const containerWidth = mapContainer.value.clientWidth;
  const containerHeight = mapContainer.value.clientHeight;
  const imgWidth = mapImage.value.clientWidth;
  const imgHeight = mapImage.value.clientHeight;
  const offsetX = (containerWidth - imgWidth) / 2;
  const offsetY = (containerHeight - imgHeight) / 2;
  const imgX = clickX - offsetX;
  const imgY = clickY - offsetY;
  // 防止点在留白区域
  if (imgX < 0 || imgY < 0 || imgX > imgWidth || imgY > imgHeight) return;
  // 按比例换算为原图坐标
  const x = imgX / imgWidth * mapDimensions.value.width;
  const y = imgY / imgHeight * mapDimensions.value.height;
  editingPosition.value = { x, y };
}

function handleMapMouseLeave() {
  if (route.query.mode !== 'add') return;
  editingPosition.value = null;
}

function handleMapClick(e) {
  if (route.query.mode !== 'add' || !editingPosition.value) return;
  if (route.query.from === 'post-edit' && route.query.editId) {
    localStorage.setItem('postEditCoordinates', JSON.stringify(editingPosition.value));
    router.push(`/posts/edit/${route.query.editId}`);
  } else {
    localStorage.setItem('postCreateCoordinates', JSON.stringify(editingPosition.value));
    router.push('/posts/create');
  }
}

function getAreaName(coordinates) {
  if (!coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') return '未知地点';
  if (coordinates.x > 1147) return '教学区';
  if (coordinates.x >= 0 && coordinates.x <= 654 && coordinates.y >= 0 && coordinates.y <= 751) return '运动区';
  return '生活区';
}

// 工具函数：原始坐标转显示坐标
function toDisplayPos(x, y) {
  if (!mapDimensions.value.width || !mapDisplaySize.value.width) return { x, y };
  const container = mapContainer.value;
  const img = mapImage.value;
  if (!container || !img) return { x, y };
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const imgWidth = img.clientWidth;
  const imgHeight = img.clientHeight;
  const offsetX = (containerWidth - imgWidth) / 2;
  const offsetY = (containerHeight - imgHeight) / 2;
  const px = x / mapDimensions.value.width * imgWidth + offsetX;
  const py = y / mapDimensions.value.height * imgHeight + offsetY;
  return { x: px, y: py };
}

// 工具函数：显示坐标转原始坐标
function toOriginPos(x, y) {
  if (!mapDimensions.value.width || !mapDisplaySize.value.width) return { x, y };
  return {
    x: x / mapDisplaySize.value.width * mapDimensions.value.width,
    y: y / mapDisplaySize.value.height * mapDimensions.value.height
  };
}

function updateMapDisplaySize() {
  if (mapImage.value) {
    mapDisplaySize.value = {
      width: mapImage.value.clientWidth,
      height: mapImage.value.clientHeight
    };
  }
}
</script>

<style scoped>
.campus-map-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  padding: 15px 20px;
  background: #e3f2fd;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border-bottom: 2px solid #bbdefb;
  align-items: center;
  gap: 15px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 8px 20px;
  background: #ffffff;
  border: 2px solid #5c6bc0;
  border-radius: 25px;
  color: #1a237e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.filter-btn:hover {
  background: #5c6bc0;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.filter-btn.active {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.action-btn span {
  font-size: 1.2rem;
}

.map-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.map-container {
  width: 100%;
  max-width: 900px;
  height: 60vw;
  max-height: 600px;
  min-height: 200px;
  background: #e8eaf6;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
@media (max-width: 600px) {
  .map-container {
    height: 60vw;
    min-height: 160px;
  }
}
.campus-map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f0f0f0;
  display: block;
}

.legend {
  display: flex;
  gap: 25px;
  background: white;
  padding: 12px 30px;
  border-radius: 30px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-lost {
  background: linear-gradient(135deg, #ff5252, #d32f2f);
}

.legend-found {
  background: linear-gradient(135deg, #2196f3, #0d47a1);
}

.legend-new {
  background: linear-gradient(135deg, #2196f3, #0d47a1);
}

.coordinate-panel {
  position: absolute;
  top: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 280px;
}

.coord-display {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.coord-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
}

.coord-actions {
  display: flex;
  gap: 10px;
}

.save-btn, .cancel-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
}

.save-btn:hover {
  background: linear-gradient(135deg, #43a047, #1b5e20);
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 400px;
  display: none;
  position: relative;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.4s ease;
}

.info-card.active {
  display: block;
  transform: translateY(0);
  opacity: 1;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.item-type {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.type-found {
  background: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}

.type-lost {
  background: rgba(255, 82, 82, 0.2);
  color: #d32f2f;
}

.item-title {
  font-size: 1.5rem;
  color: #1a237e;
  margin-bottom: 20px;
  font-weight: 600;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item-detail {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
  margin-top: 3px;
  color: #5c6bc0;
}

.detail-content {
  line-height: 1.5;
  color: #444;
}

.card-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.edit-position-btn, .resolve-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-position-btn {
  background: linear-gradient(135deg, #5c6bc0, #1a237e);
  color: white;
}

.edit-position-btn:hover {
  background: linear-gradient(135deg, #3f51b5, #0d1b5c);
}

.resolve-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.resolve-btn:hover {
  background: linear-gradient(135deg, #ef6c00, #e65100);
}

.close-btn {
  background: #f5f5f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.stats-panel {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  background: #f5f5f7;
  margin: 0 20px 20px;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-value.lost {
  color: #d32f2f;
}

.stat-value.found {
  color: #2e7d32;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

footer {
  text-align: center;
  padding: 20px;
  color: #5c6bc0;
  font-size: 0.9rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
}

@media (max-width: 900px) {
  .map-container {
    height: 500px;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: center;
  }
  
  .actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .map-container {
    height: 400px;
  }
  
  .controls {
    padding: 10px;
  }
  
  .filter-btn {
    padding: 6px 15px;
    font-size: 0.9rem;
  }
  
  .legend {
    padding: 10px 15px;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .coordinate-panel {
    top: 15px;
    right: 15px;
    width: 250px;
  }
  
  .info-card {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .map-container {
    height: 350px;
  }
  
  .legend {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    border-radius: 15px;
    padding: 12px 20px;
  }
  
  .coordinate-panel {
    position: relative;
    top: 0;
    right: 0;
    width: 100%;
    margin-bottom: 15px;
  }
  
  .stats-panel {
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .stat-item {
    flex: 1;
    min-width: 100px;
  }
}

.map-point {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  /* border: 2px solid #42b983; */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  user-select: none;
  transition: box-shadow 0.2s;
  position: absolute;
}

.point-icon.lost {
  color: #d32f2f;
}

.point-icon.found {
  color: #2e7d32;
}
</style>