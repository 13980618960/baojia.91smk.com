<template>
  <div class="hall-banner-ad">
    <div class="sticky-header">
      <el-card shadow="hover" class="settings-card">
        <div class="global-settings">
          <div class="settings-title">
            <el-icon><Setting /></el-icon>
            <span>全局展示设置</span>
          </div>
          <div class="settings-content">
            <div class="setting-item">
              <span class="setting-label">更换频率：</span>
              <el-select v-model="globalIntervalType" style="width: 120px">
                <el-option label="每小时" value="hour" />
                <el-option label="每天" value="day" />
              </el-select>
            </div>
            <div class="setting-item">
              <span class="setting-label">更换周期：</span>
              <el-input-number v-model="globalIntervalValue" :min="1" :max="24" size="default" />
              <span class="setting-desc">{{ globalIntervalType === 'hour' ? '小时' : '天' }}更换一次</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">展示频率：</span>
              <el-input-number v-model="globalInterval" :min="1" :max="20" size="default" />
              <span class="setting-desc">条需求展示1条广告</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">广告数量：</span>
              <span class="setting-value">{{ filteredList.length }} 个</span>
            </div>
            <div class="setting-item">
              <el-button type="primary" @click="handleSaveGlobalSettings" :loading="saving">保存设置</el-button>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="description-card">
        <div class="description-content">
          <h3>大厅横幅广告</h3>
          <p>需求大厅顶部的横幅广告，提升品牌曝光</p>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="filter-card">
        <div class="filter-content">
          <div class="filter-item">
            <el-input v-model="searchKeyword" placeholder="搜索广告标题" clearable @change="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="filter-item">
            <el-select v-model="filterStatus" placeholder="筛选状态" clearable @change="handleSearch">
              <el-option label="全部" :value="-1" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </div>
          <div class="filter-item">
            <CascaderHover
              v-model="areaValues"
              :options="provinces.map(p => ({ value: p.area_id, label: p.name, leaf: false }))"
              placeholder="省/市/区"
              @change="handleAreaChange"
            />
          </div>
          <div class="filter-item">
            <el-cascader
              v-model="categoryValues"
              :options="categoryOptions"
              :props="cascaderProps"
              placeholder="选择分类"
              clearable
              @change="handleCategoryChange"
            />
          </div>
          <div class="filter-item">
            <el-date-picker v-model="filterDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="handleSearch" />
          </div>
          <div class="filter-item">
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="content-card">
      <template #header>
        <div class="card-header sticky-card-header">
          <span>大厅横幅广告列表</span>
          <el-button type="primary" @click="handleAdd">新增广告</el-button>
        </div>
      </template>
      
      <div class="ad-cards-grid" v-loading="loading">
        <el-card v-for="ad in filteredList" :key="ad.ad_id" class="ad-card-item" shadow="hover">
          <div class="ad-card-content">
            <div class="ad-image">
              <el-image v-if="ad.image_url" :src="getImageUrl(ad.image_url)" fit="cover" :preview-src-list="[getImageUrl(ad.image_url)]" :lazy="false" />
              <div v-else class="no-image">暂无图片</div>
            </div>
            <div class="ad-info">
              <div class="ad-id">ID: {{ ad.ad_id }}</div>
              <h4 class="ad-title">{{ ad.title }}</h4>
              <div class="ad-meta">
                <div class="meta-item">
                  <el-icon><Star /></el-icon>
                  <span>权重: {{ ad.weight }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatDate(ad.start_time) || '无' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="ad-card-footer">
            <el-switch :model-value="ad.status === 1" @change="(val) => handleStatusChange(ad, val)" active-text="启用" inactive-text="禁用" />
            <div class="ad-actions">
              <el-button size="small" @click="handleEdit(ad)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(ad)">删除</el-button>
            </div>
          </div>
        </el-card>
        
        <div v-if="filteredList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无大厅横幅广告" />
        </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑大厅横幅广告' : '新增大厅横幅广告'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="广告标题" required>
          <el-input v-model="form.title" placeholder="请输入广告标题" />
        </el-form-item>
        <el-form-item label="计费规则" required>
          <div class="search-select-wrapper">
            <el-select 
              v-model="form.rule_id" 
              placeholder="请选择计费规则或输入规则ID"
              filterable
              :filter-method="filterRule"
              clearable
            >
              <el-option v-for="rule in adPricingRules" :key="rule.rule_id" :label="getRuleLabel(rule)" :value="rule.rule_id" />
            </el-select>
            <button v-if="form.rule_id" class="clear-btn" @click.stop="form.rule_id = ''">×</button>
          </div>
        </el-form-item>
        <el-form-item label="资金账户">
          <div class="search-select-wrapper">
            <el-select 
              v-model="form.fund_account_id" 
              placeholder="请选择资金账户或输入账户ID"
              filterable
              :filter-method="filterFund"
              clearable
            >
              <el-option v-for="fund in fundAccounts" :key="fund.fund_id" :label="fund.account_name" :value="fund.fund_id" />
            </el-select>
            <button v-if="form.fund_account_id" class="clear-btn" @click.stop="form.fund_account_id = ''">×</button>
          </div>
        </el-form-item>
        <el-form-item label="图片URL" required>
          <ImageUpload
            v-model="form.image_url"
            upload-text="上传图片"
            tips="支持 JPG、PNG、GIF 格式，建议尺寸 1920x300"
          />
          <el-input v-model="form.image_url" placeholder="或输入图片URL" style="margin-top: 10px" />
        </el-form-item>
        <el-form-item label="图片尺寸">
          <el-row :gutter="20">
            <el-col :span="11">
              <el-input-number v-model="form.image_width" :min="1" placeholder="宽度" />
            </el-col>
            <el-col :span="2" style="text-align: center;">x</el-col>
            <el-col :span="11">
              <el-input-number v-model="form.image_height" :min="1" placeholder="高度" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="广告介绍">
          <div class="rich-text-editor">
            <el-tabs v-model="activeTab" type="border-card">
              <el-tab-pane label="编辑" name="edit">
                <div class="editor-toolbar">
                  <!-- 撤销/重做 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('undo')" title="撤销">
                      <el-icon><DArrowLeft /></el-icon>
                    </el-button>
                    <el-button size="small" @click="execCommand('redo')" title="重做">
                      <el-icon><DArrowRight /></el-icon>
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 字体大小 -->
                  <el-select v-model="selectedFontSize" size="small" style="width: 100px" @change="handleFontSizeChange" placeholder="字号">
                    <el-option label="12px" value="12px" />
                    <el-option label="14px" value="14px" />
                    <el-option label="16px" value="16px" />
                    <el-option label="18px" value="18px" />
                    <el-option label="20px" value="20px" />
                    <el-option label="24px" value="24px" />
                    <el-option label="28px" value="28px" />
                    <el-option label="32px" value="32px" />
                  </el-select>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 字体颜色/背景颜色 -->
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <el-tooltip content="字体颜色" placement="top">
                      <el-color-picker 
                        v-model="selectedTextColor" 
                        @change="handleTextColorChange" 
                        size="small"
                        show-alpha
                      />
                    </el-tooltip>
                    <el-tooltip content="背景颜色" placement="top">
                      <el-color-picker 
                        v-model="selectedBgColor" 
                        @change="handleBgColorChange" 
                        size="small"
                        show-alpha
                      />
                    </el-tooltip>
                  </div>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 文字样式 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('bold')" title="加粗">
                      <strong>B</strong>
                    </el-button>
                    <el-button size="small" @click="execCommand('italic')" title="斜体">
                      <em>I</em>
                    </el-button>
                    <el-button size="small" @click="execCommand('underline')" title="下划线">
                      <u>U</u>
                    </el-button>
                    <el-button size="small" @click="execCommand('strikeThrough')" title="删除线">
                      <s>S</s>
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 标题/段落 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('formatBlock', 'h1')" title="标题1">
                      <strong>H1</strong>
                    </el-button>
                    <el-button size="small" @click="execCommand('formatBlock', 'h2')" title="标题2">
                      <strong>H2</strong>
                    </el-button>
                    <el-button size="small" @click="execCommand('formatBlock', 'h3')" title="标题3">
                      <strong>H3</strong>
                    </el-button>
                    <el-button size="small" @click="execCommand('formatBlock', 'p')" title="段落">
                      P
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 列表 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('insertUnorderedList')" title="无序列表">
                      • 列表
                    </el-button>
                    <el-button size="small" @click="execCommand('insertOrderedList')" title="有序列表">
                      1. 列表
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 对齐 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('justifyLeft')" title="左对齐">
                      <el-icon><ArrowLeft /></el-icon>
                    </el-button>
                    <el-button size="small" @click="execCommand('justifyCenter')" title="居中对齐">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <el-button size="small" @click="execCommand('justifyRight')" title="右对齐">
                      <el-icon><ArrowRight /></el-icon>
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 引用/分割线 -->
                  <el-button-group>
                    <el-button size="small" @click="execCommand('formatBlock', 'blockquote')" title="引用块">
                      " 引用
                    </el-button>
                    <el-button size="small" @click="insertDivider" title="分割线">
                      — 分割
                    </el-button>
                  </el-button-group>
                  
                  <el-divider direction="vertical" />
                  
                  <!-- 链接/清除格式 -->
                  <el-button-group>
                    <el-button size="small" @click="showLinkDialog" title="插入链接">
                      <el-icon><Link /></el-icon>
                    </el-button>
                    <el-button size="small" @click="execCommand('removeFormat')" title="清除格式">
                      <el-icon><RefreshLeft /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
                
                <div 
                  ref="contentEditor"
                  class="content-editable"
                  contenteditable="true"
                  @input="handleContentInput"
                  @paste="handlePaste"
                  placeholder="请输入广告的文字说明，支持粘贴图片"
                ></div>
              </el-tab-pane>
              <el-tab-pane label="预览" name="preview">
                <div class="rich-text-preview" v-html="form.content"></div>
              </el-tab-pane>
            </el-tabs>
            <div class="editor-actions">
              <el-upload
                class="upload-btn"
                :action="''"
                :auto-upload="false"
                :multiple="false"
                :on-change="handleContentImageUpload"
                :before-upload="handleUploadBefore"
                :disabled="uploadLoading"
              >
                <el-button size="small" type="primary">
                  <el-icon><Upload /></el-icon>
                  上传图片
                </el-button>
              </el-upload>
              <span class="editor-tip">支持粘贴图片、上传图片和文本格式化</span>
            </div>
          </div>
          
          <el-dialog
            v-model="linkDialogVisible"
            title="插入链接"
            width="400px"
          >
            <el-form label-width="80px">
              <el-form-item label="链接文本">
                <el-input v-model="linkText" placeholder="请输入链接文本" />
              </el-form-item>
              <el-form-item label="链接地址">
                <el-input v-model="linkUrl" placeholder="https://example.com" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="linkDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="insertLink">确定</el-button>
            </template>
          </el-dialog>
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.link_url" placeholder="跳转链接(可选)" />
        </el-form-item>
        <el-form-item label="定向省份">
          <el-select v-model="form.province" placeholder="选择省份(空=全国)" clearable style="width: 100%" @change="handleEditProvinceChange">
            <el-option v-for="province in provinces" :key="province.area_id" :label="province.name" :value="province.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="定向城市">
          <el-select v-model="form.city" placeholder="选择城市(空=全省)" clearable style="width: 100%" :disabled="!form.province" @change="handleEditCityChange">
            <el-option v-for="city in editCities" :key="city.area_id" :label="city.name" :value="city.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="定向区县">
          <el-select v-model="form.district" placeholder="选择区县(空=全市)" clearable style="width: 100%" :disabled="!form.city">
            <el-option v-for="district in editDistricts" :key="district.area_id" :label="district.name" :value="district.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="定向分类">
          <el-select v-model="form.category_level1" placeholder="选择一级分类(空=全分类)" clearable style="width: 100%" @change="handleEditCategoryChange(1)">
            <el-option v-for="cat in categoryList.filter(c => c.level === 1)" :key="cat.category_id" :label="cat.name" :value="cat.category_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.category_level2" placeholder="选择二级分类(空=全部分类)" clearable style="width: 100%" :disabled="!form.category_level1" @change="handleEditCategoryChange(2)">
            <el-option v-for="cat in categoryList.filter(c => c.level === 2 && c.parent_id === form.category_level1)" :key="cat.category_id" :label="cat.name" :value="cat.category_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="三级分类">
          <el-select v-model="form.category_level3" placeholder="选择三级分类(空=全部分类)" clearable style="width: 100%" :disabled="!form.category_level2">
            <el-option v-for="cat in categoryList.filter(c => c.level === 3 && c.parent_id === form.category_level2)" :key="cat.category_id" :label="cat.name" :value="cat.category_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄范围">
          <el-row :gutter="20">
            <el-col :span="11">
              <el-input-number v-model="form.min_age" :min="0" :max="100" placeholder="最小年龄" />
            </el-col>
            <el-col :span="2" style="text-align: center;">至</el-col>
            <el-col :span="11">
              <el-input-number v-model="form.max_age" :min="0" :max="100" placeholder="最大年龄" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="form.weight" :min="1" :max="1000" />
          <span style="margin-left: 10px; color: #909399">权重越高，被展示的概率越大</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useAreaUtils } from '@/utils/areaUtils'
