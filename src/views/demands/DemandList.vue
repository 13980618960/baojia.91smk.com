<template>
  <div class="demand-list">
    <el-card>
      <template #header>
        <div class="card-header" style="text-align: center;">
          <span style="font-size: 18px; font-weight: bold;">需求管理</span>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; margin-top: 10px;">
            <el-input v-model="queryParams.demand_id" placeholder="需求ID" style="width: 120px" clearable @change="fetchList" />
            <el-select v-model="queryParams.status" placeholder="状态筛选" clearable style="width: 120px" @change="fetchList">
              <el-option label="新发布" :value="0" />
              <el-option label="报价中" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已流拍" :value="3" />
              <el-option label="已禁用" :value="4" />
            </el-select>
            <el-select v-model="queryParams.need_audit" placeholder="审核状态" clearable style="width: 120px" @change="fetchList">
              <el-option label="未审核" :value="0" />
              <el-option label="已审核" :value="1" />
            </el-select>
            <el-select v-model="queryParams.status_type" placeholder="正常/禁用" clearable style="width: 120px" @change="fetchList">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <div style="display: flex; gap: 5px; align-items: center;">
              <el-select v-model="filterCategoryLevel1" placeholder="一级分类" clearable style="width: 100px" @change="handleFilterCategoryChange(1)">
                <el-option v-for="category in categoryList.filter(c => c.level === 1)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
              <el-select v-model="filterCategoryLevel2" placeholder="二级分类" clearable style="width: 100px" @change="handleFilterCategoryChange(2)">
                <el-option v-for="category in categoryList.filter(c => c.level === 2 && c.parent_id === filterCategoryLevel1)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
              <el-select v-model="filterCategoryLevel3" placeholder="三级分类" clearable style="width: 100px" @change="handleFilterCategoryChange(3)">
                <el-option v-for="category in categoryList.filter(c => c.level === 3 && c.parent_id === filterCategoryLevel2)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
            </div>
            <el-input v-model="queryParams.min_budget" placeholder="最低预算" style="width: 100px" clearable @change="fetchList" type="number" />
            <el-input v-model="queryParams.max_budget" placeholder="最高预算" style="width: 100px" clearable @change="fetchList" type="number" />
            <div style="display: flex; gap: 5px; align-items: center;">
              <el-select v-model="filterProvince" placeholder="省份" clearable style="width: 100px" @change="handleAreaFilterChange('province')">
                <el-option v-for="province in provinces" :key="province.area_id" :label="province.name" :value="province.name" />
              </el-select>
              <el-select v-model="filterCity" placeholder="城市" clearable style="width: 100px" :disabled="!filterProvince" @change="handleAreaFilterChange('city')">
                <el-option v-for="city in cities" :key="city.area_id" :label="city.name" :value="city.name" />
              </el-select>
              <el-select v-model="filterDistrict" placeholder="区县" clearable style="width: 100px" :disabled="!filterCity" @change="handleAreaFilterChange('district')">
                <el-option v-for="district in districts" :key="district.area_id" :label="district.name" :value="district.name" />
              </el-select>
            </div>
            <el-input v-model="queryParams.keyword" placeholder="搜索标题" style="width: 200px" clearable @change="fetchList" />
            <el-button type="primary" @click="fetchList">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" border stripe fit style="text-align: center; font-size: 12px;">
        <el-table-column prop="demand_id" label="需求ID" min-width="60" align="center" />
        <el-table-column label="发布人" min-width="70" align="center">
          <template #default="{ row }">
            <el-link @click="handleViewUser(row.user_id, row.user_name)" :title="row.user_name">{{ row.user_name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="需求标题" min-width="180" show-overflow-tooltip align="center" />
        <el-table-column prop="category_level1" label="1级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="category_level2" label="2级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="category_level3" label="3级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="province" label="省份" min-width="70" align="center" />
        <el-table-column prop="city" label="城市" min-width="70" align="center" />
        <el-table-column prop="district" label="区县" min-width="70" align="center" />
        <el-table-column label="需求详情" min-width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="心理价位" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.budget }}
          </template>
        </el-table-column>
        <el-table-column label="单位" min-width="70" align="center">
          <template #default="{ row }">
            {{ row.unit || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="max_quoters" label="限报人数" min-width="60" align="center" />
        <el-table-column prop="published_at" label="发布时间" min-width="130" align="center" />
        <el-table-column prop="expire_time" label="限制报价时间" min-width="130" align="center" />
        <el-table-column label="需求状态" min-width="160" align="center">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
              <el-tag :type="getStatusType(row.status)" style="font-size: 11px; padding: 2px 6px;">
                {{ getStatusText(row.status) }}
              </el-tag>
              <el-tag :type="row.status === 4 ? 'danger' : 'success'" effect="plain" size="small" style="font-size: 11px; padding: 2px 6px;">
                {{ row.status === 4 ? '禁用' : '正常' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditType(row.need_audit)" @click="handleAuditStatus(row)" style="cursor: pointer; font-size: 11px; padding: 2px 6px;">
              {{ getAuditText(row.need_audit) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已参报人数" min-width="70" align="center">
          <template #default="{ row }">
            <el-link v-if="row.quote_count > 0" @click="handleViewQuotes(row.demand_id)">{{ row.quote_count }}</el-link>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="收藏数量" min-width="70" align="center">
          <template #default="{ row }">
            <el-link v-if="row.favorite_count > 0" @click="handleViewFavorites(row.demand_id)">{{ row.favorite_count }}</el-link>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="编辑" min-width="70" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="130" align="center">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <el-button size="small" type="warning" @click="handleToggleStatus(row)" style="font-size: 11px; padding: 2px 8px;">
                {{ row.status === 4 ? '正常' : '禁用' }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)" style="font-size: 11px; padding: 2px 8px;">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px; text-align: center"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>

    <!-- 编辑需求对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑需求" width="800px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="需求标题" required>
          <el-input v-model="editForm.title" placeholder="请输入需求标题" />
        </el-form-item>
        <el-form-item label="需求分类" required>
          <el-cascader
            v-model="categoryPath"
            :options="categoryTree"
            :props="{
              expandTrigger: 'hover',
              emitPath: true,
              checkStrictly: false
            }"
            placeholder="请选择需求分类"
            style="width: 100%"
            @change="(value) => {
              if (value.length > 0) {
                editForm.category_id = value[value.length - 1]
              } else {
                editForm.category_id = null
              }
            }"
          />
        </el-form-item>
        <el-form-item label="精简说明" required>
          <el-input v-model="editForm.brief_desc" placeholder="请输入精简说明（100字以内）" />
        </el-form-item>
        <el-form-item label="详细描述" required>
          <el-input v-model="editForm.detail_desc" type="textarea" rows="4" placeholder="请输入需求详细描述" />
        </el-form-item>
        <el-form-item label="附件管理">
          <el-upload
            class="upload-demo"
            :action="''"
            name="file"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-exceed="(files, fileList) => ElMessage.warning('最多只能上传12个文件')"
            multiple
            :limit="12"
            :show-file-list="false"
          >
            <el-button type="primary">上传附件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传图片、文档等文件，图片最多上传9张，文档最多上传3份<br>
                <span style="color: #909399; font-size: 12px;">仅支持的格式: .doc .pdf .xls .rtf .jpg .png</span>
              </div>
            </template>
          </el-upload>
          <div v-if="attachments.length > 0" style="margin-top: 15px; max-height: 300px; overflow-y: auto;">
            <el-divider content-position="left">已上传附件</el-divider>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 500px;">
              <div v-for="(attachment, index) in attachments" :key="attachment.id" style="display: flex; flex-direction: column; align-items: center; padding: 10px; border: 1px solid #e4e7ed; border-radius: 4px; background: #fafafa; max-width: 120px;">
                <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; border: 1px solid #e4e7ed; border-radius: 4px; background: #fff;">
                  <img 
                    v-if="attachment.mime_type && attachment.mime_type.startsWith('image/')" 
                    :src="getAttachmentUrl(attachment.url)" 
                    alt="附件图片" 
                    style="max-width: 70px; max-height: 70px; object-fit: cover;"
                  />
                  <span v-else style="font-size: 12px; color: #909399;">文档</span>
                </div>
                <div style="font-size: 12px; text-align: center; margin-bottom: 8px; word-break: break-all; width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ decodeFilename(attachment.filename) || '未命名' }}</div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">
                  <el-button size="mini" @click="handleDownload(attachment)">查看</el-button>
                  <el-button size="mini" type="danger" @click="handleDeleteAttachment(attachment)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="省份">
          <el-select v-model="editForm.province" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange">
            <el-option v-for="province in provinces" :key="province.name" :label="province.name" :value="province.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="editForm.city" placeholder="请选择城市" style="width: 100%" @change="handleCityChange">
            <el-option v-for="city in cities" :key="city.name" :label="city.name" :value="city.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="区县">
          <el-select v-model="editForm.district" placeholder="请选择区县" style="width: 100%">
            <el-option v-for="district in districts" :key="district.name" :label="district.name" :value="district.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="editForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="心里价位">
          <el-input v-model="editForm.budget" type="number" placeholder="请输入心里价位" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="editForm.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="限报人数">
          <el-input v-model="editForm.max_quoters" type="number" placeholder="请输入限报人数" />
        </el-form-item>
        <el-form-item label="限制报价时间">
          <el-date-picker v-model="editForm.deadline" type="datetime" placeholder="请选择限制报价时间" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="editForm.need_audit" placeholder="请选择审核状态">
            <el-option label="未审核" :value="0" />
            <el-option label="已审核" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

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

const list = ref([])
const total = ref(0)
// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  demand_id: '',
  status: '',
  need_audit: '',
  status_type: '',
  category_id: '',
  province: '',
  city: '',
  district: '',
  min_budget: '',
  max_budget: '',
  keyword: ''
})

onMounted(async () => {
  await fetchCategories()
  await fetchProvinces()
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/demands', { params: queryParams })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger', 'danger']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['新发布', '报价中', '已完成', '已流拍', '已禁用']
  return texts[status] || ''
}

const getAuditType = (auditStatus) => {
  const types = ['warning', 'success']
  return types[auditStatus] || 'info'
}

const getAuditText = (auditStatus) => {
  const texts = ['未审核', '已审核']
  return texts[auditStatus] || '未知'
}

const handleAuditStatus = async (row) => {
  try {
    // 检查是否有分类
    if (!row.category_id) {
      ElMessage.warning('请先选择分类后再审核')
      return
    }
    
    // 切换审核状态
    const newAuditStatus = row.need_audit === 0 ? 1 : 0
    await request.put(`/admin/demands/${row.demand_id}/audit`, { need_audit: newAuditStatus })
    ElMessage.success('审核状态更新成功')
    fetchList()
  } catch (error) {
    console.error(error)
    ElMessage.error('更新审核状态失败')
  }
}

// 处理需求状态切换
const handleStatusChange = async (row, command) => {
  try {
    // 检查状态切换的合法性
    if (row.status === 4) { // 已流拍
      ElMessage.warning('已流拍的需求不能切换状态')
      return
    }
    
    // 更新状态
    await request.post(`/admin/demands/${row.demand_id}/update-status`, { status: command })
    ElMessage.success('状态切换成功')
    fetchList()
  } catch (error) {
    console.error(error)
    ElMessage.error('状态切换失败')
  }
}



// 选中的状态
const selectedStatus = ref(null)

// 分类级别
const categoryLevel1 = ref(null)
const categoryLevel2 = ref(null)
const categoryLevel3 = ref(null)

// 分类级联选择
const categoryPath = ref([])
const categoryTree = ref([])

// 级联选择器配置
const cascaderProps = {
  expandTrigger: 'hover',
  emitPath: true,
  onChange: (value, selectedOptions) => {
    if (value.length > 0) {
      // 取最后一个值作为分类ID（即最深级别的分类）
      queryParams.category_id = value[value.length - 1]
    } else {
      queryParams.category_id = ''
    }
    // 自动刷新需求列表
    fetchList()
    // 选择了分类，自动收起
    if (value.length > 0) {
      // 选择后自动收起的逻辑
    }
  },
  checkStrictly: false
  // 允许选择任何级别的分类
}

// 筛选分类级别
const filterCategoryLevel1 = ref(null)
const filterCategoryLevel2 = ref(null)
const filterCategoryLevel3 = ref(null)

// 处理分类选择变化
const handleCategoryChange = (level) => {
  if (level === 1) {
    categoryLevel2.value = null
    categoryLevel3.value = null
    editForm.category_id = categoryLevel1.value
  } else if (level === 2) {
    categoryLevel3.value = null
    editForm.category_id = categoryLevel2.value
  } else if (level === 3) {
    editForm.category_id = categoryLevel3.value
  }
}

// 处理筛选分类选择变化
const handleFilterCategoryChange = (level) => {
  if (level === 1) {
    filterCategoryLevel2.value = null
    filterCategoryLevel3.value = null
    queryParams.category_id = filterCategoryLevel1.value
  } else if (level === 2) {
    filterCategoryLevel3.value = null
    queryParams.category_id = filterCategoryLevel2.value
  } else if (level === 3) {
    queryParams.category_id = filterCategoryLevel3.value
  }
  fetchList()
}

// 处理省市区筛选变化
const handleAreaFilterChange = (level) => {
  if (level === 'province') {
    filterCity.value = ''
    filterDistrict.value = ''
    // 获取城市列表
    const province = provinces.value.find(p => p.name === filterProvince.value)
    if (province) {
      fetchCities(province.area_id)
    } else {
      cities.value = []
      districts.value = []
    }
  } else if (level === 'city') {
    filterDistrict.value = ''
    // 获取区县列表
    const city = cities.value.find(c => c.name === filterCity.value)
    if (city) {
      fetchDistricts(city.area_id)
    } else {
      districts.value = []
    }
  }
  
  // 设置省市区筛选参数
  queryParams.province = filterProvince.value || ''
  queryParams.city = filterCity.value || ''
  queryParams.district = filterDistrict.value || ''
  
  fetchList()
}

// 查看收藏列表
const handleViewFavorites = async (demandId) => {
  try {
    const res = await request.get(`/admin/favorites`, { params: { demand_id: demandId } })
    const favorites = res.data.list
    if (favorites.length === 0) {
      ElMessage.info('暂无收藏')
      return
    }
    let favoriteHtml = ''
    favorites.forEach((favorite, index) => {
      favoriteHtml += `收藏 ${index + 1}:<br>` +
                    `用户ID: ${favorite.user_id}<br>` +
                    `用户昵称: ${favorite.user_nickname}<br>` +
                    `真实姓名: ${favorite.real_name || '未设置'}<br>` +
                    `手机号: ${favorite.phone || '未设置'}<br><br>`
    })
    ElMessageBox.alert(
      favoriteHtml,
      `收藏列表 - 需求ID: ${demandId}`,
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      }
    )
  } catch (error) {
    console.error(error)
    ElMessage.error('获取收藏列表失败')
  }
}

const handleViewUser = async (userId, userName) => {
  try {
    const res = await request.get(`/admin/users/${userId}`)
    const user = res.data
    ElMessageBox.alert(
      `用户ID: ${user.user_id}<br>` +
      `用户昵称: ${user.nickname}<br>` +
      `真实姓名: ${user.real_name || '未设置'}<br>` +
      `手机号: ${user.phone || '未设置'}<br>` +
      `地址: ${user.address || '未设置'}<br>` +
      `用户身份: ${user.demander_active && user.quoter_active ? '需求方+报价方' : user.demander_active ? '需求方' : user.quoter_active ? '报价方' : '未激活'}<br>` +
      `注册时间: ${user.created_at}`,
      `用户信息 - ${userName}`,
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      }
    )
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户信息失败')
  }
}

