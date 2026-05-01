<template>
  <div class="category-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">新增顶级分类</el-button>
        </div>
      </template>
      <div class="filter-container">
        <el-cascader
          v-model="filterCategory"
          :options="cascaderOptions"
          :props="{ 
            value: 'category_id', 
            label: 'name', 
            children: 'children', 
            checkStrictly: true,
            expandTrigger: 'hover'
          }"
          placeholder="筛选分类（不选则显示全部）"
          clearable
          size="default"
          @change="handleFilterChange"
        />
        <el-button @click="handleResetFilter">重置</el-button>
      </div>
      <div class="table-container">
        <el-table
          :data="treeData"
          border
          stripe
          row-key="category_id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :lazy="true"
          :load="loadChildren"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="category_id" label="分类ID" width="300" align="center" />
          <el-table-column prop="name" label="分类名称" min-width="35">
            <template #default="{ row }">
              <div class="category-cell" :class="'level-' + row.level">
                <span class="level-indicator" :class="'level-bg-' + row.level">{{ row.level }}级</span>
                <el-icon class="category-icon">
                  <Folder v-if="row.level === 1" />
                  <FolderOpened v-else-if="row.level === 2" />
                  <Document v-else />
                </el-icon>
                <span class="category-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="icon" label="图标" width="240" align="center">
            <template #default="{ row }">
              <span v-if="row.icon" class="icon-text">{{ row.icon }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="100" align="center" />
          <el-table-column label="显示" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.is_show"
                :active-value="1"
                :inactive-value="0"
                @change="handleToggleShow(row)"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleAddChild(row)" v-if="row.level < 3">
                添加子分类
              </el-button>
              <el-button size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <span class="pagination-tip">共 {{ total }} 个一级分类</span>
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="上级分类">
          <div class="parent-info">
            <el-tag v-if="form.level > 1" type="info" size="large" effect="plain">
              {{ getFullPath() }}
            </el-tag>
            <span v-else class="top-level-text">顶级分类（无上级）</span>
          </div>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="显示">
          <el-switch v-model="form.is_show" :active-value="1" :inactive-value="0" />
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
import { Folder, FolderOpened, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

const treeData = ref([])
const cascaderOptions = ref([])
const filterCategory = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  category_id: null
})

const form = reactive({
  category_id: null,
  parent_id: 0,
  level: 1,
  name: '',
  icon: '',
  sort: 0,
  is_show: 1,
  parent_name: ''
})

onMounted(async () => {
  await fetchList()
  await fetchCascaderOptions()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/categories', {
      params: {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
        category_id: queryParams.category_id
      }
    })
    total.value = res.data.total || 0
    treeData.value = res.data.list || []
  } catch (error) {
    console.error(error)
    total.value = 0
    treeData.value = []
  }
}

// 获取级联选择器数据
const fetchCascaderOptions = async () => {
  try {
    const res = await request.get('/admin/categories/all')
    cascaderOptions.value = res.data || []
  } catch (error) {
    console.error(error)
    cascaderOptions.value = []
  }
}

// 筛选分类变化
const handleFilterChange = (value) => {
  queryParams.category_id = value && value.length > 0 ? value[value.length - 1] : null
  queryParams.page = 1
  fetchList()
}

// 重置筛选
const handleResetFilter = () => {
  filterCategory.value = []
  queryParams.category_id = null
  queryParams.page = 1
  fetchList()
}

// 懒加载子分类
const loadChildren = async (row, treeNode, resolve) => {
  try {
    const res = await request.get(`/admin/categories/${row.category_id}/children`)
    resolve(res.data || [])
  } catch (error) {
    console.error(error)
    resolve([])
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    category_id: null,
    parent_id: 0,
    level: 1,
    name: '',
    icon: '',
    sort: 0,
    is_show: 1,
    parent_name: ''
  })
  dialogVisible.value = true
}

