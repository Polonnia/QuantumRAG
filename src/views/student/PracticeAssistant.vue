<template>
  <div class="practice-assistant">
    <el-row :gutter="20">
      <!-- 左侧练习列表 -->
      <el-col :span="6">
        <el-card class="left-panel">
          <template #header>
            <div class="panel-header">
              <h3>练习列表</h3>
              <el-input
                v-model="searchQuery"
                placeholder="搜索练习"
                prefix-icon="Search"
                clearable
                size="small"
              />
            </div>
          </template>
          
          <div class="practice-filters">
            <el-select v-model="filters.courseId" placeholder="课程" style="width: 100%" size="small">
              <el-option
                v-for="course in courses"
                :key="course.id"
                :label="course.title"
                :value="course.id"
              />
            </el-select>
            
            <el-select v-model="filters.type" placeholder="题型" style="width: 100%" size="small">
              <el-option label="全部类型" value="" />
              <el-option label="概念题" value="concept" />
              <el-option label="填空题" value="fillBlank" />
              <el-option label="简答题" value="shortAnswer" />
              <el-option label="编程题" value="programming" />
            </el-select>
            
            <el-select v-model="filters.difficulty" placeholder="难度" style="width: 100%" size="small">
              <el-option label="全部难度" value="0" />
              <el-option label="初级" value="1" />
              <el-option label="中级" value="2" />
              <el-option label="高级" value="3" />
              <el-option label="专家" value="4" />
            </el-select>
          </div>
          
          <el-tabs v-model="activeListTab">
            <el-tab-pane label="推荐练习" name="recommended">
              <div class="practice-list">
                <div
                  v-for="exercise in filteredExercises"
                  :key="exercise.id"
                  class="practice-item"
                  :class="{ active: currentExercise && currentExercise.id === exercise.id }"
                  @click="selectExercise(exercise)"
                >
                  <div class="practice-item-header">
                    <el-tag size="small" :type="getExerciseTypeTagType(exercise.type)">
                      {{ getExerciseTypeLabel(exercise.type) }}
                    </el-tag>
                    <div class="practice-item-difficulty">
                      <el-rate
                        v-model="exercise.difficulty"
                        disabled
                        :max="5"
                        size="small"
                        text-color="#ff9900"
                      />
                    </div>
                  </div>
                  <div class="practice-item-title">{{ exercise.title }}</div>
                  <div class="practice-item-footer">
                    <span v-if="exercise.completed" class="practice-status completed">
                      <el-icon><Check /></el-icon>已完成
                    </span>
                    <span v-else class="practice-status">
                      <el-icon><Timer /></el-icon>待完成
                    </span>
                    <span class="practice-score" v-if="exercise.score !== undefined">
                      得分: {{ exercise.score }}
                    </span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="错题集" name="mistakes">
              <div class="practice-list">
                <div
                  v-for="exercise in mistakeExercises"
                  :key="exercise.id"
                  class="practice-item"
                  :class="{ active: currentExercise && currentExercise.id === exercise.id }"
                  @click="selectExercise(exercise)"
                >
                  <div class="practice-item-header">
                    <el-tag size="small" :type="getExerciseTypeTagType(exercise.type)">
                      {{ getExerciseTypeLabel(exercise.type) }}
                    </el-tag>
                    <div class="practice-item-difficulty">
                      <el-rate
                        v-model="exercise.difficulty"
                        disabled
                        :max="5"
                        size="small"
                        text-color="#ff9900"
                      />
                    </div>
                  </div>
                  <div class="practice-item-title">{{ exercise.title }}</div>
                  <div class="practice-item-footer">
                    <span class="practice-status error">
                      <el-icon><WarningFilled /></el-icon>错误次数: {{ exercise.errorCount }}
                    </span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      
      <!-- 右侧练习内容 -->
      <el-col :span="18">
        <div v-if="!currentExercise" class="empty-state">
          <el-empty description="请从左侧选择一道练习题">
            <el-button type="primary" @click="startRecommendedPractice">开始推荐练习</el-button>
          </el-empty>
        </div>
        
        <div v-else>
          <el-card class="question-card">
            <template #header>
              <div class="question-header">
                <div class="question-meta">
                  <el-tag :type="getExerciseTypeTagType(currentExercise.type)" size="large">
                    {{ getExerciseTypeLabel(currentExercise.type) }}
                  </el-tag>
                  <span class="question-difficulty">
                    难度: 
                    <el-rate
                      v-model="currentExercise.difficulty"
                      disabled
                      :max="5"
                      size="small"
                      text-color="#ff9900"
                    />
                  </span>
                </div>
                <div class="question-actions">
                  <el-button v-if="showTimer" type="text">
                    <el-icon><Timer /></el-icon>
                    {{ formatTime(timer) }}
                  </el-button>
                  <el-button v-if="!isSubmitted" type="info" @click="requestHint">
                    <el-icon><WarnTriangleFilled /></el-icon>提示
                  </el-button>
                  <el-button type="primary" v-if="!isSubmitted" @click="submitAnswer">
                    <el-icon><Check /></el-icon>提交
                  </el-button>
                  <el-button v-else @click="nextExercise">
                    <el-icon><ArrowRight /></el-icon>下一题
                  </el-button>
                </div>
              </div>
            </template>
            
            <!-- 题目内容 -->
            <div class="question-content">
              <h2 class="question-title">{{ currentExercise.title }}</h2>
              <div class="question-description" v-html="currentExercise.content"></div>
              
              <!-- 选择题选项 -->
              <div v-if="currentExercise.type === 'concept' && currentExercise.options" class="question-options">
                <el-radio-group v-model="userAnswer.conceptAnswer" :disabled="isSubmitted">
                  <div class="option-item" v-for="(option, index) in currentExercise.options" :key="index">
                    <el-radio :label="index">
                      {{ ['A', 'B', 'C', 'D'][index] }}: {{ option }}
                    </el-radio>
                    <div class="option-feedback" v-if="isSubmitted">
                      <el-icon v-if="isCorrectOption(index)" class="correct-icon"><SuccessFilled /></el-icon>
                      <el-icon v-else-if="userAnswer.conceptAnswer === index" class="error-icon"><CircleCloseFilled /></el-icon>
                    </div>
                  </div>
                </el-radio-group>
              </div>
              
              <!-- 填空题答案 -->
              <div v-else-if="currentExercise.type === 'fillBlank'" class="question-fill-blank">
                <el-input
                  v-model="userAnswer.fillBlankAnswer"
                  placeholder="请输入答案"
                  :disabled="isSubmitted"
                  class="fill-blank-input"
                />
              </div>
              
              <!-- 简答题答案 -->
              <div v-else-if="currentExercise.type === 'shortAnswer'" class="question-short-answer">
                <el-input
                  v-model="userAnswer.shortAnswerContent"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入你的答案"
                  :disabled="isSubmitted"
                />
              </div>
              
              <!-- 编程题代码编辑器 -->
              <div v-else-if="currentExercise.type === 'programming'" class="question-programming">
                <div class="code-editor">
                  <div class="editor-header">
                    <span>编程解答:</span>
                    <el-select v-model="programLanguage" size="small" style="width: 120px;" :disabled="isSubmitted">
                      <el-option label="Python" value="python" />
                      <el-option label="JavaScript" value="javascript" />
                      <el-option label="Java" value="java" />
                    </el-select>
                  </div>
                  <el-input
                    v-model="userAnswer.programmingCode"
                    type="textarea"
                    :rows="15"
                    class="code-textarea"
                    :placeholder="getCodePlaceholder()"
                    :disabled="isSubmitted"
                  />
                  <div class="editor-actions" v-if="!isSubmitted">
                    <el-button size="small" @click="runCode">
                      <el-icon><VideoPlay /></el-icon>运行代码
                    </el-button>
                  </div>
                </div>
                
                <div v-if="codeResult" class="code-result">
                  <div class="result-header">
                    <span>运行结果:</span>
                    <el-tag :type="codeResult.success ? 'success' : 'danger'">
                      {{ codeResult.success ? '成功' : '错误' }}
                    </el-tag>
                  </div>
                  <pre class="result-output">{{ codeResult.output }}</pre>
                </div>
              </div>
            </div>
            
            <!-- 提交后的反馈 -->
            <div v-if="isSubmitted" class="answer-feedback">
              <el-divider>答案与解析</el-divider>
              
              <el-result
                :icon="answerCorrect ? 'success' : 'error'"
                :title="answerCorrect ? '恭喜，回答正确！' : '回答不正确'"
                :sub-title="answerCorrect ? '你真棒！继续保持！' : '不要灰心，仔细看看解析吧'"
              />
              
              <div class="correct-answer">
                <div class="answer-label">正确答案:</div>
                <div class="answer-content">{{ currentExercise.answer }}</div>
              </div>
              
              <div class="answer-analysis">
                <div class="answer-label">解析:</div>
                <div class="answer-content" v-html="currentExercise.analysis"></div>
              </div>
              
              <div class="answer-knowledge">
                <div class="answer-label">相关知识点:</div>
                <div class="knowledge-tags">
                  <el-tag
                    v-for="knowledge in relatedKnowledge"
                    :key="knowledge.id"
                    effect="plain"
                    class="knowledge-tag"
                    @click="viewKnowledge(knowledge)"
                  >
                    {{ knowledge.title }}
                  </el-tag>
                </div>
              </div>
              
              <!-- AI助手辅导 -->
              <div class="ai-coaching">
                <div class="ai-coaching-header">
                  <el-icon class="ai-icon"><Connection /></el-icon>
                  <span>AI学习助手分析</span>
                </div>
                <div class="ai-coaching-content">
                  <div v-if="answerCorrect">
                    <p>你对该知识点的掌握很好，以下是一些进阶建议：</p>
                    <ul>
                      <li>尝试探索这个知识点的更高级应用场景</li>
                      <li>可以帮助其他同学解答相关问题，这样能加深你的理解</li>
                      <li>尝试将这个知识点与其他知识点结合，形成知识网络</li>
                    </ul>
                  </div>
                  <div v-else>
                    <p>根据你的作答情况，我发现以下几点需要注意：</p>
                    <ul>
                      <li>你在理解{{ aiCoachingTips[0] }}方面存在一些混淆</li>
                      <li>建议重点复习{{ aiCoachingTips[1] }}相关的内容</li>
                      <li>你可以尝试先解决一些类似但更简单的问题来巩固概念</li>
                    </ul>
                  </div>
                  <div class="ai-resources">
                    <p><strong>推荐资源:</strong></p>
                    <div class="resource-list">
                      <div v-for="(resource, index) in aiRecommendedResources" :key="index" class="resource-item">
                        <el-icon><Document /></el-icon>
                        <a href="javascript:void(0)" @click="openResource(resource)">{{ resource.title }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
          
          <el-card v-if="!isSubmitted && similarExercises.length > 0" class="similar-exercises-card">
            <template #header>
              <div class="card-header">
                <h3>相似练习</h3>
              </div>
            </template>
            
            <div class="similar-exercises">
              <div
                v-for="exercise in similarExercises"
                :key="exercise.id"
                class="similar-exercise-item"
                @click="selectExercise(exercise)"
              >
                <div class="exercise-badge">
                  <el-tag size="small" :type="getExerciseTypeTagType(exercise.type)">
                    {{ getExerciseTypeLabel(exercise.type) }}
                  </el-tag>
                </div>
                <div class="exercise-title">{{ exercise.title }}</div>
                <div class="exercise-meta">
                  <span class="difficulty">
                    <el-rate
                      v-model="exercise.difficulty"
                      disabled
                      :max="5"
                      size="small"
                      text-color="#ff9900"
                    />
                  </span>
                  <span v-if="exercise.completed" class="status completed">
                    <el-icon><Check /></el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
    
    <!-- 知识点弹窗 -->
    <el-dialog
      v-model="knowledgeDialogVisible"
      :title="selectedKnowledge ? selectedKnowledge.title : '知识点详情'"
      width="60%"
    >
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="knowledge-content" v-html="selectedKnowledge.content"></div>
        
        <el-divider>示例</el-divider>
        <div class="knowledge-examples">
          <div class="example-item" v-for="(example, index) in selectedKnowledge.examples" :key="index">
            <div class="example-header">示例 {{ index + 1 }}</div>
            <div class="example-content" v-html="example"></div>
          </div>
        </div>
        
        <el-divider>笔记</el-divider>
        <div class="knowledge-notes">
          <div class="note-item" v-for="(note, index) in selectedKnowledge.notes" :key="index">
            <div class="note-content" v-html="note"></div>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 提示弹窗 -->
    <el-dialog
      v-model="hintDialogVisible"
      title="解题提示"
      width="50%"
    >
      <div class="hint-content">
        <p>以下是帮助你解决此题的一些提示：</p>
        <ul>
          <li v-for="(hint, index) in exerciseHints" :key="index">{{ hint }}</li>
        </ul>
        <el-alert
          title="学习建议"
          type="info"
          :closable="false"
          description="使用提示可能会影响你对知识的掌握评估。建议只在真正需要时使用提示。"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Check, Timer, WarningFilled, SuccessFilled, CircleCloseFilled, ArrowRight,
  WarnTriangleFilled, VideoPlay, Connection, Document
} from '@element-plus/icons-vue'
import type { Exercise, KnowledgePoint } from '../../types'