const handleViewDetail = async (row) => {
  try {
    const res = await request.get(`/admin/demands/${row.demand_id}`)
    const demand = res.data
    ElMessageBox.alert(
      `需求ID: ${demand.demand_id}<br>` +
      `需求标题: ${demand.title}<br>` +
      `发布人: ${demand.user_name || '未设置'} (用户ID: ${demand.user_id})<br>` +
      `需求分类: ${demand.category_name || '未设置'}<br>` +
      `精简说明: ${demand.brief_desc || '未设置'}<br>` +
      `详细描述: ${demand.detail_desc || '未设置'}<br>` +
      `心里价位: ${demand.budget} ${demand.unit || ''}<br>` +
      `限报人数: ${demand.max_quoters}<br>` +
      `需求状态: ${getStatusText(demand.status)}<br>` +
      `发布时间: ${demand.published_at || '未设置'}<br>` +
      `限制报价时间: ${demand.deadline || '未设置'}<br>` +
      `省份: ${demand.province || '未设置'}<br>` +
      `城市: ${demand.city || '未设置'}<br>` +
      `区县: ${demand.district || '未设置'}<br>` +
      `详细地址: ${demand.address || '未设置'}<br>`,
      `需求详情 - ${demand.title}`,
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      }
    )
  } catch (error) {
    console.error(error)
    ElMessage.error('获取需求详情失败')
  }
}