const handleAddChild = (row) => {
  isEdit.value = false
  // 构建完整的上级分类路径（用于显示）
  // 添加的分类的level是row.level + 1，显示时应该显示当前分类及其所有上级
  let displayText = ''
  
  const findCategory = (id, options) => {
    for (const option of options) {
      if (option.category_id === id) {
        return option
      }
      if (option.children) {
        const result = findCategory(id, option.children)
        if (result) return result
      }
    }
    return null
  }
  
  if (row.level === 1) {
    // 添加二级分类，显示一级分类名称
    displayText = row.name
  } else if (row.level === 2) {
    // 添加三级分类，显示一级+二级分类名称
    const level1Cat = findCategory(row.parent_id, cascaderOptions.value)
    if (level1Cat) {
      displayText = `${level1Cat.name} → ${row.name}`
    } else {
      displayText = row.name
    }
  }
  
  Object.assign(form, {
    category_id: null,
    parent_id: row.category_id,
    level: row.level + 1,
    name: '',
    icon: '',
    sort: 0,
    is_show: 1,
    parent_name: displayText
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  // 构建完整的上级分类路径（用于显示）
  // 编辑时显示当前分类及其所有上级
  let displayText = ''
  
  const findCategory = (id, options) => {
    for (const option of options) {
      if (option.category_id === id) {
        return option
      }
      if (option.children) {
        const result = findCategory(id, option.children)
        if (result) return result
      }
    }
    return null
  }
  
  if (row.level === 1) {
    // 编辑一级分类，显示一级分类名称
    displayText = row.name
  } else if (row.level === 2) {
    // 编辑二级分类，显示一级+二级分类名称
    const level1Cat = findCategory(row.parent_id, cascaderOptions.value)
    if (level1Cat) {
      displayText = `${level1Cat.name} → ${row.name}`
    } else {
      displayText = row.name
    }
  } else if (row.level === 3) {
    // 编辑三级分类，显示一级+二级+三级分类名称
    const level2Cat = findCategory(row.parent_id, cascaderOptions.value)
    if (level2Cat) {
      const level1Cat = findCategory(level2Cat.parent_id, cascaderOptions.value)
      if (level1Cat) {
        displayText = `${level1Cat.name} → ${level2Cat.name} → ${row.name}`
      } else {
        displayText = `${level2Cat.name} → ${row.name}`
      }
    } else {
      displayText = row.name
    }
  }
  
  Object.assign(form, {
    category_id: row.category_id,
    parent_id: row.parent_id,
    level: row.level,
    name: row.name,
    icon: row.icon || '',
    sort: row.sort || 0,
    is_show: row.is_show,
    parent_name: displayText
  })
  dialogVisible.value = true
}

const getFullPath = () => {
  return form.parent_name
}

const handleDelete = async (row) => {
  try {
    const checkRes = await request.get(`/admin/categories/${row.category_id}/check`)
    if (checkRes.data.hasContent) {
      await ElMessageBox.confirm(
        `此分类下有${checkRes.data.count}条内容，删除后这些内容将变为未分类，确定要删除吗?`,
        '提示',
        { type: 'warning' }
      )
    } else {
      await ElMessageBox.confirm('确定要删除此分类吗?', '提示', { type: 'warning' })
    }
    await request.delete(`/admin/categories/${row.category_id}`)
    ElMessage.success('删除成功')
    await fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    if (!form.name) {
      ElMessage.warning('请输入分类名称')
      return
    }
    if (isEdit.value) {
      await request.put(`/admin/categories/${form.category_id}`, form)
    } else {
      await request.post('/admin/categories', form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    await fetchList()
  } catch (error) {
    console.error(error)
  }
}

const handleToggleShow = async (row) => {
  try {
    await request.put(`/admin/categories/${row.category_id}`, {
      is_show: row.is_show
    })
    ElMessage.success('操作成功')
  } catch (error) {
    console.error(error)
    row.is_show = row.is_show === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.category-list {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.table-container {
  flex: 1;
  overflow: auto;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
}

.pagination-tip {
  font-size: 13px;
  color: #909399;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.level-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  border-radius: 4px;
}

.level-bg-1 {
  background: linear-gradient(135deg, #409eff, #3a8ee6);
}

.level-bg-2 {
  background: linear-gradient(135deg, #67c23a, #5daf34);
}

.level-bg-3 {
  background: linear-gradient(135deg, #e6a23c, #d89f3c);
}

.category-icon {
  font-size: 16px;
}

.level-1 .category-icon {
  color: #409eff;
}

.level-2 .category-icon {
  color: #67c23a;
}

.level-3 .category-icon {
  color: #e6a23c;
}

.category-name {
  font-size: 14px;
  color: #303133;
}

.level-1 .category-name {
  font-weight: 600;
  font-size: 15px;
}

.level-2 .category-name {
  font-weight: 500;
}

.level-3 .category-name {
  font-size: 13px;
}

.icon-text {
  font-size: 12px;
  color: #606266;
}

.text-muted {
  color: #c0c4cc;
}

.parent-info {
  display: flex;
  align-items: center;
}

.top-level-text {
  font-size: 14px;
  color: #909399;
}
</style>