// 练习列表状态
const searchQuery = ref('')
const activeListTab = ref('recommended')
const filters = reactive({
  courseId: '',
  type: '',
  difficulty: '0'
})
const currentExercise = ref<Exercise | null>(null)
const similarExercises = ref<Exercise[]>([])

// 答题状态
const userAnswer = reactive({
  conceptAnswer: -1,
  fillBlankAnswer: '',
  shortAnswerContent: '',
  programmingCode: ''
})
const isSubmitted = ref(false)
const answerCorrect = ref(false)
const programLanguage = ref('python')
const codeResult = ref<{ success: boolean; output: string } | null>(null)
const showTimer = ref(false)
const timer = ref(0)
let timerInterval: number | null = null

// 对话框状态
const knowledgeDialogVisible = ref(false)
const hintDialogVisible = ref(false)
const selectedKnowledge = ref<KnowledgePoint | null>(null)
const exerciseHints = ref<string[]>([])

// AI教练提示（模拟）
const aiCoachingTips = ref(['算法复杂度的计算', '递归与迭代的区别'])
const aiRecommendedResources = ref([
  { id: 1, title: '数据结构基础概念解析', type: 'document', url: '#' },
  { id: 2, title: '算法分析方法视频课程', type: 'video', url: '#' },
  { id: 3, title: '编程实践：实现常见数据结构', type: 'exercise', url: '#' }
])

