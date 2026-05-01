<template>
  <div class="stats-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><DataAnalysis /></el-icon>
          <span>广告投放报表</span>
        </div>
      </template>

      <div class="tab-content">
        <div class="filter-bar">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="fetchAdsReport"
          />
          <el-select v-model="filterAdType" placeholder="选择广告类型" style="margin-left: 10px;">
            <el-option label="全部" :value="''" />
            <el-option label="开屏广告" :value="1" />
            <el-option label="轮播图广告" :value="2" />
            <el-option label="需求卡片广告" :value="3" />
            <el-option label="大厅横幅广告" :value="4" />
            <el-option label="个人中心广告" :value="5" />
          </el-select>
          <el-button type="primary" @click="exportAdsReport" style="margin-left: 10px;">导出报表</el-button>
        </div>

        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-icon"><Eye /></div>
            <div class="summary-info">
              <span class="summary-label">总展示次数</span>
              <span class="summary-value">{{ adsReport.total_views.toLocaleString() }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon click"><Mouse /></div>
            <div class="summary-info">
              <span class="summary-label">总点击次数</span>
              <span class="summary-value click-color">{{ adsReport.total_clicks.toLocaleString() }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon cost"><Wallet /></div>
            <div class="summary-info">
              <span class="summary-label">总消耗金额</span>
              <span class="summary-value cost-color">¥{{ adsReport.total_cost.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon ctr"><TrendingUp /></div>
            <div class="summary-info">
              <span class="summary-label">平均点击率</span>
              <span class="summary-value ctr-color">{{ adsReport.avg_ctr }}%</span>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <el-card class="chart-card">
            <template #header>展示/点击趋势</template>
            <div ref="adsTrendChart" style="height: 300px;"></div>
          </el-card>
        </div>

        <el-card class="table-card">
          <template #header>广告投放详情</template>
          <el-table :data="adsReportDetails" border stripe style="width: 100%">
            <el-table-column prop="ad_id" label="广告ID" width="80" align="center" />
            <el-table-column prop="title" label="广告标题" min-width="200" />
            <el-table-column prop="position" label="广告位置" width="120">
              <template #default="{ row }">{{ getPositionName(row.position) }}</template>
            </el-table-column>
            <el-table-column prop="view_count" label="展示次数" width="120" align="right">
              <template #default="{ row }">{{ row.view_count.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="click_count" label="点击次数" width="120" align="right">
              <template #default="{ row }">{{ row.click_count.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="点击率" width="120" align="right">
              <template #default="{ row }">{{ ((row.click_count / row.view_count) * 100 || 0).toFixed(2) }}%</template>
            </el-table-column>
            <el-table-column prop="cost" label="消耗金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.cost.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="created_at" label="投放时间" width="180" />
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const dateRange = ref([])
const filterAdType = ref('')

const adsReport = reactive({
  total_views: 0,
  total_clicks: 0,
  total_cost: 0,
  avg_ctr: '0.00'
})

const adsReportDetails = ref([])
const adsTrendChart = ref(null)

const positionNames = {
  1: '开屏广告',
  2: '轮播图广告',
  3: '需求卡片广告',
  4: '大厅横幅广告',
  5: '个人中心广告'
}

const getPositionName = (position) => {
  return positionNames[position] || '未知位置'
}

const fetchAdsReport = async () => {
  try {
    const params = {
      start_date: dateRange.value[0] || '',
      end_date: dateRange.value[1] || '',
      ad_type: filterAdType.value || ''
    }
    const res = await request.get('/api/stats/ads-report', { params })
    if (res.data) {
      adsReport.total_views = res.data.total_views || 0
      adsReport.total_clicks = res.data.total_clicks || 0
      adsReport.total_cost = res.data.total_cost || 0
      adsReport.avg_ctr = res.data.avg_ctr || '0.00'
      adsReportDetails.value = res.data.details || []
      await nextTick()
      renderAdsTrendChart(res.data.trend || [])
    }
  } catch (error) {
    console.error('获取广告报表失败:', error)
  }
}

const renderAdsTrendChart = (trendData) => {
  if (!adsTrendChart.value) return
  const chart = echarts.init(adsTrendChart.value)
  const dates = trendData.map(item => item.date)
  const views = trendData.map(item => item.views)
  const clicks = trendData.map(item => item.clicks)
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['展示次数', '点击次数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '展示次数', type: 'line', data: views, smooth: true },
      { name: '点击次数', type: 'line', data: clicks, smooth: true }
    ]
  })
}

const exportAdsReport = () => {
  alert('导出功能开发中')
}

onMounted(() => {
  fetchAdsReport()
})

watch([dateRange, filterAdType], () => {
  fetchAdsReport()
})
</script>

<style scoped>
.stats-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 8px;
  color: #667eea;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.summary-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-right: 16px;
  color: #fff;
  font-size: 20px;
}

.summary-icon.click {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-icon.cost {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-icon.ctr {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.summary-value.click-color {
  color: #4facfe;
}

.summary-value.cost-color {
  color: #f5576c;
}

.summary-value.ctr-color {
  color: #43e97b;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 0;
}

.table-card {
  margin-top: 20px;
}
</style>