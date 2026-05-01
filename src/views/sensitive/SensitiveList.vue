<template>
  <div class="sensitive-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>敏感词管理</span>
          <el-button type="primary" @click="handleAdd">新增词汇</el-button>
        </div>
      </template>
      <el-table :data="list" border stripe>
        <el-table-column prop="word_id" label="ID" width="80" />
        <el-table-column prop="word" label="敏感词" />
        <el-table-column label="级别">
          <template #default="{ row }">
            <el-tag :type="row.level === 1 ? 'danger' : 'warning'">
              {{ row.level === 1 ? '严重' : '一般' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="replace_word" label="替换词" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑敏感词' : '新增敏感词'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="敏感词">
          <el-input v-model="form.word" />
        </el-form-item>
        <el-form-item label="级别">
          <el-radio-group v-model="form.level">
            <el-radio :label="1">严重</el-radio>
            <el-radio :label="2">一般</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="替换词">
          <el-input v-model="form.replace_word" placeholder="选填" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const list = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const form = reactive({
  word_id: null,
  word: '',
  level: 1,
  replace_word: ''
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/sensitive')
    list.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { word_id: null, word: '', level: 1, replace_word: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此敏感词吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/sensitive/${row.word_id}`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await request.put(`/admin/sensitive/${form.word_id}`, form)
    } else {
      await request.post('/admin/sensitive', form)
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
.sensitive-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
