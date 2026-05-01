<template>
  <div class="wechat-message-template">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公众号消息模版管理</span>
        </div>
      </template>
      <div class="api-content">
        <el-card shadow="hover" class="api-card">
          <div class="api-header">
            <h3>微信公众号模板消息</h3>
            <p>微信公众号模板消息是微信公众平台提供的一种消息推送能力，允许认证服务号向用户发送结构化的服务通知</p>
          </div>
          <div class="api-features">
            <h4>核心功能</h4>
            <ul>
              <li>发送模板消息给关注公众号的用户</li>
              <li>支持在消息中设置跳转链接（可跳转到公众号文章或网页）</li>
              <li>支持设置消息的颜色和字体大小</li>
              <li>支持批量发送模板消息</li>
              <li>查询模板消息的发送状态</li>
              <li>管理已添加的模板</li>
            </ul>
          </div>
          <div class="api-settings">
            <h4>模板管理</h4>
            <el-button type="primary" @click="handleAddTemplate">添加模板</el-button>
            <div class="template-grid">
              <div v-for="template in templateList" :key="template.template_id" class="template-card">
                <div class="template-header">
                  <h5>{{ template.title }}</h5>
                  <el-switch v-model="template.status" @change="handleStatusChange(template)" />
                </div>
                <div class="template-body">
                  <div class="template-item">
                    <label>模板ID:</label>
                    <span>{{ template.template_id }}</span>
                  </div>
                  <div class="template-item">
                    <label>行业1:</label>
                    <span>{{ template.industry_id1 || '未设置' }}</span>
                  </div>
                  <div class="template-item">
                    <label>行业2:</label>
                    <span>{{ template.industry_id2 || '未设置' }}</span>
                  </div>
                  <div class="template-item">
                    <label>创建时间:</label>
                    <span>{{ template.create_time }}</span>
                  </div>
                </div>
                <div class="template-footer">
                  <el-button size="small" @click="handleEditTemplate(template)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDeleteTemplate(template.template_id)">删除</el-button>
                  <el-button size="small" @click="handleTestTemplate(template)">测试</el-button>
                </div>
              </div>
            </div>
          </div>
          <div class="api-notes">
            <h4>技术注意事项</h4>
            <ul>
              <li>日调用上限默认 10 万次，粉丝数超过一定量级会自动提升</li>
              <li>只能用于发送重要服务通知，禁止发送营销类、广告类消息</li>
              <li>用户可以拒收模板消息</li>
              <li>模板消息的有效期为 7 天，超过有效期未被用户查看将自动删除</li>
            </ul>
          </div>
          <div class="api-docs">
            <h4>官方文档</h4>
            <el-link type="primary" href="https://developers.weixin.qq.com/doc/offiaccount/" target="_blank">公众号开发文档主站</el-link>
            <el-link type="primary" href="https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html" target="_blank">模板消息接口说明</el-link>
            <el-link type="primary" href="https://developers.weixin.qq.com/doc/service/guide/product/template_message/Template_Message_Operation_Specifications.html" target="_blank">模板消息操作规范</el-link>
            <el-link type="primary" href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Global_Return_Code.html" target="_blank">错误码说明</el-link>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 模板编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="模板类型">
          <el-select v-model="form.templateType" placeholder="请选择模板类型">
            <el-option label="需求相关" value="demand" />
            <el-option label="报价相关" value="quote" />
            <el-option label="沟通相关" value="message" />
            <el-option label="撮合相关" value="match" />
            <el-option label="用户相关" value="user" />
            <el-option label="会员相关" value="member" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input v-model="form.title" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板ID">
          <el-input v-model="form.templateId" placeholder="请输入模板ID" />
        </el-form-item>
        <el-form-item label="行业1">
          <el-input v-model="form.industryId1" placeholder="请输入行业1" />
        </el-form-item>
        <el-form-item label="行业2">
          <el-input v-model="form.industryId2" placeholder="请输入行业2" />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input v-model="form.content" type="textarea" placeholder="请输入模板内容" rows="6" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTemplate">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElDialog } from 'element-plus'
import request from '@/utils/request'

const templateList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加模板')

const form = reactive({
  templateId: '',
  title: '',
  content: '',
  industryId1: '',
  industryId2: '',
  templateType: '',
  status: true
})

const fetchTemplates = async () => {
  try {
    const res = await request.get('/admin/open-api/message-template/wechat/list')
    templateList.value = res.data.list.map(template => ({
      ...template,
      status: template.status !== false // 默认为true
    }))
  } catch (error) {
    console.error(error)
  }
}

const handleAddTemplate = () => {
  dialogTitle.value = '添加模板'
  // 重置表单
  form.templateId = ''
  form.title = ''
  form.content = ''
  form.industryId1 = ''
  form.industryId2 = ''
  form.templateType = ''
  form.status = true
  dialogVisible.value = true
}

const handleEditTemplate = (row) => {
  dialogTitle.value = '编辑模板'
  // 填充表单
  form.templateId = row.template_id
  form.title = row.title
  form.content = row.content
  form.industryId1 = row.industry_id1 || ''
  form.industryId2 = row.industry_id2 || ''
  form.templateType = row.template_type || ''
  form.status = row.status !== false
  dialogVisible.value = true
}

const handleSaveTemplate = async () => {
  try {
    await request.post('/admin/open-api/message-template/wechat', form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchTemplates()
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
}

const handleDeleteTemplate = async (templateId) => {
  try {
    await ElMessageBox.confirm('确定要删除此模板吗?', '提示', { type: 'warning' })
    await request.delete(`/admin/open-api/message-template/wechat/${templateId}`)
    ElMessage.success('删除成功')
    fetchTemplates()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

const handleStatusChange = async (template) => {
  try {
    await request.post('/admin/open-api/message-template/wechat', {
      templateId: template.template_id,
      title: template.title,
      content: template.content,
      industryId1: template.industry_id1,
      industryId2: template.industry_id2,
      status: template.status
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    template.status = !template.status
  }
}

const handleTestTemplate = (template) => {
  ElMessage.info('测试功能开发中')
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.wechat-message-template {
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

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.template-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background: #f9f9f9;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.template-header h5 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.template-body {
  margin-bottom: 15px;
}

.template-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.template-item label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}

.template-item span {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.template-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e4e7ed;
  padding-top: 10px;
}

.api-notes {
  margin-bottom: 30px;
}

.api-notes ul {
  list-style: none;
  padding-left: 0;
}

.api-notes li {
  margin-bottom: 8px;
  line-height: 1.5;
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