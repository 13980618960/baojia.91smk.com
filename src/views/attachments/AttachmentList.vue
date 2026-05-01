<template>
  <div class="attachment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>附件管理</span>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
            <el-input v-model="queryParams.keyword" placeholder="搜索文件名" style="width: 180px" clearable @change="fetchList" />
            <el-input v-model="queryParams.user_id" placeholder="用户ID" style="width: 100px" clearable @change="fetchList" type="number" />
            <el-input v-model="queryParams.demand_id" placeholder="需求ID" style="width: 100px" clearable @change="fetchList" type="number" />
            <el-input v-model="queryParams.quote_id" placeholder="报价ID" style="width: 100px" clearable @change="fetchList" type="number" />
            <el-select v-model="queryParams.file_extension" placeholder="文件格式" clearable style="width: 120px" @change="fetchList">
              <el-option label="pdf" value="pdf" />
              <el-option label="doc" value="doc" />
              <el-option label="docx" value="docx" />
              <el-option label="xls" value="xls" />
              <el-option label="xlsx" value="xlsx" />
              <el-option label="jpg" value="jpg" />
              <el-option label="jpeg" value="jpeg" />
              <el-option label="png" value="png" />
              <el-option label="gif" value="gif" />
              <el-option label="txt" value="txt" />
              <el-option label="zip" value="zip" />
              <el-option label="rar" value="rar" />
            </el-select>
            <el-select v-model="activeType" @change="fetchList" style="width: 140px;">
              <el-option label="全部" value="all" />
              <el-option label="需求附件" value="demand" />
              <el-option label="报价附件" value="quote" />
              <el-option label="系统附件" value="system" />
              <el-option label="平台附件" value="platform" />
              <el-option label="广告附件" value="advertisement" />
              <el-option label="用户头像" value="avatar" />
            </el-select>
            <el-button type="primary" @click="fetchList">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" border stripe fit style="text-align: center;">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="附件类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'demand'" type="success" size="small">需求附件</el-tag>
            <el-tag v-else-if="row.type === 'quote'" type="warning" size="small">报价附件</el-tag>
            <el-tag v-else-if="row.type === 'system'" type="info" size="small">系统附件</el-tag>
            <el-tag v-else-if="row.type === 'platform'" type="info" size="small">平台附件</el-tag>
            <el-tag v-else-if="row.type === 'advertisement'" type="info" size="small">广告附件</el-tag>
            <el-tag v-else-if="row.type === 'avatar'" type="danger" size="small">用户头像</el-tag>
            <el-tag v-else type="primary" size="small">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件名" min-width="180" show-overflow-tooltip align="center">
          <template #default="{ row }">
            {{ row.filename }}
          </template>
        </el-table-column>
        <el-table-column label="需求ID" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.demand_id">{{ row.demand_id }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="报价ID" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.quote_id">{{ row.quote_id }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="文件格式" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.file_extension" type="info" size="small">{{ row.file_extension.toUpperCase() }}</el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="user_id" label="用户ID" width="80" align="center" />
        <el-table-column prop="created_at" label="上传时间" width="170" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.file_extension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(row.file_extension.toLowerCase())" size="small" type="primary" @click="handlePreview(row)">预览</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px; text-align: right"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="附件详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="附件ID">{{ currentAttachment?.id }}</el-descriptions-item>
        <el-descriptions-item label="附件类型">
          <el-tag v-if="currentAttachment?.type === 'demand'" type="success" size="small">需求附件</el-tag>
          <el-tag v-else-if="currentAttachment?.type === 'quote'" type="warning" size="small">报价附件</el-tag>
          <el-tag v-else-if="currentAttachment?.type === 'system'" type="info" size="small">系统附件</el-tag>
          <el-tag v-else-if="currentAttachment?.type === 'avatar'" type="danger" size="small">用户头像</el-tag>
          <el-tag v-else type="primary" size="small">其他</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="文件名">{{ currentAttachment?.filename || '' }}</el-descriptions-item>
        <el-descriptions-item label="文件格式">
          <el-tag v-if="currentAttachment?.file_extension" type="info" size="small">{{ currentAttachment.file_extension.toUpperCase() }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="需求ID">
          <span v-if="currentAttachment?.demand_id">{{ currentAttachment.demand_id }}</span>
          <span v-else style="color: #909399;">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="报价ID">
          <span v-if="currentAttachment?.quote_id">{{ currentAttachment.quote_id }}</span>
          <span v-else style="color: #909399;">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="大小">{{ formatSize(currentAttachment?.size) }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentAttachment?.user_id }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentAttachment?.created_at }}</el-descriptions-item>
        <el-descriptions-item label="访问链接">
          <el-tooltip :content="currentAttachment?.url" placement="top">
            <el-link :href="getAttachmentUrl(currentAttachment?.url)" target="_blank" style="max-width: 100%; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ currentAttachment?.url }}
            </el-link>
          </el-tooltip>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="图片预览" width="800px">
      <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <img v-if="previewImageUrl" :src="previewImageUrl" style="max-width: 100%; max-height: 600px; object-fit: contain;" />
        <span v-else>图片加载失败</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const list = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const currentAttachment = ref(null)
const activeType = ref('all')
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  user_id: '',
  demand_id: '',
  quote_id: '',
  file_extension: ''
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/attachments', { 
      params: {
        ...queryParams,
        type: activeType.value === 'all' ? '' : activeType.value
      }
    })
    // 处理数据：解码文件名，格式化时间
    list.value = res.data.list.map(item => ({
      ...item,
      filename: decodeFilename(item.filename),
      created_at: formatDateTime(item.created_at)
    }))
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

// 解码文件名（兼容多种编码）
const decodeFilename = (filename) => {
  if (!filename) return ''
  
  // 方法1: 直接 decodeURIComponent
  try {
    return decodeURIComponent(filename)
  } catch (e) {}
  
  // 方法2: 尝试 unescape
  try {
    return unescape(filename)
  } catch (e) {}
  
  // 方法3: 尝试 decodeURI
  try {
    return decodeURI(filename)
  } catch (e) {}
  
  // 方法4: 尝试 UTF-8 解码
  try {
    return decodeURIComponent(escape(filename))
  } catch (e) {}
  
  // 直接返回原文件名
  return filename
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handleView = (row) => {
  // 查看详情时也要解码文件名和格式化时间
  currentAttachment.value = {
    ...row,
    filename: decodeFilename(row.filename),
    created_at: formatDateTime(row.created_at)
  }
  dialogVisible.value = true
}

const handlePreview = (row) => {
  previewImageUrl.value = getAttachmentUrl(row.url)
  previewDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此附件吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.delete(`/admin/attachments/${row.id}`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    // 取消删除时也会触发 catch，忽略即可
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const formatSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(2)} ${units[i]}`
}

const getAttachmentUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  return `https://baojiaapi.91smk.com${normalizedUrl}`
}
</script>

<style scoped>
.attachment-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>