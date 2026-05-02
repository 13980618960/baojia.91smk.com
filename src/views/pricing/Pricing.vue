<template>
  <div class="pricing">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Wallet /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>
      </template>

      <template v-if="currentView === 'ads-funds'">
        <div class="fund-summary-section">
          <div class="summary-card">
            <div class="summary-icon total-income">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="summary-info">
              <span class="summary-label">平台广告总收入</span>
              <span class="summary-value">¥{{ platformTotalIncome.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon recharge">
              <el-icon><ArrowUp /></el-icon>
            </div>
            <div class="summary-info">
              <span class="summary-label">总充值金额</span>
              <span class="summary-value">¥{{ totalRecharge.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon remaining">
              <el-icon><ArrowDown /></el-icon>
            </div>
            <div class="summary-info">
              <span class="summary-label">总剩余金额</span>
              <span class="summary-value remaining-color">¥{{ totalRemaining.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon count">
              <el-icon><User /></el-icon>
            </div>
            <div class="summary-info">
              <span class="summary-label">总广告账户数量</span>
              <span class="summary-value">{{ fundList.length }}</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <el-input v-model="fundSearchKeyword" placeholder="搜索用户ID、昵称" clearable />
          <el-button type="primary" @click="showFundDialog(true)">新增账户</el-button>
        </div>

        <el-table :data="filteredFundList" border stripe style="width: 100%">
          <el-table-column prop="fund_id" label="账户ID" width="100" align="center" />
          <el-table-column prop="user_id" label="用户ID" width="100" align="center" />
          <el-table-column prop="account_name" label="账户名称" min-width="150" />
          <el-table-column prop="balance" label="余额" width="120" align="right">
            <template #default="{ row }">¥{{ parseFloat(row.balance).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="total_recharge" label="累计充值" width="120" align="right">
            <template #default="{ row }">¥{{ parseFloat(row.total_recharge).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="total_expense" label="累计消费" width="120" align="right">
            <template #default="{ row }">¥{{ parseFloat(row.total_expense).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="is_active" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch :model-value="row.is_active === 1" @change="toggleFundStatus(row)" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" @click="showRechargeDialog(row)">充值</el-button>
                <el-button size="small" type="warning" @click="showAdjustDialog(row)">调整</el-button>
                <el-button size="small" type="info" @click="showRecordDialog(row)">流水</el-button>
                <el-button size="small" @click="showFundDialog(false, row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteFund(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else-if="currentView === 'ads-invitation'">
        <div class="filter-bar">
          <el-button type="primary" @click="showInvitationDialog(true)">新增规则</el-button>
        </div>

        <el-card class="invitation-card">
          <template #header>
            <span>模式一：邀请奖励（获得免费广告）</span>
          </template>
          <el-table :data="invitationRuleList.filter(r => r.rule_mode === 1)" border stripe style="width: 100%">
            <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
            <el-table-column prop="rule_name" label="规则名称" min-width="150" />
            <el-table-column prop="required_invites" label="邀请人数" width="100" align="center" />
            <el-table-column label="广告位置" min-width="150">
              <template #default="{ row }">{{ row.positionInfo?.position_name || '-' }}</template>
            </el-table-column>
            <el-table-column prop="pricing_model" label="计费方式" width="120">
              <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
            </el-table-column>
            <el-table-column prop="free_value" label="免费额度" width="100" align="center">
              <template #default="{ row }">{{ row.free_value }}{{ getPricingUnitText(row.pricing_model) }}</template>
            </el-table-column>
            <el-table-column prop="can_stack" label="可叠加" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.can_stack === 1 ? 'success' : 'info'">{{ row.can_stack === 1 ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="show_on_miniprogram" label="小程序显示" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.show_on_miniprogram === 1 ? 'success' : 'info'">{{ row.show_on_miniprogram === 1 ? '显示' : '隐藏' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_invites" label="累计邀请" width="100" align="center" />
            <el-table-column prop="total_rewards" label="累计发放" width="100" align="center" />
            <el-table-column prop="is_active" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.is_active === 1" @change="toggleInvitationStatus(row)" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="showInvitationDialog(false, row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteInvitation(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card class="invitation-card" style="margin-top: 20px;">
          <template #header>
            <span>模式二：邀请奖励（直接获得金额）</span>
          </template>
          <el-table :data="invitationRuleList.filter(r => r.rule_mode === 2)" border stripe style="width: 100%">
            <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
            <el-table-column prop="rule_name" label="规则名称" min-width="150" />
            <el-table-column prop="required_invites" label="邀请人数" width="100" align="center" />
            <el-table-column prop="reward_amount" label="奖励金额" width="120" align="right">
              <template #default="{ row }">¥{{ parseFloat(row.reward_amount).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="can_stack" label="可叠加" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.can_stack === 1 ? 'success' : 'info'">{{ row.can_stack === 1 ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_invites" label="累计邀请" width="100" align="center" />
            <el-table-column prop="total_rewards" label="累计发放" width="100" align="center" />
            <el-table-column prop="is_active" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch :model-value="row.is_active === 1" @change="toggleInvitationStatus(row)" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="showInvitationDialog(false, row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteInvitation(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>

      <template v-else-if="currentView === 'ads' && currentAdType">
        <div class="tab-content">
          <div class="filter-bar">
            <el-button type="primary" @click="showPricingModelSelect">新增规则</el-button>
          </div>
          
          <el-card class="ad-type-card">
            <template #header>
              <span class="ad-type-title">{{ currentAdType.name }}</span>
              <span class="ad-type-count">{{ getCurrentAdTypeRules().length }} 条规则</span>
            </template>
            
            <div class="pricing-model-tabs">
              <el-tabs type="card" v-model="activePricingTab" class="model-tabs">
                <el-tab-pane label="CPM (按展示计费)" name="cpm">
                  <div class="model-detail">
                    <div class="detail-header">
                      <span class="detail-title">CPM - 按千次展示计费</span>
                      <span class="detail-desc">每展示1000次收取费用</span>
                    </div>
                    <div class="detail-content">
                      <el-table :data="getCurrentRulesByModel(1)" border stripe style="width: 100%">
                        <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
                        <el-table-column label="位置" min-width="140">
                          <template #default="{ row }">{{ currentAdType.position || '-' }}</template>
                        </el-table-column>
                        <el-table-column label="交付方式" width="110">
                          <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
                        </el-table-column>
                        <el-table-column prop="base_price" label="基础价格" width="110" align="right">
                          <template #default="{ row }">¥{{ parseFloat(row.base_price) }}</template>
                        </el-table-column>
                        <el-table-column prop="unit" label="价格单位" min-width="100" />
                        <el-table-column label="高峰时段" min-width="200">
                          <template #default="{ row }">
                            <div v-if="row.peak_time_slots" class="peak-slots">
                              <div v-for="(slot, idx) in parsePeakSlots(row.peak_time_slots)" :key="idx" class="peak-slot-item">
                                {{ slot.start }}-{{ slot.end }} {{ slot.multiplier !== null ? slot.multiplier : row.peak_hour_multiplier || '1.0' }}倍
                              </div>
                            </div>
                            <div v-else class="no-peak">-</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="is_active" label="状态" width="80" align="center">
                          <template #default="{ row }">
                            <el-switch :model-value="parseInt(row.is_active) === 1" @change="(val) => toggleAdPricingStatus(row, val)" size="small" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                          <template #default="{ row }">
                            <el-button size="small" @click="showAdPricingDialog(false, row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteAdPricing(row)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="add-rule-btn">
                        <el-button size="small" type="primary" @click="showAdPricingDialog(true, { ad_type: currentAdType.type, pricing_model: 1 })">+ 添加CPM规则</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="CPC (按点击计费)" name="cpc">
                  <div class="model-detail">
                    <div class="detail-header">
                      <span class="detail-title">CPC - 按点击计费</span>
                      <span class="detail-desc">每次点击收取费用</span>
                    </div>
                    <div class="detail-content">
                      <el-table :data="getCurrentRulesByModel(2)" border stripe style="width: 100%">
                        <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
                        <el-table-column label="位置" min-width="140">
                          <template #default="{ row }">{{ currentAdType.position || '-' }}</template>
                        </el-table-column>
                        <el-table-column label="交付方式" width="110">
                          <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
                        </el-table-column>
                        <el-table-column prop="base_price" label="基础价格" width="110" align="right">
                          <template #default="{ row }">¥{{ parseFloat(row.base_price) }}</template>
                        </el-table-column>
                        <el-table-column prop="unit" label="价格单位" min-width="100" />
                        <el-table-column label="高峰时段" min-width="200">
                          <template #default="{ row }">
                            <div v-if="row.peak_time_slots" class="peak-slots">
                              <div v-for="(slot, idx) in parsePeakSlots(row.peak_time_slots)" :key="idx" class="peak-slot-item">
                                {{ slot.start }}-{{ slot.end }} {{ slot.multiplier !== null ? slot.multiplier : row.peak_hour_multiplier || '1.0' }}倍
                              </div>
                            </div>
                            <div v-else class="no-peak">-</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="is_active" label="状态" width="80" align="center">
                          <template #default="{ row }">
                            <el-switch :model-value="parseInt(row.is_active) === 1" @change="(val) => toggleAdPricingStatus(row, val)" size="small" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                          <template #default="{ row }">
                            <el-button size="small" @click="showAdPricingDialog(false, row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteAdPricing(row)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="add-rule-btn">
                        <el-button size="small" type="primary" @click="showAdPricingDialog(true, { ad_type: currentAdType.type, pricing_model: 2 })">+ 添加CPC规则</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="CPA (按转化计费)" name="cpa">
                  <div class="model-detail">
                    <div class="detail-header">
                      <span class="detail-title">CPA - 按转化计费</span>
                      <span class="detail-desc">每次有效转化收取费用</span>
                    </div>
                    <div class="detail-content">
                      <el-table :data="getCurrentRulesByModel(3)" border stripe style="width: 100%">
                        <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
                        <el-table-column label="位置" min-width="140">
                          <template #default="{ row }">{{ currentAdType.position || '-' }}</template>
                        </el-table-column>
                        <el-table-column label="交付方式" width="110">
                          <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
                        </el-table-column>
                        <el-table-column prop="base_price" label="基础价格" width="110" align="right">
                          <template #default="{ row }">¥{{ parseFloat(row.base_price) }}</template>
                        </el-table-column>
                        <el-table-column prop="unit" label="价格单位" min-width="100" />
                        <el-table-column label="高峰时段" min-width="200">
                          <template #default="{ row }">
                            <div v-if="row.peak_time_slots" class="peak-slots">
                              <div v-for="(slot, idx) in parsePeakSlots(row.peak_time_slots)" :key="idx" class="peak-slot-item">
                                {{ slot.start }}-{{ slot.end }} {{ slot.multiplier !== null ? slot.multiplier : row.peak_hour_multiplier || '1.0' }}倍
                              </div>
                            </div>
                            <div v-else class="no-peak">-</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="is_active" label="状态" width="80" align="center">
                          <template #default="{ row }">
                            <el-switch :model-value="parseInt(row.is_active) === 1" @change="(val) => toggleAdPricingStatus(row, val)" size="small" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                          <template #default="{ row }">
                            <el-button size="small" @click="showAdPricingDialog(false, row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteAdPricing(row)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="add-rule-btn">
                        <el-button size="small" type="primary" @click="showAdPricingDialog(true, { ad_type: currentAdType.type, pricing_model: 3 })">+ 添加CPA规则</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="oCPC (优化点击计费)" name="ocpc">
                  <div class="model-detail">
                    <div class="detail-header">
                      <span class="detail-title">oCPC - 优化点击计费</span>
                      <span class="detail-desc">基于转化目标优化的点击计费</span>
                    </div>
                    <div class="detail-content">
                      <el-table :data="getCurrentRulesByModel(4)" border stripe style="width: 100%">
                        <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
                        <el-table-column label="位置" min-width="140">
                          <template #default="{ row }">{{ currentAdType.position || '-' }}</template>
                        </el-table-column>
                        <el-table-column label="交付方式" width="110">
                          <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
                        </el-table-column>
                        <el-table-column prop="base_price" label="基础价格" width="110" align="right">
                          <template #default="{ row }">¥{{ parseFloat(row.base_price) }}</template>
                        </el-table-column>
                        <el-table-column prop="unit" label="价格单位" min-width="100" />
                        <el-table-column label="高峰时段" min-width="200">
                          <template #default="{ row }">
                            <div v-if="row.peak_time_slots" class="peak-slots">
                              <div v-for="(slot, idx) in parsePeakSlots(row.peak_time_slots)" :key="idx" class="peak-slot-item">
                                {{ slot.start }}-{{ slot.end }} {{ slot.multiplier !== null ? slot.multiplier : row.peak_hour_multiplier || '1.0' }}倍
                              </div>
                            </div>
                            <div v-else class="no-peak">-</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="is_active" label="状态" width="80" align="center">
                          <template #default="{ row }">
                            <el-switch :model-value="parseInt(row.is_active) === 1" @change="(val) => toggleAdPricingStatus(row, val)" size="small" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                          <template #default="{ row }">
                            <el-button size="small" @click="showAdPricingDialog(false, row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteAdPricing(row)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="add-rule-btn">
                        <el-button size="small" type="primary" @click="showAdPricingDialog(true, { ad_type: currentAdType.type, pricing_model: 4 })">+ 添加oCPC规则</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="CPT (按时长计费)" name="cpt">
                  <div class="model-detail">
                    <div class="detail-header">
                      <span class="detail-title">CPT - 按时长计费</span>
                      <span class="detail-desc">按固定时长（天/周/月）收取费用</span>
                    </div>
                    <div class="detail-content">
                      <el-table :data="getCurrentRulesByModel(5)" border stripe style="width: 100%">
                        <el-table-column prop="rule_id" label="规则ID" width="80" align="center" />
                        <el-table-column label="位置" min-width="140">
                          <template #default="{ row }">{{ currentAdType.position || '-' }}</template>
                        </el-table-column>
                        <el-table-column label="交付方式" width="110">
                          <template #default="{ row }">{{ pricingModelNames[row.pricing_model] || '-' }}</template>
                        </el-table-column>
                        <el-table-column prop="base_price" label="基础价格" width="110" align="right">
                          <template #default="{ row }">¥{{ parseFloat(row.base_price) }}</template>
                        </el-table-column>
                        <el-table-column prop="unit" label="价格单位" min-width="100" />
                        <el-table-column label="高峰时段" min-width="200">
                          <template #default="{ row }">
                            <div v-if="row.peak_time_slots" class="peak-slots">
                              <div v-for="(slot, idx) in parsePeakSlots(row.peak_time_slots)" :key="idx" class="peak-slot-item">
                                {{ slot.start }}-{{ slot.end }} {{ slot.multiplier !== null ? slot.multiplier : row.peak_hour_multiplier || '1.0' }}倍
                              </div>
                            </div>
                            <div v-else class="no-peak">-</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="is_active" label="状态" width="80" align="center">
                          <template #default="{ row }">
                            <el-switch :model-value="parseInt(row.is_active) === 1" @change="(val) => toggleAdPricingStatus(row, val)" size="small" />
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                          <template #default="{ row }">
                            <el-button size="small" @click="showAdPricingDialog(false, row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteAdPricing(row)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="add-rule-btn">
                        <el-button size="small" type="primary" @click="showAdPricingDialog(true, { ad_type: currentAdType.type, pricing_model: 5 })">+ 添加CPT规则</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>
      </template>

      <template v-else-if="currentView === 'services'">
        <div class="filter-bar">
          <el-button type="primary" @click="showServiceDialog(true)">新增服务</el-button>
        </div>
        <el-table :data="serviceList" border stripe style="width: 100%">
          <el-table-column prop="service_id" label="服务ID" width="100" align="center" />
          <el-table-column prop="service_name" label="服务名称" min-width="150" />
          <el-table-column prop="description" label="服务描述" min-width="200" />
          <el-table-column prop="base_price" label="基础价格" width="120" align="right">
            <template #default="{ row }">¥{{ parseFloat(row.base_price).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="duration" label="时长(小时)" width="120" />
          <el-table-column prop="is_active" label="状态" width="100">
            <template #default="{ row }">
              <el-switch :model-value="row.is_active === 1" @change="toggleServiceStatus(row)" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="showServiceDialog(false, row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteService(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else-if="currentView === 'services-funds'">
        <div class="filter-bar">
          <el-input v-model="serviceFundKeyword" placeholder="搜索用户ID、昵称" clearable />
          <el-button type="primary" @click="showServiceFundDialog(true)">新增账户</el-button>
        </div>
        <el-table :data="serviceFundList" border stripe style="width: 100%">
          <el-table-column prop="fund_id" label="账户ID" width="100" align="center" />
          <el-table-column prop="user_id" label="用户ID" width="100" align="center" />
          <el-table-column prop="account_name" label="账户名称" min-width="150" />
          <el-table-column prop="balance" label="余额" width="120" align="right">
            <template #default="{ row }">¥{{ parseFloat(row.balance).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="is_active" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch :model-value="row.is_active === 1" @change="toggleServiceFundStatus(row)" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="showServiceFundRecharge(row)">充值</el-button>
              <el-button size="small" @click="showServiceFundDialog(false, row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteServiceFund(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else-if="currentView === 'services-invitation'">
        <div class="filter-bar">
          <el-button type="primary" @click="showServiceInvitationDialog(true)">新增规则</el-button>
        </div>
        <el-table :data="serviceInvitationList" border stripe style="width: 100%">
          <el-table-column prop="rule_id" label="规则ID" width="120" />
          <el-table-column prop="required_invites" label="邀请人数" width="120" />
          <el-table-column prop="reward_type" label="奖励类型" width="120">
            <template #default="{ row }">{{ getRewardTypeText(row.reward_type) }}</template>
          </el-table-column>
          <el-table-column prop="reward_name" label="奖励名称" min-width="150" />
          <el-table-column prop="reward_value" label="奖励值" width="150" />
          <el-table-column prop="is_active" label="状态" width="100">
            <template #default="{ row }">
              <el-switch :model-value="row.is_active === 1" @change="toggleServiceInvitationStatus(row)" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="showServiceInvitationDialog(false, row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteServiceInvitation(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
        <div class="empty-state">
          <el-icon class="empty-icon"><Folder /></el-icon>
          <p>请选择具体的管理项</p>
        </div>
      </template>
    </el-card>

    <el-dialog v-model="userSelectDialog.visible" title="选择用户" width="700px">
      <div class="mb-3">
        <el-input v-model="userSearchKeyword" placeholder="搜索用户ID、昵称、姓名或手机号" clearable />
      </div>
      <el-table :data="filteredUserList" border stripe style="width: 100%; max-height: 400px; overflow-y: auto;">
        <el-table-column prop="user_id" label="用户ID" width="80" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="real_name" label="真实姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="selectUser(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="rechargeDialog.visible" title="充值" width="500px">
      <el-form :model="rechargeForm" label-width="100px" label-position="right">
        <el-form-item label="账户名称">
          <el-input :model-value="currentAccount.account_name" disabled />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input :model-value="currentAccount.user_id" disabled />
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input v-model="rechargeForm.amount" type="number" step="0.01" placeholder="请输入充值金额" />
        </el-form-item>
        <el-form-item label="充值备注">
          <el-input v-model="rechargeForm.description" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleRecharge">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="fundDialog.visible" title="资金账户" width="500px">
      <el-form :model="fundForm" label-width="100px" label-position="right">
        <el-form-item label="账户名称">
          <el-input v-model="fundForm.account_name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="关联用户">
          <el-input v-model="fundForm.user_id" placeholder="点击选择用户" @click="showUserSelect" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fundDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveFund">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="adPricingDialog.visible" title="广告定价规则" width="600px">
      <el-form :model="adPricingForm" label-width="120px" label-position="right">
        <el-form-item label="广告类型">
          <el-input :value="currentAdType?.name || ''" disabled />
          <input type="hidden" v-model="adPricingForm.ad_type" />
          <input type="hidden" v-model="adPricingForm.pricing_model" />
        </el-form-item>
        <el-form-item label="基础价格">
          <el-input v-model="adPricingForm.base_price" type="number" step="0.01" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="价格单位">
          <el-select v-model="adPricingForm.unit">
            <el-option v-for="unit in getPricingUnits()" :key="unit.value" :label="unit.label" :value="unit.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="高峰时段加价">
          <el-input v-model="adPricingForm.peak_hour_multiplier" type="number" step="0.1" placeholder="如 1.5" />
        </el-form-item>
        <el-form-item label="高峰时段列表">
          <div class="peak-time-list">
            <div v-for="(timeSlot, index) in adPricingForm.peak_time_slots" :key="index" class="time-slot">
              <div class="time-slot-left">
                <el-time-picker v-model="timeSlot.start" format="HH:mm" value-format="HH:mm" placeholder="开始时间" />
                <span class="time-separator">-</span>
                <el-time-picker v-model="timeSlot.end" format="HH:mm" value-format="HH:mm" placeholder="结束时间" />
                <input type="number" v-model="timeSlot.multiplier" placeholder="倍率" class="multiplier-input" />
              </div>
              <el-button size="small" type="danger" @click="removePeakTimeSlot(index)">删除</el-button>
            </div>
          </div>
          <el-button size="small" @click="addPeakTimeSlot">+ 添加时段</el-button>
        </el-form-item>
        <el-form-item label="每日预算（元）">
          <el-input v-model="adPricingForm.daily_budget" type="number" step="0.01" placeholder="请输入每日预算，0或空表示不限制" />
          <div class="form-tip">设置后，广告每日消耗达到此金额将自动暂停</div>
        </el-form-item>
        <el-form-item label="总预算（元）">
          <el-input v-model="adPricingForm.total_budget" type="number" step="0.01" placeholder="请输入总预算，0或空表示不限制" />
          <div class="form-tip">设置后，广告累计消耗达到此金额将自动暂停</div>
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input type="textarea" v-model="adPricingForm.description" :rows="2" placeholder="描述规则生效条件" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adPricingDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveAdPricing">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="invitationDialog.visible" title="邀请奖励规则" width="600px">
      <el-form :model="invitationForm" label-width="120px" label-position="right">
        <el-form-item label="规则名称">
          <el-input v-model="invitationForm.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="奖励模式">
          <el-select v-model="invitationForm.rule_mode">
            <el-option label="模式一：免费广告" :value="1" />
            <el-option label="模式二：金额奖励" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="邀请人数要求">
          <el-input v-model="invitationForm.required_invites" type="number" placeholder="邀请多少人获得奖励" />
        </el-form-item>
        <el-form-item v-if="invitationForm.rule_mode === 1" label="广告位置">
          <el-select v-model="invitationForm.position_id">
            <el-option v-for="pos in adPositions" :key="pos.position_id" :label="pos.position_name" :value="pos.position_id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="invitationForm.rule_mode === 1" label="计费方式">
          <el-select v-model="invitationForm.pricing_model">
            <el-option label="CPM" :value="1" />
            <el-option label="CPC" :value="2" />
            <el-option label="CPA" :value="3" />
            <el-option label="oCPC" :value="4" />
            <el-option label="CPT" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="invitationForm.rule_mode === 1" label="免费额度">
          <el-input v-model="invitationForm.free_value" type="number" placeholder="免费展示次数或时长" />
        </el-form-item>
        <el-form-item v-if="invitationForm.rule_mode === 2" label="奖励金额">
          <el-input v-model="invitationForm.reward_amount" type="number" step="0.01" placeholder="奖励金额" />
        </el-form-item>
        <el-form-item label="是否可叠加">
          <el-switch v-model="invitationForm.can_stack" />
        </el-form-item>
        <el-form-item v-if="invitationForm.rule_mode === 1" label="小程序显示">
          <el-switch v-model="invitationForm.show_on_miniprogram" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="invitationDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveInvitation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import { Wallet, ArrowUp, ArrowDown, User, Folder } from '@element-plus/icons-vue'

const route = useRoute()

const currentView = ref('ads-funds')
const currentAdType = ref(null)
const activePricingTab = ref('cpm')

const fundList = ref([])
const fundSearchKeyword = ref('')
const invitationRuleList = ref([])
const adPricingRuleList = ref([])
const serviceList = ref([])
const serviceFundList = ref([])
const serviceInvitationList = ref([])

const userList = ref([])
const userSearchKeyword = ref('')

const currentAccount = reactive({})

const platformTotalIncome = ref(0)
const totalRecharge = ref(0)
const totalRemaining = ref(0)

const fundDialog = reactive({ visible: false })
const fundForm = reactive({
  fund_id: '',
  user_id: '',
  account_name: ''
})

const rechargeDialog = reactive({ visible: false })
const rechargeForm = reactive({
  amount: '',
  description: ''
})

const adPricingDialog = reactive({ visible: false })
const adPricingForm = reactive({
  rule_id: '',
  ad_type: '',
  pricing_model: '',
  base_price: '',
  unit: '',
  peak_hour_multiplier: '',
  peak_time_slots: [],
  daily_budget: '',
  total_budget: '',
  description: ''
})

const invitationDialog = reactive({ visible: false })
const invitationForm = reactive({
  rule_id: '',
  rule_name: '',
  rule_mode: 1,
  required_invites: '',
  position_id: '',
  pricing_model: '',
  free_value: '',
  reward_amount: '',
  can_stack: false,
  show_on_miniprogram: true
})

const userSelectDialog = reactive({ visible: false })

const pricingModelNames = {
  1: 'CPM',
  2: 'CPC',
  3: 'CPA',
  4: 'oCPC',
  5: 'CPT'
}

const adPositions = ref([
  { position_id: 1, position_name: '开屏广告' },
  { position_id: 2, position_name: '轮播图广告' },
  { position_id: 3, position_name: '需求卡片广告' },
  { position_id: 4, position_name: '大厅横幅广告' },
  { position_id: 5, position_name: '个人中心广告' }
])

const currentTitle = computed(() => {
  const titles = {
    'ads-funds': '平台广告收费 - 资金账户管理',
    'ads-invitation': '平台广告收费 - 邀请奖励规则',
    'services': '增值服务收费 - 收费规则设置',
    'services-funds': '增值服务收费 - 资金账户管理',
    'services-invitation': '增值服务收费 - 邀请奖励规则'
  }
  if (currentView.value.startsWith('ads/')) {
    return '平台广告收费 - 收费规则设置'
  }
  return titles[currentView.value] || '收费管理'
})

const filteredFundList = computed(() => {
  if (!fundSearchKeyword.value) return fundList.value
  return fundList.value.filter(item => 
    item.user_id.includes(fundSearchKeyword.value) ||
    item.account_name.includes(fundSearchKeyword.value)
  )
})

const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value
  return userList.value.filter(item =>
    item.user_id.includes(userSearchKeyword.value) ||
    item.nickname.includes(userSearchKeyword.value) ||
    item.real_name.includes(userSearchKeyword.value) ||
    item.phone.includes(userSearchKeyword.value)
  )
})

const getCurrentAdType = () => {
  const path = route.path
  const adTypeMap = {
    '/pricing/ads/splash': { type: 1, name: '开屏广告', position: '首页开屏' },
    '/pricing/ads/banner': { type: 2, name: '轮播图广告', position: '首页轮播图' },
    '/pricing/ads/demand-card': { type: 3, name: '需求卡片广告', position: '需求列表卡片' },
    '/pricing/ads/hall-banner': { type: 4, name: '大厅横幅广告', position: '大厅横幅' },
    '/pricing/ads/profile': { type: 5, name: '个人中心广告', position: '个人中心' }
  }
  return adTypeMap[path] || null
}

const getCurrentAdTypeRules = () => {
  if (!currentAdType.value) return []
  return adPricingRuleList.value.filter(r => r.ad_type === currentAdType.value.type)
}

const getCurrentRulesByModel = (model) => {
  return getCurrentAdTypeRules().filter(r => r.pricing_model === model)
}

const getPricingUnits = () => {
  return [
    { value: '元/千次展示', label: '元/千次展示' },
    { value: '元/次点击', label: '元/次点击' },
    { value: '元/次转化', label: '元/次转化' },
    { value: '元/天', label: '元/天' },
    { value: '元/小时', label: '元/小时' }
  ]
}

const getPricingUnitText = (model) => {
  const units = {
    1: '千次展示',
    2: '次点击',
    3: '次转化',
    4: '次点击',
    5: '天'
  }
  return units[model] || ''
}

const getRewardTypeText = (type) => {
  const types = { 1: '积分', 2: '优惠券', 3: '服务时长' }
  return types[type] || '未知'
}

const parsePeakSlots = (slots) => {
  try {
    return JSON.parse(slots)
  } catch {
    return []
  }
}

const addPeakTimeSlot = () => {
  adPricingForm.peak_time_slots.push({ start: '', end: '', multiplier: '' })
}

const removePeakTimeSlot = (index) => {
  adPricingForm.peak_time_slots.splice(index, 1)
}

const showUserSelect = () => {
  userSelectDialog.visible = true
  fetchUsers()
}

const selectUser = (user) => {
  fundForm.user_id = user.user_id
  userSelectDialog.visible = false
}

const showFundDialog = (isAdd, row = {}) => {
  fundDialog.visible = true
  if (isAdd) {
    fundForm.fund_id = ''
    fundForm.user_id = ''
    fundForm.account_name = ''
  } else {
    fundForm.fund_id = row.fund_id
    fundForm.user_id = row.user_id
    fundForm.account_name = row.account_name
  }
}

const showRechargeDialog = (account) => {
  currentAccount.account_name = account.account_name
  currentAccount.user_id = account.user_id
  currentAccount.fund_id = account.fund_id
  rechargeForm.amount = ''
  rechargeForm.description = ''
  rechargeDialog.visible = true
}

const showPricingModelSelect = () => {
  showAdPricingDialog(true, { ad_type: currentAdType.value.type, pricing_model: 1 })
}

const showAdPricingDialog = (isAdd, row = {}) => {
  adPricingDialog.visible = true
  if (isAdd) {
    adPricingForm.rule_id = ''
    adPricingForm.ad_type = row.ad_type || ''
    adPricingForm.pricing_model = row.pricing_model || ''
    adPricingForm.base_price = ''
    adPricingForm.unit = ''
    adPricingForm.peak_hour_multiplier = ''
    adPricingForm.peak_time_slots = []
    adPricingForm.daily_budget = ''
    adPricingForm.total_budget = ''
    adPricingForm.description = ''
  } else {
    adPricingForm.rule_id = row.rule_id
    adPricingForm.ad_type = row.ad_type
    adPricingForm.pricing_model = row.pricing_model
    adPricingForm.base_price = row.base_price
    adPricingForm.unit = row.unit
    adPricingForm.peak_hour_multiplier = row.peak_hour_multiplier
    adPricingForm.peak_time_slots = parsePeakSlots(row.peak_time_slots)
    adPricingForm.daily_budget = row.daily_budget
    adPricingForm.total_budget = row.total_budget
    adPricingForm.description = row.description
  }
}

const showInvitationDialog = (isAdd, row = {}) => {
  invitationDialog.visible = true
  if (isAdd) {
    invitationForm.rule_id = ''
    invitationForm.rule_name = ''
    invitationForm.rule_mode = 1
    invitationForm.required_invites = ''
    invitationForm.position_id = ''
    invitationForm.pricing_model = ''
    invitationForm.free_value = ''
    invitationForm.reward_amount = ''
    invitationForm.can_stack = false
    invitationForm.show_on_miniprogram = true
  } else {
    invitationForm.rule_id = row.rule_id
    invitationForm.rule_name = row.rule_name
    invitationForm.rule_mode = row.rule_mode
    invitationForm.required_invites = row.required_invites
    invitationForm.position_id = row.position_id
    invitationForm.pricing_model = row.pricing_model
    invitationForm.free_value = row.free_value
    invitationForm.reward_amount = row.reward_amount
    invitationForm.can_stack = row.can_stack === 1
    invitationForm.show_on_miniprogram = row.show_on_miniprogram === 1
  }
}

const showServiceDialog = (isAdd, row = {}) => {
  alert('功能开发中')
}

const showServiceFundDialog = (isAdd, row = {}) => {
  alert('功能开发中')
}

const showServiceFundRecharge = (row) => {
  alert('功能开发中')
}

const showServiceInvitationDialog = (isAdd, row = {}) => {
  alert('功能开发中')
}

const showAdjustDialog = (row) => {
  alert('功能开发中')
}

const showRecordDialog = (row) => {
  alert('功能开发中')
}

const saveFund = async () => {
  try {
    const data = { ...fundForm }
    if (!data.user_id || data.user_id === '') {
      data.user_id = null
    }
    if (fundForm.fund_id) {
      await request.put(`/pricing/funds/${fundForm.fund_id}`, data)
    } else {
      delete data.fund_id
      await request.post('/pricing/funds', data)
    }
    fundDialog.visible = false
    fetchFunds()
    alert('保存成功')
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const handleRecharge = async () => {
  try {
    await request.post('/pricing/funds/recharge', {
      fund_id: currentAccount.fund_id,
      amount: rechargeForm.amount,
      description: rechargeForm.description
    })
    rechargeDialog.visible = false
    fetchFunds()
    alert('充值成功')
  } catch (error) {
    alert('充值失败: ' + error.message)
  }
}

const saveAdPricing = async () => {
  try {
    const data = { ...adPricingForm }
    data.peak_time_slots = JSON.stringify(adPricingForm.peak_time_slots)
    const url = adPricingForm.rule_id ? '/pricing/ads/update' : '/pricing/ads/create'
    await request.post(url, data)
    adPricingDialog.visible = false
    fetchAdPricingRules()
    alert('保存成功')
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const saveInvitation = async () => {
  try {
    const data = { ...invitationForm }
    data.can_stack = invitationForm.can_stack ? 1 : 0
    data.show_on_miniprogram = invitationForm.show_on_miniprogram ? 1 : 0
    const url = invitationForm.rule_id ? '/pricing/ads-invitation/update' : '/pricing/ads-invitation/create'
    await request.post(url, data)
    invitationDialog.visible = false
    fetchInvitationRules()
    alert('保存成功')
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const deleteFund = async (row) => {
  if (!confirm('确定删除此账户吗？')) return
  try {
    await request.post('/pricing/funds/delete', { fund_id: row.fund_id })
    fetchFunds()
    alert('删除成功')
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

const deleteAdPricing = async (row) => {
  if (!confirm('确定删除此规则吗？')) return
  try {
    await request.post('/pricing/ads/delete', { rule_id: row.rule_id })
    fetchAdPricingRules()
    alert('删除成功')
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

const deleteInvitation = async (row) => {
  if (!confirm('确定删除此规则吗？')) return
  try {
    await request.post('/pricing/ads-invitation/delete', { rule_id: row.rule_id })
    fetchInvitationRules()
    alert('删除成功')
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

const deleteService = async (row) => {
  alert('功能开发中')
}

const deleteServiceFund = async (row) => {
  alert('功能开发中')
}

const deleteServiceInvitation = async (row) => {
  alert('功能开发中')
}

const toggleFundStatus = async (row) => {
  try {
    await request.post('/pricing/funds/toggle', { fund_id: row.fund_id })
    row.is_active = row.is_active === 1 ? 0 : 1
  } catch (error) {
    alert('操作失败: ' + error.message)
    row.is_active = row.is_active === 1 ? 0 : 1
  }
}

const toggleAdPricingStatus = async (row, val) => {
  try {
    await request.post('/pricing/ads/toggle', { rule_id: row.rule_id })
    row.is_active = val ? 1 : 0
  } catch (error) {
    alert('操作失败: ' + error.message)
  }
}

const toggleInvitationStatus = async (row) => {
  try {
    await request.post('/pricing/ads-invitation/toggle', { rule_id: row.rule_id })
    row.is_active = row.is_active === 1 ? 0 : 1
  } catch (error) {
    alert('操作失败: ' + error.message)
    row.is_active = row.is_active === 1 ? 0 : 1
  }
}

const toggleServiceStatus = async (row) => {
  alert('功能开发中')
}

const toggleServiceFundStatus = async (row) => {
  alert('功能开发中')
}

const toggleServiceInvitationStatus = async (row) => {
  alert('功能开发中')
}

const fetchFunds = async () => {
  try {
    const res = await request.get('/pricing/funds')
    fundList.value = res.data.list || []
    platformTotalIncome.value = res.data.platformTotalIncome || 0
    totalRecharge.value = res.data.totalRecharge || 0
    totalRemaining.value = res.data.totalRemaining || 0
  } catch (error) {
    console.error('获取资金账户失败:', error)
  }
}

const fetchAdPricingRules = async () => {
  try {
    const res = await request.get('/pricing/ads')
    adPricingRuleList.value = res.data || []
  } catch (error) {
    console.error('获取广告定价规则失败:', error)
  }
}

const fetchInvitationRules = async () => {
  try {
    const res = await request.get('/pricing/ads-invitation')
    invitationRuleList.value = res.data || []
  } catch (error) {
    console.error('获取邀请奖励规则失败:', error)
  }
}

const fetchUsers = async () => {
  try {
    const res = await request.get('/pricing/users/list')
    userList.value = res.data || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const fetchServices = async () => {
  try {
    const res = await request.get('/pricing/services')
    serviceList.value = res.data || []
  } catch (error) {
    console.error('获取服务列表失败:', error)
  }
}

const fetchServiceFunds = async () => {
  try {
    const res = await request.get('/pricing/services-funds')
    serviceFundList.value = res.data || []
  } catch (error) {
    console.error('获取服务资金账户失败:', error)
  }
}

const fetchServiceInvitations = async () => {
  try {
    const res = await request.get('/pricing/services-invitation')
    serviceInvitationList.value = res.data || []
  } catch (error) {
    console.error('获取服务邀请规则失败:', error)
  }
}

const init = () => {
  const path = route.path
  if (path.startsWith('/pricing/ads/')) {
    currentView.value = 'ads'
    currentAdType.value = getCurrentAdType()
    fetchAdPricingRules()
  } else if (path === '/pricing/ads-funds') {
    currentView.value = 'ads-funds'
    fetchFunds()
  } else if (path === '/pricing/ads-invitation') {
    currentView.value = 'ads-invitation'
    fetchInvitationRules()
  } else if (path === '/pricing/services') {
    currentView.value = 'services'
    fetchServices()
  } else if (path === '/pricing/services-funds') {
    currentView.value = 'services-funds'
    fetchServiceFunds()
  } else if (path === '/pricing/services-invitation') {
    currentView.value = 'services-invitation'
    fetchServiceInvitations()
  } else if (path === '/pricing') {
    currentView.value = 'ads-funds'
    fetchFunds()
  }
}

onMounted(() => {
  init()
})

watch(() => route.path, () => {
  init()
})
</script>

<style scoped>
.pricing {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 8px;
  color: #667eea;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.fund-summary-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-right: 16px;
  color: #fff;
  font-size: 20px;
}

.summary-icon.total-income {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.summary-icon.recharge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-icon.remaining {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.summary-icon.count {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.summary-value.remaining-color {
  color: #fa709a;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.model-tabs {
  margin-top: 20px;
}

.model-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-desc {
  font-size: 14px;
  color: #909399;
}

.peak-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.peak-slot-item {
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.no-peak {
  color: #909399;
  font-size: 12px;
}

.add-rule-btn {
  margin-top: 16px;
  text-align: right;
}

.peak-time-list {
  margin-bottom: 10px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.time-slot-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.time-separator {
  color: #909399;
}

.multiplier-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.invitation-card {
  margin-top: 20px;
}

.ad-type-title {
  font-size: 16px;
  font-weight: 600;
}

.ad-type-count {
  margin-left: 16px;
  font-size: 14px;
  color: #909399;
}
</style>