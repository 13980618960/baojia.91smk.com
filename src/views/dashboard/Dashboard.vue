<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="stat-icon"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <p class="stat-label">总用户数</p>
            <p class="stat-value">{{ stats.total_users || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <p class="stat-label">总需求数</p>
            <p class="stat-value">{{ stats.total_demands || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-icon"><el-icon><PriceTag /></el-icon></div>
          <div class="stat-info">
            <p class="stat-label">总报价数</p>
            <p class="stat-value">{{ stats.total_quotes || 0 }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <p class="stat-label">总撮合数</p>
            <p class="stat-value">{{ stats.total_deals || 0 }}</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>区域需求排行</span>
          </template>
          <div ref="provinceChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分类需求排行</span>
          </template>
          <div ref="categoryChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据趋势</span>
          </template>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const stats = reactive({
  total_users: 0,
  total_demands: 0,
  total_quotes: 0,
  total_deals: 0
})

const provinceChart = ref(null)
const categoryChart = ref(null)
const trendChart = ref(null)

onMounted(async () => {
  await fetchStats()
  initCharts()
})

const fetchStats = async () => {
  try {
    // 添加时间戳参数，避免缓存
    const res = await request.get('/admin/stats/today', {
      params: { timestamp: new Date().getTime() }
    })
    Object.assign(stats, res.data)
  } catch (error) {
    console.error(error)
  }
}

const initCharts = () => {
  const provinceOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['广东', '江苏', '浙江', '山东', '河南'] },
    yAxis: { type: 'value' },
    series: [{ data: [1200, 980, 876, 654, 543], type: 'bar', itemStyle: { color: '#667eea' } }]
  }

  const categoryOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['生活服务', '维修安装', '保洁清洗', '搬家物流', '装修建材'] },
    yAxis: { type: 'value' },
    series: [{ data: [1100, 890, 765, 654, 543], type: 'bar', itemStyle: { color: '#764ba2' } }]
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['用户', '需求', '报价'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '用户', data: [120, 132, 101, 134, 90, 230, 210], type: 'line' },
      { name: '需求', data: [220, 182, 191, 234, 290, 330, 310], type: 'line' },
      { name: '报价', data: [150, 232, 201, 154, 190, 330, 410], type: 'line' }
    ]
  }

  echarts.init(provinceChart.value).setOption(provinceOption)
  echarts.init(categoryChart.value).setOption(categoryOption)
  echarts.init(trendChart.value).setOption(trendOption)
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
}

.stat-card.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card.orange { background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); }
.stat-card.purple { background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%); }

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}
</style>