import CascaderHover from '@/components/CascaderHover.vue'
import { Setting, Star, Clock, Search, Upload, ArrowLeft, ArrowRight, Minus, Link, RefreshLeft, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import ImageUpload from '@/components/ImageUpload.vue'

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const provinces = ref([])
const cities = ref([])
const districts = ref([])
const editCities = ref([])
const editDistricts = ref([])
const categoryList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const dateRange = ref([])
const globalIntervalType = ref('hour')
const globalIntervalValue = ref(5)
const globalInterval = ref(3)
const searchKeyword = ref('')
const filterStatus = ref(-1)
const filterDateRange = ref([])
const filterProvince = ref('')
const filterCity = ref('')
const filterDistrict = ref('')
const filterCategory = ref('')
const categories = ref([])
const areaValues = ref([])
const areaOptions = ref([])
const categoryValues = ref([])
const categoryOptions = ref([])
const detailFileList = ref([])
const activeTab = ref('edit')
const uploadLoading = ref(false)

// 富文本编辑器新功能
const contentEditor = ref(null)
const linkDialogVisible = ref(false)
const linkText = ref('')
const linkUrl = ref('')
const selectedFontSize = ref('')
const selectedTextColor = ref('#303133')
const selectedBgColor = ref('#ffffff')

// 级联选择器配置
const cascaderProps = {
  expandTrigger: 'hover',
  emitPath: true,
  checkStrictly: false
}

// 使用areaUtils工具函数
const { fetchProvinces, fetchCities, fetchDistricts } = useAreaUtils(
  provinces, filterCity, filterDistrict, cities, districts
)

// 构建省市区级联选项
const buildAreaOptions = () => {
  areaOptions.value = provinces.value.map(province => {
    const cityOptions = cities.value
      .filter(city => city.province_id === province.area_id)
      .map(city => {
        const districtOptions = districts.value
          .filter(district => district.city_id === city.area_id)
          .map(district => ({
            value: district.area_id,
            label: district.name
          }))
        return {
          value: city.area_id,
          label: city.name,
          children: districtOptions
        }
      })
    return {
      value: province.area_id,
      label: province.name,
      children: cityOptions
    }
  })
}

// 处理区域选择变化
const handleAreaChange = (value) => {
  if (value && value.length > 0) {
    // 重置省市区筛选值
    filterProvince.value = ''
    filterCity.value = ''
    filterDistrict.value = ''
    
    // 根据选择的值更新筛选条件
    const [provinceId, cityId, districtId] = value
    if (provinceId) {
      const province = provinces.value.find(p => p.area_id === provinceId)
      if (province) {
        filterProvince.value = province.name
      }
    }
  } else {
    // 清除筛选条件
    filterProvince.value = ''
    filterCity.value = ''
    filterDistrict.value = ''
  }
  handleSearch()
}

// 上传相关
const uploadUrl = '/upload/file'
const uploadHeaders = ref({})

const handleImageUpload = (response, uploadFile) => {
  if (response && response.code === 200 && response.data && response.data.length > 0 && response.data[0].url) {
    form.image_url = response.data[0].url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
  uploadLoading.value = false
}

const handleUploadError = (error, uploadFile) => {
  console.error('Upload error:', error)
  ElMessage.error('上传失败，请重试')
  uploadLoading.value = false
}



const handleDetailImageUpload = (response, uploadFile) => {
  if (response && response.code === 200 && response.data && response.data.length > 0 && response.data[0].url) {
    detailFileList.value.push({
      name: uploadFile.name,
      url: response.data[0].url,
      response: { url: response.data[0].url }
    })
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
  uploadLoading.value = false
}







const filteredList = computed(() => {
  let result = list.value
  if (searchKeyword.value) {
    result = result.filter(item => item.title.includes(searchKeyword.value))
  }
  if (filterStatus.value !== -1) {
    result = result.filter(item => item.status === filterStatus.value)
  }
  if (filterProvince.value || filterCity.value || filterDistrict.value) {
    result = result.filter(item => {
      if (item.provinces) {
        const provinces = item.provinces.split(',')
        if (filterDistrict.value && !provinces.includes(filterDistrict.value)) return false
        if (filterCity.value && !provinces.includes(filterCity.value)) return false
        if (filterProvince.value && !provinces.includes(filterProvince.value)) return false
      }
      return true
    })
  }
  if (filterCategory.value) {
    result = result.filter(item => {
      if (item.category_ids) {
        const categoryIds = item.category_ids.split(',')
        return categoryIds.includes(String(filterCategory.value))
      }
      return false
    })
  }
  if (filterDateRange.value && filterDateRange.value.length === 2) {
    const [start, end] = filterDateRange.value
    result = result.filter(item => {
      if (!item.start_time || !item.end_time) return true
      return item.start_time >= start && item.end_time <= end
    })
  }
  return result
})

const fundAccounts = ref([])
const adPricingRules = ref([])
const categoryLevel2 = ref([])
const categoryLevel3 = ref([])
const pricingModelNames = {
  1: 'CPM (按展示计费)',
  2: 'CPC (按点击计费)',
  3: 'CPA (按转化计费)',
  4: 'oCPC (优化点击计费)',
  5: 'CPT (按时长计费)'
}

const form = reactive({
  ad_id: null,
  title: '',
  type: 5,
  billing_type: 'cpm',
  rule_id: '',
  fund_account_id: '',
  image_url: '',
  link_url: '',
  province: '',
  city: '',
  content: '',
  district: '',
  category_level1: null,
  category_level2: null,
  category_level3: null,
  min_age: null,
  max_age: null,
  start_time: '',
  end_time: '',
  weight: 50,
  status: 1
})

const fetchFundAccounts = async () => {
  try {
    const res = await request.get('/pricing/funds')
    fundAccounts.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const fetchAdPricingRules = async () => {
  try {
    const res = await request.get('/pricing/ad-pricing/list', { params: { ad_type: 4 } })
    adPricingRules.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const getRuleLabel = (rule) => {
  const modelName = pricingModelNames[rule.pricing_model] || '未知'
  return `[${rule.rule_id}] ${modelName} - ¥${parseFloat(rule.base_price).toFixed(2)}/${rule.unit}`
}

const filterRule = (keyword) => {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  return (rule) => {
    return rule.rule_id.toString().includes(kw) ||
           (rule.rule_name && rule.rule_name.toLowerCase().includes(kw)) ||
           (pricingModelNames[rule.pricing_model] && pricingModelNames[rule.pricing_model].toLowerCase().includes(kw))
  }
}

const filterFund = (keyword) => {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  return (fund) => {
    return fund.fund_id.toString().includes(kw) ||
           (fund.account_name && fund.account_name.toLowerCase().includes(kw))
  }
}

onMounted(async () => {
  fetchList()
  await fetchProvinces()
  buildAreaOptions()
  fetchCategories()
  fetchFundAccounts()
  fetchGlobalSettings()
  fetchAdPricingRules()
})

const getImageUrl = (url) => {
  if (!url) return ''
  if (!url.startsWith('http')) {
    if (url.startsWith('/')) {
      return `https://baojiaapi.91smk.com${url}`
    } else {
      return `https://baojiaapi.91smk.com/uploads/${url}`
    }
  }
  return url
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/ads/platform', { params: { position_id: 5 } })
    list.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAreaFilterChange = (level) => {
  handleFilterAreaChange(level, filterProvince.value, filterCity.value, filterDistrict.value)
  handleSearch()
}

const handleEditProvinceChange = () => {
  form.city = ''
  form.district = ''
  editDistricts.value = []
  if (form.province) {
    const province = provinces.value.find(p => p.name === form.province)
    if (province) {
      fetchEditCities(province.area_id)
    }
  } else {
    editCities.value = []
  }
}

const handleEditCityChange = () => {
  form.district = ''
  if (form.city) {
    const city = editCities.value.find(c => c.name === form.city)
    if (city) {
      fetchEditDistricts(city.area_id)
    }
  } else {
    editDistricts.value = []
  }
}

const fetchEditCities = async (provinceId) => {
  try {
    const res = await request.get('/admin/areas/cities', { params: { province_id: provinceId } })
    editCities.value = res.data || []
  } catch (error) {
    console.error('获取城市列表失败:', error)
  }
}

const fetchEditDistricts = async (cityId) => {
  try {
    const res = await request.get('/admin/areas/districts', { params: { city_id: cityId } })
    editDistricts.value = res.data || []
  } catch (error) {
    console.error('获取区县列表失败:', error)
  }
}

const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories/all')
    categoryList.value = flattenCategoryTree(res.data)
    categoryOptions.value = buildCascaderTree(res.data)
  } catch (error) {
    console.error(error)
  }
}

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

// 处理分类选择变化
const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    filterCategory.value = value[value.length - 1]
  } else {
    filterCategory.value = ''
  }
  handleSearch()
}

const handleEditCategoryChange = (level) => {
  if (level === 1) {
    form.category_level2 = null
    form.category_level3 = null
  } else if (level === 2) {
    form.category_level3 = null
  }
}

const fetchGlobalSettings = async () => {
  try {
    const res = await request.get('/admin/ads/positions', { params: { code: 'demand_hall_banner' } })
    if (res.data && res.data.length > 0) {
      globalIntervalType.value = res.data[0].interval_type || 'hour'
      globalIntervalValue.value = res.data[0].interval_value || 5
      globalInterval.value = res.data[0].content_interval || 3
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSaveGlobalSettings = async () => {
  saving.value = true
  try {
    await request.put('/admin/ads/positions/code/demand_hall_banner', {
      interval_type: globalIntervalType.value,
      interval_value: globalIntervalValue.value,
      content_interval: globalInterval.value
    })
    ElMessage.success('全局展示频率设置已保存')
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

const handleSearch = () => {
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = -1
  filterDateRange.value = []
  filterProvince.value = ''
  filterCity.value = ''
  filterDistrict.value = ''
  filterCategory.value = ''
  cities.value = []
  districts.value = []
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    ad_id: null,
    title: '',
    type: 5,
    position: 'demand_hall_banner',
    billing_type: 'cpm',
    rule_id: '',
    fund_account_id: '',
    image_url: '',
    link_url: '',
    province: '',
    city: '',
    district: '',
    category_level1: null,
    category_level2: null,
    category_level3: null,
    min_age: null,
    max_age: null,
    start_time: '',
    end_time: '',
    weight: 50,
    status: 1
  })
  editCities.value = []
  editDistricts.value = []
  dateRange.value = []
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  
  // 先清空 form，避免旧数据残留
  resetFormData()
  
  // 手动赋值，避免 Object.assign 覆盖处理逻辑
  form.ad_id = row.ad_id
  form.title = row.title || ''
  form.type = row.type || 5
  form.position = row.position || 'demand_hall_banner'
  form.billing_type = row.billing_type || 'cpm'
  form.image_url = row.image_url || ''
  form.link_url = row.link_url || ''
  form.province = row.province || ''
  form.city = row.city || ''
  form.district = row.district || ''
  form.category_level1 = row.category_level1 || null
  form.category_level2 = row.category_level2 || null
  form.category_level3 = row.category_level3 || null
  form.min_age = row.min_age || null
  form.max_age = row.max_age || null
  form.start_time = row.start_time || ''
  form.end_time = row.end_time || ''
  form.weight = row.weight || 50
  form.status = row.status !== undefined ? row.status : 1
  form.sort = row.sort || 0
  
  // 确保 rule_id 和 fund_account_id 正确赋值（处理 null/undefined 情况）并转换为数字类型
  form.rule_id = row.rule_id !== undefined && row.rule_id !== null ? parseInt(row.rule_id) : ''
  form.fund_account_id = row.fund_account_id !== undefined && row.fund_account_id !== null ? parseInt(row.fund_account_id) : ''
  
  dateRange.value = [row.start_time, row.end_time]

  if (row.province) {
    const province = provinces.value.find(p => p.name === row.province)
    if (province) {
      await fetchEditCities(province.area_id)
      if (row.city) {
        const city = editCities.value.find(c => c.name === row.city)
        if (city) {
          await fetchEditDistricts(city.area_id)
        }
      }
    }
  }

  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此广告吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/ads/platform/${row.ad_id}`)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleFileChange = async (file, fileList) => {
  // 检查文件类型
  const isJPG = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/gif'
  if (!isJPG) {
    ElMessage.error('只能上传JPG、PNG、GIF格式的图片')
    return
  }
  
  // 检查文件大小
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }
  
  uploadLoading.value = true
  
  // 准备表单数据
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('type', 'ad')
  formData.append('user_id', localStorage.getItem('admin_user_id') || 1)
  
  try {
    // 发送上传请求
    const res = await request.post('/api/v1/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200 && res.data && res.data.length > 0) {
      form.image_url = res.data[0].url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    uploadLoading.value = false
  }
}

const execCommand = (command, value = null) => {
  if (!contentEditor.value) return
  contentEditor.value.focus()
  if (value) {
    document.execCommand(command, false, value)
  } else {
    document.execCommand(command, false, null)
  }
  handleContentInput()
}

const handleContentInput = () => {
  if (contentEditor.value) {
    form.content = contentEditor.value.innerHTML
  }
}

const showLinkDialog = () => {
  if (!contentEditor.value) return
  const selection = window.getSelection()
  if (selection.toString()) {
    linkText.value = selection.toString()
  } else {
    linkText.value = ''
  }
  linkUrl.value = ''
  linkDialogVisible.value = true
}

const insertLink = () => {
  if (!linkUrl.value) {
    ElMessage.warning('请输入链接地址')
    return
  }
  if (!linkText.value) {
    linkText.value = linkUrl.value
  }
  const fullUrl = linkUrl.value.startsWith('http') ? linkUrl.value : `https://${linkUrl.value}`
  execCommand('insertHTML', `<a href="${fullUrl}" target="_blank" style="color: #409eff">${linkText.value}</a>`)
  linkDialogVisible.value = false
}

const initializeEditor = () => {
  if (contentEditor.value) {
    contentEditor.value.innerHTML = form.content || ''
  }
}

// 处理字体大小变化
const handleFontSizeChange = (size) => {
  if (!contentEditor.value || !size) return
  contentEditor.value.focus()
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      // 如果没有选择文本，直接插入一个带样式的span
      const span = document.createElement('span')
      span.style.fontSize = size
      span.innerHTML = ' '
      range.insertNode(span)
      // 将光标移到span后面
      range.setStartAfter(span)
      range.setEndAfter(span)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // 如果有选择文本，用span包裹
      const span = document.createElement('span')
      span.style.fontSize = size
      try {
        range.surroundContents(span)
      } catch (e) {
        // 如果surroundContents失败，用insertHTML
        const text = range.toString()
        span.innerHTML = text
        range.deleteContents()
        range.insertNode(span)
      }
    }
    handleContentInput()
  }
}

// 处理字体颜色变化
const handleTextColorChange = (color) => {
  if (!contentEditor.value) return
  contentEditor.value.focus()
  execCommand('styleWithCSS', true)
  execCommand('foreColor', color)
}

// 处理背景颜色变化
const handleBgColorChange = (color) => {
  if (!contentEditor.value) return
  contentEditor.value.focus()
  execCommand('styleWithCSS', true)
  execCommand('hiliteColor', color)
}

// 插入分割线
const insertDivider = () => {
  if (!contentEditor.value) return
  contentEditor.value.focus()
  execCommand('insertHTML', '<hr style="border: none; border-top: 2px solid #e4e7ed; margin: 16px 0;">')
}

const handleContentImageUpload = async (uploadFile) => {
  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', uploadFile.raw)
    formData.append('type', 'ad')
    formData.append('user_id', localStorage.getItem('admin_user_id') || 1)
    
    const res = await request.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200 && res.data && res.data.length > 0 && res.data[0].url) {
      const fullImageUrl = getImageUrl(res.data[0].url)
      if (contentEditor.value) {
        contentEditor.value.focus()
        execCommand('insertHTML', `<img src="${fullImageUrl}" alt="" style="max-width: 100%; height: auto; margin: 10px 0;" />`)
      }
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    uploadLoading.value = false
  }
}

const handlePaste = (e) => {
  if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
    e.preventDefault()
    const file = e.clipboardData.files[0]
    if (file.type.startsWith('image/')) {
      uploadImageFile(file)
    }
  }
}

const uploadImageFile = (file) => {
  uploadLoading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'ad')
  formData.append('user_id', localStorage.getItem('admin_user_id') || 1)
  
  request.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    if (response && response.code === 200 && response.data && response.data.length > 0 && response.data[0].url) {
      const fullImageUrl = getImageUrl(response.data[0].url)
      if (contentEditor.value) {
        contentEditor.value.focus()
        execCommand('insertHTML', `<img src="${fullImageUrl}" alt="" style="max-width: 100%; height: auto; margin: 10px 0;" />`)
      }
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败')
    }
  })
  .catch(error => {
    console.error('上传错误:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
  })
  .finally(() => {
    uploadLoading.value = false
  })
}

const handleUploadBefore = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) {
    ElMessage.error('只能上传JPG、PNG、GIF格式的图片')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

const handleStatusChange = async (row, val) => {
  try {
    const newStatus = val ? 1 : 0
    await request.put(`/admin/ads/platform/${row.ad_id}`, { status: newStatus })
    row.status = newStatus
    ElMessage.success('更新成功')
  } catch (error) {
    console.error(error)
  }
}

const resetFormData = () => {
  form.ad_id = null
  form.title = ''
  form.type = 1
  form.billing_type = 'cpm'
  form.rule_id = ''
  form.fund_account_id = ''
  form.image_url = ''
  form.link_url = ''
  form.province = ''
  form.city = ''
  form.content = ''
  form.district = ''
  form.min_age = null
  form.max_age = null
  form.start_time = ''
  form.end_time = ''
  form.weight = 50
  form.status = 1
  form.category_level1 = ''
  form.category_level2 = ''
  form.category_level3 = ''
  dateRange.value = []
  editCities.value = []
  editDistricts.value = []
  categoryLevel2.value = []
  categoryLevel3.value = []
}

const handleSubmit = async () => {
  try {
    const now = new Date()
    form.start_time = dateRange.value?.[0] || now.toISOString().split('T')[0]
    form.end_time = dateRange.value?.[1] || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const categoryIds = []
    if (form.category_level3) {
      categoryIds.push(String(form.category_level3))
    } else if (form.category_level2) {
      categoryIds.push(String(form.category_level2))
    } else if (form.category_level1) {
      categoryIds.push(String(form.category_level1))
    }

    let billingType = 'cpm'
    if (form.rule_id) {
      const rule = adPricingRules.value.find(r => r.rule_id === form.rule_id)
      if (rule) {
        const typeMap = { 1: 'cpm', 2: 'cpc', 3: 'cpa', 4: 'ocpc', 5: 'cpt' }
        billingType = typeMap[rule.pricing_model] || 'cpm'
      }
    }

    // 将空字符串转换为 null，确保数据库能正确存储
    const ruleId = form.rule_id !== '' ? parseInt(form.rule_id) : null
    const fundAccountId = form.fund_account_id !== '' ? parseInt(form.fund_account_id) : null

    const submitData = {
      title: form.title,
      type: form.type,
      billing_type: billingType,
      rule_id: ruleId,
      fund_account_id: fundAccountId,
      image_url: form.image_url,
      content: form.content,
      link_url: form.link_url,
      target_provinces: form.district || form.city || form.province || '',
      target_categories: categoryIds.join(','),
      position_id: 5, // 大厅横幅广告的position_id
      position: 'demand_hall_banner', // 大厅横幅广告的position
      min_age: form.min_age,
      max_age: form.max_age,
      start_time: form.start_time,
      end_time: form.end_time,
      weight: form.weight,
      sort: 0, // 固定设置为0
      status: form.status
    }

    if (isEdit.value) {
      const res = await request.put(`/admin/ads/platform/${form.ad_id}`, submitData)
      console.log('更新广告结果:', res)
    } else {
      const res = await request.post('/admin/ads/platform', submitData)
      console.log('创建广告结果:', res)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    resetFormData()
    fetchList()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.hall-banner-ad {
  padding: 20px;
  position: relative;
}

.sticky-header {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.sticky-card-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  padding: 12px 20px;
  margin: -20px -20px 20px;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.settings-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.settings-card :deep(.el-card__body) {
  padding: 20px;
}

.settings-card :deep(.global-settings) {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.settings-card :deep(.settings-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  color: #fff;
  min-width: 120px;
}

.settings-card :deep(.settings-content) {
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 1;
  flex-wrap: wrap;
}

.settings-card :deep(.setting-item) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-card :deep(.setting-label) {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.settings-card :deep(.setting-desc) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.settings-card :deep(.setting-value) {
  font-weight: bold;
  color: #fff;
  font-size: 16px;
}

.filter-card {
  background: #fff;
  border-radius: 12px;
}

.filter-card :deep(.el-card__body) {
  padding: 15px 20px;
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.content-card {
  border-radius: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.ad-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.ad-card-item {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
}

.ad-card-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
}

.ad-card-content {
  display: flex;
  flex-direction: column;
}

.ad-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  /* 大厅横幅广告按 12:1 比例展示 */
  aspect-ratio: 12/1;
  max-height: 100px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.ad-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.ad-card-item:hover .ad-image .el-image {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #4facfe 100%);
  color: #fff;
  font-size: 14px;
  border-radius: 12px;
}

.no-image .el-icon {
  font-size: 36px;
  opacity: 0.8;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
  font-size: 14px;
}

.image-error .el-icon {
  font-size: 36px;
  opacity: 0.8;
}

.ad-info {
  flex: 1;
}

.ad-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-meta {
  display: flex;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
}

.ad-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.ad-actions {
  display: flex;
  gap: 8px;
}

.rich-text-editor {
  width: 100%;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.editor-tip {
  font-size: 12px;
  color: #909399;
}

.rich-text-preview {
  min-height: 200px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
  line-height: 1.6;
}

.rich-text-preview img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  border-radius: 4px;
}

.rich-text-preview p {
  margin: 0 0 10px 0;
}

.rich-text-preview:empty::before {
  content: '暂无内容';
  color: #c0c4cc;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.content-editable {
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: #fff;
  line-height: 1.6;
  outline: none;
}

.content-editable:focus {
  border-color: #409eff;
}

.content-editable img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  border-radius: 4px;
}

.content-editable a {
  color: #409eff;
  text-decoration: underline;
}

.content-editable h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 16px 0;
}

.content-editable h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 14px 0;
}

.content-editable h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0;
}

.content-editable p {
  margin: 0 0 10px 0;
}

.content-editable blockquote {
  border-left: 4px solid #409eff;
  padding: 10px 16px;
  margin: 16px 0;
  background-color: #f5f7fa;
  color: #606266;
  font-style: italic;
}

.content-editable ul, .content-editable ol {
  margin: 10px 0;
  padding-left: 30px;
}

.content-editable ul li, .content-editable ol li {
  margin: 5px 0;
}

.content-editable hr {
  border: none;
  border-top: 2px solid #e4e7ed;
  margin: 16px 0;
}

.content-editable:empty::before {
  content: '请输入广告的文字说明，支持粘贴图片';
  color: #c0c4cc;
}

.rich-text-preview h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 16px 0;
}

.rich-text-preview h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 14px 0;
}

.rich-text-preview h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0;
}

.rich-text-preview blockquote {
  border-left: 4px solid #409eff;
  padding: 10px 16px;
  margin: 16px 0;
  background-color: #f5f7fa;
  color: #606266;
  font-style: italic;
}

.rich-text-preview ul, .rich-text-preview ol {
  margin: 10px 0;
  padding-left: 30px;
}

.rich-text-preview ul li, .rich-text-preview ol li {
  margin: 5px 0;
}

.rich-text-preview hr {
  border: none;
  border-top: 2px solid #e4e7ed;
  margin: 16px 0;
}

.rich-text-preview a {
  color: #409eff;
  text-decoration: underline;
}

.search-select-wrapper {
  position: relative;
  width: 100%;
}

.search-select-wrapper .clear-btn {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #ccc;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s;
}

.search-select-wrapper .clear-btn:hover {
  background: #999;
}
</style>
