
# 万物皆可报管理后台 - 部署文档

## 🌐 项目概述

| 项目 | 地址 | 类型 |
|------|------|------|
| 前端 | https://baojia.91smk.com | Vue3 + Element Plus |
| 后端 | https://baojiaapi.91smk.com | Node.js + Express |

---

## 📋 环境要求

### 前端
- Node.js: **v16.20.2** (必须使用此版本)
- 构建工具: Vite 4.x

### 后端
- Node.js: v16+
- 数据库: MySQL 8.0+
- 进程管理: PM2

---

## 🚀 部署步骤

### 1. 前端部署

```bash
# 进入项目目录
cd /www/wwwroot/baojia.91smk.com

# 切换 Node 版本
export PATH=/www/server/nodejs/v16.20.2/bin:$PATH
node -v  # 确认是 v16.20.2

# 安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build

# 复制构建产物
rm -f index.html
cp -rf dist/* .

# 重启 Nginx
service nginx restart
```

### 2. 后端部署

```bash
# 进入项目目录
cd /www/wwwroot/baojiaapi.91smk.com

# 配置环境变量
cat > .env << 'EOF'
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=baojia_ai
DB_USER=baojia_ai
DB_PASSWORD=wanwujiekebao8ai
JWT_SECRET=baojia_admin_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
PORT=3000
HOST=0.0.0.0
EOF

# 启动服务
pm2 start app.js --name baojia-api
pm2 save
```

---

## 🔄 自动部署（已配置）

### 日常开发流程

```bash
# 前端项目
cd e:\www\wwwroot\baojia.91smk.com
git add .
git commit -m "your commit message"
git push origin main

# 后端项目
cd e:\www\wwwroot\baojiaapi.91smk.com
git add .
git commit -m "your commit message"
git push origin main
```

推送后自动执行：
1. 拉取最新代码
2. 智能检查依赖变更
3. 构建项目（前端）
4. 重启服务

---

## 🛠️ 故障排除

### 问题1：页面打不开

```bash
# 检查 Nginx 状态
service nginx status

# 检查前端文件
ls -la /www/wwwroot/baojia.91smk.com/index.html

# 查看 Nginx 日志
tail -f /www/wwwlogs/baojia.91smk.com.log
```

### 问题2：API 返回错误

```bash
# 检查后端状态
pm2 status baojia-api

# 查看后端日志
pm2 logs baojia-api

# 测试 API
curl http://127.0.0.1:3000/api/v1/categories/tree
```

### 问题3：构建失败

```bash
# 手动构建测试
cd /www/wwwroot/baojia.91smk.com
export PATH=/www/server/nodejs/v16.20.2/bin:$PATH
npm run build
```

### 问题4：数据库连接失败

```bash
# 检查数据库配置
cat /www/wwwroot/baojiaapi.91smk.com/.env

# 测试数据库连接
mysql -u baojia_ai -p -h localhost baojia_ai
```

---

## 📝 常用命令

| 操作 | 命令 |
|------|------|
| 重启前端 | `service nginx restart` |
| 重启后端 | `pm2 restart baojia-api` |
| 查看后端状态 | `pm2 status baojia-api` |
| 查看后端日志 | `pm2 logs baojia-api` |
| 查看前端日志 | `tail -f /www/wwwlogs/baojia.91smk.com.log` |
| 测试 API | `curl https://baojiaapi.91smk.com/api/v1/categories/tree` |

---

## 🔐 登录信息

| 项目 | 地址 | 用户名 | 密码 |
|------|------|--------|------|
| 管理后台 | https://baojia.91smk.com | admin | admin123 |

---

## 📅 部署记录

| 日期 | 操作 | 备注 |
|------|------|------|
| 2026-05-02 | 首次部署完成 | 配置自动部署脚本 |
| 2026-05-02 | 修复收费管理菜单 | 修复 API 路由和前端路由 |
| 2026-05-02 | 后端依赖修复 | 更换 npm 源解决 axios 包下载失败 |
| 2026-05-02 | 前端构建修复 | 修复 vite.config.js 中的 es 模块格式配置 |
| 2026-05-02 | ✅ 项目成功部署 | 前后端服务均正常运行 |

---

## 📝 部署备注

### 问题记录

| 序号 | 问题描述 | 原因 | 解决方案 |
|------|----------|------|----------|
| 1 | `axios@1.15.2` 包找不到 | npmmirror 镜像源问题 | `npm config set registry https://registry.npmmirror.com` |
| 2 | `pm2: command not found` | PM2 不在系统 PATH 中 | 使用完整路径 `/www/server/nodejs/v16.20.2/bin/pm2` |
| 3 | `--production` 参数警告 | 参数已废弃 | 使用 `--omit=dev` 替代 |
| 4 | `Cannot find module 'express'` | npm install 失败 | 删除 node_modules 后重新安装 |
| 5 | `Failed to resolve module specifier "vue"` | Vite 构建配置错误 | 移除 `format: 'es'` 配置，设置 `target: 'es2015'` |

### 关键配置

```bash
# PM2 完整路径
/www/server/nodejs/v16.20.2/bin/pm2

# npm 推荐配置
npm config set registry https://registry.npmmirror.com
npm config set cache /tmp/npm-cache
```

### 快速同步命令

```bash
# 前端更新（静态文件）
cd /www/wwwroot/baojia.91smk.com && git pull

# 前端更新（需要构建）
cd /www/wwwroot/baojia.91smk.com && git pull && npm install --omit=dev && npm run build

# 后端更新
cd /www/wwwroot/baojiaapi.91smk.com && git pull && npm install --omit=dev && /www/server/nodejs/v16.20.2/bin/pm2 restart baojia-api
```

### 注意事项

1. **Node.js 版本**：前端构建必须使用 v16.20.2
2. **PM2 命令**：宝塔终端需使用完整路径
3. **npm 参数**：使用 `--omit=dev` 替代过时的 `--production`
4. **npm 源**：如遇包下载失败，切换 npmmirror 源

---

**文档版本**: v1.1  
**最后更新**: 2026-05-02  
**维护者**: AI 技术团队
