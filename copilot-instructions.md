# GitHub Copilot 使用指南

本项目是"基于开源AI大模型的教学实训智能体软件"前端部分，使用 Vue3 + Vite + TypeScript + Element Plus 开发。以下是使用 GitHub Copilot 辅助开发的指南。

## 技术栈

- Vue3 + Vite
- TypeScript
- Element Plus UI 框架
- Vue Router 4
- Pinia 状态管理
- ECharts 图表库
- Axios 请求库

## 使用 Copilot 进行开发

### 常见开发场景

1. **编写新组件**

   ```typescript
   // 提示: 创建一个带有基本生命周期的 Vue3 组件
   ```

2. **定义类型**

   ```typescript
   // 提示: 为学生考试成绩数据定义 TypeScript 接口
   ```

3. **处理 API 请求**

   ```typescript
   // 提示: 创建获取课程列表的 API 请求函数
   ```

4. **实现路由配置**

   ```typescript
   // 提示: 为管理员端添加资源管理路由配置
   ```

5. **编写 Pinia Store**

   ```typescript
   // 提示: 创建管理考试数据的 Pinia store
   ```

### 项目结构提示

项目使用以下结构：

- `src/views/admin/` - 管理员端页面
- `src/views/teacher/` - 教师端页面
- `src/views/student/` - 学生端页面
- `src/components/` - 公共组件
- `src/api/` - API 请求函数
- `src/store/` - Pinia 状态管理
- `src/types/` - TypeScript 类型定义
- `src/utils/` - 工具函数
- `src/router/` - 路由配置
- `src/layouts/` - 布局组件

### 命名约定

- 组件文件: PascalCase (如 `UserProfile.vue`)
- API 请求函数: camelCase (如 `getUserList`)
- 类型定义: PascalCase (如 `interface UserInfo`)
- Store 文件: camelCase (如 `user.ts`)
- 工具函数: camelCase (如 `formatDate`)

### 生成代码模式

1. **提供明确的上下文**：描述需要生成的代码的上下文，包括相关的类型、组件或 API。

2. **指定技术细节**：明确说明使用的技术栈组件（如 Element Plus、ECharts）。

3. **包含功能描述**：描述要实现的功能，包括交互方式、数据流向等。

4. **参考已有代码**：引用项目中已有的代码模式，以确保一致性。

## 主要功能模块

- 智能备课
- 考核生成
- 学情分析
- 在线学习助手
- 资源管理
- 大屏数据可视化

## 角色权限

- 管理员：系统管理、用户管理、资源管理、数据统计
- 教师：课程管理、备课、考核生成、学情分析
- 学生：学习、练习、智能助手、学情查看

## 示例提示

```
// 为练习评测页面创建一个评分卡片组件
```

```
// 实现学生端仪表盘的学习进度图表
```

```
// 创建管理员批量导入用户的功能
```
