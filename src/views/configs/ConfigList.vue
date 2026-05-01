<template>
  <div class="config-list">
    <el-card>
      <template #header>
        <span>系统配置</span>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础配置" name="basic">
          <el-form :model="configs" label-width="120px">
            <el-form-item label="网站名称">
              <el-input v-model="configs.site_name" />
            </el-form-item>
            <el-form-item label="网站Logo">
              <div class="logo-upload-container">
                <el-upload
                  class="logo-uploader"
                  action="https://baojiaapi.91smk.com/api/v1/upload/image"
                  :show-file-list="false"
                  :on-success="handleLogoUpload"
                  :before-upload="beforeLogoUpload"
                >
                  <div v-if="configs.site_logo" class="logo-preview-container">
                    <img :src="getLogoUrl(configs.site_logo)" class="logo-preview" />
                    <div class="logo-overlay">
                      <el-button type="primary" size="small">更换</el-button>
                    </div>
                  </div>
                  <el-button v-else type="primary">上传Logo</el-button>
                </el-upload>
                <div v-if="configs.site_logo" class="logo-actions">
                  <el-button type="primary" size="small" @click="removeLogo">移除</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('basic')">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="VIP配置" name="vip">
          <el-form :model="configs" label-width="150px">
            <el-form-item label="需求方VIP功能">
              <el-switch v-model="configs.vip_demander_enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="报价方VIP功能">
              <el-switch v-model="configs.vip_quoter_enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('vip')">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="内容配置" name="content">
          <el-form :model="configs" label-width="150px">
            <el-form-item label="敏感词检测">
              <el-switch v-model="configs.sensitive_check_enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="需求审核">
              <el-switch v-model="configs.demand_review_enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="自动分类">
              <el-switch v-model="configs.auto_classify_enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('content')">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="广告配置" name="ad">
          <el-form :model="configs" label-width="150px">
            <el-form-item label="广告展示间隔">
              <el-input-number v-model="configs.ad_show_interval" :min="1" />
              <span style="margin-left: 10px">条</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('ad')">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const activeTab = ref('basic')
const configs = reactive({
  site_name: '',
  site_logo: '',
  vip_demander_enabled: 0,
  vip_quoter_enabled: 0,
  sensitive_check_enabled: 1,
  demand_review_enabled: 0,
  auto_classify_enabled: 1,
  ad_show_interval: 5
})

onMounted(() => {
  fetchConfigs()
})

const fetchConfigs = async () => {
  try {
    const res = await request.get('/admin/configs')
    // 遍历配置数组，将每个配置项的config_key作为键，config_value作为值
    res.data.forEach(item => {
      configs[item.config_key] = item.config_value
    })
  } catch (error) {
    console.error(error)
  }
}

const saveConfig = async (group) => {
  try {
    await request.post('/admin/configs', { group, configs })
    ElMessage.success('配置已保存')
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
}

const handleLogoUpload = (response) => {
  if (response.code === 200) {
    configs.site_logo = response.data.url
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error('Logo上传失败')
  }
}

const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('只能上传JPG、PNG或WebP格式的图片')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
  }
  
  return isJPG && isLt2M
}

const getLogoUrl = (logo) => {
  if (!logo) return ''
  // 检查是否已经是完整的URL
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }
  // 如果是相对路径，返回完整的URL
  return `https://baojiaapi.91smk.com${logo}`
}

const removeLogo = () => {
  configs.site_logo = ''
  ElMessage.success('Logo已移除')
}
</script>

<style scoped>
.config-list {
  padding: 20px;
}

.logo-uploader {
  width: 200px;
}

.logo-preview {
  width: 100%;
  height: auto;
  border-radius: 4px;
  cursor: pointer;
}

.el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.el-upload:hover {
  border-color: #409EFF;
}

.logo-preview-container {
  position: relative;
  width: 100%;
  height: auto;
  border-radius: 4px;
  overflow: hidden;
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.logo-preview-container:hover .logo-overlay {
  opacity: 1;
}

.logo-overlay .el-button {
  z-index: 1;
}

.logo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logo-actions {
  margin-top: 10px;
}
</style>
