<template>
  <div class="cascader-hover">
    <el-cascader
      v-model="value"
      :options="options"
      :props="cascaderProps"
      :placeholder="placeholder || '省/市/区'"
      clearable
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const value = ref([])

// 级联选择器配置
const cascaderProps = {
  lazy: true,
  expandTrigger: 'hover',
  lazyLoad: async (node, resolve) => {
    const { value: areaId } = node
    if (node.level === 0) {
      // 一级节点，加载省份
      // 省份已经通过props.options传入
      resolve([])
    } else if (node.level === 1) {
      // 二级节点，加载城市
      try {
        const res = await request.get('/admin/areas/cities', {
          params: { province_id: areaId }
        })
        const cities = res.data.map(city => ({
          value: city.area_id,
          label: city.name,
          leaf: false
        }))
        resolve(cities)
      } catch (error) {
        console.error('加载城市失败:', error)
        resolve([])
      }
    } else if (node.level === 2) {
      // 三级节点，加载区县
      try {
        const res = await request.get('/admin/areas/districts', {
          params: { city_id: areaId }
        })
        const districts = res.data.map(district => ({
          value: district.area_id,
          label: district.name,
          leaf: true
        }))
        resolve(districts)
      } catch (error) {
        console.error('加载区县失败:', error)
        resolve([])
      }
    }
  }
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length > 0) {
    value.value = [...newValue]
  } else {
    value.value = []
  }
}, { immediate: true, deep: true })

// 处理选择变化
const handleChange = (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.cascader-hover {
  width: 100%;
}
</style>