const handleViewQuotes = async (demandId) => {
  try {
    const res = await request.get(`/admin/quotes`, { params: { demand_id: demandId } })
    const quotes = res.data.list
    if (quotes.length === 0) {
      ElMessage.info('暂无报价')
      return
    }
    let quoteHtml = ''
    quotes.forEach((quote, index) => {
      quoteHtml += `报价 ${index + 1}:<br>` +
                  `报价ID: ${quote.quote_id}<br>` +
                  `报价人: ${quote.user_nickname} (用户ID: ${quote.user_id})<br>` +
                  `报价金额: ${quote.price}<br>` +
                  `报价时间: ${quote.created_at}<br><br>`
    })
    ElMessageBox.alert(
      quoteHtml,
      `报价列表 - 需求ID: ${demandId}`,
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      }
    )
  } catch (error) {
    console.error(error)
    ElMessage.error('获取报价列表失败')
  }
}

// 编辑需求表单
const editDialogVisible = ref(false)
const editForm = reactive({
  demand_id: '',
  title: '',
  brief_desc: '',
  detail_desc: '',
  category_id: '',
  province: '',
  city: '',
  district: '',
  address: '',
  budget: '',
  unit: '',
  max_quoters: 5,
  deadline: '',
  need_audit: 0
})

// 附件管理
const attachments = ref([])
const uploadUrl = '/api/v1/upload'

