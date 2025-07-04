<template>
  <div class="student-dashboard">
    <el-row :gutter="20">
      <!-- 学生个人信息卡片 -->
      <el-col :span="24">
        <el-card class="profile-card">
          <div class="profile-content">
            <div class="profile-avatar">
              <el-avatar :size="80" src="https://avatars.githubusercontent.com/u/1?v=4" />
            </div>
            <div class="profile-info">
              <h2 class="profile-name">张三 <small>计算机科学2202班</small></h2>
              <div class="profile-metrics">
                <div class="metric">
                  <div class="metric-value">85</div>
                  <div class="metric-label">平均分</div>
                </div>
                <div class="metric">
                  <div class="metric-value">92%</div>
                  <div class="metric-label">完成率</div>
                </div>
                <div class="metric">
                  <div class="metric-value">42h</div>
                  <div class="metric-label">学习时长</div>
                </div>
                <div class="metric">
                  <div class="metric-value">24</div>
                  <div class="metric-label">积分排名</div>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <el-button type="primary" @click="$router.push('/student/learning-assistant')">
                <el-icon><ChatDotRound /></el-icon>AI学习助手
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 待完成任务 -->
      <el-col :span="16">
        <el-card class="tasks-card">
          <template #header>
            <div class="card-header">
              <h3>待完成任务</h3>
              <el-select v-model="taskFilter" size="small">
                <el-option label="所有任务" value="all" />
                <el-option label="作业" value="homework" />
                <el-option label="考试" value="exam" />
                <el-option label="实验" value="lab" />
              </el-select>
            </div>
          </template>
          
          <el-table :data="filteredTasks" style="width: 100%">
            <el-table-column prop="title" label="任务名称" min-width="200" />
            <el-table-column prop="course" label="所属课程" width="150" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getTaskTypeTag(scope.row.type)" size="small">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column label="剩余时间" width="100">
              <template #default="scope">
                <span :class="{ 'text-warning': isUrgent(scope.row.deadline) }">
                  {{ getRemainingTime(scope.row.deadline) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button link type="primary" @click="startTask(scope.row)">开始</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 通知公告 -->
      <el-col :span="8">
        <el-card class="notices-card">
          <template #header>
            <div class="card-header">
              <h3>通知公告</h3>
              <el-button link @click="viewAllNotices">
                <el-icon><More /></el-icon>查看全部
              </el-button>
            </div>
          </template>
          
          <div class="notices-container">
            <div
              v-for="(notice, index) in notices"
              :key="index"
              class="notice-item"
              :class="{ 'unread': !notice.read }"
              @click="readNotice(index)"
            >
              <div class="notice-badge" :class="getNoticeBadgeClass(notice.type)"></div>
              <div class="notice-content">
                <div class="notice-header">
                  <span class="notice-title">{{ notice.title }}</span>
                  <span v-if="!notice.read" class="unread-dot"></span>
                </div>
                <div class="notice-desc">{{ notice.description }}</div>
                <div class="notice-meta">
                  <span class="notice-publisher">{{ notice.publisher }}</span>
                  <span class="notice-time">{{ notice.publishTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 学习进度 -->
      <el-col :span="12">
        <el-card class="progress-card">
          <template #header>
            <div class="card-header">
              <h3>课程学习进度</h3>
              <el-tooltip content="学习进度按照课程内容完成比例计算">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <div class="courses-progress">
            <div v-for="(course, index) in courses" :key="index" class="course-progress-item">
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="progress-percentage">{{ course.progress }}%</div>
              </div>
              <el-progress :percentage="course.progress" :color="getCourseProgressColor(course.progress)" />
              <div class="course-meta">
                <span class="course-teacher">{{ course.teacher }}</span>
                <span class="course-next">下次课：{{ course.nextClass }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 学习统计 -->
      <el-col :span="12">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <h3>学习统计</h3>
              <el-radio-group v-model="statsTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <v-chart class="chart" :option="studyStatsOption" />
        </el-card>
      </el-col>

      <!-- 学习推荐 -->
      <el-col :span="24">
        <el-card class="recommendations-card">
          <template #header>
            <div class="card-header">
              <h3>学习推荐</h3>
              <el-tabs v-model="recommendationType" class="recommendation-tabs">
                <el-tab-pane label="知识点" name="knowledge" />
                <el-tab-pane label="练习" name="exercise" />
                <el-tab-pane label="资源" name="resource" />
              </el-tabs>
            </div>
          </template>
          
          <!-- 知识点推荐 -->
          <div v-if="recommendationType === 'knowledge'" class="recommendation-list knowledge-list">
            <div v-for="(knowledge, index) in recommendedKnowledge" :key="index" class="recommendation-item knowledge-item" @click="viewKnowledge(knowledge)">
              <div class="recommendation-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="recommendation-content">
                <div class="recommendation-title">{{ knowledge.title }}</div>
                <div class="recommendation-desc">{{ knowledge.description }}</div>
                <div class="recommendation-meta">
                  <el-tag size="small" effect="plain">{{ knowledge.course }}</el-tag>
                  <div class="recommendation-reason">
                    <el-icon><Connection /></el-icon>
                    {{ knowledge.recommendReason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 练习推荐 -->
          <div v-else-if="recommendationType === 'exercise'" class="recommendation-list exercise-list">
            <div v-for="(exercise, index) in recommendedExercises" :key="index" class="recommendation-item exercise-item" @click="startExercise(exercise)">
              <div class="recommendation-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="recommendation-content">
                <div class="recommendation-title">{{ exercise.title }}</div>
                <div class="recommendation-desc">{{ exercise.description }}</div>
                <div class="recommendation-meta">
                  <div class="exercise-info">
                    <el-tag size="small" :type="getExerciseTypeColor(exercise.type)" effect="plain">{{ exercise.type }}</el-tag>
                    <span class="exercise-difficulty">
                      难度：
                      <el-rate
                        v-model="exercise.difficulty"
                        :max="5"
                        disabled
                        size="small"
                        text-color="#ff9900"
                      />
                    </span>
                  </div>
                  <div class="recommendation-reason">
                    <el-icon><Connection /></el-icon>
                    {{ exercise.recommendReason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 资源推荐 -->
          <div v-else class="recommendation-list resource-list">
            <div v-for="(resource, index) in recommendedResources" :key="index" class="recommendation-item resource-item" @click="viewResource(resource)">
              <div class="recommendation-icon" :class="getResourceIconClass(resource.type)">
                <el-icon><component :is="getResourceIcon(resource.type)" /></el-icon>
              </div>
              <div class="recommendation-content">
                <div class="recommendation-title">{{ resource.title }}</div>
                <div class="recommendation-desc">{{ resource.description }}</div>
                <div class="recommendation-meta">
                  <div class="resource-info">
                    <el-tag size="small" effect="plain">{{ resource.course }}</el-tag>
                    <span class="resource-type">{{ resource.type }}</span>
                  </div>
                  <div class="recommendation-reason">
                    <el-icon><Connection /></el-icon>
                    {{ resource.recommendReason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 错题集与知识掌握度 -->
      <el-col :span="12">
        <el-card class="mistakes-card">
          <template #header>
            <div class="card-header">
              <h3>错题统计</h3>
              <el-button link @click="$router.push('/student/practice')">
                <el-icon><View /></el-icon>查看错题集
              </el-button>
            </div>
          </template>
          
          <v-chart class="chart" :option="mistakesChartOption" />
        </el-card>
      </el-col>

      <!-- 学习伙伴 -->
      <el-col :span="12">
        <el-card class="peers-card">
          <template #header>
            <div class="card-header">
              <h3>学习伙伴</h3>
              <el-button link>
                <el-icon><Plus /></el-icon>添加伙伴
              </el-button>
            </div>
          </template>
          
          <div class="peers-container">
            <div v-for="(peer, index) in learningPeers" :key="index" class="peer-item">
              <el-avatar :size="40" :src="peer.avatar" />
              <div class="peer-info">
                <div class="peer-name">{{ peer.name }}</div>
                <div class="peer-meta">
                  <span class="peer-class">{{ peer.class }}</span>
                  <el-tag size="small" :type="getActivityLevelType(peer.activityLevel)">{{ peer.activityLevel }}</el-tag>
                </div>
              </div>
              <div class="peer-actions">
                <el-tooltip content="共同学习">
                  <el-button circle size="small">
                    <el-icon><Reading /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="发送消息">
                  <el-button circle size="small">
                    <el-icon><ChatDotRound /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  ChatDotRound, More, InfoFilled, Reading, EditPen, Connection, 
  View, Plus, Document, VideoCamera, Link, Notebook
} from '@element-plus/icons-vue'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart, LineChart, PieChart, RadarChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent
])

const router = useRouter()

// 状态变量
const taskFilter = ref('all')
const statsTimeRange = ref('week')
const recommendationType = ref('knowledge')

// 任务列表（模拟数据）
const tasks = ref([
  {
    id: 1,
    title: '数据结构期中作业',
    course: '数据结构与算法',
    type: '作业',
    deadline: '2023-11-05 23:59',
    urgent: false
  },
  {
    id: 2,
    title: '计算机网络实验报告',
    course: '计算机网络',
    type: '实验',
    deadline: '2023-11-08 23:59',
    urgent: false
  },
  {
    id: 3,
    title: '软件工程在线测验',
    course: '软件工程导论',
    type: '考试',
    deadline: '2023-11-02 20:00',
    urgent: true
  },
  {
    id: 4,
    title: '人工智能课程讨论',
    course: '人工智能导论',
    type: '讨论',
    deadline: '2023-11-10 23:59',
    urgent: false
  }
])

// 通知列表（模拟数据）
const notices = ref([
  {
    id: 1,
    title: '数据结构期中考试通知',
    description: '期中考试将于11月15日在主教学楼306教室进行，请携带学生证和必要文具。',
    type: 'exam',
    publisher: '张教授',
    publishTime: '2023-10-28',
    read: false
  },
  {
    id: 2,
    title: '计算机网络实验安排变更',
    description: '原定于周三的实验课调整到周五下午3点，地点不变。',
    type: 'course',
    publisher: '李教授',
    publishTime: '2023-10-30',
    read: false
  },
  {
    id: 3,
    title: '软件工程课程资料已更新',
    description: '软件工程课程新增设计模式相关资料，请前往课程资源下载。',
    type: 'resource',
    publisher: '教务系统',
    publishTime: '2023-11-01',
    read: true
  },
  {
    id: 4,
    title: '校园文化节活动通知',
    description: '校园文化节将于11月15日-11月20日举行，欢迎踊跃参与各项活动。',
    type: 'system',
    publisher: '学生处',
    publishTime: '2023-11-01',
    read: true
  }
])

// 课程进度（模拟数据）
const courses = ref([
  {
    id: 1,
    name: '数据结构与算法',
    progress: 75,
    teacher: '张教授',
    nextClass: '周三 08:00-09:30'
  },
  {
    id: 2,
    name: '计算机网络',
    progress: 68,
    teacher: '李教授',
    nextClass: '周四 14:00-15:30'
  },
  {
    id: 3,
    name: '软件工程导论',
    progress: 85,
    teacher: '王教授',
    nextClass: '周五 10:00-11:30'
  },
  {
    id: 4,
    name: '人工智能导论',
    progress: 92,
    teacher: '赵教授',
    nextClass: '周一 14:00-15:30'
  }
])

// 知识点推荐（模拟数据）
const recommendedKnowledge = ref([
  {
    id: 1,
    title: '二叉树的遍历算法',
    description: '深度理解前序、中序、后序和层序遍历的实现与应用',
    course: '数据结构与算法',
    recommendReason: '基于你最近的学习进度推荐'
  },
  {
    id: 2,
    title: 'TCP/IP协议族',
    description: 'TCP与UDP的区别、TCP的三次握手与四次挥手过程',
    course: '计算机网络',
    recommendReason: '你的相关习题正确率较低'
  },
  {
    id: 3,
    title: '设计模式：观察者模式',
    description: '理解并掌握观察者模式的核心思想与实现方法',
    course: '软件工程导论',
    recommendReason: '下周课程将会讲解此内容'
  }
])

// 习题推荐（模拟数据）
const recommendedExercises = ref([
  {
    id: 1,
    title: '哈希表冲突解决方案',
    description: '分析并比较开放寻址法和链地址法两种冲突解决策略',
    type: '简答题',
    difficulty: 4,
    course: '数据结构与算法',
    recommendReason: '针对你的薄弱知识点'
  },
  {
    id: 2,
    title: '排序算法效率比较',
    description: '实现快速排序和归并排序，并分析其时间复杂度',
    type: '编程题',
    difficulty: 3,
    course: '数据结构与算法',
    recommendReason: '强化编程能力'
  },
  {
    id: 3,
    title: 'IPv4与IPv6地址格式',
    description: '比较IPv4和IPv6的地址格式与特点',
    type: '概念题',
    difficulty: 2,
    course: '计算机网络',
    recommendReason: '巩固基础知识'
  }
])

// 资源推荐（模拟数据）
const recommendedResources = ref([
  {
    id: 1,
    title: '数据结构与算法分析（第3版）',
    description: '经典教材，深入浅出地讲解数据结构与算法设计',
    type: '电子书',
    course: '数据结构与算法',
    recommendReason: '适合深入学习'
  },
  {
    id: 2,
    title: 'TCP/IP详解 视频教程',
    description: '通过动画演示深入理解网络协议的工作原理',
    type: '视频',
    course: '计算机网络',
    recommendReason: '生动形象易于理解'
  },
  {
    id: 3,
    title: '设计模式实战指南',
    description: '23种设计模式的实际应用案例与代码实现',
    type: '实验',
    course: '软件工程导论',
    recommendReason: '提升代码设计能力'
  }
])

// 学习伙伴（模拟数据）
const learningPeers = ref([
  {
    id: 1,
    name: '李四',
    class: '计科2202班',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    activityLevel: '活跃'
  },
  {
    id: 2,
    name: '王五',
    class: '计科2202班',
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    activityLevel: '一般'
  },
  {
    id: 3,
    name: '赵六',
    class: '软工2201班',
    avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
    activityLevel: '非常活跃'
  },
  {
    id: 4,
    name: '钱七',
    class: '人工智能2201班',
    avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
    activityLevel: '活跃'
  }
])

// 过滤后的任务列表
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') {
    return tasks.value
  }
  
  const typeMap = {
    'homework': '作业',
    'exam': '考试',
    'lab': '实验'
  }
  
  return tasks.value.filter(task => task.type === typeMap[taskFilter.value as keyof typeof typeMap])
})

// 学习统计图表配置
const studyStatsOption = computed(() => {
  const isWeek = statsTimeRange.value === 'week'
  const xAxisData = isWeek
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : ['第1周', '第2周', '第3周', '第4周']
  
  return {
    title: {
      text: isWeek ? '本周学习情况' : '本月学习情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['学习时长(小时)', '完成任务数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xAxisData
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '学习时长',
        min: 0,
        max: 6,
        position: 'left',
        axisLabel: {
          formatter: '{value}h'
        }
      },
      {
        type: 'value',
        name: '任务数',
        min: 0,
        max: 10,
        position: 'right'
      }
    ],
    series: [
      {
        name: '学习时长(小时)',
        type: 'bar',
        data: isWeek
          ? [2.5, 3.2, 1.8, 4.0, 3.5, 2.0, 1.5]
          : [18.5, 20.2, 22.8, 19.0]
      },
      {
        name: '完成任务数',
        type: 'line',
        yAxisIndex: 1,
        data: isWeek
          ? [2, 3, 1, 5, 4, 2, 1]
          : [12, 15, 18, 14]
      }
    ]
  }
})

// 错题统计图表配置
const mistakesChartOption = computed(() => {
  return {
    title: {
      text: '错题分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['数据结构', '计算机网络', '软件工程', '人工智能']
    },
    series: [
      {
        name: '错题数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 12, name: '数据结构' },
          { value: 8, name: '计算机网络' },
          { value: 5, name: '软件工程' },
          { value: 3, name: '人工智能' }
        ]
      }
    ]
  }
})

// 获取任务类型标签样式
const getTaskTypeTag = (type: string) => {
  switch(type) {
    case '作业': return ''
    case '考试': return 'danger'
    case '实验': return 'warning'
    case '讨论': return 'success'
    default: return 'info'
  }
}

// 判断任务是否紧急
const isUrgent = (deadline: string) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 2
}

// 获取剩余时间文本
const getRemainingTime = (deadline: string) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return '已过期'
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `${diffDays}天后`
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}小时后`
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes}分钟后`
}

