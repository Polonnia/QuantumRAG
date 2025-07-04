<template>
  <div class="teacher-dashboard">
    <el-row :gutter="20">
      <!-- 顶部统计卡片 -->
      <el-col :span="6" v-for="(stat, index) in statisticsData" :key="index">
        <el-card class="stat-card" :style="{ borderTop: `4px solid ${stat.color}` }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ color: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend" :class="{ 'up': stat.trend > 0, 'down': stat.trend < 0 }">
              <el-icon v-if="stat.trend > 0"><CaretTop /></el-icon>
              <el-icon v-else-if="stat.trend < 0"><CaretBottom /></el-icon>
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="period">较上月</span>
          </div>
        </el-card>
      </el-col>

      <!-- 教学进度 -->
      <el-col :span="16">
        <el-card class="main-chart-card">
          <template #header>
            <div class="card-header">
              <h3>教学进度</h3>
              <el-radio-group v-model="progressChartType" size="small">
                <el-radio-button label="weekly">周视图</el-radio-button>
                <el-radio-button label="monthly">月视图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="teachingProgressOption" />
        </el-card>
      </el-col>

      <!-- 今日事项 -->
      <el-col :span="8">
        <el-card class="today-tasks-card">
          <template #header>
            <div class="card-header">
              <h3>今日事项</h3>
              <el-button link>
                <el-icon><Plus /></el-icon>添加
              </el-button>
            </div>
          </template>
          <div class="tasks-container">
            <el-timeline>
              <el-timeline-item
                v-for="(task, index) in todayTasks"
                :key="index"
                :type="getTaskType(task.status)"
                :color="getTaskColor(task.status)"
                :timestamp="task.time"
              >
                <div class="task-item" :class="{ 'completed': task.status === 'completed' }">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-desc">{{ task.description }}</div>
                  <div v-if="task.status !== 'completed'" class="task-actions">
                    <el-button size="small" @click="markTaskCompleted(index)">标记完成</el-button>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

      <!-- 近期考核情况 -->
      <el-col :span="12">
        <el-card class="exams-card">
          <template #header>
            <div class="card-header">
              <h3>近期考核情况</h3>
              <el-button link @click="$router.push('/teacher/exam-generator')">
                <el-icon><Plus /></el-icon>创建考核
              </el-button>
            </div>
          </template>
          
          <el-table :data="recentExams" stripe style="width: 100%">
            <el-table-column prop="title" label="考核名称" min-width="150" />
            <el-table-column prop="className" label="班级" width="150" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getExamStatusType(scope.row.status)">
                  {{ getExamStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="平均分" width="100">
              <template #default="scope">
                <span v-if="scope.row.avgScore">{{ scope.row.avgScore }}</span>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button link type="primary" @click="viewExamDetail(scope.row)">查看</el-button>
                <el-button v-if="scope.row.status === 'published'" link type="warning" @click="startExam(scope.row)">
                  开始考试
                </el-button>
                <el-button v-if="scope.row.status === 'completed'" link type="success" @click="viewResults(scope.row)">
                  查看结果
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 班级学情 -->
      <el-col :span="12">
        <el-card class="classes-card">
          <template #header>
            <div class="card-header">
              <h3>班级学情</h3>
              <el-button link @click="$router.push('/teacher/student-analysis')">
                <el-icon><View /></el-icon>详细分析
              </el-button>
            </div>
          </template>
          
          <div class="class-grid">
            <div v-for="(cls, index) in classesPerformance" :key="index" class="class-item">
              <div class="class-header">
                <div class="class-name">{{ cls.name }}</div>
                <el-button link @click="viewClassDetail(cls)">详情</el-button>
              </div>
              
              <div class="class-metrics">
                <div class="metric">
                  <span class="metric-label">平均成绩</span>
                  <el-progress
                    type="dashboard"
                    :percentage="cls.avgScore"
                    :color="getDashboardColor(cls.avgScore)"
                    :width="80"
                  />
                </div>
                <div class="metric">
                  <span class="metric-label">完成率</span>
                  <el-progress
                    type="dashboard"
                    :percentage="cls.completionRate"
                    :color="getDashboardColor(cls.completionRate)"
                    :width="80"
                  />
                </div>
                <div class="metric">
                  <span class="metric-label">参与度</span>
                  <el-progress
                    type="dashboard"
                    :percentage="cls.participation"
                    :color="getDashboardColor(cls.participation)"
                    :width="80"
                  />
                </div>
              </div>
              
              <div class="class-alerts">
                <el-alert
                  v-if="cls.alerts.length > 0"
                  :title="cls.alerts[0].title"
                  :type="cls.alerts[0].type"
                  :description="cls.alerts[0].description"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 活跃学生 -->
      <el-col :span="12">
        <el-card class="active-students-card">
          <template #header>
            <div class="card-header">
              <h3>活跃学生</h3>
              <el-select v-model="activeStudentsTimeRange" placeholder="选择时间范围" size="small">
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
                <el-option label="本学期" value="term" />
              </el-select>
            </div>
          </template>
          
          <div class="active-students">
            <div v-for="(student, index) in activeStudents" :key="index" class="student-item">
              <div class="student-rank">{{ index + 1 }}</div>
              <el-avatar :size="40" :src="student.avatar" />
              <div class="student-info">
                <div class="student-name">{{ student.name }}</div>
                <div class="student-class">{{ student.className }}</div>
              </div>
              <div class="activity-details">
                <div class="activity-score">
                  <div class="score-value">{{ student.activityScore }}</div>
                  <div class="score-label">活跃度</div>
                </div>
                <div class="activity-items">
                  <el-tooltip content="完成练习数">
                    <div class="activity-item">
                      <el-icon><Files /></el-icon> {{ student.exerciseCount }}
                    </div>
                  </el-tooltip>
                  <el-tooltip content="参与讨论数">
                    <div class="activity-item">
                      <el-icon><ChatLineSquare /></el-icon> {{ student.discussionCount }}
                    </div>
                  </el-tooltip>
                  <el-tooltip content="学习时长(小时)">
                    <div class="activity-item">
                      <el-icon><Timer /></el-icon> {{ student.studyHours }}
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 课程资源使用情况 -->
      <el-col :span="12">
        <el-card class="resources-card">
          <template #header>
            <div class="card-header">
              <h3>课程资源使用情况</h3>
              <el-button link @click="$router.push('/teacher/resources')">
                <el-icon><Management /></el-icon>管理资源
              </el-button>
            </div>
          </template>
          
          <div class="resources-usage">
            <v-chart class="chart" :option="resourcesUsageOption" />
          </div>
        </el-card>
      </el-col>

      <!-- 通知公告 -->
      <el-col :span="24">
        <el-card class="notices-card">
          <template #header>
            <div class="card-header">
              <h3>通知公告</h3>
              <el-button link>
                <el-icon><Plus /></el-icon>发布通知
              </el-button>
            </div>
          </template>
          
          <div class="notices-container">
            <el-table :data="notices" style="width: 100%">
              <el-table-column prop="title" label="标题" min-width="250" />
              <el-table-column prop="type" label="类型" width="120">
                <template #default="scope">
                  <el-tag :type="getNoticeTypeTag(scope.row.type)">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="publishDate" label="发布日期" width="120" />
              <el-table-column prop="publisher" label="发布人" width="120" />
              <el-table-column prop="readCount" label="已读/总人数" width="120" />
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button link type="primary" @click="viewNoticeDetail(scope.row)">查看</el-button>
                  <el-button link type="primary" @click="editNotice(scope.row)">编辑</el-button>
                  <el-button link type="danger" @click="deleteNotice(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  User, Reading, GobletFull, Bell, CaretTop, CaretBottom,
  Plus, View, Files, ChatLineSquare, Timer, Management
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart, LineChart, PieChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent
])