// 省市区数据
const provinces = ref([])
const cities = ref([])
const districts = ref([])

// 获取附件列表
const fetchAttachments = async (demandId) => {
  try {
    const res = await request.get('/admin/attachments', { params: { type: 'demand', related_id: demandId } })
    attachments.value = res.data.list
  } catch (error) {
    console.error(error)
  }
}

// 分类列表
const categoryList = ref([])

// 省市区筛选
const filterProvince = ref('')
const filterCity = ref('')
const filterDistrict = ref('')

// 扁平化分类树
const flattenCategoryTree = (tree) => {
  let flatList = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      flatList.push(node)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return flatList
}

// 构建级联选择器的树形结构
const buildCascaderTree = (tree) => {
  const buildNode = (node) => {
    return {
      value: node.category_id,
      label: node.name,
      children: node.children ? node.children.map(child => buildNode(child)) : []
    }
  }
  return tree.map(node => buildNode(node))
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories/all')
    // 将树形结构转换为扁平结构
    categoryList.value = flattenCategoryTree(res.data)
    // 构建级联选择器的树形结构
    categoryTree.value = buildCascaderTree(res.data)
  } catch (error) {
    console.error(error)
  }
}

// 获取省份列表
const fetchProvinces = async () => {
  try {
    const res = await request.get('/admin/areas/provinces')
    provinces.value = res.data
  } catch (error) {
    console.error('获取省份列表失败:', error)
  }
}

