<template>
  <div class="user-list">
    <el-card class="card-with-pagination">
      <template #header>
        <div class="card-header" style="text-align: center;">
          <span style="font-size: 18px; font-weight: bold;">用户管理</span>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; margin-top: 10px;">
            <el-input v-model="queryParams.user_id" placeholder="用户ID" style="width: 100px" clearable @change="fetchList" />
            <el-input v-model="queryParams.real_name" placeholder="用户姓名" style="width: 100px" clearable @change="fetchList" />
            <el-input v-model="queryParams.phone" placeholder="手机号" style="width: 120px" clearable @change="fetchList" />
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 100px" @change="fetchList">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-select v-model="queryParams.identity" placeholder="用户类型" clearable style="width: 100px" @change="fetchList">
              <el-option label="需求方" :value="1" />
              <el-option label="报价方" :value="2" />
              <el-option label="双方身份" :value="3" />
            </el-select>
            <div style="display: flex; gap: 5px; align-items: center;">
              <el-select v-model="filterProvince" placeholder="省份" clearable style="width: 90px" @change="handleAreaFilterChange('province')">
                <el-option v-for="province in provinces" :key="province.area_id" :label="province.name" :value="province.name" />
              </el-select>
              <el-select v-model="filterCity" placeholder="城市" clearable style="width: 90px" :disabled="!filterProvince" @change="handleAreaFilterChange('city')">
                <el-option v-for="city in cities" :key="city.area_id" :label="city.name" :value="city.name" />
              </el-select>
              <el-select v-model="filterDistrict" placeholder="区县" clearable style="width: 90px" :disabled="!filterCity" @change="handleAreaFilterChange('district')">
                <el-option v-for="district in districts" :key="district.area_id" :label="district.name" :value="district.name" />
              </el-select>
            </div>
            <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" @change="fetchList" />
            <el-input v-model="queryParams.keyword" placeholder="搜索关键词" style="width: 150px" clearable @change="fetchList" />
            <el-button type="primary" @click="fetchList">搜索</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>
      <div class="table-container">
        <el-table :data="list" border stripe style="width: 100%">
          <el-table-column prop="user_id" label="用户ID" min-width="60" align="center" />
          <el-table-column label="头像" min-width="80" align="center">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.avatar" v-if="row.avatar" />
              <el-avatar :size="40" v-else>{{ row.nickname.charAt(0) }}</el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="微信昵称" min-width="80" align="center">
            <template #default="{ row }">
              <div class="user-info" @click="handleShowWechatInfo(row)">
                <span class="nickname" style="cursor: pointer; text-decoration: underline;">{{ row.nickname }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="real_name" label="用户姓名" min-width="90" align="center" />
          <el-table-column prop="phone" label="用户电话" min-width="120" align="center" />
          <el-table-column label="省" min-width="70" align="center">
            <template #default="{ row }">
              {{ row.province || '' }}
            </template>
          </el-table-column>
          <el-table-column label="市" min-width="70" align="center">
            <template #default="{ row }">
              {{ row.city || '' }}
            </template>
          </el-table-column>
          <el-table-column label="区" min-width="70" align="center">
            <template #default="{ row }">
              {{ row.district || '' }}
            </template>
          </el-table-column>
          <el-table-column label="详细地址" min-width="150" show-overflow-tooltip align="center">
            <template #default="{ row }">
              {{ row.detail_address || row.address || '' }}
            </template>
          </el-table-column>
          <el-table-column label="用户身份" min-width="100" align="center">
            <template #default="{ row }">
              <div v-if="row.demander_active && row.quoter_active" style="display: flex; gap: 2px; flex-wrap: wrap;">
                <el-tag size="small" type="primary">需求方</el-tag>
                <el-tag size="small" type="success">报价方</el-tag>
              </div>
              <el-tag size="small" v-else-if="row.demander_active" type="primary">需求方</el-tag>
              <el-tag size="small" v-else-if="row.quoter_active" type="success">报价方</el-tag>
              <el-tag size="small" v-else type="warning">未激活</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="demand_count" label="发布需求数" min-width="60" align="center" />
          <el-table-column prop="demand_deal_count" label="需求成交数量" min-width="50" align="center" />
          <el-table-column prop="quote_count" label="参与报价数" min-width="50" align="center" />
          <el-table-column prop="quote_deal_count" label="报价成交数量" min-width="50" align="center" />
          <el-table-column prop="created_at" label="注册时间" min-width="130" align="center" />
          <el-table-column label="状态" min-width="70" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.user_status === 1 ? 'success' : 'danger'" @click="handleToggleStatus(row)" style="cursor: pointer;">
                {{ row.user_status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="100" align="center">
            <template #default="{ row }">
              <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">
                <el-button size="small" @click="handleView(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleToggleStatus(row)">
                  {{ row.user_status === 1 ? '禁用' : '启用' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="'编辑用户 - ' + currentUser?.nickname" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户ID" disabled>
          <el-input v-model="form.user_id" disabled />
        </el-form-item>
        <el-form-item label="昵称" disabled>
          <el-input v-model="form.nickname" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省份">
          <el-select v-model="form.province" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange">
            <el-option v-for="province in provinces" :key="province.area_id" :label="province.name" :value="province.area_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%" :disabled="!form.province" @change="handleCityChange">
            <el-option v-for="city in cities" :key="city.area_id" :label="city.name" :value="city.area_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="区县">
          <el-select v-model="form.district" placeholder="请选择区县" style="width: 100%" :disabled="!form.city">
            <el-option v-for="district in districts" :key="district.area_id" :label="district.name" :value="district.area_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detail_address" placeholder="请输入详细地址" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="wechatDialogVisible" title="微信相关信息" width="400px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="微信昵称">{{ currentUser?.nickname }}</el-descriptions-item>
        <el-descriptions-item label="微信头像">
          <el-avatar :size="80" :src="currentUser?.avatar" v-if="currentUser?.avatar" />
          <span v-else>无头像</span>
        </el-descriptions-item>
        <el-descriptions-item label="微信OpenID">{{ currentUser?.openid }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentUser?.user_id }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser?.created_at }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="wechatDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const list = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const wechatDialogVisible = ref(false)
const currentUser = ref(null)
const form = reactive({
  user_id: '',
  nickname: '',
  real_name: '',
  phone: '',
  address: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  demander_active: 0,
  quoter_active: 0
})

// 省市区数据
const provinces = ref([])
const cities = ref([])
const districts = ref([])

// 省市区筛选
const filterProvince = ref('')
const filterCity = ref('')
const filterDistrict = ref('')

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  user_id: '',
  real_name: '',
  phone: '',
  status: null,
  identity: null,
  province: '',
  city: '',
  district: '',
  dateRange: null,
  keyword: '',
  start_date: null,
  end_date: null
})

onMounted(async () => {
  await fetchProvinces()
  fetchList()
})

// 获取省份列表
const fetchProvinces = async () => {
  try {
    const res = await request.get('/admin/areas/provinces')
    if (Array.isArray(res.data)) {
      provinces.value = res.data
    }
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
const handleProvinceChange = async (provinceId) => {
  if (provinceId) {
    await fetchCities(provinceId)
  } else {
    cities.value = []
    districts.value = []
    form.city = ''
    form.district = ''
  }
}

// 城市选择变化处理
const handleCityChange = async (cityId) => {
  if (cityId) {
    await fetchDistricts(cityId)
  } else {
    districts.value = []
    form.district = ''
  }
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

const fetchList = async () => {
  try {
    const params = {
      ...queryParams,
      start_date: queryParams.dateRange ? queryParams.dateRange[0] : null,
      end_date: queryParams.dateRange ? queryParams.dateRange[1] : null
    }
    const res = await request.get('/admin/users', { params })
    // 直接使用后端返回的数据，后端已经处理了省市区字段
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const handleExport = async () => {
  try {
    const params = {
      ...queryParams,
      start_date: queryParams.dateRange ? queryParams.dateRange[0] : null,
      end_date: queryParams.dateRange ? queryParams.dateRange[1] : null,
      export: true
    }
    const res = await request.get('/admin/users/export', { params, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `用户数据_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
  }
}

const handleView = async (row) => {
  currentUser.value = row
  Object.assign(form, {
    user_id: row.user_id,
    nickname: row.nickname,
    real_name: row.real_name || '',
    phone: row.phone || '',
    address: row.address || '',
    province: row.province_id || '',
    city: row.city_id || '',
    district: row.district_id || '',
    detail_address: row.detail_address || '',
    demander_active: row.demander_active || 0,
    quoter_active: row.quoter_active || 0
  })

  // 如果设置了省份，获取城市列表
  if (form.province) {
    await fetchCities(form.province)
    // 如果设置了城市，获取区县列表
    if (form.city) {
      await fetchDistricts(form.city)
    }
  }

  dialogVisible.value = true
}

const handleUpdate = async () => {
  try {
    // 构建更新数据，包含省、市、区ID和详细地址
    const updateData = {
      ...form,
      province_id: form.province,
      city_id: form.city,
      district_id: form.district,
      detail_address: form.detail_address
    }
    
    await request.put(`/admin/users/${form.user_id}`, updateData)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  }
}

const handleShowWechatInfo = (row) => {
  currentUser.value = row
  wechatDialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  try {
    await request.post(`/admin/users/${row.user_id}/toggle-status`)
    ElMessage.success('操作成功')
    fetchList()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname {
  font-size: 14px;
  line-height: 32px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-with-pagination {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}

.table-container {
  flex: 1;
  overflow: auto;
  margin-bottom: 16px;
}

/* 确保表格在容器中正确显示 */
.table-container :deep(.el-table) {
  min-width: 100%;
}

.pagination-container {
  padding: 16px 0;
  border-top: 1px solid #e4e7ed;
  text-align: right;
  background-color: #fff;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
