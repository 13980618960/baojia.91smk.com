<template>
  <div class="quote-list">
    <el-card>
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span style="font-size: 18px; font-weight: bold;">报价管理</span>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
            <el-input v-model="queryParams.quote_id" placeholder="报价ID" style="width: 100px" clearable @change="fetchList" />
            <el-input v-model="queryParams.demand_id" placeholder="需求ID" style="width: 100px" clearable @change="fetchList" />
            <el-select v-model="queryParams.status" placeholder="状态筛选" clearable style="width: 100px" @change="fetchList">
              <el-option label="报价中" :value="0" />
              <el-option label="已拒绝" :value="1" />
              <el-option label="已采纳" :value="2" />
              <el-option label="已流拍" :value="3" />
              <el-option label="已禁用" :value="4" />
            </el-select>
            <div style="display: flex; gap: 5px; align-items: center;">
              <el-select v-model="filterCategoryLevel1" placeholder="一级分类" clearable style="width: 100px" @change="handleFilterCategoryChange(1)">
                <el-option v-for="category in categoryList.filter(c => c.level === 1)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
              <el-select v-model="filterCategoryLevel2" placeholder="二级分类" clearable style="width: 100px" :disabled="!filterCategoryLevel1" @change="handleFilterCategoryChange(2)">
                <el-option v-for="category in categoryList.filter(c => c.level === 2 && c.parent_id === filterCategoryLevel1)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
              <el-select v-model="filterCategoryLevel3" placeholder="三级分类" clearable style="width: 100px" :disabled="!filterCategoryLevel2" @change="handleFilterCategoryChange(3)">
                <el-option v-for="category in categoryList.filter(c => c.level === 3 && c.parent_id === filterCategoryLevel2)" :key="category.category_id" :label="category.name" :value="category.category_id" />
              </el-select>
            </div>
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
            <el-input v-model="queryParams.keyword" placeholder="搜索标题" style="width: 150px" clearable @change="fetchList" />
            <el-button type="primary" @click="fetchList">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" border stripe fit style="text-align: center; font-size: 12px;">
        <el-table-column prop="quote_id" label="报价ID" min-width="80" align="center" />
        <el-table-column prop="demand_id" label="需求ID" min-width="80" align="center" />
        <el-table-column label="报价人" min-width="90" align="center">
          <template #default="{ row }">
            <el-link @click="handleViewUser(row.user_id, row.user_nickname)">{{ row.user_nickname }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="demand_title" label="需求标题" min-width="180" show-overflow-tooltip align="center" />
        <el-table-column prop="demand_category_level1" label="1级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="demand_category_level2" label="2级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="demand_category_level3" label="3级分类" min-width="90" show-overflow-tooltip align="center" />
        <el-table-column prop="demand_province" label="省份" min-width="70" align="center" />
        <el-table-column prop="demand_city" label="城市" min-width="70" align="center" />
        <el-table-column prop="demand_district" label="区县" min-width="70" align="center" />
        <el-table-column label="心理价位" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.demand_budget }}
          </template>
        </el-table-column>
        <el-table-column prop="demand_unit" label="单位" min-width="60" align="center" />
        <el-table-column prop="demand_published_at" label="发布时间" min-width="140" align="center" />
        <el-table-column prop="created_at" label="报价时间" min-width="140" align="center" />
        <el-table-column prop="price" label="报价金额" min-width="90" align="center" />
        <el-table-column label="报价状态" min-width="120" align="center">
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
        <el-table-column label="报价详情" min-width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const list = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  quote_id: '',
  demand_id: '',
  status: '',
  category_id: '',
  province: '',
  city: '',
  district: '',
  keyword: ''
})

// 分类列表
const categoryList = ref([])
// 省市区数据
const provinces = ref([])
const cities = ref([])
const districts = ref([])
// 筛选分类级别
const filterCategoryLevel1 = ref(null)
const filterCategoryLevel2 = ref(null)
const filterCategoryLevel3 = ref(null)
// 省市区筛选
const filterProvince = ref('')
const filterCity = ref('')
const filterDistrict = ref('')

onMounted(async () => {
  await fetchCategories()
  await fetchProvinces()
  fetchList()
})

