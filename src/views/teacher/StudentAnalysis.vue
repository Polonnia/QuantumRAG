<template>
  <div class="student-analysis">
    <el-row :gutter="20">
      <!-- 概览统计卡片 -->
      <el-col :span="24">
        <el-card class="stats-card">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(stat, index) in overviewStats" :key="index">
              <div class="stat-item">
                <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
                  <el-icon><component :is="stat.icon" /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 班级与课程选择 -->
      <el-col :span="24" class="filter-container">
        <el-card>
          <el-form :model="filters" :inline="true">
            <el-form-item label="班级">
              <el-select v-model="filters.classId" placeholder="选择班级" style="width: 200px;">
                <el-option 
                  v-for="cls in classesList" 
                  :key="cls.id" 
                  :label="cls.name" 
                  :value="cls.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="课程">
              <el-select v-model="filters.courseId" placeholder="选择课程" style="width: 200px;">
                <el-option 
                  v-for="course in coursesList" 
                  :key="course.id" 
                  :label="course.title" 
                  :value="course.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 360px;"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchAnalyticsData">
                <el-icon><Search /></el-icon>查询
              </el-button>
              <el-button @click="resetFilters">
                <el-icon><RefreshRight /></el-icon>重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 知识点掌握情况 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>知识点掌握情况</h3>
              <el-radio-group v-model="knowledgeView" size="small">
                <el-radio-button label="chart">图表</el-radio-button>
                <el-radio-button label="table">表格</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <div v-if="knowledgeView === 'chart'" class="chart-container">
            <v-chart class="chart" :option="knowledgeRadarOption" />
          </div>
          
          <div v-else>
            <el-table :data="knowledgePoints" stripe style="width: 100%">
              <el-table-column prop="title" label="知识点" width="200" />
              <el-table-column prop="correctRate" label="正确率" width="180">
                <template #default="scope">
                  <el-progress 
                    :percentage="Number((scope.row.correctRate * 100).toFixed(1))" 
                    :color="getProgressColor(scope.row.correctRate)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="masteryLevel" label="掌握程度">
                <template #default="scope">
                  <el-tag :type="getMasteryTagType(scope.row.masteryLevel)">
                    {{ getMasteryLevelText(scope.row.masteryLevel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="averageTime" label="平均用时(秒)" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button 
                    link
                    type="primary" 
                    @click="showKnowledgeDetail(scope.row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 学习趋势 -->
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>学习趋势</h3>
              <el-select v-model="trendMetric" size="small" style="width: 120px;">
                <el-option label="正确率" value="correctRate" />
                <el-option label="完成率" value="completionRate" />
                <el-option label="参与度" value="participation" />
              </el-select>
            </div>
          </template>
          
          <v-chart class="chart" :option="trendChartOption" />
        </el-card>
      </el-col>

      <!-- 学生表现排名 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>学生表现排名</h3>
              <el-select v-model="rankingMetric" size="small" style="width: 120px;">
                <el-option label="总分" value="totalScore" />
                <el-option label="进步幅度" value="improvement" />
                <el-option label="练习量" value="exerciseCount" />
              </el-select>
            </div>
          </template>
          
          <el-table :data="studentRankings" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column label="学生">
              <template #default="scope">
                <div class="student-info">
                  <el-avatar :size="30" :src="scope.row.avatar" />
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column 
              :prop="rankingMetric" 
              :label="getRankingLabel()" 
              sortable 
            >
              <template #default="scope">
                <div class="ranking-value-container">
                  <span class="ranking-value">{{ formatRankingValue(scope.row[rankingMetric]) }}</span>
                  <el-progress 
                    :percentage="getRankingPercentage(scope.row[rankingMetric])" 
                    :color="getProgressColor(scope.row[rankingMetric] / getMaxRankingValue())"
                    :show-text="false"
                    :stroke-width="4"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 问题类型分析 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>问题类型分析</h3>
              <el-tooltip content="不同题型的正确率和用时对比">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          
          <v-chart class="chart" :option="questionTypeChartOption" />
        </el-card>
      </el-col>

      <!-- 学生学习状态分布 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>学生学习状态分布</h3>
            </div>
          </template>
          
          <div class="learning-status-grid">
            <div v-for="(status, index) in learningStatusDistribution" :key="index" class="learning-status-item">
              <div class="status-header">
                <div class="status-icon" :style="{ backgroundColor: status.color }">
                  <el-icon><component :is="status.icon" /></el-icon>
                </div>
                <div class="status-name">{{ status.name }}</div>
              </div>
              <div class="status-count">{{ status.count }}人</div>
              <div class="status-percentage">{{ (status.percentage * 100).toFixed(1) }}%</div>
              <el-progress :percentage="status.percentage * 100" :color="status.color" :show-text="false" />
              <div class="status-desc">{{ status.description }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 知识点详情对话框 -->
    <el-dialog
      v-model="knowledgeDetailVisible"
      :title="currentKnowledgePoint?.title + ' - 详细分析'"
      width="70%"
    >
      <div v-if="currentKnowledgePoint" class="knowledge-detail">
        <el-tabs>
          <el-tab-pane label="概览">
            <div class="detail-overview">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="知识点">{{ currentKnowledgePoint.title }}</el-descriptions-item>
                <el-descriptions-item label="掌握程度">
                  <el-tag :type="getMasteryTagType(currentKnowledgePoint.masteryLevel)">
                    {{ getMasteryLevelText(currentKnowledgePoint.masteryLevel) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="正确率">{{ (currentKnowledgePoint.correctRate * 100).toFixed(1) }}%</el-descriptions-item>
                <el-descriptions-item label="平均用时">{{ currentKnowledgePoint.averageTime }}秒</el-descriptions-item>
              </el-descriptions>

              <el-divider>班级对比</el-divider>
              <v-chart class="detail-chart" :option="classComparisonOption" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="相关习题分析">
            <el-table :data="relatedExercises" stripe>
              <el-table-column prop="title" label="题目" />
              <el-table-column prop="correctRate" label="正确率" width="180">
                <template #default="scope">
                  <el-progress 
                    :percentage="Number((scope.row.correctRate * 100).toFixed(1))" 
                    :color="getProgressColor(scope.row.correctRate)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="averageTime" label="平均用时(秒)" width="150" />
              <el-table-column prop="type" label="题目类型" width="120">
                <template #default="scope">
                  {{ getQuestionTypeLabel(scope.row.type) }}
                </template>
              </el-table-column>
              <el-table-column prop="difficulty" label="难度" width="100">
                <template #default="scope">
                  <el-rate
                    v-model="scope.row.difficulty"
                    disabled
                    text-color="#ff9900"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="学生掌握情况">
            <el-table :data="studentMasteryList" stripe>
              <el-table-column label="学生">
                <template #default="scope">
                  <div class="student-info">
                    <el-avatar :size="30" :src="scope.row.avatar" />
                    <span>{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="correctRate" label="正确率" width="180">
                <template #default="scope">
                  <el-progress 
                    :percentage="Number((scope.row.correctRate * 100).toFixed(1))" 
                    :color="getProgressColor(scope.row.correctRate)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="masteryLevel" label="掌握程度" width="120">
                <template #default="scope">
                  <el-tag :type="getMasteryTagType(scope.row.masteryLevel)">
                    {{ getMasteryLevelText(scope.row.masteryLevel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="attemptCount" label="尝试次数" width="120" />
              <el-table-column prop="lastAttemptTime" label="最近尝试时间" width="180" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="推荐教学策略">
            <div class="teaching-strategies">
              <el-alert
                v-for="(strategy, index) in teachingStrategies"
                :key="index"
                :title="strategy.title"
                :type="strategy.type"
                :description="strategy.description"
                show-icon
                :closable="false"
                class="strategy-item"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  RadarChart, LineChart, BarChart, PieChart, ScatterChart
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent, RadarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Search, RefreshRight, InfoFilled, User, Calendar, DataAnalysis, 
  Reading, OfficeBuilding, Trophy, WarningFilled, SuccessFilled, CircleCloseFilled
} from '@element-plus/icons-vue'
import type { AnalysisData } from '../../types'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  RadarChart, LineChart, BarChart, PieChart, ScatterChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, 
  DatasetComponent, TransformComponent, RadarComponent
])

// 筛选条件
const filters = reactive({
  classId: '',
  courseId: '',
  dateRange: [] as string[]
})

// 查看切换
const knowledgeView = ref('chart')
const trendMetric = ref('correctRate')
const rankingMetric = ref('totalScore')

// 状态变量
const loading = ref(false)
const knowledgeDetailVisible = ref(false)
const currentKnowledgePoint = ref<AnalysisData | null>(null)

// 班级与课程数据（模拟）
const classesList = ref([
  { id: 1, name: '计算机科学2022-1班' },
  { id: 2, name: '计算机科学2022-2班' },
  { id: 3, name: '软件工程2022-1班' },
  { id: 4, name: '人工智能2022-1班' },
])

const coursesList = ref([
  { id: 1, title: '数据结构与算法' },
  { id: 2, title: '计算机网络' },
  { id: 3, title: '人工智能导论' },
])

// 概览统计数据（模拟）
const overviewStats = ref([
  { 
    label: '学生人数', 
    value: 38, 
    icon: User, 
    bgColor: '#409EFF' 
  },
  { 
    label: '知识点数量', 
    value: 24, 
    icon: Reading, 
    bgColor: '#67C23A' 
  },
  { 
    label: '平均正确率', 
    value: '76.5%', 
    icon: DataAnalysis, 
    bgColor: '#E6A23C' 
  },
  { 
    label: '平均完成率', 
    value: '83.2%', 
    icon: Calendar, 
    bgColor: '#F56C6C' 
  }
])

// 知识点数据（模拟）
const knowledgePoints = ref<AnalysisData[]>([
  { 
    knowledgePointId: 1, 
    title: '数组与链表',
    correctRate: 0.82, 
    averageTime: 45, 
    masteryLevel: 'proficient' 
  },
  { 
    knowledgePointId: 2, 
    title: '栈与队列',
    correctRate: 0.76, 
    averageTime: 58, 
    masteryLevel: 'familiar' 
  },
  { 
    knowledgePointId: 3, 
    title: '树与二叉树',
    correctRate: 0.65, 
    averageTime: 75, 
    masteryLevel: 'familiar' 
  },
  { 
    knowledgePointId: 4, 
    title: '图论基础',
    correctRate: 0.52, 
    averageTime: 90, 
    masteryLevel: 'unfamiliar' 
  },
  { 
    knowledgePointId: 5, 
    title: '排序算法',
    correctRate: 0.78, 
    averageTime: 60, 
    masteryLevel: 'familiar' 
  },
  { 
    knowledgePointId: 6, 
    title: '哈希表',
    correctRate: 0.88, 
    averageTime: 42, 
    masteryLevel: 'expert' 
  },
  { 
    knowledgePointId: 7, 
    title: '动态规划',
    correctRate: 0.58, 
    averageTime: 105, 
    masteryLevel: 'unfamiliar' 
  }
])

// 学生排名数据（模拟）
const studentRankings = ref([
  { 
    rank: 1, 
    id: 1, 
    name: '张三', 
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    totalScore: 95,
    improvement: 15,
    exerciseCount: 120
  },
  { 
    rank: 2, 
    id: 2, 
    name: '李四', 
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    totalScore: 92,
    improvement: 12,
    exerciseCount: 105
  },
  { 
    rank: 3, 
    id: 3, 
    name: '王五', 
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    totalScore: 90,
    improvement: 18,
    exerciseCount: 98
  },
  { 
    rank: 4, 
    id: 4, 
    name: '赵六', 
    avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
    totalScore: 88,
    improvement: 10,
    exerciseCount: 112
  },
  { 
    rank: 5, 
    id: 5, 
    name: '钱七', 
    avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
    totalScore: 85,
    improvement: 14,
    exerciseCount: 95
  }
])

// 学习状态分布数据（模拟）
const learningStatusDistribution = ref([
  {
    name: '优秀',
    count: 8,
    percentage: 0.21,
    color: '#67C23A',
    icon: SuccessFilled,
    description: '学习积极，理解深入，成绩优秀'
  },
  {
    name: '良好',
    count: 15,
    percentage: 0.39,
    color: '#409EFF',
    icon: User,
    description: '基础扎实，学习有规律，成绩稳定'
  },
  {
    name: '一般',
    count: 10,
    percentage: 0.26,
    color: '#E6A23C',
    icon: WarningFilled,
    description: '基础尚可，需要更多练习加强'
  },
  {
    name: '需关注',
    count: 5,
    percentage: 0.13,
    color: '#F56C6C',
    icon: CircleCloseFilled,
    description: '学习困难，需要额外辅导和关注'
  }
])

// 查询分析数据
const fetchAnalyticsData = () => {
  if (!filters.classId || !filters.courseId) {
    ElMessage.warning('请选择班级和课程')
    return
  }

  loading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    // 这里应该是实际的API调用
    loading.value = false
    ElMessage.success('数据加载成功')
  }, 1000)
}

// 重置筛选条件
const resetFilters = () => {
  filters.classId = ''
  filters.courseId = ''
  filters.dateRange = []
}

// 显示知识点详情
const showKnowledgeDetail = (knowledgePoint: AnalysisData) => {
  currentKnowledgePoint.value = knowledgePoint
  knowledgeDetailVisible.value = true
}

// 获取掌握程度标签类型
const getMasteryTagType = (level: string) => {
  switch(level) {
    case 'expert': return 'success'
    case 'proficient': return 'primary'
    case 'familiar': return 'warning'
    case 'unfamiliar': return 'danger'
    default: return 'info'
  }
}

// 获取掌握程度文本
const getMasteryLevelText = (level: string) => {
  switch(level) {
    case 'expert': return '精通'
    case 'proficient': return '熟练'
    case 'familiar': return '熟悉'
    case 'unfamiliar': return '生疏'
    default: return '未知'
  }
}

// 获取进度条颜色
const getProgressColor = (rate: number) => {
  if (rate >= 0.85) return '#67C23A'
  if (rate >= 0.7) return '#409EFF'
  if (rate >= 0.5) return '#E6A23C'
  return '#F56C6C'
}

// 获取问题类型标签
const getQuestionTypeLabel = (type: string) => {
  switch(type) {
    case 'concept': return '概念题'
    case 'fillBlank': return '填空题'
    case 'shortAnswer': return '简答题'
    case 'programming': return '编程题'
    default: return '未知'
  }
}

// 格式化排名值
const formatRankingValue = (value: number) => {
  if (rankingMetric.value === 'improvement') {
    return `+${value}`
  }
  return value
}

// 获取排名标签
const getRankingLabel = () => {
  switch(rankingMetric.value) {
    case 'totalScore': return '总分'
    case 'improvement': return '进步幅度'
    case 'exerciseCount': return '练习量'
    default: return '值'
  }
}

// 获取排名百分比
const getRankingPercentage = (value: number) => {
  const maxValue = getMaxRankingValue()
  return (value / maxValue) * 100
}

// 获取最大排名值
const getMaxRankingValue = () => {
  return Math.max(...studentRankings.value.map(student => student[rankingMetric.value as keyof typeof student] as number))
}

// 知识点雷达图配置
const knowledgeRadarOption = computed(() => ({
  title: {
    text: '知识点掌握情况',
  },
  tooltip: {},
  legend: {
    data: ['正确率', '掌握度']
  },
  radar: {
    indicator: knowledgePoints.value.map(point => ({
      name: point.title,
      max: 1
    }))
  },
  series: [{
    name: '知识点分析',
    type: 'radar',
    data: [
      {
        value: knowledgePoints.value.map(point => point.correctRate),
        name: '正确率',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)'
        },
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        value: knowledgePoints.value.map(point => {
          // 将掌握度转换为数值
          switch(point.masteryLevel) {
            case 'expert': return 1
            case 'proficient': return 0.75
            case 'familiar': return 0.5
            case 'unfamiliar': return 0.25
            default: return 0
          }
        }),
        name: '掌握度',
        areaStyle: {
          color: 'rgba(103, 194, 58, 0.2)'
        },
        lineStyle: {
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }]
}))

// 学习趋势图表配置
const trendChartOption = computed(() => {
  // 模拟不同日期的数据
  const dates = ['9/1', '9/8', '9/15', '9/22', '9/29', '10/6', '10/13', '10/20', '10/27', '11/3']
  
  let data
  switch(trendMetric.value) {
    case 'correctRate':
      data = [0.65, 0.68, 0.70, 0.69, 0.72, 0.75, 0.77, 0.76, 0.79, 0.82]
      break
    case 'completionRate':
      data = [0.70, 0.73, 0.75, 0.78, 0.80, 0.82, 0.85, 0.83, 0.86, 0.88]
      break
    case 'participation':
      data = [0.90, 0.92, 0.88, 0.91, 0.94, 0.93, 0.95, 0.94, 0.96, 0.98]
      break
    default:
      data = [0.65, 0.68, 0.70, 0.69, 0.72, 0.75, 0.77, 0.76, 0.79, 0.82]
  }
  
  // 将比率转换为百分比
  const percentData = data.map(value => (value * 100).toFixed(1))
  
  return {
    title: {
      text: '学习趋势',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: percentData,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#409EFF'
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(64, 158, 255, 0.5)'
          }, {
            offset: 1, color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      }
    }]
  }
})

// 问题类型分析图表配置
const questionTypeChartOption = computed(() => ({
  title: {
    text: '问题类型分析',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['正确率', '平均用时(秒)']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['概念题', '填空题', '简答题', '编程题']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '正确率',
      min: 0,
      max: 1,
      interval: 0.2,
      axisLabel: {
        formatter: '{value * 100}%'
      }
    },
    {
      type: 'value',
      name: '平均用时(秒)',
      min: 0,
      max: 300,
      interval: 60
    }
  ],
  series: [
    {
      name: '正确率',
      type: 'bar',
      data: [0.85, 0.76, 0.68, 0.55]
    },
    {
      name: '平均用时(秒)',
      type: 'line',
      yAxisIndex: 1,
      data: [45, 65, 120, 220]
    }
  ]
}))

// 班级对比图表（知识点详情中使用）
const classComparisonOption = computed(() => {
  if (!currentKnowledgePoint.value) return {}
  
  return {
    title: {
      text: `${currentKnowledgePoint.value.title} - 班级对比`,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: classesList.value.map(cls => cls.name)
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        data: [
          Math.round(currentKnowledgePoint.value.correctRate * 100 * 0.95),
          Math.round(currentKnowledgePoint.value.correctRate * 100 * 1.05),
          Math.round(currentKnowledgePoint.value.correctRate * 100 * 0.9),
          Math.round(currentKnowledgePoint.value.correctRate * 100 * 1.1)
        ]
      }
    ]
  }
})

// 相关习题数据（模拟）
const relatedExercises = computed(() => {
  if (!currentKnowledgePoint.value) return []
  
  // 模拟与当前知识点相关的习题
  return [
    {
      id: 1,
      title: '简述栈和队列的区别',
      correctRate: 0.8,
      averageTime: 50,
      type: 'shortAnswer',
      difficulty: 3
    },
    {
      id: 2,
      title: '数组和链表的优缺点对比',
      correctRate: 0.76,
      averageTime: 65,
      type: 'shortAnswer',
      difficulty: 3
    },
    {
      id: 3,
      title: '实现一个基于数组的栈',
      correctRate: 0.65,
      averageTime: 120,
      type: 'programming',
      difficulty: 4
    },
    {
      id: 4,
      title: '下列哪种数据结构适合实现队列？',
      correctRate: 0.92,
      averageTime: 35,
      type: 'concept',
      difficulty: 2
    }
  ]
})

// 学生掌握情况数据（模拟）
const studentMasteryList = computed(() => {
  if (!currentKnowledgePoint.value) return []
  
  return [
    {
      id: 1,
      name: '张三',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      correctRate: 0.9,
      masteryLevel: 'expert',
      attemptCount: 8,
      lastAttemptTime: '2023-10-28 15:32:21'
    },
    {
      id: 2,
      name: '李四',
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      correctRate: 0.8,
      masteryLevel: 'proficient',
      attemptCount: 6,
      lastAttemptTime: '2023-10-29 10:15:43'
    },
    {
      id: 3,
      name: '王五',
      avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
      correctRate: 0.7,
      masteryLevel: 'familiar',
      attemptCount: 5,
      lastAttemptTime: '2023-10-27 09:22:18'
    },
    {
      id: 4,
      name: '赵六',
      avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
      correctRate: 0.6,
      masteryLevel: 'familiar',
      attemptCount: 4,
      lastAttemptTime: '2023-10-25 16:45:32'
    },
    {
      id: 5,
      name: '钱七',
      avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
      correctRate: 0.45,
      masteryLevel: 'unfamiliar',
      attemptCount: 3,
      lastAttemptTime: '2023-10-26 14:18:56'
    }
  ]
})

// 教学策略建议（模拟）
const teachingStrategies = computed(() => {
  if (!currentKnowledgePoint.value) return []
  
  const strategies = []
  const mastery = currentKnowledgePoint.value.masteryLevel
  
  if (mastery === 'unfamiliar' || mastery === 'familiar') {
    strategies.push({
      title: '增加基础练习',
      type: 'warning',
      description: '该知识点掌握程度较低，建议增加基础概念讲解和简单练习，帮助学生建立基础认知。'
    })
    
    strategies.push({
      title: '分组讨论学习',
      type: 'info',
      description: '建议组织学生以小组形式讨论该知识点，让掌握较好的学生带动其他学生。'
    })
  }
  
  if (mastery === 'unfamiliar') {
    strategies.push({
      title: '紧急干预',
      type: 'danger',
      description: '该知识点学生普遍掌握较差，建议重新讲解并设计更多互动性练习。'
    })
  }
  
  if (mastery === 'proficient' || mastery === 'expert') {
    strategies.push({
      title: '进阶挑战',
      type: 'success',
      description: '该知识点学生掌握良好，可以设计更有挑战性的问题，并引入实际应用场景。'
    })
  }
  
  strategies.push({
    title: '个性化辅导',
    type: 'primary',
    description: '针对掌握程度较低的学生提供额外的学习资源和辅导。'
  })
  
  return strategies
})

onMounted(() => {
  // 可以在这里加载初始数据
})
</script>

<style scoped>
.student-analysis {
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 24px;
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

.filter-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.chart {
  height: 100%;
  width: 100%;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ranking-value-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ranking-value {
  font-weight: bold;
}

.learning-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.learning-status-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.status-name {
  font-size: 18px;
  font-weight: bold;
}

.status-count {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-percentage {
  color: #606266;
  margin-bottom: 8px;
}

.status-desc {
  color: #909399;
  margin-top: 10px;
  font-size: 14px;
}

.knowledge-detail {
  padding: 10px;
}

.detail-overview {
  margin-bottom: 20px;
}

.detail-chart {
  height: 300px;
  margin-top: 20px;
}

.teaching-strategies {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.strategy-item {
  margin-bottom: 15px;
}
</style>