// 获取城市列表
const fetchCities = async (provinceId) => {
  try {
    const res = await request.get('/admin/areas/cities', { params: { province_id: provinceId } })
    cities.value = res.data
  } catch (error) {
    console.error('获取城市列表失败:', error)
  }
}

// 获取区县列表
const fetchDistricts = async (cityId) => {
  try {
    const res = await request.get('/admin/areas/districts', { params: { city_id: cityId } })
    districts.value = res.data
  } catch (error) {
    console.error('获取区县列表失败:', error)
  }
}

// 省份选择变化处理
const handleProvinceChange = (provinceName) => {
  console.log('Province changed:', provinceName)
  // 清空城市和区县
  editForm.city = ''
  editForm.district = ''
  cities.value = []
  districts.value = []
  
  // 查找省份ID
  const province = provinces.value.find(p => p.name === provinceName)
  console.log('Found province:', province)
  if (province) {
    console.log('Fetching cities for province:', province.area_id)
    fetchCities(province.area_id)
  }
}

// 城市选择变化处理
const handleCityChange = (cityName) => {
  console.log('City changed:', cityName)
  // 清空区县
  editForm.district = ''
  districts.value = []
  
  // 查找城市ID
  const city = cities.value.find(c => c.name === cityName)
  console.log('Found city:', city)
  if (city) {
    console.log('Fetching districts for city:', city.area_id)
    fetchDistricts(city.area_id)
  }
}

