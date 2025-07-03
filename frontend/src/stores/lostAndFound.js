import { defineStore } from 'pinia'

export const useLostAndFoundStore = defineStore('lostAndFound', {
  state: () => ({
    items: [] // 地图上所有物品点位
  }),
  actions: {
    loadItems() {
      // 这里可以从后端加载数据，或用本地假数据
      // 示例：
      // this.items = [{ id: 1, type: 'lost', title: '钥匙', location: '教学楼', ... , coordinates: { x: 100, y: 200 } }]
      if (!this.items.length) {
        this.items = []
      }
    },
    addItem(item) {
      this.items.push(item)
      return item
    },
    updateItemCoordinates(id, coordinates) {
      const item = this.items.find(i => i.id === id)
      if (item) item.coordinates = coordinates
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id)
    }
  }
}) 