const router = useRouter()

// 图表类型选择
const progressChartType = ref('weekly')
const activeStudentsTimeRange = ref('week')

// 统计数据（模拟）
const statisticsData = ref([
  {
    label: '学生总数',
    value: 142,
    icon: User,
    color: '#409EFF',
    trend: 5.2
  },
  {
    label: '课程总数',
    value: 8,
    icon: Reading,
    color: '#67C23A',
    trend: 0
  },
  {
    label: '考核完成率',
    value: '86%',
    icon: GobletFull,
    color: '#E6A23C',
    trend: 2.8
  },
  {
    label: '新消息',
    value: 12,
    icon: Bell,
    color: '#F56C6C',
    trend: -3.5
  }
])

// 今日事项（模拟）
const todayTasks = ref([
  {
    title: '数据结构课程授课',
    description: '计科2202班，主题：二叉树基础',
    time: '09:00 - 10:30',
    status: 'completed'
  },
  {
    title: '计算机网络实验课',
    description: '软工2201班，内容：网络协议分析',
    time: '13:00 - 14:30',
    status: 'upcoming'
  },
  {
    title: '学院教学研讨会',
    description: '主题：课程思政融合教学',
    time: '15:00 - 16:30',
    status: 'upcoming'
  },
  {
    title: '期中考试阅卷',
    description: '计算机组成原理，截止日期：11月5日',
    time: '19:00 - 21:00',
    status: 'ongoing'
  }
])

