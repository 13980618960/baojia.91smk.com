<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>万物皆可AI</h3>
        <p>管理后台</p>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="transparent"
        text-color="rgba(255, 255, 255, 0.9)"
        active-text-color="#fff"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/demands">
          <el-icon><Document /></el-icon>
          <span>需求管理</span>
        </el-menu-item>
        <el-menu-item index="/quotes">
          <el-icon><PriceTag /></el-icon>
          <span>报价管理</span>
        </el-menu-item>
        <el-menu-item index="/messages">
          <el-icon><ChatDotRound /></el-icon>
          <span>沟通记录</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/personalization">
          <el-icon><Star /></el-icon>
          <span>千人千面</span>
        </el-menu-item>
        <el-sub-menu index="/vip">
          <template #title>
            <el-icon><Medal /></el-icon>
            <span>VIP管理</span>
          </template>
          <el-menu-item index="/vip/demander">D-vips</el-menu-item>
          <el-menu-item index="/vip/quoter">Q-vips</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/ads">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>广告管理</span>
          </template>
          <el-sub-menu index="/ads/platform">
            <template #title>
              <span>平台广告</span>
            </template>
            <el-menu-item index="/ads/platform/splash">开屏广告</el-menu-item>
            <el-menu-item index="/ads/platform/banner">轮播图广告</el-menu-item>
            <el-menu-item index="/ads/platform/demand-card">需求卡片广告</el-menu-item>
            <el-menu-item index="/ads/platform/hall-banner">大厅横幅广告</el-menu-item>
            <el-menu-item index="/ads/platform/profile">个人中心广告</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/ads/advertiser">
            <template #title>
              <span>流量主广告</span>
            </template>
            <el-menu-item index="/ads/advertiser/feature1" disabled>待开发</el-menu-item>
            <el-menu-item index="/ads/advertiser/feature2" disabled>待开发</el-menu-item>
            <el-menu-item index="/ads/advertiser/feature3" disabled>待开发</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-sub-menu index="/pricing">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>收费管理</span>
          </template>
          <el-sub-menu index="/pricing/ads">
            <template #title>
              <span>平台广告收费</span>
            </template>
            <el-sub-menu index="/pricing/ads/splash">
              <template #title>
                <span>收费规则设置</span>
              </template>
              <el-menu-item index="/pricing/ads/splash">开屏广告</el-menu-item>
              <el-menu-item index="/pricing/ads/banner">轮播图广告</el-menu-item>
              <el-menu-item index="/pricing/ads/demand-card">需求卡片广告</el-menu-item>
              <el-menu-item index="/pricing/ads/hall-banner">大厅横幅广告</el-menu-item>
              <el-menu-item index="/pricing/ads/profile">个人中心广告</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/pricing/ads-funds">资金账户管理</el-menu-item>
            <el-menu-item index="/pricing/ads-invitation">邀请奖励规则</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/pricing/services">
            <template #title>
              <span>增值服务收费</span>
            </template>
            <el-menu-item index="/pricing/services">收费规则设置</el-menu-item>
            <el-menu-item index="/pricing/services-funds">资金账户管理</el-menu-item>
            <el-menu-item index="/pricing/services-invitation">邀请奖励规则</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-sub-menu index="/open-api">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>开放接口</span>
          </template>
          <el-menu-item index="/open-api/tencent-map">腾讯地图</el-menu-item>
          <el-menu-item index="/open-api/wechat-pay">微信支付</el-menu-item>
          <el-sub-menu index="/open-api/message-template">
            <template #title>
              <span>消息模板</span>
            </template>
            <el-menu-item index="/open-api/message-template/wechat">公众号消息模板</el-menu-item>
            <el-menu-item index="/open-api/message-template/miniprogram">小程序消息模板</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-sub-menu index="/stats">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </template>
          <el-sub-menu index="/stats/ads">
            <template #title>
              <span>广告数据</span>
            </template>
            <el-menu-item index="/stats/ads/report">广告投放报表</el-menu-item>
            <el-menu-item index="/stats/ads/finance">财务统计报表</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="/sensitive">
          <el-icon><WarnTriangleFilled /></el-icon>
          <span>敏感词管理</span>
        </el-menu-item>
        <el-menu-item index="/configs">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Clock /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
        <el-menu-item index="/attachments">
          <el-icon><Picture /></el-icon>
          <span>附件管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="admin-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="admin-name">超级管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <div class="footer-content">
          <p>© 2026 万物皆可AI管理后台</p>
          <p>技术支持：<a href="#" target="_blank">AI 技术团队</a></p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Odometer, User, Document, PriceTag, ChatDotRound, Grid, Star, Medal, Picture, Wallet, Connection, DataAnalysis, WarnTriangleFilled, Setting, Clock } from '@element-plus/icons-vue'

const router = useRouter()

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('admin_token')
    router.push('/login')
  } else if (command === 'profile') {
    alert('个人中心功能开发中')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  width: 240px !important;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden;
  transition: all 0.3s ease;
}

.logo {
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo h3 {
  font-size: 16px;
  margin-bottom: 4px;
  font-weight: 600;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-menu {
  border: none;
  background: transparent !important;
  font-size: 14px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.9);
  background: transparent !important;
  transition: all 0.3s ease;
  position: relative;
  margin: 4px 12px;
  border-radius: 8px;
  min-height: 44px;
  line-height: 44px;
  padding-left: 20px !important;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
  color: #fff;
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: #fff;
  border-radius: 0 4px 4px 0;
}

.sidebar-menu :deep(.el-sub-menu) {
  background: transparent !important;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  background: transparent !important;
  font-weight: 500;
}

.sidebar-menu :deep(.el-sub-menu__title)::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: rgba(0, 0, 0, 0.1) !important;
  margin: 4px 8px;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background: transparent !important;
  margin: 0;
  padding-left: 52px !important;
  border-radius: 0;
  border-left: 3px solid transparent;
  text-align: left;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item::before) {
  content: '';
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 78px !important;
  background: rgba(255, 255, 255, 0.03) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item::before) {
  left: 58px;
  width: 4px;
  height: 4px;
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 104px !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-sub-menu .el-menu-item::before) {
  left: 84px;
  width: 4px;
  height: 4px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%) !important;
  border-left-color: rgba(255, 255, 255, 0.6);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active)::before {
  background: #fff;
}

.sidebar-menu :deep(.el-icon) {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 10px;
}

.sidebar-menu :deep(.el-menu-item.is-disabled) {
  color: rgba(255, 255, 255, 0.4) !important;
  cursor: not-allowed;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.header-left {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.admin-info:hover {
  background: rgba(255, 255, 255, 0.25);
}

.admin-name {
  margin-left: 10px;
  font-size: 14px;
  color: #fff;
}

.main-content {
  background-color: #f5f7fa;
  flex: 1;
  overflow-y: auto;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 16px 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-size: 14px;
  color: #606266;
}

.footer-content a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-content a:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>