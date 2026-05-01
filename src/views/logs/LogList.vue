<template>
  <div class="log-list">
    <el-card>
      <template #header>
        <span>操作日志</span>
      </template>
      <el-table :data="list" border stripe>
        <el-table-column prop="log_id" label="ID" width="80" />
        <el-table-column prop="admin_name" label="管理员" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="target_type" label="对象类型" />
        <el-table-column prop="target_id" label="对象ID" />
        <el-table-column prop="detail" label="详情" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP地址" />
        <el-table-column prop="created_at" label="时间" />
      </el-table>
      <el-pagination
        style="margin-top: 20px; text-align: right"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const list = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/logs', { params: queryParams })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.log-list {
  padding: 20px;
}
</style>
