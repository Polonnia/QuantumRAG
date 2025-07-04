<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>管理系统大屏概览</h1>
      <div class="date-selector">
        <el-radio-group v-model="timeRange" size="default">
          <el-radio-button label="day">当日</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <div class="dashboard-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-header">
              <div class="icon blue">
                <el-icon :size="24"><User /></el-icon>
              </div>
              <div class="value-container">
                <div class="label">教师数量</div>
                <div class="value">{{ stats.teacherCount }}</div>
              </div>
            </div>
            <div class="trend">
              <span :class="{ 'up': stats.teacherGrowth > 0, 'down': stats.teacherGrowth < 0 }">
                <el-icon v-if="stats.teacherGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stats.teacherGrowth < 0"><ArrowDown /></el-icon>
                {{ Math.abs(stats.teacherGrowth) }}%
              </span>
              较上一周期
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-header">
              <div class="icon green">
                <el-icon :size="24"><User /></el-icon>
              </div>
              <div class="value-container">
                <div class="label">学生数量</div>
                <div class="value">{{ stats.studentCount }}</div>
              </div>
            </div>
            <div class="trend">
              <span :class="{ 'up': stats.studentGrowth > 0, 'down': stats.studentGrowth < 0 }">
                <el-icon v-if="stats.studentGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stats.studentGrowth < 0"><ArrowDown /></el-icon>
                {{ Math.abs(stats.studentGrowth) }}%
              </span>
              较上一周期
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-header">
              <div class="icon purple">
                <el-icon :size="24"><Timer /></el-icon>
              </div>
              <div class="value-container">
                <div class="label">资源总数</div>
                <div class="value">{{ stats.resourceCount }}</div>
              </div>
            </div>
            <div class="trend">
              <span :class="{ 'up': stats.resourceGrowth > 0, 'down': stats.resourceGrowth < 0 }">
                <el-icon v-if="stats.resourceGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stats.resourceGrowth < 0"><ArrowDown /></el-icon>
                {{ Math.abs(stats.resourceGrowth) }}%
              </span>
              较上一周期
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="card-header">
              <div class="icon orange">
                <el-icon :size="24"><Connection /></el-icon>
              </div>
              <div class="value-container">
                <div class="label">系统活跃度</div>
                <div class="value">{{ stats.activityScore }}</div>
              </div>
            </div>
            <div class="trend">
              <span :class="{ 'up': stats.activityGrowth > 0, 'down': stats.activityGrowth < 0 }">
                <el-icon v-if="stats.activityGrowth > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stats.activityGrowth < 0"><ArrowDown /></el-icon>
                {{ Math.abs(stats.activityGrowth) }}%
              </span>
              较上一周期
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div class="chart-header">
              <h3>教师使用次数统计</h3>
              <el-tag effect="dark" type="primary">当前{{ timeRangeText }}最活跃: {{ mostActiveTeacher }}</el-tag>
            </div>
            <v-chart class="chart" :option="teacherChartOption" autoresize />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div class="chart-header">
              <h3>学生使用次数统计</h3>
              <el-tag effect="dark" type="success">当前{{ timeRangeText }}最活跃: {{ mostActiveStudent }}</el-tag>
            </div>
            <v-chart class="chart" :option="studentChartOption" autoresize />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div class="chart-header">
              <h3>教学效率指数</h3>
            </div>
            <v-chart class="chart" :option="efficiencyChartOption" autoresize />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div class="chart-header">
              <h3>学习效果分析</h3>
            </div>
            <v-chart class="chart" :option="learningEffectChartOption" autoresize />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header-with-action">
                <h3>课程通过率</h3>
                <el-select v-model="selectedCourse" placeholder="选择课程" size="small">
                  <el-option v-for="course in courseOptions" :key="course.value" :label="course.label" :value="course.value" />
                </el-select>
              </div>
            </template>
            <v-chart class="chart wide-chart" :option="passRateChartOption" autoresize />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
} from 'echarts/components'

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
])

// 时间范围
const timeRange = ref('day')
const timeRangeText = computed(() => {
  switch (timeRange.value) {
    case 'day': return '日';
    case 'week': return '周';
    case 'month': return '月';
    default: return '';
  }
})

// 统计数据
const stats = ref({
  teacherCount: 45,
  teacherGrowth: 5.2,
  studentCount: 876,
  studentGrowth: 12.8,
  resourceCount: 312,
  resourceGrowth: 8.7,
  activityScore: 85,
  activityGrowth: -2.3
})

