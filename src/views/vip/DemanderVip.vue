<template>
  <div class="vip-page">
    <el-card>
      <template #header>
        <span>D-vips 需求方会员等级管理</span>
        <el-button type="primary" size="small" @click="handleAdd">新增等级</el-button>
      </template>
      <el-table :data="levels" border stripe>
        <el-table-column prop="level_id" label="ID" width="80" />
        <el-table-column prop="level_name" label="等级名称" />
        <el-table-column prop="level_value" label="等级值" />
        <el-table-column label="每日发布数">
          <template #default="{ row }">
            {{ row.daily_max_demands }}条/天
          </template>
        </el-table-column>
        <el-table-column prop="priority_weight" label="优先级权重" />
        <el-table-column prop="price" label="价格" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑等级' : '新增等级'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="等级名称">
          <el-input v-model="form.level_name" />
        </el-form-item>
        <el-form-item label="等级值">
          <el-input-number v-model="form.level_value" :min="1" />
        </el-form-item>
        <el-form-item label="每日发布数">
          <el-input-number v-model="form.daily_max_demands" :min="0" />
        </el-form-item>
        <el-form-item label="优先级权重">
          <el-input-number v-model="form.priority_weight" :min="1" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const levels = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const form = reactive({
  level_id: null,
  level_name: '',
  level_value: 1,
  daily_max_demands: 0,
  priority_weight: 10,
  price: 0,
  sort: 0
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/vip/demander')
    levels.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { level_id: null, level_name: '', level_value: 1, daily_max_demands: 0, priority_weight: 10, price: 0, sort: 0 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await request.put(`/admin/vip/demander/${form.level_id}`, form)
    } else {
      await request.post('/admin/vip/demander', form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.vip-page {
  padding: 20px;
}
</style>