// 近期考核（模拟）
const recentExams = ref([
  {
    id: 1,
    title: '数据结构期中考试',
    className: '计科2202班',
    date: '2023-10-25',
    status: 'completed',
    avgScore: 82
  },
  {
    id: 2,
    title: '计算机网络在线测验',
    className: '软工2201班',
    date: '2023-10-30',
    status: 'ongoing'
  },
  {
    id: 3,
    title: '人工智能导论期末考试',
    className: '人工智能2201班',
    date: '2023-11-15',
    status: 'published'
  },
  {
    id: 4,
    title: '算法设计作业',
    className: '计科2202班',
    date: '2023-11-08',
    status: 'published'
  }
])

// 班级学情（模拟）
const classesPerformance = ref([
  {
    id: 1,
    name: '计科2202班',
    avgScore: 85,
    completionRate: 92,
    participation: 88,
    alerts: [
      {
        title: '学情预警',
        type: 'info',
        description: '有3名学生近期作业完成率低于60%'
      }
    ]
  },
  {
    id: 2,
    name: '软工2201班',
    avgScore: 78,
    completionRate: 86,
    participation: 80,
    alerts: [
      {
        title: '学情预警',
        type: 'warning',
        description: '该班级在网络协议章节掌握度普遍较低'
      }
    ]
  },
  {
    id: 3,
    name: '人工智能2201班',
    avgScore: 92,
    completionRate: 95,
    participation: 96,
    alerts: []
  },
  {
    id: 4,
    name: '计科2201班',
    avgScore: 75,
    completionRate: 82,
    participation: 78,
    alerts: [
      {
        title: '学情预警',
        type: 'error',
        description: '该班级平均成绩较上学期下降了8%'
      }
    ]
  }
])

// 活跃学生（模拟）
const activeStudents = ref([
  {
    id: 1,
    name: '张三',
    className: '计科2202班',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    activityScore: 95,
    exerciseCount: 86,
    discussionCount: 32,
    studyHours: 42
  },
  {
    id: 2,
    name: '李四',
    className: '软工2201班',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    activityScore: 92,
    exerciseCount: 78,
    discussionCount: 45,
    studyHours: 38
  },
  {
    id: 3,
    name: '王五',
    className: '计科2202班',
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    activityScore: 88,
    exerciseCount: 72,
    discussionCount: 28,
    studyHours: 36
  },
  {
    id: 4,
    name: '赵六',
    className: '人工智能2201班',
    avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
    activityScore: 85,
    exerciseCount: 68,
    discussionCount: 24,
    studyHours: 33
  },
  {
    id: 5,
    name: '钱七',
    className: '计科2201班',
    avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
    activityScore: 82,
    exerciseCount: 65,
    discussionCount: 20,
    studyHours: 30
  }
])

// 通知公告（模拟）
const notices = ref([
  {
    id: 1,
    title: '关于2023年秋季学期期中考试安排的通知',
    type: '考试通知',
    publishDate: '2023-10-15',
    publisher: '教务处',
    readCount: '125/142'
  },
  {
    id: 2,
    title: '计算机科学与技术系学术讲座通知',
    type: '讲座通知',
    publishDate: '2023-10-20',
    publisher: '张老师',
    readCount: '98/142'
  },
  {
    id: 3,
    title: '关于提交课程设计报告的截止日期提醒',
    type: '课程通知',
    publishDate: '2023-10-25',
    publisher: '李老师',
    readCount: '136/142'
  }
])