// 最活跃用户
const mostActiveTeacher = ref('张老师 (计算机科学系)')
const mostActiveStudent = ref('李同学 (计算机科学2班)')

// 教师使用统计图表
const teacherChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['备课设计', '考核生成', '学情分析']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: timeRange.value === 'day' 
      ? ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      : timeRange.value === 'week'
      ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      : ['第1周', '第2周', '第3周', '第4周']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '备课设计',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      data: [12, 19, 15, 8, 22, 14, 9, 17, 13]
    },
    {
      name: '考核生成',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      data: [8, 12, 10, 6, 14, 9, 5, 11, 7]
    },
    {
      name: '学情分析',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      data: [5, 8, 6, 3, 10, 7, 4, 6, 5]
    }
  ]
}))

// 学生使用统计图表
const studentChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['学习助手', '练习评测']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: timeRange.value === 'day' 
      ? ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      : timeRange.value === 'week'
      ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      : ['第1周', '第2周', '第3周', '第4周']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '学习助手',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      data: [42, 65, 57, 36, 78, 59, 51, 69, 48]
    },
    {
      name: '练习评测',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      data: [35, 48, 42, 29, 56, 43, 37, 51, 40]
    }
  ]
}))

// 教学效率指数图表
const efficiencyChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['备课耗时', '练习设计耗时', '实际教学耗时', '效率指数']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: [
    {
      type: 'value',
      name: '耗时(分钟)',
      position: 'left'
    },
    {
      type: 'value',
      name: '效率指数',
      position: 'right',
      max: 100,
      min: 0
    }
  ],
  series: [
    {
      name: '备课耗时',
      type: 'line',
      data: [120, 110, 95, 80, 70, 65],
      smooth: true
    },
    {
      name: '练习设计耗时',
      type: 'line',
      data: [90, 85, 75, 68, 60, 55],
      smooth: true
    },
    {
      name: '实际教学耗时',
      type: 'line',
      data: [150, 145, 140, 135, 130, 125],
      smooth: true
    },
    {
      name: '效率指数',
      type: 'line',
      yAxisIndex: 1,
      data: [65, 68, 75, 82, 89, 92],
      smooth: true,
      lineStyle: {
        width: 3,
        type: 'dashed'
      }
    }
  ]
}))

// 学习效果分析图表
const learningEffectChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['平均正确率', '知识点掌握度']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}%'
    },
    max: 100,
    min: 0
  },
  series: [
    {
      name: '平均正确率',
      type: 'line',
      data: [65, 68, 72, 75, 79, 82],
      smooth: true,
      lineStyle: {
        width: 3
      },
      areaStyle: {
        opacity: 0.1
      }
    },
    {
      name: '知识点掌握度',
      type: 'line',
      data: [55, 60, 67, 72, 78, 81],
      smooth: true,
      lineStyle: {
        width: 3
      },
      areaStyle: {
        opacity: 0.1
      }
    }
  ]
}))

// 课程选择
const selectedCourse = ref('cs101')
const courseOptions = [
  { value: 'cs101', label: '计算机基础' },
  { value: 'cs102', label: '程序设计' },
  { value: 'cs103', label: '数据结构' },
  { value: 'cs104', label: '操作系统' }
]

// 通过率图表
const passRateChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['优秀率', '良好率', '及格率', '不及格率']
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
      boundaryGap: false,
      data: ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章']
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      },
      max: 100
    }
  ],
  series: [
    {
      name: '优秀率',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [25, 28, 22, 30, 35, 32, 38, 40]
    },
    {
      name: '良好率',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [35, 32, 30, 35, 30, 36, 32, 35]
    },
    {
      name: '及格率',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [25, 26, 30, 25, 25, 22, 20, 18]
    },
    {
      name: '不及格率',
      type: 'line',
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [15, 14, 18, 10, 10, 10, 10, 7]
    }
  ]
}))

onMounted(() => {
  // 在实际项目中，这里可以调用API获取数据
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.dashboard-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  align-items: center;
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.blue {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.green {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.orange {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.purple {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.value-container {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.trend {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.up {
  color: #67C23A;
  margin-right: 5px;
}

.down {
  color: #F56C6C;
  margin-right: 5px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.chart {
  height: 300px;
}

.wide-chart {
  height: 350px;
}

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-with-action h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}
</style>
