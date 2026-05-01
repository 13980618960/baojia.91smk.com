<template>
  <div class="platform-ad">
    <el-card v-if="$route.path === '/ads/advertiser'">
      <template #header>
        <div class="card-header">
          <span>广告主广告管理</span>
        </div>
      </template>
      <div class="ad-overview">
        <el-row :gutter="20">
          <el-col :span="4" v-for="(item, index) in adTypes" :key="index">
            <el-card shadow="hover" class="overview-card" @click="navigateToAd(item.route)">
              <div class="overview-content">
                <div class="overview-icon" :class="item.iconClass">
                  <el-icon :size="32">{{ item.icon }}</el-icon>
                </div>
                <div class="overview-info">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div class="ad-guide">
        <el-card shadow="hover">
          <h3>广告管理指南</h3>
          <ul>
            <li><strong>开屏广告</strong>：App启动时展示的全屏广告，支持视频和图片</li>
            <li><strong>轮播图广告</strong>：首页顶部的轮播图片，吸引用户注意</li>
            <li><strong>需求卡片广告</strong>：需求列表中间穿插的广告，可设置展示频率</li>
            <li><strong>大厅横幅广告</strong>：需求大厅顶部的横幅广告，提升品牌曝光</li>
            <li><strong>个人中心广告</strong>：用户个人中心的广告，精准触达目标用户</li>
          </ul>
        </el-card>
      </div>
    </el-card>
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { VideoPlay, PictureFilled, Document, Menu, User } from '@element-plus/icons-vue'

const router = useRouter()

const adTypes = [
  {
    name: '开屏广告',
    description: 'App启动页',
    icon: VideoPlay,
    iconClass: 'splash-icon',
    route: '/ads/advertiser/splash'
  },
  {
    name: '轮播图广告',
    description: '首页顶部',
    icon: PictureFilled,
    iconClass: 'banner-icon',
    route: '/ads/advertiser/banner'
  },
  {
    name: '需求卡片广告',
    description: '需求列表',
    icon: Document,
    iconClass: 'demand-icon',
    route: '/ads/advertiser/demand-card'
  },
  {
    name: '大厅横幅广告',
    description: '需求大厅',
    icon: Menu,
    iconClass: 'hall-icon',
    route: '/ads/advertiser/hall-banner'
  },
  {
    name: '个人中心广告',
    description: '用户中心',
    icon: User,
    iconClass: 'profile-icon',
    route: '/ads/advertiser/profile'
  }
]

const navigateToAd = (route) => {
  router.push(route)
}
</script>

<style scoped>
.platform-ad {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.ad-overview {
  margin-bottom: 20px;
}

.overview-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.overview-card:hover {
  transform: translateY(-5px);
}

.overview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 15px;
}

.splash-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.demand-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.hall-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.profile-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.overview-info {
  text-align: center;
}

.overview-info h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
}

.overview-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.ad-guide {
  margin-top: 20px;
}

.ad-guide h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.ad-guide ul {
  margin: 0;
  padding-left: 20px;
}

.ad-guide li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
</style>