// 教学进度图表选项
const teachingProgressOption = computed(() => {
  const isWeekly = progressChartType.value === 'weekly'
  const xAxisData = isWeekly 
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
  
  // 模拟数据
  const planData = isWeekly
    ? [2, 3, 2, 4, 3, 0, 0]
    : [12, 14, 12, 15, 13, 10, 14, 13]
  
  const completedData = isWeekly
    ? [2, 3, 2, 3, 0, 0, 0]
    : [12, 14, 12, 14, 10, 8, 0, 0]
  
  return {
    title: {
      text: isWeekly ? '本周教学进度' : '本月教学进度'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划课时', '已完成']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      name: '课时数'
    },
    series: [
      {
        name: '计划课时',
        type: 'bar',
        data: planData,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '已完成',
        type: 'bar',
        data: completedData,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
})

// 资源使用情况图表
const resourcesUsageOption = computed(() => {
  return {
    title: {
      text: '资源使用情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['课件', '视频', '习题', '实验', '参考资料']
    },
    series: [
      {
        name: '访问次数',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: 335, name: '课件' },
          { value: 310, name: '视频' },
          { value: 234, name: '习题' },
          { value: 135, name: '实验' },
          { value: 1548, name: '参考资料' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})

// 获取任务类型
const getTaskType = (status: string) => {
  switch(status) {
    case 'completed': return 'success'
    case 'ongoing': return 'warning'
    case 'upcoming': return 'primary'
    default: return 'info'
  }
}

// 获取任务颜色
const getTaskColor = (status: string) => {
  switch(status) {
    case 'completed': return '#67C23A'
    case 'ongoing': return '#E6A23C'
    case 'upcoming': return '#409EFF'
    default: return '#909399'
  }
}

// 获取考核状态类型
const getExamStatusType = (status: string) => {
  switch(status) {
    case 'completed': return 'success'
    case 'ongoing': return 'warning'
    case 'published': return 'info'
    default: return 'info'
  }
}

// 获取考核状态文本
const getExamStatusText = (status: string) => {
  switch(status) {
    case 'completed': return '已完成'
    case 'ongoing': return '进行中'
    case 'published': return '已发布'
    default: return '未知'
  }
}

// 获取通知类型标签
const getNoticeTypeTag = (type: string) => {
  switch(type) {
    case '考试通知': return 'danger'
    case '课程通知': return 'warning'
    case '讲座通知': return 'success'
    default: return 'info'
  }
}

// 获取仪表盘颜色
const getDashboardColor = (value: number) => {
  if (value >= 85) return '#67C23A'
  if (value >= 70) return '#409EFF'
  if (value >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 标记任务为已完成
const markTaskCompleted = (index: number) => {
  todayTasks.value[index].status = 'completed'
  ElMessage.success('任务已标记为完成')
}

// 查看考核详情
const viewExamDetail = (exam: any) => {
  ElMessage.info(`查看考核详情: ${exam.title}`)
  // 实际项目中跳转到考核详情页面
  // router.push(`/teacher/exam/${exam.id}`)
}

// 开始考试
const startExam = (exam: any) => {
  ElMessageBox.confirm(`确定开始 ${exam.title} 考试吗？`, '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新考试状态
    const index = recentExams.value.findIndex(e => e.id === exam.id)
    if (index !== -1) {
      recentExams.value[index].status = 'ongoing'
      ElMessage.success('考试已开始')
    }
  }).catch(() => {})
}

// 查看考试结果
const viewResults = (exam: any) => {
  ElMessage.info(`查看考试结果: ${exam.title}`)
  // 实际项目中跳转到考试结果页面
  // router.push(`/teacher/exam-results/${exam.id}`)
}

// 查看班级详情
const viewClassDetail = (cls: any) => {
  ElMessage.info(`查看班级详情: ${cls.name}`)
  // 实际项目中跳转到班级详情页面
  router.push('/teacher/student-analysis')
}

// 查看通知详情
const viewNoticeDetail = (notice: any) => {
  ElMessage.info(`查看通知详情: ${notice.title}`)
  // 实际项目中跳转到通知详情页面或显示弹窗
}

// 编辑通知
const editNotice = (notice: any) => {
  ElMessage.info(`编辑通知: ${notice.title}`)
  // 实际项目中跳转到通知编辑页面或显示编辑弹窗
}

// 删除通知
const deleteNotice = (notice: any) => {
  ElMessageBox.confirm(`确定删除通知 "${notice.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    const index = notices.value.findIndex(n => n.id === notice.id)
    if (index !== -1) {
      notices.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 28px;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-footer {
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
}

.trend {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.trend.up {
  color: #67c23a;
}

.trend.down {
  color: #f56c6c;
}

.period {
  margin-left: 5px;
}

.main-chart-card,
.today-tasks-card,
.exams-card,
.classes-card,
.active-students-card,
.resources-card,
.notices-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 350px;
}

.tasks-container {
  max-height: 350px;
  overflow-y: auto;
}

.task-item {
  margin-bottom: 8px;
}

.task-item.completed {
  opacity: 0.7;
  text-decoration: line-through;
}

.task-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.task-desc {
  color: #606266;
  font-size: 13px;
}

.task-actions {
  margin-top: 8px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.class-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.class-name {
  font-weight: bold;
  font-size: 16px;
}

.class-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  margin-bottom: 5px;
  color: #606266;
  font-size: 13px;
}

.class-alerts {
  margin-top: 10px;
}

.active-students {
  max-height: 350px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.student-rank {
  width: 24px;
  height: 24px;
  background-color: #f2f6fc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
  font-size: 14px;
}

.student-info {
  flex: 1;
  margin-left: 10px;
}

.student-name {
  font-weight: bold;
}

.student-class {
  font-size: 12px;
  color: #909399;
}

.activity-details {
  display: flex;
  align-items: center;
}

.activity-score {
  text-align: center;
  margin-right: 15px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.score-label {
  font-size: 12px;
  color: #909399;
}

.activity-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #f2f6fc;
  border-radius: 4px;
  font-size: 12px;
}

.resources-usage {
  height: 350px;
}

.notices-container {
  max-height: 300px;
  overflow-y: auto;
}
</style>
