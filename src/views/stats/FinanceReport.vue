<template>
  <div class="stats-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><DataAnalysis /></el-icon>
          <span>财务统计报表</span>
        </div>
      </template>

      <div class="tab-content">
        <div class="filter-bar">
          <el-date-picker
            v-model="financialDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="fetchFinancialReport"
          />
          <el-select v-model="filterType" placeholder="选择类型" style="margin-left: 10px;">
            <el-option label="全部" :value="''" />
            <el-option label="充值" :value="1" />
            <el-option label="消费" :value="2" />
            <el-option label="退款" :value="3" />
          </el-select>
          <el-button type="primary" @click="exportFinancialReport" style="margin-left: 10px;">导出报表</el-button>
        </div>

        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-icon income"><ArrowUp /></div>
            <div class="summary-info">
              <span class="summary-label">总收入</span>
              <span class="summary-value income-color">¥{{ financialReport.total_income.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon expense"><ArrowDown /></div>
            <div class="summary-info">
              <span class="summary-label">总支出</span>
              <span class="summary-value expense-color">¥{{ financialReport.total_expense.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon profit"><Wallet /></div>
            <div class="summary-info">
              <span class="summary-label">净利润</span>
              <span class="summary-value profit-color">¥{{ financialReport.profit.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon balance"><Coin /></div>
            <div class="summary-info">
              <span class="summary-label">总账户余额</span>
              <span class="summary-value">¥{{ financialReport.total_balance.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <el-card class="chart-card">
            <template #header>收支趋势</template>
            <div ref="financialTrendChart" style="height: 300px;"></div>
          </el-card>
        </div>

        <el-card class="table-card">
          <template #header>财务明细</template>
          <el-table :data="financialReportDetails" border stripe style="width: 100%">
            <el-table-column prop="record_id" label="记录ID" width="80" align="center" />
            <el-table-column prop="type" label="类型" width="100" align="center">
              <template #default="{ row }">{{ getRecordTypeText(row.type) }}</template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                <span :style="{ color: parseFloat(row.amount) >= 0 ? '#67C23A' : '#F56C6C' }">
                  {{ parseFloat(row.amount) >= 0 ? '+' : '' }}¥{{ parseFloat(row.amount).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="user_id" label="用户ID" width="100" align="center" />
            <el-table-column prop="description" label="备注" min-width="200" />
            <el-table-column prop="created_at" label="时间" width="180" />
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

const financialDateRange = ref([])
const filterType = ref('')

const financialReport = reactive({
  total_income: 0,
  total_expense: 0,
  profit: 0,
  total_balance: 0
})

const financialReportDetails = ref([])
const financialTrendChart = ref(null)

const getRecordTypeText = (type) => {
  const types = { 1: '充值', 2: '消费', 3: '退款', 4: '调整' }
  return types[type] || '未知'
}

const fetchFinancialReport = async () => {
  try {
    const params = {
      start_date: financialDateRange.value[0] || '',
      end_date: financialDateRange.value[1] || '',
      type: filterType.value || ''
    }
    const res = await request.get('/api/stats/financial-report', { params })
    if (res.data) {
      financialReport.total_income = res.data.total_income || 0
      financialReport.total_expense = res.data.total_expense || 0
      financialReport.profit = res.data.profit || 0
      financialReport.total_balance = res.data.total_balance || 0
      financialReportDetails.value = res.data.details || []
      await nextTick()
      renderFinancialTrendChart(res.data.trend || [])
    }
  } catch (error) {
    console.error('获取财务报表失败:', error)
  }
}

const renderFinancialTrendChart = (trendData) => {
  if (!financialTrendChart.value) return
  const chart = echarts.init(financialTrendChart.value)
  const dates = trendData.map(item => item.date)
  const income = trendData.map(item => item.income)
  const expense = trendData.map(item => item.expense)
  
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'bar', data: income, color: '#67C23A' },
      { name: '支出', type: 'bar', data: expense, color: '#F56C6C' }
    ]
  })
}

const exportFinancialReport = () => {
  alert('导出功能开发中')
}

onMounted(() => {
  fetchFinancialReport()
})

watch([financialDateRange, filterType], () => {
  fetchFinancialReport()
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
  border-radius: 12px;
  margin-right: 16px;
  color: #fff;
  font-size: 20px;
}

.summary-icon.income {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.summary-icon.expense {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-icon.profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-icon.balance {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

.summary-value.income-color {
  color: #43e97b;
}

.summary-value.expense-color {
  color: #f5576c;
}

.summary-value.profit-color {
  color: #4facfe;
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