// 课程列表（模拟）
const courses = ref([
  { id: 1, title: '数据结构与算法' },
  { id: 2, title: '计算机网络' },
  { id: 3, title: '人工智能导论' }
])

// 练习列表（模拟）
const exercises = ref<Exercise[]>([
  {
    id: 1,
    type: 'concept',
    title: '数据结构基础概念',
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
    difficulty: 2,
    completed: true,
    score: 90
  },
  {
    id: 2,
    type: 'concept',
    title: '算法复杂度分析',
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
    difficulty: 3,
    completed: true,
    score: 100
  },
  {
    id: 3,
    type: 'fillBlank',
    title: '二叉树性质',
    content: '在二叉树中，若一个节点有两个子节点，则其左子节点的值总是_____该节点的值。',
    answer: '小于',
    analysis: '在二叉搜索树中，左子节点的值总是小于父节点的值，右子节点的值总是大于父节点的值。',
    knowledgePointIds: [13],
    difficulty: 3,
    completed: false
  },
  {
    id: 4,
    type: 'shortAnswer',
    title: '动态规划原理',
    content: '请简述动态规划的基本原理和适用场景。',
    answer: '动态规划是通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。它适用于有重叠子问题和最优子结构性质的问题。基本原理是通过定义状态，找出状态转移方程，自底向上或自顶向下地求解问题。',
    analysis: '动态规划的核心思想是将复杂问题分解成简单子问题，避免重复计算子问题。其适用场景包括最优化问题（如最短路径、背包问题）、计数问题和最值问题等。',
    knowledgePointIds: [23],
    difficulty: 4,
    completed: false
  },
  {
    id: 5,
    type: 'programming',
    title: '实现栈数据结构',
    content: '请使用你选择的编程语言实现一个栈(Stack)数据结构，要求包含push、pop、peek和isEmpty方法。',
    answer: '```python\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        if not self.isEmpty():\n            return self.items.pop()\n        return None\n    \n    def peek(self):\n        if not self.isEmpty():\n            return self.items[-1]\n        return None\n    \n    def isEmpty(self):\n        return len(self.items) == 0\n```',
    analysis: '栈是一种后进先出(LIFO)的数据结构，上面的实现使用Python列表作为底层存储，并封装了栈的标准操作。',
    knowledgePointIds: [12],
    difficulty: 3,
    completed: false
  }
])

