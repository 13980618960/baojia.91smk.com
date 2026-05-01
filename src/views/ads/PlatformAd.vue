<template>
  <div class="platform-ad">
    <el-card v-if="$route.path === '/ads'">
      <template #header>
        <div class="card-header">
          <span>广告管理</span>
        </div>
      </template>
      <div class="api-content">
        <el-card shadow="hover" class="api-card">
          <div class="api-settings">
            <h4>平台广告</h4>
            <div class="ad-grid">
              <el-card shadow="hover" class="ad-card" @click="navigateTo('/ads/platform/splash')">
                <div class="ad-icon">
                  <i class="el-icon-video-camera"></i>
                </div>
                <h5>开屏广告</h5>
                <p>App启动时展示的全屏广告，支持视频和图片</p>
              </el-card>
              <el-card shadow="hover" class="ad-card" @click="navigateTo('/ads/platform/banner')">
                <div class="ad-icon">
                  <i class="el-icon-picture-outline"></i>
                </div>
                <h5>轮播图广告</h5>
                <p>首页顶部的轮播图片，吸引用户注意</p>
              </el-card>
              <el-card shadow="hover" class="ad-card" @click="navigateTo('/ads/platform/demand-card')">
                <div class="ad-icon">
                  <i class="el-icon-document"></i>
                </div>
                <h5>需求卡片广告</h5>
                <p>需求列表中间穿插的广告，可设置展示频率</p>
              </el-card>
              <el-card shadow="hover" class="ad-card" @click="navigateTo('/ads/platform/hall-banner')">
                <div class="ad-icon">
                  <i class="el-icon-s-unfold"></i>
                </div>
                <h5>大厅横幅广告</h5>
                <p>需求大厅顶部的横幅广告，提升品牌曝光</p>
              </el-card>
              <el-card shadow="hover" class="ad-card" @click="navigateTo('/ads/platform/profile')">
                <div class="ad-icon">
                  <i class="el-icon-user"></i>
                </div>
                <h5>个人中心广告</h5>
                <p>用户个人中心的广告，精准触达目标用户</p>
              </el-card>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    <router-view v-else />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.platform-ad {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-content {
  margin-top: 20px;
}

.api-card {
  margin-bottom: 20px;
}

.api-settings {
  padding: 20px 0;
}

.api-settings h4 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.ad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.ad-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.ad-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.ad-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
  text-align: center;
}

.ad-card h5 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.ad-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  text-align: center;
}
</style>
