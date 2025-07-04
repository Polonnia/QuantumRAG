<template>
  <div class="exam-generator">
    <el-card class="exam-generator-card">
      <template #header>
        <div class="card-header">
          <h2>考核生成</h2>
          <div>
            <el-button type="primary" @click="generateExam" :loading="generating">
              <el-icon><Aim /></el-icon>AI生成试卷
            </el-button>
            <el-button @click="saveExam" :disabled="!currentExam.title">
              <el-icon><DocumentAdd /></el-icon>保存
            </el-button>
            <el-button @click="exportExam" :disabled="!currentExam.title">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
        </div>
      </template>

      <div class="generate-form-container">
        <el-form :model="examConfig" label-width="100px" label-position="top">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="课程">
                <el-select v-model="examConfig.courseId" placeholder="选择课程" style="width: 100%">
                  <el-option
                    v-for="course in coursesList"
                    :key="course.id"
                    :label="course.title"
                    :value="course.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="试卷名称">
                <el-input v-model="currentExam.title" placeholder="输入试卷名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="考试时长(分钟)">
                <el-input-number v-model="examConfig.duration" :min="15" :max="180" :step="15" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider>题型设置</el-divider>

          <div class="question-type-config">
            <el-row :gutter="20">
              <el-col :span="6" v-for="(type, index) in questionTypes" :key="index">
                <el-card shadow="hover" class="question-type-card">
                  <div class="question-type-header">
                    <div class="type-title">{{ type.label }}</div>
                    <el-switch v-model="type.enabled" />
                  </div>
                  <div v-if="type.enabled" class="question-type-content">
                    <div class="type-settings">
                      <div class="setting-item">
                        <span>题目数量</span>
                        <el-input-number v-model="type.count" :min="1" :max="20" size="small" />
                      </div>
                      <div class="setting-item">
                        <span>每题分数</span>
                        <el-input-number v-model="type.score" :min="1" :max="20" size="small" />
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <el-divider>知识点选择</el-divider>

          <div class="knowledge-points-selection">
            <el-tree
              ref="knowledgeTree"
              :data="knowledgePoints"
              show-checkbox
              node-key="id"
              :props="{ label: 'title', children: 'children' }"
            />
          </div>

          <el-divider>难度分布</el-divider>

          <div class="difficulty-distribution">
            <el-slider
              v-model="examConfig.difficultyDistribution"
              range
              :marks="difficultyMarks"
              :step="10"
              :min="0"
              :max="100"
            />
            <div class="difficulty-labels">
              <span>简单</span>
              <span>中等</span>
              <span>困难</span>
            </div>
          </div>
        </el-form>
      </div>
    </el-card>

    <el-card v-if="currentExam.questions.length > 0" class="exam-preview-card">
      <template #header>
        <div class="card-header">
          <h2>试卷预览</h2>
          <el-switch v-model="showAnswers" active-text="显示答案" inactive-text="隐藏答案" />
        </div>
      </template>

      <div class="exam-preview">
        <h1 class="exam-title">{{ currentExam.title }}</h1>
        <div class="exam-meta">
          <div>总分: {{ calculateTotalScore() }}分</div>
          <div>考试时长: {{ examConfig.duration }}分钟</div>
        </div>

        <div v-for="(section, sectionIndex) in examSections" :key="sectionIndex" class="exam-section">
          <h3 class="section-title">{{ section.title }} (每题{{ section.score }}分)</h3>
          
          <div v-for="(question, questionIndex) in section.questions" :key="questionIndex" class="question-item">
            <div class="question-header">
              <span class="question-number">{{ questionIndex + 1 }}.</span>
              <div class="question-content" v-html="question.content"></div>
            </div>
            
            <div v-if="question.type === 'concept' && question.options" class="question-options">
              <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                <span class="option-label">{{ ['A', 'B', 'C', 'D'][optionIndex] }}.</span>
                <span class="option-content">{{ option }}</span>
              </div>
            </div>

            <div v-if="showAnswers" class="question-answer">
              <div class="answer-label">答案:</div>
              <div class="answer-content">{{ question.answer }}</div>
              <div class="answer-label">解析:</div>
              <div class="answer-content" v-html="question.analysis"></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="saveDialogVisible"
      title="保存试卷"
      width="30%"
    >
      <el-form :model="saveForm" label-width="80px">
        <el-form-item label="试卷名称">
          <el-input v-model="saveForm.title" />
        </el-form-item>
        <el-form-item label="适用班级">
          <el-select v-model="saveForm.classes" multiple placeholder="选择班级" style="width: 100%">
            <el-option
              v-for="cls in classesList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期">
          <el-date-picker
            v-model="saveForm.examDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSave">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Aim, DocumentAdd, Download } from '@element-plus/icons-vue'
