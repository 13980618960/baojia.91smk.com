
# 自动部署文档

## 🚀 概述

本项目已配置完整的自动部署流程，修改代码后只需说一句话即可完成部署。

### ⚠️ 环境要求

| 项目 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | **v16.20.2** | 前端构建必须使用此版本 |
| **npm** | v8+ | 随 Node.js 安装 |
| **Git** | v2+ | 版本控制 |

---

## 📋 触发指令

以下指令均可触发自动部署：

| 指令 | 示例 |
|------|------|
| 推送代码 | "推送代码" |
| 同步代码 | "同步代码" |
| 同步宝塔 | "同步宝塔" |
| 保存代码 | "保存代码" |
| 推送 | "推送" |
| 同步 | "同步" |
| 保存 | "保存" |
| 上传 | "上传" |

---

## 🔄 工作流程

```
修改代码 → 说触发指令 → 自动提交推送 → 宝塔自动部署 → 刷新浏览器
```

### 详细步骤

1. **修改代码**：在 Trae CN 中编辑代码
2. **触发同步**：说"推送"、"同步"、"保存"或"上传"
3. **自动提交**：系统自动执行 `git add . && git commit && git push`
4. **宝塔部署**：宝塔自动拉取代码并部署
5. **查看效果**：等待约30秒后刷新浏览器

---

## 🔐 SSH 配置（重要）

### SSH 协议说明

**本项目已配置为使用 SSH 协议进行代码推送，这是自动部署的关键配置！**

| 协议 | 格式 | 是否需要密码 | 自动部署支持 |
|------|------|-------------|-------------|
| **SSH** | `git@github.com:user/repo.git` | ❌ 免密（密钥认证） | ✅ **支持** |
| HTTPS | `https://github.com/user/repo.git` | ✅ 需要输入密码 | ❌ **不支持** |

### 前端项目
```bash
origin  git@github.com:13980618960/baojia.91smk.com.git (fetch)
origin  git@github.com:13980618960/baojia.91smk.com.git (push)
```

### 后端项目
```bash
origin  git@github.com:13980618960/baojiaapi.91smk.com.git (fetch)
origin  git@github.com:13980618960/baojiaapi.91smk.com.git (push)
```

### 为什么必须使用 SSH？

1. **免密推送**：SSH 使用密钥认证，无需每次输入密码
2. **自动部署**：只有 SSH 方式才能实现无人值守的自动推送
3. **安全性**：密钥认证比密码认证更安全

> ✅ **已配置完成**：SSH 免密推送已配置，自动部署功能正常工作

---

## 📁 项目结构

```
e:\www\wwwroot\
├── baojia.91smk.com/          # 前端项目
│   └── .git/hooks/post-commit  # 前端自动推送钩子
└── baojiaapi.91smk.com/       # 后端项目
    └── .git/hooks/post-commit  # 后端自动推送钩子
```

---

## 📋 项目信息

| 项目 | 标题 | 仓库地址 | 分支 |
|------|------|----------|------|
| 前端 | baojia.91smk.com前端管理后台 | `git@github.com:13980618960/baojia.91smk.com.git` | main |
| 后端 | baojiaapi.91smk.com后端API | `git@github.com:13980618960/baojiaapi.91smk.com.git` | main |

---

## ⚡ 快速同步命令

### 前端更新
```bash
cd /www/wwwroot/baojia.91smk.com && git pull
```

### 后端更新
```bash
cd /www/wwwroot/baojiaapi.91smk.com && git pull && npm install --production && pm2 restart baojia-api
```

### Vue/React 项目（需要打包）
```bash
cd /www/wwwroot/baojia.91smk.com && git pull && npm install --production && npm run build
```

---

## 🧠 宝塔自动部署脚本

### 前端自动部署（宝塔）
```bash
#!/bin/bash
cd /www/wwwroot/baojia.91smk.com
git checkout main
git pull origin main
export PATH=/www/server/nodejs/v16.20.2/bin:$PATH

# 智能检查依赖变更
if git diff HEAD~1 HEAD --name-only | grep -E "(package\.json|package-lock\.json)" > /dev/null 2>&1; then
    npm install --legacy-peer-deps
fi

npm run build
rm -f index.html && cp -rf dist/* .
service nginx restart
```

### 后端自动部署（宝塔）
```bash
#!/bin/bash
cd /www/wwwroot/baojiaapi.91smk.com
git checkout main
git pull origin main
pm2 restart baojia-api
```

---

## ⏱️ 部署时间

| 操作 | 时间 |
|------|------|
| 拉取代码 | ~5秒 |
| 构建项目（前端） | ~15秒 |
| 重启服务 | ~5秒 |
| **总计** | **~25-30秒** |

---

## ✅ 配置状态

| 配置项 | 状态 |
|--------|------|
| SSH 推送 | ✅ 已配置 |
| 自动推送钩子 | ✅ 已配置 |
| 宝塔自动部署 | ✅ 已配置 |
| 智能依赖检查 | ✅ 已配置 |

---

## 📝 使用示例

**用户**："同步"

**系统执行**：
```bash
# 前端
cd e:\www\wwwroot\baojia.91smk.com
git add .
git commit -m "auto: 同步代码"
git push origin main

# 后端
cd e:\www\wwwroot\baojiaapi.91smk.com
git add .
git commit -m "auto: 同步代码"
git push origin main
```

**结果**：宝塔自动部署，等待约30秒后刷新浏览器即可看到最新效果！

---

## 🛠️ 手动部署（备用）

如果自动部署失败，可手动执行：

```bash
# 前端
cd /www/wwwroot/baojia.91smk.com
git pull origin main
npm run build
rm -f index.html && cp -rf dist/* .
service nginx restart

# 后端
cd /www/wwwroot/baojiaapi.91smk.com
git pull origin main
pm2 restart baojia-api
```

---

**文档版本**: v1.0  
**最后更新**: 2026-05-02  
**维护者**: AI 技术团队