// 错题集（模拟）
const mistakeExercises = ref<Exercise[]>([
  {
    id: 6,
    type: 'concept',
    title: '红黑树特性',
    content: '下列哪项不是红黑树的特性？',
    options: [
      '每个节点要么是红色，要么是黑色',
      '根节点必须是红色',
      '所有叶子节点(NIL)都是黑色',
      '从根到叶子的所有路径上，黑色节点数量相同'
    ],
    answer: 'B. 根节点必须是红色',
    analysis: '红黑树的根节点必须是黑色，而不是红色。红黑树的其他特性包括：每个节点要么是红色要么是黑色；所有叶子节点(NIL)都是黑色；如果一个节点是红色，则其两个子节点都是黑色；从根到叶子的所有路径上，黑色节点数量相同。',
    knowledgePointIds: [13],
    difficulty: 4,
    errorCount: 2
  },
  {
    id: 7,
    type: 'programming',
    title: '合并两个有序数组',
    content: '编写一个函数，将两个有序数组合并为一个新的有序数组。',
    answer: '```python\ndef merge_sorted_arrays(arr1, arr2):\n    result = []\n    i = j = 0\n    \n    while i < len(arr1) and j < len(arr2):\n        if arr1[i] < arr2[j]:\n            result.append(arr1[i])\n            i += 1\n        else:\n            result.append(arr2[j])\n            j += 1\n    \n    while i < len(arr1):\n        result.append(arr1[i])\n        i += 1\n    \n    while j < len(arr2):\n        result.append(arr2[j])\n        j += 1\n    \n    return result\n```',
    analysis: '这个函数使用双指针方法合并两个有序数组。比较两个数组当前元素的大小，将较小的元素添加到结果数组中，然后移动对应的指针。最后，将剩余元素添加到结果数组。',
    knowledgePointIds: [21],
    difficulty: 3,
    errorCount: 1
  }
])

