<template>
  <div class="personalization">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Sparkles /></el-icon>
          <span>千人千面管理</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card" class="tabs-container">
        <el-tab-pane label="用户画像" name="profiles">
          <div class="tab-content">
            <div class="filter-bar">
              <el-input v-model="profileFilter.user_id" placeholder="用户ID" class="filter-input" />
              <el-select v-model="profileFilter.user_type" placeholder="用户类型" class="filter-input">
                <el-option label="全部" :value="-1" />
                <el-option label="普通用户" :value="0" />
                <el-option label="需求方" :value="1" />
                <el-option label="报价方" :value="2" />
                <el-option label="双身份" :value="3" />
              </el-select>
              <el-button @click="fetchProfiles">搜索</el-button>
              <el-button type="primary" @click="showProfileDialog(true)">新增画像</el-button>
            </div>
            
            <el-table :data="profileList" border stripe style="width: 100%">
              <el-table-column prop="profile_id" label="画像ID" width="120" />
              <el-table-column prop="user_id" label="用户ID" width="120" />
              <el-table-column prop="user_type" label="用户类型" width="120">
                <template #default="{ row }">{{ getUserTypeText(row.user_type) }}</template>
              </el-table-column>
              <el-table-column prop="demander_vip_level" label="需求方VIP" width="120" />
              <el-table-column prop="quoter_vip_level" label="报价方VIP" width="120" />
              <el-table-column prop="location" label="位置" width="150" />
              <el-table-column prop="age_range" label="年龄范围" width="120" />
              <el-table-column prop="gender" label="性别" width="80">
                <template #default="{ row }">{{ getGenderText(row.gender) }}</template>
              </el-table-column>
              <el-table-column prop="behavior_score" label="行为评分" width="120" />
              <el-table-column prop="quote_count" label="报价次数" width="120" />
              <el-table-column prop="quote_success_rate" label="报价成功率" width="130" />
              <el-table-column prop="demand_count" label="需求数量" width="120" />
              <el-table-column prop="created_at" label="创建时间" width="180" />
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <el-button size="small" @click="showProfileDialog(false, row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteProfile(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="profilePage.page"
              v-model:page-size="profilePage.pageSize"
              :total="profilePage.total"
              layout="total, prev, pager, next, jumper"
              @size-change="fetchProfiles"
              @current-change="fetchProfiles"
              class="pagination"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="推荐规则" name="rules">
          <div class="tab-content">
            <div class="filter-bar">
              <el-select v-model="ruleFilter.rule_type" placeholder="规则类型" class="filter-input">
                <el-option label="全部" :value="0" />
                <el-option label="内容推荐" :value="1" />
                <el-option label="广告推荐" :value="2" />
                <el-option label="需求推荐" :value="3" />
              </el-select>
              <el-select v-model="ruleFilter.is_active" placeholder="状态" class="filter-input">
                <el-option label="全部" :value="-1" />
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
              <el-button @click="fetchRules">搜索</el-button>
              <el-button type="primary" @click="showRuleDialog(true)">新增规则</el-button>
            </div>
            
            <el-table :data="ruleList" border stripe style="width: 100%">
              <el-table-column prop="rule_id" label="规则ID" width="120" />
              <el-table-column prop="rule_name" label="规则名称" min-width="150" />
              <el-table-column prop="rule_type" label="规则类型" width="120">
                <template #default="{ row }">{{ getRuleTypeText(row.rule_type) }}</template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100" />
              <el-table-column prop="is_active" label="状态" width="100">
                <template #default="{ row }">
                  <el-switch
                    :value="row.is_active === 1"
                    @change="toggleRuleStatus(row)"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="start_time" label="开始时间" width="180" />
              <el-table-column prop="end_time" label="结束时间" width="180" />
              <el-table-column prop="description" label="描述" min-width="200" />
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <el-button size="small" @click="showRuleDialog(false, row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="rulePage.page"
              v-model:page-size="rulePage.pageSize"
              :total="rulePage.total"
              layout="total, prev, pager, next, jumper"
              @size-change="fetchRules"
              @current-change="fetchRules"
              class="pagination"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="内容映射" name="mappings">
          <div class="tab-content">
            <div class="filter-bar">
              <el-select v-model="mappingFilter.content_type" placeholder="内容类型" class="filter-input">
                <el-option label="全部" :value="0" />
                <el-option label="需求" :value="1" />
                <el-option label="报价" :value="2" />
                <el-option label="广告" :value="3" />
                <el-option label="分类" :value="4" />
              </el-select>
              <el-select v-model="mappingFilter.is_active" placeholder="状态" class="filter-input">
                <el-option label="全部" :value="-1" />
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
              <el-button @click="fetchMappings">搜索</el-button>
              <el-button type="primary" @click="showMappingDialog(true)">新增映射</el-button>
            </div>
            
            <el-table :data="mappingList" border stripe style="width: 100%">
              <el-table-column prop="mapping_id" label="映射ID" width="120" />
              <el-table-column prop="rule_id" label="规则ID" width="100" />
              <el-table-column prop="content_type" label="内容类型" width="120">
                <template #default="{ row }">{{ getContentTypeText(row.content_type) }}</template>
              </el-table-column>
              <el-table-column prop="content_id" label="内容ID" width="120" />
              <el-table-column prop="target_user_type" label="目标用户" width="120">
                <template #default="{ row }">{{ getUserTypeText(row.target_user_type) }}</template>
              </el-table-column>
              <el-table-column prop="weight" label="权重" width="100" />
              <el-table-column prop="is_active" label="状态" width="100">
                <template #default="{ row }">
                  <el-switch
                    :value="row.is_active === 1"
                    @change="toggleMappingStatus(row)"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180" />
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <el-button size="small" @click="showMappingDialog(false, row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteMapping(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              v-model:current-page="mappingPage.page"
              v-model:page-size="mappingPage.pageSize"
              :total="mappingPage.total"
              layout="total, prev, pager, next, jumper"
              @size-change="fetchMappings"
              @current-change="fetchMappings"
              class="pagination"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="profileDialog.visible" :title="profileDialog.isAdd ? '新增用户画像' : '编辑用户画像'" width="600px">
      <el-form :model="profileForm" label-width="120px">
        <el-form-item label="用户ID">
          <el-input v-model="profileForm.user_id" type="number" />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="profileForm.user_type">
            <el-option label="普通用户" :value="0" />
            <el-option label="需求方" :value="1" />
            <el-option label="报价方" :value="2" />
            <el-option label="双身份" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="需求方VIP等级">
          <el-input v-model="profileForm.demander_vip_level" type="number" />
        </el-form-item>
        <el-form-item label="报价方VIP等级">
          <el-input v-model="profileForm.quoter_vip_level" type="number" />
        </el-form-item>
        <el-form-item label="地理位置">
          <el-input v-model="profileForm.location" />
        </el-form-item>
        <el-form-item label="年龄范围">
          <el-input v-model="profileForm.age_range" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="profileForm.gender">
            <el-option label="未知" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="行为评分">
          <el-input v-model="profileForm.behavior_score" type="number" />
        </el-form-item>
        <el-form-item label="报价次数">
          <el-input v-model="profileForm.quote_count" type="number" />
        </el-form-item>
        <el-form-item label="报价成功率">
          <el-input v-model="profileForm.quote_success_rate" type="number" step="0.01" />
        </el-form-item>
        <el-form-item label="常报价分类（JSON）">
          <el-input type="textarea" v-model="profileForm.quote_categories" :rows="2" placeholder='{"category_id": count}' />
        </el-form-item>
        <el-form-item label="发布需求数量">
          <el-input v-model="profileForm.demand_count" type="number" />
        </el-form-item>
        <el-form-item label="常发布分类（JSON）">
          <el-input type="textarea" v-model="profileForm.demand_categories" :rows="2" placeholder='{"category_id": count}' />
        </el-form-item>
        <el-form-item label="用户标签（JSON）">
          <el-input type="textarea" v-model="profileForm.tags" :rows="3" />
        </el-form-item>
        <el-form-item label="兴趣分类（JSON）">
          <el-input type="textarea" v-model="profileForm.interest_categories" :rows="3" />
        </el-form-item>
        <el-form-item label="收藏分类（JSON）">
          <el-input type="textarea" v-model="profileForm.favorite_categories" :rows="2" />
        </el-form-item>
        <el-form-item label="最近浏览（JSON）">
          <el-input type="textarea" v-model="profileForm.recent_viewed" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialog.visible" :title="ruleDialog.isAdd ? '新增推荐规则' : '编辑推荐规则'" width="600px">
      <el-form :model="ruleForm" label-width="120px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.rule_name" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.rule_type">
            <el-option label="内容推荐" :value="1" />
            <el-option label="广告推荐" :value="2" />
            <el-option label="需求推荐" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input v-model="ruleForm.priority" type="number" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="ruleForm.is_active" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="生效开始时间">
          <el-date-picker v-model="ruleForm.start_time" type="datetime" />
        </el-form-item>
        <el-form-item label="生效结束时间">
          <el-date-picker v-model="ruleForm.end_time" type="datetime" />
        </el-form-item>
        <el-form-item label="规则条件（JSON）">
          <el-input type="textarea" v-model="ruleForm.conditions" :rows="3" placeholder='{"user_types":[2,3],"min_quoter_vip":1,"min_behavior_score":60,"interest_categories":["1","5"]}' />
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input type="textarea" v-model="ruleForm.description" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="mappingDialog.visible" :title="mappingDialog.isAdd ? '新增内容映射' : '编辑内容映射'" width="600px">
      <el-form :model="mappingForm" label-width="120px">
        <el-form-item label="关联规则ID">
          <el-input v-model="mappingForm.rule_id" type="number" />
        </el-form-item>
        <el-form-item label="内容类型">
          <el-select v-model="mappingForm.content_type">
            <el-option label="需求" :value="1" />
            <el-option label="报价" :value="2" />
            <el-option label="广告" :value="3" />
            <el-option label="分类" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容ID">
          <el-input v-model="mappingForm.content_id" type="number" />
        </el-form-item>
        <el-form-item label="目标用户类型">
          <el-select v-model="mappingForm.target_user_type">
            <el-option label="全部" :value="0" />
            <el-option label="需求方" :value="1" />
            <el-option label="报价方" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标需求方VIP">
          <el-input v-model="mappingForm.target_demander_vip" placeholder="逗号分隔" />
        </el-form-item>
        <el-form-item label="目标报价方VIP">
          <el-input v-model="mappingForm.target_quoter_vip" placeholder="逗号分隔" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input v-model="mappingForm.weight" type="number" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="mappingForm.is_active" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="目标用户标签（JSON）">
          <el-input type="textarea" v-model="mappingForm.target_user_tags" :rows="2" />
        </el-form-item>
        <el-form-item label="目标分类（JSON）">
          <el-input type="textarea" v-model="mappingForm.target_categories" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mappingDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveMapping">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/utils/request';

