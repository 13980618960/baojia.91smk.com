import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '控制台' }
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/demands',
        name: 'Demands',
        component: () => import('@/views/demands/DemandList.vue'),
        meta: { title: '需求管理' }
      },
      {
        path: '/quotes',
        name: 'Quotes',
        component: () => import('@/views/quotes/QuoteList.vue'),
        meta: { title: '报价管理' }
      },
      {
        path: '/messages',
        name: 'Messages',
        component: () => import('@/views/messages/MessageList.vue'),
        meta: { title: '沟通记录' }
      },
      {
        path: '/categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoryList.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: '/personalization',
        name: 'Personalization',
        component: () => import('@/views/personalization/Personalization.vue'),
        meta: { title: '千人千面' }
      },
      {
        path: '/vip/demander',
        name: 'DemanderVip',
        component: () => import('@/views/vip/DemanderVip.vue'),
        meta: { title: 'D-vips管理' }
      },
      {
        path: '/vip/quoter',
        name: 'QuoterVip',
        component: () => import('@/views/vip/QuoterVip.vue'),
        meta: { title: 'Q-vips管理' }
      },

      {
        path: '/ads',
        name: 'Ads',
        component: () => import('@/views/ads/PlatformAd.vue'),
        meta: { title: '广告管理', icon: 'el-icon-picture' },
        children: [
          {
            path: 'platform',
            name: 'PlatformAds',
            meta: { title: '平台广告' },
            children: [
              {
                path: 'splash',
                name: 'SplashAd',
                component: () => import('@/views/ads/SplashAd.vue'),
                meta: { title: '开屏广告' }
              },
              {
                path: 'banner',
                name: 'BannerAd',
                component: () => import('@/views/ads/BannerAd.vue'),
                meta: { title: '轮播图广告' }
              },
              {
                path: 'demand-card',
                name: 'DemandCardAd',
                component: () => import('@/views/ads/DemandCardAd.vue'),
                meta: { title: '需求卡片广告' }
              },
              {
                path: 'hall-banner',
                name: 'HallBannerAd',
                component: () => import('@/views/ads/HallBannerAd.vue'),
                meta: { title: '大厅横幅广告' }
              },
              {
                path: 'profile',
                name: 'ProfileAd',
                component: () => import('@/views/ads/ProfileAd.vue'),
                meta: { title: '个人中心广告' }
              }
            ]
          },
          {
          path: 'advertiser',
          name: 'PublisherAds',
          component: () => import('@/views/ads/AdvertiserAd.vue'),
          meta: { title: '流量主广告' },
          children: [
            {
              path: 'feature1',
              name: 'AdvertiserFeature1',
              meta: { title: '待开发' }
            },
            {
              path: 'feature2',
              name: 'AdvertiserFeature2',
              meta: { title: '待开发' }
            },
            {
              path: 'feature3',
              name: 'AdvertiserFeature3',
              meta: { title: '待开发' }
            }
          ]
        }
        ]
      },
      {
        path: '/pricing',
        name: 'Pricing',
        component: () => import('@/views/pricing/Pricing.vue'),
        meta: { title: '收费管理' },
        children: [
          {
            path: 'ads/splash',
            name: 'PricingAdsSplash',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 收费规则设置 - 开屏广告' }
          },
          {
            path: 'ads/banner',
            name: 'PricingAdsBanner',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 收费规则设置 - 轮播图广告' }
          },
          {
            path: 'ads/demand-card',
            name: 'PricingAdsDemandCard',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 收费规则设置 - 需求卡片广告' }
          },
          {
            path: 'ads/hall-banner',
            name: 'PricingAdsHallBanner',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 收费规则设置 - 大厅横幅广告' }
          },
          {
            path: 'ads/profile',
            name: 'PricingAdsProfile',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 收费规则设置 - 个人中心广告' }
          },
          {
            path: 'ads-funds',
            name: 'PricingAdsFunds',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 资金账户管理' }
          },
          {
            path: 'ads-invitation',
            name: 'PricingAdsInvitation',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '平台广告收费 - 邀请奖励规则' }
          },
          {
            path: 'services',
            name: 'PricingServices',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '增值服务收费 - 收费规则设置' }
          },
          {
            path: 'services-funds',
            name: 'PricingServicesFunds',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '增值服务收费 - 资金账户管理' }
          },
          {
            path: 'services-invitation',
            name: 'PricingServicesInvitation',
            component: () => import('@/views/pricing/Pricing.vue'),
            meta: { title: '增值服务收费 - 邀请奖励规则' }
          }
        ]
      },
      {
        path: '/open-api/tencent-map',
        name: 'TencentMap',
        component: () => import('@/views/open-api/tencent-map/TencentMap.vue'),
        meta: { title: '腾讯地图' }
      },
      {
        path: '/open-api/wechat-pay',
        name: 'WechatPay',
        component: () => import('@/views/open-api/wechat-pay/WechatPay.vue'),
        meta: { title: '微信支付' }
      },
      {
        path: '/open-api/message-template/wechat',
        name: 'WechatMessageTemplate',
        component: () => import('@/views/open-api/message-template/WechatMessageTemplate.vue'),
        meta: { title: '公众号消息模板' }
      },
      {
        path: '/open-api/message-template/miniprogram',
        name: 'MiniprogramMessageTemplate',
        component: () => import('@/views/open-api/message-template/MiniprogramMessageTemplate.vue'),
        meta: { title: '小程序消息模板' }
      },
      {
        path: '/stats',
        name: 'Stats',
        component: () => import('@/views/stats/Stats.vue'),
        meta: { title: '数据统计' },
        children: [
          {
            path: 'ads',
            name: 'StatsAds',
            meta: { title: '广告数据' },
            children: [
              {
                path: 'report',
                name: 'AdsReport',
                component: () => import('@/views/stats/AdsReport.vue'),
                meta: { title: '广告投放报表' }
              },
              {
                path: 'finance',
                name: 'FinanceReport',
                component: () => import('@/views/stats/FinanceReport.vue'),
                meta: { title: '财务统计报表' }
              }
            ]
          }
        ]
      },
      {
        path: '/sensitive',
        name: 'Sensitive',
        component: () => import('@/views/sensitive/SensitiveList.vue'),
        meta: { title: '敏感词管理' }
      },
      {
        path: '/configs',
        name: 'Configs',
        component: () => import('@/views/configs/ConfigList.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: '/logs',
        name: 'Logs',
        component: () => import('@/views/logs/LogList.vue'),
        meta: { title: '操作日志' }
      },
      {
        path: '/attachments',
        name: 'Attachments',
        component: () => import('@/views/attachments/AttachmentList.vue'),
        meta: { title: '附件管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  // 如果已经是登录页但有 token，直接跳转到首页
  if (to.path === '/login' && token) {
    next('/')
  } 
  // 如果不是登录页且没有 token，跳转到登录页
  else if (to.path !== '/login' && !token) {
    next('/login')
  } 
  // 其他情况正常导航
  else {
    next()
  }
})

export default router