// 相关知识点（模拟）
const relatedKnowledge = ref<KnowledgePoint[]>([
  {
    id: 12,
    title: '栈与队列',
    content: '<p>栈(Stack)是一种遵循后进先出(LIFO, Last In First Out)原则的线性数据结构。栈只允许在一端(栈顶)进行操作。栈的基本操作包括：</p><ul><li>push：将元素添加到栈顶</li><li>pop：移除栈顶元素</li><li>peek/top：获取栈顶元素但不移除</li><li>isEmpty：检查栈是否为空</li></ul><p>栈的典型应用包括函数调用、表达式求值、括号匹配、撤销操作等。</p>',
    examples: [
      '函数调用栈：当一个函数被调用时，它的执行信息会被压入调用栈，函数执行完毕后再从栈中弹出。',
      '浏览器的历史记录：浏览器的前进和后退功能就是两个栈的应用。'
    ],
    notes: [
      '栈可以用数组或链表实现，但无论使用哪种方式，都应保证操作的时间复杂度为O(1)。',
      '在递归算法中，系统使用栈来管理函数调用。如果递归深度过大，可能导致栈溢出错误。'
    ]
  },
  {
    id: 21,
    title: '排序算法',
    content: '<p>排序算法是计算机科学中最基本的算法之一，用于将一组数据按照特定顺序重新排列。常见的排序算法包括：</p><ul><li>冒泡排序：相邻元素比较交换，时间复杂度O(n²)</li><li>选择排序：找出最小/大元素放到已排序部分，时间复杂度O(n²)</li><li>插入排序：将元素插入已排序部分，时间复杂度O(n²)</li><li>归并排序：分治法，时间复杂度O(n log n)</li><li>快速排序：分治法，平均时间复杂度O(n log n)</li><li>堆排序：利用堆数据结构，时间复杂度O(n log n)</li></ul>',
    examples: [
      '快速排序示例：```python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n```'
    ],
    notes: [
      '选择排序算法时需要考虑数据规模、稳定性需求、空间复杂度和是否需要原地排序等因素。',
      '在实际应用中，对于小规模数据，简单的排序算法(如插入排序)可能比复杂算法更高效。'
    ]
  }
])