const activeTab = ref('profiles');

const profileList = ref([]);
const profilePage = reactive({ page: 1, pageSize: 20, total: 0 });
const profileFilter = reactive({ user_id: '', user_type: 0 });
const profileDialog = reactive({ visible: false, isAdd: true });
const profileForm = reactive({
  profile_id: null,
  user_id: '',
  user_type: 1,
  demander_vip_level: 0,
  quoter_vip_level: 0,
  location: '',
  age_range: '',
  gender: 0,
  behavior_score: 0,
  quote_count: 0,
  quote_categories: '',
  quote_success_rate: 0,
  favorite_categories: '',
  recent_viewed: '',
  tags: '',
  interest_categories: ''
});

const ruleList = ref([]);
const rulePage = reactive({ page: 1, pageSize: 20, total: 0 });
const ruleFilter = reactive({ rule_type: 0, is_active: -1 });
const ruleDialog = reactive({ visible: false, isAdd: true });
const ruleForm = reactive({
  rule_id: null,
  rule_name: '',
  rule_type: 1,
  conditions: '',
  priority: 100,
  is_active: 1,
  start_time: null,
  end_time: null,
  description: ''
});

const mappingList = ref([]);
const mappingPage = reactive({ page: 1, pageSize: 20, total: 0 });
const mappingFilter = reactive({ content_type: 0, is_active: -1 });
const mappingDialog = reactive({ visible: false, isAdd: true });
const mappingForm = reactive({
  mapping_id: null,
  rule_id: null,
  content_type: 1,
  content_id: '',
  target_user_tags: '',
  target_user_type: 0,
  target_demander_vip: '',
  target_quoter_vip: '',
  target_categories: '',
  weight: 100,
  is_active: 1
});