// 编辑需求
const handleEdit = async (row) => {
  try {
    // 获取分类列表
    await fetchCategories()
    // 获取省份列表
    await fetchProvinces()
    // 获取需求详情
    const res = await request.get(`/admin/demands/${row.demand_id}`)
    const demand = res.data
    // 填充表单数据
    Object.assign(editForm, {
      demand_id: demand.demand_id,
      title: demand.title,
      brief_desc: demand.brief_desc,
      detail_desc: demand.detail_desc,
      category_id: demand.category_id,
      province: demand.province,
      city: demand.city,
      district: demand.district,
      address: demand.address,
      budget: demand.budget,
      unit: demand.unit,
      max_quoters: demand.max_quoters,
      deadline: demand.deadline,
      need_audit: demand.need_audit
    })
    
    // 根据省份获取城市列表
    if (demand.province) {
      const province = provinces.value.find(p => p.name === demand.province)
      if (province) {
        await fetchCities(province.area_id)
        // 根据城市获取区县列表
        if (demand.city) {
          const city = cities.value.find(c => c.name === demand.city)
          if (city) {
            await fetchDistricts(city.area_id)
          }
        }
      }
    }
    
    // 设置分类级别
    if (demand.category_id) {
      const category = categoryList.value.find(c => c.category_id === demand.category_id)
      if (category) {
        if (category.level === 3) {
          // 三级分类，需要找到对应的二级和一级分类
          const level2Category = categoryList.value.find(c => c.category_id === category.parent_id)
          if (level2Category) {
            categoryLevel2.value = level2Category.category_id
            const level1Category = categoryList.value.find(c => c.category_id === level2Category.parent_id)
            if (level1Category) {
              categoryLevel1.value = level1Category.category_id
              // 设置级联选择器的路径
              categoryPath.value = [level1Category.category_id, level2Category.category_id, category.category_id]
            }
          }
          categoryLevel3.value = category.category_id
          editForm.category_id = category.category_id
        } else if (category.level === 2) {
          // 二级分类，需要找到对应的一级分类
          const level1Category = categoryList.value.find(c => c.category_id === category.parent_id)
          if (level1Category) {
            categoryLevel1.value = level1Category.category_id
            // 设置级联选择器的路径
            categoryPath.value = [level1Category.category_id, category.category_id]
          }
          categoryLevel2.value = category.category_id
          categoryLevel3.value = null
          editForm.category_id = category.category_id
        } else if (category.level === 1) {
          // 一级分类
          categoryLevel1.value = category.category_id
          // 设置级联选择器的路径
          categoryPath.value = [category.category_id]
          categoryLevel2.value = null
          categoryLevel3.value = null
          editForm.category_id = category.category_id
        }
      }
    } else {
      // 没有分类
      categoryLevel1.value = null
      categoryLevel2.value = null
      categoryLevel3.value = null
      categoryPath.value = []
      editForm.category_id = null
    }
    
    // 获取附件列表
    await fetchAttachments(row.demand_id)
    // 打开编辑对话框
    editDialogVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取需求详情失败')
  }
}

// 保存编辑
const saveEdit = async () => {
  try {
    // 根据级联选择器的路径设置分类ID
    if (categoryPath.value.length > 0) {
      // 取最后一个值作为分类ID（即最深级别的分类）
      editForm.category_id = categoryPath.value[categoryPath.value.length - 1]
    } else {
      editForm.category_id = null
    }
    await request.put(`/admin/demands/${editForm.demand_id}`, editForm)
    ElMessage.success('编辑成功')
    editDialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
    ElMessage.error('编辑失败')
  }
}

// 上传前检查
const beforeUpload = (file) => {
  // 检查图片和文档的数量
  const imageCount = attachments.value.filter(item => item.mime_type && item.mime_type.startsWith('image/')).length
  const docCount = attachments.value.filter(item => item.mime_type && !item.mime_type.startsWith('image/')).length
  
  if (file.type.startsWith('image/')) {
    if (imageCount >= 9) {
      ElMessage.error('图片最多上传9张')
      return false
    }
  } else {
    if (docCount >= 3) {
      ElMessage.error('文档最多上传3份')
      return false
    }
  }
  return true
}