// 获取通知类型样式
const getNoticeBadgeClass = (type: string) => {
  switch(type) {
    case 'exam': return 'badge-danger'
    case 'course': return 'badge-warning'
    case 'resource': return 'badge-success'
    default: return 'badge-info'
  }
}

// 获取课程进度颜色
const getCourseProgressColor = (progress: number) => {
  if (progress >= 85) return '#67C23A'
  if (progress >= 70) return '#409EFF'
  if (progress >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 获取习题类型颜色
const getExerciseTypeColor = (type: string) => {
  switch(type) {
    case '概念题': return ''
    case '填空题': return 'success'
    case '简答题': return 'warning'
    case '编程题': return 'danger'
    default: return 'info'
  }
}

// 获取资源图标
const getResourceIcon = (type: string) => {
  switch(type) {
    case '电子书': return Document
    case '视频': return VideoCamera
    case '实验': return Notebook
    default: return Link
  }
}

// 获取资源图标样式
const getResourceIconClass = (type: string) => {
  switch(type) {
    case '电子书': return 'resource-icon document'
    case '视频': return 'resource-icon video'
    case '实验': return 'resource-icon experiment'
    default: return 'resource-icon link'
  }
}

// 获取活跃度标签类型
const getActivityLevelType = (level: string) => {
  switch(level) {
    case '非常活跃': return 'success'
    case '活跃': return 'primary'
    case '一般': return 'warning'
    case '不活跃': return 'info'
    default: return 'info'
  }
}

// 开始任务
const startTask = (task: any) => {
  ElMessage.success(`开始任务：${task.title}`)
  
  // 根据任务类型跳转到不同页面
  if (task.type === '作业' || task.type === '实验') {
    router.push('/student/practice')
  } else if (task.type === '考试') {
    ElMessage.info('正在准备考试环境...')
  } else if (task.type === '讨论') {
    router.push('/student/learning-assistant')
  }
}

// 查看所有通知
const viewAllNotices = () => {
  ElMessage.info('查看所有通知')
}

// 阅读通知
const readNotice = (index: number) => {
  notices.value[index].read = true
  ElMessage.info(`已阅读：${notices.value[index].title}`)
}

// 查看知识点
const viewKnowledge = (knowledge: any) => {
  ElMessage.info(`查看知识点：${knowledge.title}`)
}

// 开始练习
const startExercise = (exercise: any) => {
  ElMessage.success(`开始练习：${exercise.title}`)
  router.push('/student/practice')
}

// 查看资源
const viewResource = (resource: any) => {
  ElMessage.info(`查看资源：${resource.title}`)
}

onMounted(() => {
  // 可以在这里加载个人数据
})
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 个人资料卡片 */
.profile-card {
  margin-bottom: 20px;
}

.profile-content {
  display: flex;
  align-items: center;
}

.profile-avatar {
  margin-right: 20px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 10px 0;
}

.profile-name small {
  font-weight: normal;
  color: #909399;
  margin-left: 10px;
  font-size: 16px;
}

.profile-metrics {
  display: flex;
  gap: 30px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
}

.metric-label {
  color: #606266;
  font-size: 13px;
}

/* 任务卡片 */
.tasks-card {
  height: 100%;
  margin-bottom: 20px;
}

.text-warning {
  color: #f56c6c;
  font-weight: bold;
}

/* 通知卡片 */
.notices-card {
  height: 100%;
  margin-bottom: 20px;
}

.notices-container {
  max-height: 350px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-item:hover {
  background-color: #f5f7fa;
}

.notice-item.unread {
  background-color: #f0f9ff;
}

.notice-badge {
  width: 4px;
  margin-right: 10px;
}

.badge-danger {
  background-color: #f56c6c;
}

.badge-warning {
  background-color: #e6a23c;
}

.badge-success {
  background-color: #67c23a;
}

.badge-info {
  background-color: #909399;
}

.notice-content {
  flex: 1;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notice-title {
  font-weight: bold;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.notice-desc {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

/* 课程进度卡片 */
.progress-card {
  height: 100%;
  margin-bottom: 20px;
}

.courses-progress {
  max-height: 350px;
  overflow-y: auto;
}

.course-progress-item {
  margin-bottom: 20px;
}

.course-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.course-name {
  font-weight: bold;
}

.progress-percentage {
  color: #606266;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

/* 统计卡片 */
.stats-card {
  height: 100%;
  margin-bottom: 20px;
}

.chart {
  height: 350px;
}

/* 推荐卡片 */
.recommendations-card {
  margin-bottom: 20px;
}

.recommendation-tabs {
  margin-bottom: 0;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.recommendation-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.recommendation-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 15px;
}

.resource-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.resource-icon.document {
  background-color: #409eff;
}

.resource-icon.video {
  background-color: #f56c6c;
}

.resource-icon.experiment {
  background-color: #67c23a;
}

.resource-icon.link {
  background-color: #909399;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.recommendation-desc {
  color: #606266;
  font-size: 13px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-reason {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 12px;
}

.exercise-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exercise-difficulty {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-type {
  color: #909399;
  font-size: 12px;
}

/* 错题统计卡片 */
.mistakes-card {
  height: 100%;
  margin-bottom: 20px;
}

/* 学习伙伴卡片 */
.peers-card {
  height: 100%;
  margin-bottom: 20px;
}

.peers-container {
  max-height: 350px;
  overflow-y: auto;
}

.peer-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.peer-item:last-child {
  border-bottom: none;
}

.peer-info {
  flex: 1;
  margin-left: 10px;
}

.peer-name {
  font-weight: bold;
}

.peer-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.peer-class {
  color: #909399;
  font-size: 12px;
}

.peer-actions {
  display: flex;
  gap: 5px;
}

@media (max-width: 768px) {
  .recommendation-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