onMounted(() => {
  fetchProfiles();
});

const getUserTypeText = (type) => {
  const map = { 0: '普通用户', 1: '需求方', 2: '报价方', 3: '双身份' };
  return map[type] || '未知';
};

const getGenderText = (gender) => {
  const map = { 0: '未知', 1: '男', 2: '女' };
  return map[gender] || '未知';
};

const getRuleTypeText = (type) => {
  const map = { 1: '内容推荐', 2: '广告推荐', 3: '需求推荐' };
  return map[type] || '未知';
};

const getContentTypeText = (type) => {
  const map = { 1: '需求', 2: '报价', 3: '广告', 4: '分类' };
  return map[type] || '未知';
};

const fetchProfiles = async () => {
  try {
    const res = await request.get('/personalization/profiles', {
      params: {
        page: profilePage.page,
        pageSize: profilePage.pageSize,
        ...profileFilter
      }
    });
    profileList.value = res.data.list || [];
    profilePage.total = res.data.total || 0;
  } catch (error) {
    console.error(error);
    // 错误处理已在 request 拦截器中完成
  }
};

const showProfileDialog = (isAdd, row = null) => {
  profileDialog.isAdd = isAdd;
  profileDialog.visible = true;
  if (isAdd) {
    Object.assign(profileForm, {
      profile_id: null,
      user_id: '',
      user_type: 1,
      demander_vip_level: 0,
      quoter_vip_level: 0,
      location: '',
      age_range: '',
      gender: 0,
      behavior_score: 0,
      quote_count: 0,
      quote_categories: '',
      quote_success_rate: 0,
      favorite_categories: '',
      recent_viewed: '',
      tags: '',
      interest_categories: ''
    });
  } else {
    Object.assign(profileForm, {
      profile_id: row.profile_id,
      user_id: row.user_id,
      user_type: row.user_type,
      demander_vip_level: row.demander_vip_level,
      quoter_vip_level: row.quoter_vip_level,
      location: row.location || '',
      age_range: row.age_range || '',
      gender: row.gender,
      behavior_score: row.behavior_score,
      quote_count: row.quote_count || 0,
      quote_categories: row.quote_categories || '',
      quote_success_rate: row.quote_success_rate || 0,
      favorite_categories: row.favorite_categories || '',
      recent_viewed: row.recent_viewed || '',
      tags: row.tags || '',
      interest_categories: row.interest_categories || ''
    });
  }
};

