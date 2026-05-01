<template>
  <div class="wechat-pay">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>微信支付接口管理</span>
        </div>
      </template>
      <div class="api-content">
        <el-card shadow="hover" class="api-card">
          <div class="api-header">
            <h3>微信支付接口</h3>
            <p>微信支付接口是微信提供的金融级支付能力，支持多种支付场景，开发者可通过 API 实现订单创建、支付调起、结果查询、退款、账单下载等全流程支付功能</p>
          </div>
          <div class="api-features">
            <h4>核心功能</h4>
            <ul>
              <li><strong>多场景支付</strong>：支持 JSAPI / 公众号支付、小程序支付、H5 支付、Native 扫码支付、APP 支付</li>
              <li><strong>订单管理</strong>：创建订单、查询订单状态、关闭未支付订单</li>
              <li><strong>退款管理</strong>：发起退款、查询退款状态</li>
              <li><strong>资金管理</strong>：申请交易账单、申请资金账单、下载账单文件</li>
              <li><strong>支付通知</strong>：接收微信支付异步推送的支付结果和退款结果</li>
              <li><strong>分账功能</strong>：支持将收款资金分配给多个商户或用户</li>
              <li><strong>企业付款</strong>：向用户微信零钱转账</li>
            </ul>
          </div>
          <div class="api-settings">
            <h4>商户配置</h4>
            <el-form :model="form" label-width="120px">
              <el-form-item label="商户号(MCHID)">
                <el-input v-model="form.mchid" placeholder="请输入微信支付商户号" />
              </el-form-item>
              <el-form-item label="商户API证书路径">
                <el-input v-model="form.certPath" placeholder="请输入商户API证书路径" />
              </el-form-item>
              <el-form-item label="商户API私钥路径">
                <el-input v-model="form.keyPath" placeholder="请输入商户API私钥路径" />
              </el-form-item>
              <el-form-item label="API v3密钥">
                <el-input v-model="form.apiV3Key" placeholder="请输入API v3密钥" type="password" />
              </el-form-item>
              <el-form-item label="商户名称">
                <el-input v-model="form.mchName" placeholder="请输入商户名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="api-docs">
            <h4>官方文档</h4>
            <el-link type="primary" href="https://pay.weixin.qq.com/doc/v3/merchant/" target="_blank">微信支付商户文档中心</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/doc/v3/merchant/4012081709" target="_blank">API v3 接口规则</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/docs/merchant/apis/jsapi-payment/direct-jsons/jsapi-prepay.html" target="_blank">JSAPI / 公众号支付</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/docs/merchant/apis/mini-program-payment/mini-prepay.html" target="_blank">小程序支付</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/docs/merchant/apis/h5-payment/h5-prepay.html" target="_blank">H5 支付</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/docs/merchant/apis/native-payment/direct-jsons/native-prepay.html" target="_blank">Native 支付</el-link>
            <el-link type="primary" href="https://pay.weixin.qq.com/docs/merchant/apis/in-app-payment/app-prepay.html" target="_blank">APP 支付</el-link>
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
  mchid: '',
  certPath: '',
  keyPath: '',
  apiV3Key: '',
  mchName: ''
})

// 获取配置
const getConfig = async () => {
  try {
    const response = await request.get('/admin/open-api/wechat-pay/config')
    if (response.code === 200) {
      form.mchid = response.data.mchid || ''
      form.certPath = response.data.cert_path || ''
      form.keyPath = response.data.key_path || ''
      form.apiV3Key = response.data.api_v3_key || ''
      form.mchName = response.data.mch_name || ''
    }
  } catch (error) {
    console.error('获取配置失败:', error)
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await request.post('/admin/open-api/wechat-pay/config', form)
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
.wechat-pay {
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