const fetchList = async () => {
  try {
    const res = await request.get('/admin/quotes', { params: queryParams })
    // 确保返回的数据是数组
    if (Array.isArray(res.data.list)) {
      // 处理数据，确保即使需求信息不存在也能正常显示
      list.value = res.data.list.map(quote => {
        // 解析三级分类
        let demand_category_level1 = ''
        let demand_category_level2 = ''
        let demand_category_level3 = ''
        
        if (quote.demand_category) {
          // 尝试从分类名称中解析三级分类
          // 这里需要根据实际的分类格式进行调整
          // 假设分类格式为 "一级分类/二级分类/三级分类"
          const categoryParts = quote.demand_category.split('/')
          if (categoryParts.length >= 1) demand_category_level1 = categoryParts[0]
          if (categoryParts.length >= 2) demand_category_level2 = categoryParts[1]
          if (categoryParts.length >= 3) demand_category_level3 = categoryParts[2]
        }
        
        return {
          ...quote,
          user_id: quote.user_id || null,
          user_nickname: quote.user_nickname || '未知用户',
          demand_title: quote.demand_title || '未知需求',
          demand_category: quote.demand_category || '未分类',
          demand_category_level1,
          demand_category_level2,
          demand_category_level3,
          demand_province: quote.demand_province || '',
          demand_city: quote.demand_city || '',
          demand_district: quote.demand_district || '',
          demand_budget: quote.demand_budget || '无',
          demand_unit: quote.demand_unit || '元',
          demand_published_at: quote.demand_published_at || null
        }
      })
      total.value = res.data.total
    } else {
      list.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取报价列表出错:', error)
    // 避免显示错误信息，直接显示空列表
    list.value = []
    total.value = 0
  }
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger', 'danger', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['报价中', '已拒绝', '已采纳', '已流拍', '已禁用', '已禁用']
  return texts[status] || '未知'
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
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

const handleViewDetail = async (row) => {
  try {
    const res = await request.get(`/admin/quotes/${row.quote_id}`)
    const quote = res.data
    
    let attachmentsHtml = ''
    if (quote.attachments && Array.isArray(quote.attachments) && quote.attachments.length > 0) {
      attachmentsHtml = '<br><strong>报价附件:</strong><br>'
      quote.attachments.forEach(attachment => {
        // 构建完整的附件URL
        let url = attachment.url
        if (!url.startsWith('http')) {
          if (url.startsWith('/')) {
            url = `https://baojiaapi.91smk.com${url}`
          } else {
            url = `https://baojiaapi.91smk.com/uploads/${url}`
          }
        }
        attachmentsHtml += `<a href="${url}" target="_blank">${attachment.filename}</a><br>`
      })
    } else {
      attachmentsHtml = '<br><strong>报价附件:</strong> 无<br>'
    }
    
    ElMessageBox.alert(
      `报价ID: ${quote.quote_id}<br>` +
      `需求ID: ${quote.demand_id}<br>` +
      `报价人: ${quote.User?.nickname || quote.user_nickname || '未知用户'}<br>` +
      `需求标题: ${quote.Demand?.title || quote.demand_title || '未知需求'}<br>` +
      `报价金额: ${quote.price} ${quote.unit}<br>` +
      `报价说明: ${quote.description || '无'}<br>` +
      `报价状态: ${getStatusText(quote.status)}<br>` +
      `报价时间: ${quote.created_at}<br>` +
      attachmentsHtml,
      '报价详情',
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      }
    )
  } catch (error) {
    console.error('获取报价详情失败:', error)
    ElMessage.error('获取报价详情失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要${row.status === 4 ? '正常' : '禁用'}此报价吗?`, '提示', { type: 'warning' })
    await request.post(`/admin/quotes/${row.quote_id}/toggle-status`)
    ElMessage.success(`${row.status === 4 ? '正常' : '禁用'}成功`)
    fetchList()
  } catch (error) {
    // 处理用户取消操作
    if (error !== 'cancel' && error !== undefined && error !== null) {
      console.error('状态切换失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此报价吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/quotes/${row.quote_id}`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    // 处理用户取消操作
    if (error !== 'cancel' && error !== undefined && error !== null) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理分类筛选变化
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

// 扁平化分类树
const flattenCategoryTree = (tree) => {
  let flatList = []
  const traverse = (nodes) => {
    if (!Array.isArray(nodes)) return
    nodes.forEach(node => {
      flatList.push(node)
      if (node.children && Array.isArray(node.children)) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return flatList
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    // 将树形结构转换为扁平结构
    if (res.data && Array.isArray(res.data.list)) {
      categoryList.value = flattenCategoryTree(res.data.list)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

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
</script>

<style scoped>
.quote-list {
  padding: 20px;
}
</style>