// 上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    ElMessage.success({
      message: '上传成功',
      duration: 3000
    })
    // 刷新附件列表
    fetchAttachments(editForm.demand_id)
  } else {
    ElMessage.error({
      message: '上传失败',
      duration: 3000
    })
  }
}

// 上传错误处理
const handleUploadError = (error, file, fileList) => {
  console.error('上传错误:', error)
  // 显示错误信息，3秒后自动隐藏
  let errorMessage = '未知错误'
  if (error.message) {
    errorMessage = error.message
  } else if (error.response && error.response.data && error.response.data.message) {
    errorMessage = error.response.data.message
  }
  ElMessage.error({
    message: `上传失败: ${errorMessage}`,
    duration: 3000
  })
}

// 文件选择处理
const handleFileChange = async (file, fileList) => {
  // 检查文件类型
  const ext = file.name.substring(file.name.lastIndexOf('.'))
  const allowedExtensions = ['.doc', '.pdf', '.xls', '.rtf', '.jpg', '.png']
  if (!allowedExtensions.includes(ext.toLowerCase())) {
    ElMessage.error('仅支持上传的文件类型: .doc .pdf .xls .rtf .jpg .png')
    return
  }
  
  // 检查图片和文档的数量
  const imageCount = attachments.value.filter(item => item.mime_type && item.mime_type.startsWith('image/')).length
  const docCount = attachments.value.filter(item => item.mime_type && !item.mime_type.startsWith('image/')).length
  
  if (file.raw.type.startsWith('image/')) {
    if (imageCount >= 9) {
      ElMessage.error('图片最多上传9张')
      return
    }
  } else {
    if (docCount >= 3) {
      ElMessage.error('文档最多上传3份')
      return
    }
  }
  
  // 准备表单数据
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('type', 'demand')
  formData.append('related_id', editForm.demand_id)
  formData.append('user_id', localStorage.getItem('admin_user_id') || 1)
  
  try {
    // 发送上传请求
    const res = await request.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200) {
      ElMessage.success({
        message: '上传成功',
        duration: 3000
      })
      // 刷新附件列表
      fetchAttachments(editForm.demand_id)
    } else {
      ElMessage.error({
        message: '上传失败',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error({
      message: `上传失败: ${error.message || '未知错误'}`,
      duration: 3000
    })
  }
}

// 移除文件处理
const handleRemove = (file, fileList) => {
  // 这里只是从文件列表中移除，实际删除需要调用删除接口
  console.log('移除文件:', file)
}

// 下载附件
const handleDownload = (row) => {
  // 确保 URL 是完整的
  let url = row.url
  if (!url.startsWith('http')) {
    // 构建完整的URL，确保路径正确
    if (url.startsWith('/')) {
      url = `https://baojiaapi.91smk.com${url}`
    } else {
      url = `https://baojiaapi.91smk.com/uploads/${url}`
    }
  }
  window.open(url, '_blank')
}

// 构建附件图片的完整URL
const getAttachmentUrl = (url) => {
  if (!url.startsWith('http')) {
    if (url.startsWith('/')) {
      return `https://baojiaapi.91smk.com${url}`
    } else {
      return `https://baojiaapi.91smk.com/uploads/${url}`
    }
  }
  return url
}

// 删除附件
const handleDeleteAttachment = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此附件吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/attachments/${row.id}`)
    ElMessage.success('删除成功')
    // 刷新附件列表
    fetchAttachments(editForm.demand_id)
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要${row.status === 4 ? '正常' : '禁用'}此需求吗?`, '提示', { type: 'warning' })
    await request.post(`/admin/demands/${row.demand_id}/toggle-status`)
    ElMessage.success(`${row.status === 4 ? '正常' : '禁用'}成功`)
    fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此需求吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/demands/${row.demand_id}`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleOffline = async (row) => {
  try {
    await ElMessageBox.confirm('确定要下架此需求吗?', '提示', { type: 'warning' })
    await request.post(`/admin/demands/${row.demand_id}/offline`)
    ElMessage.success('操作成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}
</script>

<style scoped>
.demand-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