// 计算过滤后的练习列表
const filteredExercises = computed(() => {
  return exercises.value.filter(exercise => {
    // 搜索关键字过滤
    if (searchQuery.value && !exercise.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    
    // 课程过滤
    if (filters.courseId && !exercise.courseId) {
      // 模拟：假设当前练习都属于选中课程
      // 实际中应该检查 exercise.courseId === filters.courseId
    }
    
    // 类型过滤
    if (filters.type && exercise.type !== filters.type) {
      return false
    }
    
    // 难度过滤
    if (filters.difficulty !== '0' && exercise.difficulty !== Number(filters.difficulty)) {
      return false
    }
    
    return true
  })
})

// 获取练习类型标签类型
const getExerciseTypeTagType = (type: string) => {
  switch(type) {
    case 'concept': return ''
    case 'fillBlank': return 'success'
    case 'shortAnswer': return 'warning'
    case 'programming': return 'danger'
    default: return 'info'
  }
}

// 获取练习类型标签文本
const getExerciseTypeLabel = (type: string) => {
  switch(type) {
    case 'concept': return '概念题'
    case 'fillBlank': return '填空题'
    case 'shortAnswer': return '简答题'
    case 'programming': return '编程题'
    default: return '未知类型'
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取代码编辑器占位符
const getCodePlaceholder = () => {
  switch(programLanguage.value) {
    case 'python':
      return '# 在这里编写你的Python代码\n\n'
    case 'javascript':
      return '// 在这里编写你的JavaScript代码\n\n'
    case 'java':
      return '// 在这里编写你的Java代码\npublic class Solution {\n    public static void main(String[] args) {\n        // 你的代码\n    }\n}\n'
    default:
      return '// 在这里编写你的代码'
  }
}

// 检查选项是否正确
const isCorrectOption = (index: number) => {
  if (!currentExercise.value || !currentExercise.value.answer) return false
  
  // 假设答案格式为 "A. 选项内容" 或 "B. 选项内容" 等
  const correctOption = currentExercise.value.answer.charAt(0)
  return ['A', 'B', 'C', 'D'][index] === correctOption
}

// 选择练习题
const selectExercise = (exercise: Exercise) => {
  // 重置状态
  currentExercise.value = exercise
  isSubmitted.value = false
  answerCorrect.value = false
  userAnswer.conceptAnswer = -1
  userAnswer.fillBlankAnswer = ''
  userAnswer.shortAnswerContent = ''
  userAnswer.programmingCode = ''
  codeResult.value = null
  
  // 开始计时
  startTimer()
  
  // 加载相似题目
  loadSimilarExercises()
}

// 开始推荐练习
const startRecommendedPractice = () => {
  const unfinishedExercises = exercises.value.filter(ex => !ex.completed)
  if (unfinishedExercises.length > 0) {
    selectExercise(unfinishedExercises[0])
  } else {
    selectExercise(exercises.value[0])
  }
}

// 加载相似练习
const loadSimilarExercises = () => {
  if (!currentExercise.value) return
  
  // 模拟：根据当前练习类型和难度找出相似练习
  similarExercises.value = exercises.value.filter(ex => 
    ex.id !== currentExercise.value?.id && 
    (ex.type === currentExercise.value?.type || 
     ex.difficulty === currentExercise.value?.difficulty)
  ).slice(0, 3)
}

// 提交答案
const submitAnswer = () => {
  if (!currentExercise.value) return
  
  // 停止计时
  stopTimer()
  
  // 根据题目类型检查答案
  const type = currentExercise.value.type
  if (type === 'concept') {
    if (userAnswer.conceptAnswer === -1) {
      ElMessage.warning('请选择一个选项')
      return
    }
    // 检查选项是否正确
    answerCorrect.value = isCorrectOption(userAnswer.conceptAnswer)
  } else if (type === 'fillBlank') {
    if (!userAnswer.fillBlankAnswer.trim()) {
      ElMessage.warning('请输入填空答案')
      return
    }
    // 简单字符串匹配（实际中可能需要更复杂的匹配逻辑）
    answerCorrect.value = currentExercise.value.answer.includes(userAnswer.fillBlankAnswer.trim())
  } else if (type === 'shortAnswer' || type === 'programming') {
    // 简答题和编程题需要教师或AI评阅，这里模拟一个评分过程
    if ((type === 'shortAnswer' && !userAnswer.shortAnswerContent.trim()) || 
        (type === 'programming' && !userAnswer.programmingCode.trim())) {
      ElMessage.warning('请输入你的答案')
      return
    }
    // 模拟：随机生成一个评分结果
    answerCorrect.value = Math.random() > 0.3
  }
  
  isSubmitted.value = true
  
  // 更新练习状态（在实际应用中应该保存到服务器）
  const index = exercises.value.findIndex(ex => ex.id === currentExercise.value?.id)
  if (index !== -1) {
    exercises.value[index].completed = true
    exercises.value[index].score = answerCorrect.value ? 100 : Math.floor(Math.random() * 60) + 20
  }
  
  ElMessage({
    message: answerCorrect.value ? '回答正确！' : '回答不正确，查看解析了解更多。',
    type: answerCorrect.value ? 'success' : 'error'
  })
}

// 进入下一题
const nextExercise = () => {
  const currentIndex = filteredExercises.value.findIndex(ex => ex.id === currentExercise.value?.id)
  if (currentIndex !== -1 && currentIndex < filteredExercises.value.length - 1) {
    selectExercise(filteredExercises.value[currentIndex + 1])
  } else {
    ElMessage.info('已经是最后一题了')
  }
}

// 请求提示
const requestHint = () => {
  if (!currentExercise.value) return
  
  // 根据不同题型生成不同的提示
  const type = currentExercise.value.type
  
  if (type === 'concept') {
    exerciseHints.value = [
      '仔细阅读每个选项，排除明显错误的选择。',
      '思考栈的基本性质和操作限制。',
      '考虑哪个选项与栈的"后进先出"特性矛盾。'
    ]
  } else if (type === 'fillBlank') {
    exerciseHints.value = [
      '考虑二叉搜索树的基本性质。',
      '二叉搜索树的节点值有特定的排序规则。',
      '左子树和右子树的节点值与根节点有什么关系？'
    ]
  } else if (type === 'shortAnswer') {
    exerciseHints.value = [
      '动态规划解决的问题通常具有两个关键特性。',
      '想想如何避免重复计算子问题。',
      '考虑如何定义状态和状态转移方程。'
    ]
  } else if (type === 'programming') {
    exerciseHints.value = [
      '栈是一种后进先出的数据结构。',
      '需要实现的四个方法分别用于：添加元素、移除元素、查看栈顶元素和检查栈是否为空。',
      '可以使用数组或链表作为底层实现。'
    ]
  }
  
  hintDialogVisible.value = true
}

// 查看知识点详情
const viewKnowledge = (knowledge: KnowledgePoint) => {
  selectedKnowledge.value = knowledge
  knowledgeDialogVisible.value = true
}

// 打开推荐资源
const openResource = (resource: { id: number, title: string, type: string, url: string }) => {
  ElMessage.info(`打开资源：${resource.title}`)
  // 在实际应用中，这里应该跳转到资源页面或打开资源文件
}

// 运行代码
const runCode = () => {
  if (!userAnswer.programmingCode.trim()) {
    ElMessage.warning('请先编写代码')
    return
  }
  
  // 模拟代码运行
  codeResult.value = {
    success: Math.random() > 0.3,
    output: Math.random() > 0.3 
      ? '运行成功！\n测试通过：4/4\n' 
      : '错误：\nTypeError: \'NoneType\' object has no attribute \'append\'\n在第5行'
  }
}

// 开始计时器
const startTimer = () => {
  stopTimer() // 先停止可能存在的定时器
  timer.value = 0
  showTimer.value = true
  
  timerInterval = window.setInterval(() => {
    timer.value += 1
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval !== null) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 页面挂载
onMounted(() => {
  // 可以在这里加载练习数据
})

// 页面卸载
onUnmounted(() => {
  // 清理定时器
  stopTimer()
})
</script>

<style scoped>
.practice-assistant {
  padding: 20px;
}

.left-panel {
  height: 100%;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.practice-filters {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.practice-list {
  max-height: 500px;
  overflow-y: auto;
}

.practice-item {
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.practice-item:hover {
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.practice-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.practice-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.practice-item-title {
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.4;
}

.practice-item-footer {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
}

.practice-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.practice-status.completed {
  color: #67c23a;
}

.practice-status.error {
  color: #f56c6c;
}

.empty-state {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.question-difficulty {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.question-content {
  padding: 20px 0;
}

.question-title {
  margin-bottom: 20px;
}

.question-description {
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-options {
  margin-top: 20px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.correct-icon {
  color: #67c23a;
}

.error-icon {
  color: #f56c6c;
}

.question-fill-blank,
.question-short-answer {
  margin-top: 20px;
}

.fill-blank-input {
  max-width: 300px;
}

.question-programming {
  margin-top: 20px;
}

.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #f8f9fa;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
}

.code-textarea {
  font-family: 'Courier New', monospace;
  background-color: #282c34;
  color: #abb2bf;
}

.editor-actions {
  margin-top: 10px;
  text-align: right;
}

.code-result {
  margin-top: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
}

.result-output {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}

.answer-feedback {
  margin-top: 30px;
}

.correct-answer,
.answer-analysis,
.answer-knowledge {
  margin-top: 20px;
}

.answer-label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}

.answer-content {
  line-height: 1.6;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.knowledge-tag {
  cursor: pointer;
}

.ai-coaching {
  margin-top: 30px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 8px;
}

.ai-coaching-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-weight: bold;
  color: #67c23a;
}

.ai-icon {
  font-size: 20px;
}

.ai-coaching-content {
  line-height: 1.6;
}

.ai-coaching-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.ai-resources {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #c2e7b0;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-item a {
  color: #409eff;
  text-decoration: none;
}

.resource-item a:hover {
  text-decoration: underline;
}

.similar-exercises-card {
  margin-top: 20px;
}

.similar-exercises {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.similar-exercise-item {
  flex: 0 0 250px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.similar-exercise-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.exercise-badge {
  margin-bottom: 10px;
}

.exercise-title {
  font-weight: bold;
  margin-bottom: 10px;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.exercise-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge-detail {
  padding: 10px;
}

.knowledge-content {
  line-height: 1.6;
}

.knowledge-examples,
.knowledge-notes {
  margin-top: 15px;
}

.example-item,
.note-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.example-header {
  font-weight: bold;
  margin-bottom: 8px;
  color: #409eff;
}

.hint-content {
  line-height: 1.6;
}

.hint-content ul {
  padding-left: 20px;
  margin: 15px 0;
}
</style>