import type { Exercise, Course } from '../../types'

// 问题类型配置
const questionTypes = reactive([
  { label: '概念题', value: 'concept', enabled: true, count: 10, score: 4 },
  { label: '填空题', value: 'fillBlank', enabled: true, count: 5, score: 6 },
  { label: '简答题', value: 'shortAnswer', enabled: true, count: 3, score: 10 },
  { label: '编程题', value: 'programming', enabled: false, count: 1, score: 20 },
])

// 试卷配置
const examConfig = reactive({
  courseId: '',
  duration: 90,
  difficultyDistribution: [20, 70], // 表示简单:20%, 中等:50%, 困难:30%
})

// 当前试卷
const currentExam = reactive({
  title: '',
  questions: [] as Exercise[],
})

// 难度标记
const difficultyMarks = {
  0: '0%',
  20: '20%',
  40: '40%',
  60: '60%',
  80: '80%',
  100: '100%',
}

// 状态变量
const generating = ref(false)
const showAnswers = ref(false)
const saveDialogVisible = ref(false)
const saveForm = reactive({
  title: '',
  classes: [] as (string | number)[],
  examDate: null as Date | null,
})

// 课程列表（模拟数据）
const coursesList = ref<Course[]>([
  { id: 1, title: '数据结构与算法', description: '计算机基础课程', knowledgePoints: [] },
  { id: 2, title: '计算机网络', description: '计算机基础课程', knowledgePoints: [] },
  { id: 3, title: '人工智能导论', description: '人工智能基础', knowledgePoints: [] },
])

// 班级列表（模拟数据）
const classesList = ref([
  { id: 1, name: '计算机科学2022-1班' },
  { id: 2, name: '计算机科学2022-2班' },
  { id: 3, name: '软件工程2022-1班' },
  { id: 4, name: '人工智能2022-1班' },
])

// 知识点树形结构（模拟数据）
const knowledgePoints = ref([
  {
    id: 1,
    title: '数据结构基础',
    children: [
      { id: 11, title: '数组与链表' },
      { id: 12, title: '栈与队列' },
      { id: 13, title: '树与二叉树' }
    ]
  },
  {
    id: 2,
    title: '算法设计',
    children: [
      { id: 21, title: '排序算法' },
      { id: 22, title: '搜索算法' },
      { id: 23, title: '动态规划' }
    ]
  }
])

// 计算试卷各部分
const examSections = computed(() => {
  const sections = []
  
  for (const type of questionTypes) {
    if (type.enabled && type.count > 0) {
      const questionsOfType = currentExam.questions.filter(q => q.type === type.value)
      if (questionsOfType.length > 0) {
        sections.push({
          title: type.label,
          score: type.score,
          questions: questionsOfType.slice(0, type.count)
        })
      }
    }
  }
  
  return sections
})

// 计算总分
const calculateTotalScore = () => {
  let total = 0
  for (const type of questionTypes) {
    if (type.enabled) {
      total += type.count * type.score
    }
  }
  return total
}