const saveProfile = async () => {
  try {
    if (!profileForm.user_id) {
      ElMessage.warning('请输入用户ID');
      return;
    }
    if (profileDialog.isAdd) {
      await request.post('/personalization/profiles', profileForm);
    } else {
      await request.put(`/personalization/profiles/${profileForm.profile_id}`, profileForm);
    }
    ElMessage.success('操作成功');
    profileDialog.visible = false;
    fetchProfiles();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  }
};

const deleteProfile = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此画像吗?', '提示', { type: 'warning' });
    await request.delete(`/personalization/profiles/${row.profile_id}`);
    ElMessage.success('删除成功');
    fetchProfiles();
  } catch (error) {
    if (error !== 'cancel') console.error(error);
  }
};

const fetchRules = async () => {
  try {
    const params = {
      page: rulePage.page,
      pageSize: rulePage.pageSize
    };
    if (ruleFilter.rule_type !== 0) params.rule_type = ruleFilter.rule_type;
    if (ruleFilter.is_active !== -1) params.is_active = ruleFilter.is_active;
    
    const res = await request.get('/personalization/rules', { params });
    ruleList.value = res.data.list || [];
    rulePage.total = res.data.total || 0;
  } catch (error) {
    console.error(error);
  }
};

const showRuleDialog = (isAdd, row = null) => {
  ruleDialog.isAdd = isAdd;
  ruleDialog.visible = true;
  if (isAdd) {
    Object.assign(ruleForm, {
      rule_id: null,
      rule_name: '',
      rule_type: 1,
      conditions: '',
      priority: 100,
      is_active: 1,
      start_time: null,
      end_time: null,
      description: ''
    });
  } else {
    Object.assign(ruleForm, {
      rule_id: row.rule_id,
      rule_name: row.rule_name,
      rule_type: row.rule_type,
      conditions: row.conditions || '',
      priority: row.priority,
      is_active: row.is_active,
      start_time: row.start_time,
      end_time: row.end_time,
      description: row.description || ''
    });
  }
};

