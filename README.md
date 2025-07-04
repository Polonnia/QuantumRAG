HEAD
# 基于开源AI大模型的教学实训智能体软件前端

这是为"基于开源AI大模型的教学实训智能体软件"比赛项目开发的前端系统，使用 Vue3 + Vite + TypeScript + Element Plus 技术栈开发。

## 项目特点

- 多角色系统：教师、学生、管理员三端分离
- 智能化功能：AI辅助备课、考核生成、学习助手等
- 数据可视化：丰富的图表展示学情分析和系统运行状态
- 响应式设计：适配不同设备的界面布局

## 主要功能模块

### 教师端

- 智能备课：AI辅助课程内容生成与知识点管理
- 考核生成：自动生成试题与评分标准
- 学情分析：学生学习数据可视化与个性化分析
- 教学仪表盘：课程进度、班级状态、任务管理等

### 学生端

- 在线学习助手：AI对话、知识引用、资源推荐
- 练习与评测：自动评分与错题管理
- 学习仪表盘：个人学习进度、任务提醒、统计分析

### 管理员端

- 用户管理：教师与学生账号维护
- 资源管理：学习资料上传、分类与权限设置
- 系统监控：平台使用数据与性能监控
- 数据大屏：系统整体运行状态可视化

## 技术栈

- **前端框架**：Vue 3.5.x + Vite 7.x
- **类型系统**：TypeScript 5.8.x
- **UI框架**：Element Plus 2.10.x
- **状态管理**：Pinia 3.x
- **路由管理**：Vue Router 4.5.x
- **图表库**：ECharts 5.6.x (通过 vue-echarts 集成)
- **HTTP客户端**：Axios

## 项目结构

```text
src/
├── api/            # API请求函数
├── assets/         # 静态资源
├── components/     # 公共组件
├── layouts/        # 布局组件
├── router/         # 路由配置
├── store/          # Pinia状态管理
├── types/          # TypeScript类型定义
├── utils/          # 工具函数
└── views/          # 页面组件
    ├── admin/      # 管理员页面
    ├── teacher/    # 教师页面
    └── student/    # 学生页面
```

## 开发指南

### 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 安装依赖

```bash
npm install
```

### 开发服务器启动

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 登录角色

系统支持三种角色登录：

- 管理员账号：admin / password
- 教师账号：teacher / password
- 学生账号：student / password

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
# QuantumRAG
 998a31162b4929d6118795f5d3a85ced112a7a8e