// 生成试卷
const generateExam = async () => {
  if (!examConfig.courseId) {
    ElMessage.warning('请先选择课程')
    return
  }
  
  generating.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟返回的试卷数据
    currentExam.title = coursesList.value.find(c => c.id === examConfig.courseId)?.title + ' 期末考试'
    currentExam.questions = [
      {
        id: 1,
        type: 'concept',
        title: '数据结构概念题',
        content: '下列关于栈的描述中，错误的是？',
        options: [
          '栈是一种后进先出的数据结构',
          '栈只能在一端进行插入和删除操作',
          '栈可以在任意位置访问元素',
          '栈的基本操作有push和pop'
        ],
        answer: 'C. 栈可以在任意位置访问元素',
        analysis: '栈是一种后进先出(LIFO)的数据结构，只能在栈顶进行插入和删除操作，不能在任意位置访问元素。',
        knowledgePointIds: [12],
        difficulty: 2
      },
      {
        id: 2,
        type: 'concept',
        title: '算法复杂度',
        content: '快速排序的平均时间复杂度是？',
        options: [
          'O(n)',
          'O(n log n)',
          'O(n²)',
          'O(n!)'
        ],
        answer: 'B. O(n log n)',
        analysis: '快速排序的平均时间复杂度为O(n log n)，最坏情况下为O(n²)。',
        knowledgePointIds: [21],
        difficulty: 3
      },
      // 更多概念题...省略其他8个概念题
      
      {
        id: 11,
        type: 'fillBlank',
        title: '填空题',
        content: '在二叉树中，若一个节点有两个子节点，则其左子节点的值总是_____该节点的值。',
        answer: '小于',
        analysis: '在二叉搜索树中，左子节点的值总是小于父节点的值，右子节点的值总是大于父节点的值。',
        knowledgePointIds: [13],
        difficulty: 3
      },
      // 更多填空题...省略其他4个填空题
      
      {
        id: 16,
        type: 'shortAnswer',
        title: '简答题',
        content: '请简述动态规划的基本原理和适用场景。',
        answer: '动态规划是通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。它适用于有重叠子问题和最优子结构性质的问题。基本原理是通过定义状态，找出状态转移方程，自底向上或自顶向下地求解问题。',
        analysis: '动态规划的核心思想是将复杂问题分解成简单子问题，避免重复计算子问题。其适用场景包括最优化问题（如最短路径、背包问题）、计数问题和最值问题等。',
        knowledgePointIds: [23],
        difficulty: 4
      },
      // 更多简答题...省略其他2个简答题
    ]
    
    ElMessage.success('试卷生成成功')
  } catch (error) {
    console.error('生成试卷失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 保存试卷
const saveExam = () => {
  saveForm.title = currentExam.title
  saveDialogVisible.value = true
}

// 确认保存
const confirmSave = async () => {
  if (!saveForm.title) {
    ElMessage.warning('请输入试卷名称')
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('试卷保存成功')
    saveDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  }
}

// 导出试卷
const exportExam = () => {
  ElMessageBox.confirm('确认导出试卷？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 模拟导出功能
    ElMessage.success('试卷已导出')
  }).catch(() => {})
}

onMounted(() => {
  // 可以在这里加载课程和知识点数据
})
</script>

<style scoped>
.exam-generator {
  padding: 20px;
}

.exam-generator-card,
.exam-preview-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.generate-form-container {
  margin-top: 20px;
}

.question-type-config {
  margin: 20px 0;
}

.question-type-card {
  margin-bottom: 15px;
  transition: all 0.3s;
}

.question-type-card:hover {
  transform: translateY(-3px);
}

.question-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.type-title {
  font-weight: bold;
  font-size: 16px;
}

.question-type-content {
  margin-top: 15px;
}

.type-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge-points-selection {
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.difficulty-distribution {
  padding: 20px 0;
}

.difficulty-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #606266;
}

/* 试卷预览样式 */
.exam-preview {
  padding: 20px;
}

.exam-title {
  text-align: center;
  margin-bottom: 20px;
}

.exam-meta {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  font-size: 16px;
  font-weight: bold;
}

.exam-section {
  margin-bottom: 30px;
}

.section-title {
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.question-item {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.3s;
}

.question-item:hover {
  border-color: #dcdfe6;
  background-color: #f5f7fa;
}

.question-header {
  display: flex;
  margin-bottom: 10px;
}

.question-number {
  margin-right: 8px;
  font-weight: bold;
}

.question-options {
  margin-left: 24px;
  margin-top: 10px;
}

.option-item {
  margin-bottom: 8px;
}

.option-label {
  margin-right: 8px;
  font-weight: bold;
}

.question-answer {
  margin-top: 15px;
  padding: 10px;
  border-top: 1px dashed #dcdfe6;
  background-color: #f8f9fa;
}

.answer-label {
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.answer-content {
  margin-bottom: 15px;
}
</style>
