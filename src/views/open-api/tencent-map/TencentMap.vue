<template>
  <div class="tencent-map">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>腾讯地图接口管理</span>
        </div>
      </template>
      <div class="api-content">
        <el-card shadow="hover" class="api-card">
          <div class="api-header">
            <h3>腾讯地图接口</h3>
            <p>腾讯位置服务为开发者保驾护航，开放位置服务能力和接口，为开发者赋能</p>
          </div>
          <div class="api-features">
            <h4>核心功能</h4>
            <ul>
              <li><strong>WebService API（服务端接口）</strong></li>
              <li>地址解析：将地址转换为经纬度坐标</li>
              <li>逆地址解析：将经纬度坐标转换为地址</li>
              <li>路线规划：提供驾车、步行、骑行、公交等多种出行方式的路线规划</li>
              <li>距离计算：计算两个或多个地点之间的距离</li>
              <li>周边搜索：搜索指定位置周边的 POI 信息</li>
              <li>坐标转换：支持不同坐标系之间的转换</li>
              <li><strong>JavaScript API（前端接口）</strong></li>
              <li>在网页中嵌入交互式地图</li>
              <li>地图缩放、平移、旋转等基本操作</li>
              <li>添加标记、信息窗口、折线、多边形等覆盖物</li>
              <li>实现地图点击、拖拽等交互功能</li>
              <li>支持地图样式自定义</li>
              <li><strong>小程序 API</strong></li>
              <li>在微信小程序中使用地图组件</li>
              <li>实现地图展示、定位、标记等功能</li>
              <li>与微信原生功能深度集成</li>
            </ul>
          </div>
          <div class="api-settings">
            <h4>API Key 配置</h4>
            <el-form :model="form" label-width="120px">
              <el-form-item label="API Key">
                <el-input v-model="form.apiKey" placeholder="请输入腾讯地图 API Key" />
              </el-form-item>
              <el-form-item label="密钥">
                <el-input v-model="form.secretKey" placeholder="请输入腾讯地图密钥" type="password" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="api-docs">
            <h4>官方文档</h4>
            <el-link type="primary" href="https://lbs.qq.com/" target="_blank">腾讯位置服务主站</el-link>
            <el-link type="primary" href="https://lbs.qq.com/service/webService/webServiceGuide/webServiceOverview" target="_blank">WebService API 文档</el-link>
            <el-link type="primary" href="https://lbs.qq.com/webApi/javascriptV2/jsGuide/jsBasic" target="_blank">JavaScript API V2 文档</el-link>
            <el-link type="primary" href="https://developers.weixin.qq.com/miniprogram/dev/component/map.html" target="_blank">微信小程序地图组件</el-link>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const form = reactive({
  apiKey: '',
  secretKey: ''
})

// 获取配置
const getConfig = async () => {
  try {
    const response = await request.get('/admin/open-api/tencent-map/config')
    if (response.code === 200) {
      form.apiKey = response.data.api_key || ''
      form.secretKey = response.data.secret_key || ''
    }
  } catch (error) {
    console.error('获取配置失败:', error)
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await request.post('/admin/open-api/tencent-map/config', form)
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('配置保存失败')
  }
}

onMounted(() => {
  getConfig()
})
</script>

<style scoped>
.tencent-map {
  padding: 20px;
}

.api-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.api-card {
  margin-bottom: 20px;
}

.api-header {
  margin-bottom: 20px;
}

.api-header h3 {
  margin-bottom: 10px;
  color: #667eea;
}

.api-features {
  margin-bottom: 30px;
}

.api-features ul {
  list-style: none;
  padding-left: 0;
}

.api-features li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.api-settings {
  margin-bottom: 30px;
}

.api-docs {
  margin-top: 20px;
}

.api-docs el-link {
  margin-right: 15px;
  margin-bottom: 10px;
  display: inline-block;
}
</style>