const saveRule = async () => {
  try {
    if (!ruleForm.rule_name) {
      ElMessage.warning('请输入规则名称');
      return;
    }
    if (ruleDialog.isAdd) {
      await request.post('/personalization/rules', ruleForm);
    } else {
      await request.put(`/personalization/rules/${ruleForm.rule_id}`, ruleForm);
    }
    ElMessage.success('操作成功');
    ruleDialog.visible = false;
    fetchRules();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  }
};

const toggleRuleStatus = async (row) => {
  try {
    await request.put(`/personalization/rules/${row.rule_id}`, {
      is_active: row.is_active === 1 ? 0 : 1
    });
    row.is_active = row.is_active === 1 ? 0 : 1;
    ElMessage.success('操作成功');
  } catch (error) {
    console.error(error);
    row.is_active = row.is_active === 1 ? 0 : 1;
    ElMessage.error('操作失败');
  }
};

const deleteRule = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此规则吗?', '提示', { type: 'warning' });
    await request.delete(`/personalization/rules/${row.rule_id}`);
    ElMessage.success('删除成功');
    fetchRules();
  } catch (error) {
    if (error !== 'cancel') console.error(error);
  }
};

const fetchMappings = async () => {
  try {
    const params = {
      page: mappingPage.page,
      pageSize: mappingPage.pageSize
    };
    if (mappingFilter.content_type !== 0) params.content_type = mappingFilter.content_type;
    if (mappingFilter.is_active !== -1) params.is_active = mappingFilter.is_active;
    
    const res = await request.get('/personalization/mappings', { params });
    mappingList.value = res.data.list || [];
    mappingPage.total = res.data.total || 0;
  } catch (error) {
    console.error(error);
  }
};

const showMappingDialog = (isAdd, row = null) => {
  mappingDialog.isAdd = isAdd;
  mappingDialog.visible = true;
  if (isAdd) {
    Object.assign(mappingForm, {
      mapping_id: null,
      rule_id: null,
      content_type: 1,
      content_id: '',
      target_user_tags: '',
      target_user_type: 0,
      target_demander_vip: '',
      target_quoter_vip: '',
      target_categories: '',
      weight: 100,
      is_active: 1
    });
  } else {
    Object.assign(mappingForm, {
      mapping_id: row.mapping_id,
      rule_id: row.rule_id,
      content_type: row.content_type,
      content_id: row.content_id,
      target_user_tags: row.target_user_tags || '',
      target_user_type: row.target_user_type,
      target_demander_vip: row.target_demander_vip || '',
      target_quoter_vip: row.target_quoter_vip || '',
      target_categories: row.target_categories || '',
      weight: row.weight,
      is_active: row.is_active
    });
  }
};

const saveMapping = async () => {
  try {
    if (!mappingForm.content_id) {
      ElMessage.warning('请输入内容ID');
      return;
    }
    if (mappingDialog.isAdd) {
      await request.post('/personalization/mappings', mappingForm);
    } else {
      await request.put(`/personalization/mappings/${mappingForm.mapping_id}`, mappingForm);
    }
    ElMessage.success('操作成功');
    mappingDialog.visible = false;
    fetchMappings();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  }
};

const toggleMappingStatus = async (row) => {
  try {
    await request.put(`/personalization/mappings/${row.mapping_id}`, {
      is_active: row.is_active === 1 ? 0 : 1
    });
    row.is_active = row.is_active === 1 ? 0 : 1;
    ElMessage.success('操作成功');
  } catch (error) {
    console.error(error);
    row.is_active = row.is_active === 1 ? 0 : 1;
    ElMessage.error('操作失败');
  }
};

const deleteMapping = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此映射吗?', '提示', { type: 'warning' });
    await request.delete(`/personalization/mappings/${row.mapping_id}`);
    ElMessage.success('删除成功');
    fetchMappings();
  } catch (error) {
    if (error !== 'cancel') console.error(error);
  }
};

const handleTabChange = (tab) => {
  if (tab === 'rules') {
    fetchRules();
  } else if (tab === 'mappings') {
    fetchMappings();
  }
};
</script>

<style scoped>
.personalization {
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

.tabs-container {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  padding-top: 16px;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-input {
  width: 180px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>