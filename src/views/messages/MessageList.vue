<template>
  <div class="message-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <span>沟通记录</span>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索内容"
            clearable
            style="width: 300px"
            @keyup.enter="fetchList"
          >
            <template #append>
              <el-button @click="fetchList">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="list" border stripe>
        <el-table-column prop="msg_id" label="ID" width="80" />
        <el-table-column prop="demand_id" label="需求ID" />
        <el-table-column label="发送方">
          <template #default="{ row }">
            {{ row.from_user_id }} ({{ row.from_identity === 0 ? '需求方' : '报价方' }})
          </template>
        </el-table-column>
        <el-table-column label="接收方">
          <template #default="{ row }">
            {{ row.to_user_id }} ({{ row.to_identity === 0 ? '需求方' : '报价方' }})
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="类型">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已读">
          <template #default="{ row }">
            <el-tag :type="row.is_read === 1 ? 'success' : 'warning'" size="small">
              {{ row.is_read === 1 ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
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
  pageSize: 20,
  keyword: ''
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/messages', { params: queryParams })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const getTypeText = (type) => {
  const texts = ['文字', '图片', '语音', '系统通知']
  return texts[type] || ''
}
</script>

<style scoped>
.message-list {
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
