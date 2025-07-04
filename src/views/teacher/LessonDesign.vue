<template>
  <div class="lesson-design-container">
    <div class="page-header">
      <h1>备课与设计</h1>
      <div class="header-actions">
        <el-button-group>
          <el-button type="primary" @click="handleCreateNew">
            <el-icon><DocumentAdd /></el-icon> 新建课件
          </el-button>
          <el-button type="success" @click="handleImport">
            <el-icon><Upload /></el-icon> 导入课件
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="main-content" v-if="!isCreatingNew">
      <div class="sidebar">
        <div class="sidebar-header">
          <h3>我的课件</h3>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索课件"
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="sidebar-list">
          <div
            v-for="item in filteredLessonList"
            :key="item.id"
            class="sidebar-item"
            :class="{ active: currentLesson && currentLesson.id === item.id }"
            @click="selectLesson(item)"
          >
            <div class="sidebar-item-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="sidebar-item-content">
              <div class="sidebar-item-title">{{ item.title }}</div>
              <div class="sidebar-item-info">
                <span>{{ item.date }}</span>
                <el-tag size="small" type="info">{{ item.subject }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-area">
        <template v-if="currentLesson">
          <div class="content-header">
            <h2>{{ currentLesson.title }}</h2>
            <div class="content-actions">
              <el-button-group>
                <el-button type="primary" @click="handleEdit">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button @click="handleExport">
                  <el-icon><Download /></el-icon> 导出
                </el-button>
                <el-button type="danger" @click="handleDelete">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </el-button-group>
            </div>
          </div>
          
          <el-tabs v-model="activeTab" class="lesson-tabs">
            <el-tab-pane label="课件内容" name="content">
              <div class="lesson-content">
                <el-collapse v-model="activeCollapses">
                  <el-collapse-item 
                    v-for="(section, index) in currentLesson.sections" 
                    :key="index"
                    :title="section.title"
                    :name="index"
                  >
                    <div class="section-content">
                      <div class="knowledge-point" v-for="(point, pointIndex) in section.knowledgePoints" :key="pointIndex">
                        <h4>{{ point.title }}</h4>
                        <div class="knowledge-content">
                          <div class="definition">
                            <h5>定义</h5>
                            <div class="text-content">{{ point.definition }}</div>
                          </div>
                          
                          <div class="examples">
                            <h5>示例</h5>
                            <div class="example-item" v-for="(example, exampleIndex) in point.examples" :key="exampleIndex">
                              <div class="example-title">示例 {{ exampleIndex + 1 }}:</div>
                              <div class="example-content">{{ example }}</div>
                            </div>
                          </div>
                          
                          <div class="notes">
                            <h5>注意事项</h5>
                            <ul>
                              <li v-for="(note, noteIndex) in point.notes" :key="noteIndex">
                                {{ note }}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-tab-pane>
            <el-tab-pane label="教学计划" name="plan">
              <div class="lesson-plan">
                <el-table :data="currentLesson.plan" border style="width: 100%">
                  <el-table-column prop="stage" label="阶段" width="120" />
                  <el-table-column prop="content" label="内容" />
                  <el-table-column prop="duration" label="时长" width="100">
                    <template #default="{ row }">
                      {{ row.duration }} 分钟
                    </template>
                  </el-table-column>
                  <el-table-column prop="materials" label="教学资源" width="200">
                    <template #default="{ row }">
                      <el-tag v-for="(material, index) in row.materials" :key="index" size="small" style="margin-right: 5px;">
                        {{ material }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="练习与指导" name="exercises">
              <div class="lesson-exercises">
                <div class="exercise-item" v-for="(exercise, index) in currentLesson.exercises" :key="index">
                  <div class="exercise-header">
                    <h4>练习 {{ index + 1 }}: {{ exercise.title }}</h4>
                    <el-tag size="small" :type="getExerciseTypeTag(exercise.type)">{{ getExerciseTypeName(exercise.type) }}</el-tag>
                  </div>
                  
                  <div class="exercise-content">{{ exercise.content }}</div>
                  
                  <div class="exercise-options" v-if="exercise.options && exercise.options.length > 0">
                    <div class="option" v-for="(option, optIndex) in exercise.options" :key="optIndex">
                      <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                      <span class="option-text">{{ option }}</span>
                    </div>
                  </div>
                  
                  <div class="exercise-solution" v-if="showSolutions">
                    <div class="solution-header">
                      <el-icon><Check /></el-icon> 参考答案
                    </div>
                    <div class="solution-content">{{ exercise.answer }}</div>
                    
                    <div class="solution-analysis" v-if="exercise.analysis">
                      <div class="analysis-header">答案解析</div>
                      <div class="analysis-content">{{ exercise.analysis }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="solutions-toggle">
                  <el-switch
                    v-model="showSolutions"
                    active-text="显示答案"
                    inactive-text="隐藏答案"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
        
        <div v-else class="no-selection">
          <el-empty description="请选择一个课件" />
        </div>
      </div>
    </div>
    
    <div class="creation-page" v-else>
      <el-card class="creation-card">
        <template #header>
          <div class="creation-header">
            <h2>{{ isEditMode ? '编辑课件' : '创建新课件' }}</h2>
            <el-button @click="cancelCreate">返回列表</el-button>
          </div>
        </template>
        
        <el-form ref="lessonFormRef" :model="lessonForm" :rules="lessonFormRules" label-width="100px">
          <el-form-item label="课件标题" prop="title">
            <el-input v-model="lessonForm.title" placeholder="请输入课件标题" />
          </el-form-item>
          
          <el-form-item label="学科" prop="subject">
            <el-select v-model="lessonForm.subject" placeholder="请选择学科" style="width: 100%">
              <el-option label="计算机基础" value="计算机基础" />
              <el-option label="程序设计" value="程序设计" />
              <el-option label="数据结构" value="数据结构" />
              <el-option label="操作系统" value="操作系统" />
              <el-option label="计算机网络" value="计算机网络" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="教学目标" prop="objectives">
            <el-input
              v-model="lessonForm.objectives"
              type="textarea"
              rows="3"
              placeholder="请输入教学目标，每行一个目标"
            />
          </el-form-item>
          
          <el-form-item label="知识点" prop="knowledgePoints">
            <div class="knowledge-point-list">
              <div v-for="(point, index) in lessonForm.knowledgePoints" :key="index" class="knowledge-point-item">
                <el-card shadow="hover" class="knowledge-point-card">
                  <template #header>
                    <div class="point-header">
                      <el-input v-model="point.title" placeholder="知识点标题" />
                      <el-button type="danger" circle @click="removeKnowledgePoint(index)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  
                  <el-form-item label="定义">
                    <el-input
                      v-model="point.definition"
                      type="textarea"
                      rows="3"
                      placeholder="请输入知识点定义"
                    />
                  </el-form-item>
                  
                  <el-form-item label="示例">
                    <div v-for="(example, exIndex) in point.examples" :key="exIndex" class="example-input">
                      <el-input v-model="point.examples[exIndex]" placeholder="示例" />
                      <el-button type="danger" circle @click="removeExample(point, exIndex)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <el-button type="primary" plain @click="addExample(point)">添加示例</el-button>
                  </el-form-item>
                  
                  <el-form-item label="注意事项">
                    <div v-for="(note, noteIndex) in point.notes" :key="noteIndex" class="note-input">
                      <el-input v-model="point.notes[noteIndex]" placeholder="注意事项" />
                      <el-button type="danger" circle @click="removeNote(point, noteIndex)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <el-button type="primary" plain @click="addNote(point)">添加注意事项</el-button>
                  </el-form-item>
                </el-card>
              </div>
              
              <div class="add-knowledge-point">
                <el-button type="primary" @click="addKnowledgePoint">
                  <el-icon><Plus /></el-icon> 添加知识点
                </el-button>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="generateContent" :loading="generatingContent">
              <el-icon><Magic /></el-icon> 智能生成内容
            </el-button>
            <el-button type="success" @click="submitLessonForm" :loading="submitting">
              <el-icon><Check /></el-icon> 保存课件
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

// 表单引用
const lessonFormRef = ref<FormInstance>()

// 页面状态
const isCreatingNew = ref(false)
const isEditMode = ref(false)
const generatingContent = ref(false)
const submitting = ref(false)
const showSolutions = ref(false)

// 标签页
const activeTab = ref('content')
const activeCollapses = ref<number[]>([0])

// 搜索
const searchKeyword = ref('')

// 当前选中的课件
const currentLesson = ref<any | null>(null)

// 课件表单
const lessonForm = reactive({
  id: '',
  title: '',
  subject: '',
  objectives: '',
  knowledgePoints: [
    {
      title: '',
      definition: '',
      examples: [''],
      notes: ['']
    }
  ]
})

// 表单验证规则
const lessonFormRules = {
  title: [
    { required: true, message: '请输入课件标题', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ],
  objectives: [
    { required: true, message: '请输入教学目标', trigger: 'blur' }
  ]
}

// 示例课件列表
const lessonList = ref([
  {
    id: '1',
    title: '计算机网络基础',
    subject: '计算机网络',
    date: '2024-05-15',
    sections: [
      {
        title: '计算机网络概述',
        knowledgePoints: [
          {
            title: '计算机网络的定义',
            definition: '计算机网络是指将地理位置不同的具有独立功能的多台计算机及其外部设备，通过通信设备与线路连接起来，在网络操作系统，网络管理软件及网络通信协议的管理和协调下，实现资源共享和信息传递的计算机系统。',
            examples: [
              '互联网(Internet)是世界上最大的计算机网络',
              '局域网(LAN)是覆盖小范围区域的计算机网络'
            ],
            notes: [
              '计算机网络的核心目的是资源共享和信息传递',
              '随着技术发展，网络的概念和范围在不断扩大'
            ]
          },
          {
            title: '计算机网络的分类',
            definition: '计算机网络可以按照覆盖范围、拓扑结构、传输介质等方式进行分类。其中按照覆盖范围可分为局域网、城域网和广域网。',
            examples: [
              '局域网(LAN): 覆盖范围小，如一栋楼或一个校园',
              '广域网(WAN): 覆盖范围大，如跨国或全球性网络'
            ],
            notes: [
              '不同类型的网络有其特定的应用场景和技术特点',
              '随着技术发展，网络类型之间的界限逐渐模糊'
            ]
          }
        ]
      },
      {
        title: '网络协议与OSI模型',
        knowledgePoints: [
          {
            title: 'OSI七层模型',
            definition: 'OSI(Open System Interconnection)参考模型是国际标准化组织(ISO)提出的一个网络分层模型，将计算机网络体系结构分为物理层、数据链路层、网络层、传输层、会话层、表示层和应用层七层。',
            examples: [
              '物理层负责比特流的传输，如网卡、中继器等设备工作在此层',
              '应用层为应用程序提供网络服务，如HTTP、FTP等协议工作在此层'
            ],
            notes: [
              'OSI模型主要是一个理论模型，实际应用中更多使用TCP/IP模型',
              '每一层都有特定的功能和相应的协议'
            ]
          }
        ]
      }
    ],
    plan: [
      {
        stage: '导入',
        content: '通过日常生活中的网络应用引入课题',
        duration: 10,
        materials: ['PPT', '视频']
      },
      {
        stage: '新课讲解',
        content: '讲解计算机网络的基本概念和分类方式',
        duration: 30,
        materials: ['PPT', '板书']
      },
      {
        stage: 'OSI模型讲解',
        content: '详细讲解OSI七层模型及各层功能',
        duration: 40,
        materials: ['PPT', '图表']
      },
      {
        stage: '总结与提问',
        content: '总结本节课内容，回答学生问题',
        duration: 10,
        materials: ['PPT']
      }
    ],
    exercises: [
      {
        type: 'concept',
        title: '计算机网络的定义',
        content: '简述计算机网络的概念及其主要目的。',
        options: [],
        answer: '计算机网络是将地理位置不同的具有独立功能的多台计算机及其外部设备，通过通信设备与线路连接起来，在网络操作系统，网络管理软件及网络通信协议的管理和协调下，实现资源共享和信息传递的计算机系统。其主要目的是资源共享和信息传递。',
        analysis: '答案应包含计算机网络的组成要素（计算机、通信设备、软件系统）和核心功能（资源共享、信息传递）。'
      },
      {
        type: 'fillBlank',
        title: 'OSI模型的七层',
        content: 'OSI参考模型从下至上依次是：_____、_____、_____、_____、_____、_____、_____。',
        options: [],
        answer: '物理层、数据链路层、网络层、传输层、会话层、表示层、应用层',
        analysis: 'OSI七层模型是网络通信的基础概念，需要记忆各层的名称和顺序。'
      }
    ]
  },
  {
    id: '2',
    title: 'Python基础编程',
    subject: '程序设计',
    date: '2024-06-01',
    sections: [
      {
        title: 'Python语言介绍',
        knowledgePoints: [
          {
            title: 'Python的特点',
            definition: 'Python是一种解释型、面向对象、动态数据类型的高级程序设计语言。Python语法简洁且清晰，具有丰富的标准库和第三方库。',
            examples: [
              'print("Hello, World!")',
              'name = "Python" # 动态类型，无需声明变量类型'
            ],
            notes: [
              'Python对缩进要求严格，使用缩进来表示代码块',
              'Python是一种解释型语言，无需编译即可运行'
            ]
          }
        ]
      }
    ],
    plan: [
      {
        stage: '环境搭建',
        content: 'Python解释器安装与开发环境配置',
        duration: 15,
        materials: ['演示', '教程文档']
      },
      {
        stage: '基本语法',
        content: 'Python基本语法、数据类型、变量与表达式',
        duration: 35,
        materials: ['代码示例', '交互演示']
      },
      {
        stage: '实战练习',
        content: '简单Python程序编写实践',
        duration: 40,
        materials: ['实验指导书', '代码模板']
      }
    ],
    exercises: [
      {
        type: 'programming',
        title: '编写Hello World程序',
        content: '请编写一个Python程序，在屏幕上输出"Hello, World!"。',
        options: [],
        answer: 'print("Hello, World!")',
        analysis: '这是Python中最基本的输出语句，使用print函数可以将内容输出到标准输出（通常是屏幕）。'
      }
    ]
  },
  {
    id: '3',
    title: '数据结构基础',
    subject: '数据结构',
    date: '2024-04-20',
    sections: [],
    plan: [],
    exercises: []
  }
])

// 过滤课件列表
const filteredLessonList = computed(() => {
  if (!searchKeyword.value) {
    return lessonList.value
  }
  
  return lessonList.value.filter(lesson => 
    lesson.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 选择课件
const selectLesson = (lesson: any) => {
  currentLesson.value = lesson
  activeTab.value = 'content'
  activeCollapses.value = [0]
}

// 新建课件
const handleCreateNew = () => {
  isCreatingNew.value = true
  isEditMode.value = false
  
  // 重置表单
  lessonForm.id = ''
  lessonForm.title = ''
  lessonForm.subject = ''
  lessonForm.objectives = ''
  lessonForm.knowledgePoints = [
    {
      title: '',
      definition: '',
      examples: [''],
      notes: ['']
    }
  ]
}

// 编辑课件
const handleEdit = () => {
  if (!currentLesson.value) return
  
  isCreatingNew.value = true
  isEditMode.value = true
  
  // 填充表单
  lessonForm.id = currentLesson.value.id
  lessonForm.title = currentLesson.value.title
  lessonForm.subject = currentLesson.value.subject
  lessonForm.objectives = ''  // 假设原数据中没有这个字段
  
  // 提取第一部分的知识点
  if (currentLesson.value.sections && currentLesson.value.sections.length > 0) {
    lessonForm.knowledgePoints = currentLesson.value.sections[0].knowledgePoints.map((point: any) => ({
      title: point.title,
      definition: point.definition,
      examples: [...point.examples],
      notes: [...point.notes]
    }))
  }
}

// 取消创建
const cancelCreate = () => {
  isCreatingNew.value = false
}

// 导出课件
const handleExport = () => {
  if (!currentLesson.value) return
  
  ElMessage.success(`开始导出: ${currentLesson.value.title}`)
  // 实际项目中这里应当触发文件下载
}

// 删除课件
const handleDelete = () => {
  if (!currentLesson.value) return
  
  ElMessageBox.confirm(
    `确定要删除课件 "${currentLesson.value.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    lessonList.value = lessonList.value.filter(item => item.id !== currentLesson.value!.id)
    currentLesson.value = null
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 导入课件
const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

// 添加知识点
const addKnowledgePoint = () => {
  lessonForm.knowledgePoints.push({
    title: '',
    definition: '',
    examples: [''],
    notes: ['']
  })
}

// 移除知识点
const removeKnowledgePoint = (index: number) => {
  if (lessonForm.knowledgePoints.length <= 1) {
    ElMessage.warning('至少需要保留一个知识点')
    return
  }
  
  lessonForm.knowledgePoints.splice(index, 1)
}

// 添加示例
const addExample = (point: any) => {
  point.examples.push('')
}

// 移除示例
const removeExample = (point: any, index: number) => {
  if (point.examples.length <= 1) {
    ElMessage.warning('至少需要保留一个示例')
    return
  }
  
  point.examples.splice(index, 1)
}

// 添加注意事项
const addNote = (point: any) => {
  point.notes.push('')
}

// 移除注意事项
const removeNote = (point: any, index: number) => {
  if (point.notes.length <= 1) {
    ElMessage.warning('至少需要保留一个注意事项')
    return
  }
  
  point.notes.splice(index, 1)
}

// 智能生成内容
const generateContent = async () => {
  if (!lessonFormRef.value) return
  
  await lessonFormRef.value.validate(async (valid, fields) => {
    if (!valid) {
      console.log('表单验证失败', fields)
      return
    }
    
    generatingContent.value = true
    
    // 模拟AI生成过程
    setTimeout(() => {
      // 填充知识点内容
      lessonForm.knowledgePoints.forEach(point => {
        // 如果标题为空，则跳过
        if (!point.title) return
        
        // 根据标题生成相关内容
        if (point.title.includes('定义')) {
          point.definition = '这是通过AI自动生成的关于' + point.title + '的定义内容。根据学科和主题的不同，这里会生成相应的专业定义描述，包含核心概念和要点。'
        } else if (point.title.includes('分类')) {
          point.definition = '这是通过AI自动生成的关于' + point.title + '的分类内容。这里会列出该主题的主要分类方式和各类别的简要特点。'
        } else if (point.title.includes('原理')) {
          point.definition = '这是通过AI自动生成的关于' + point.title + '的原理内容。这里会详细解释该技术或概念的基本原理、工作机制和理论基础。'
        } else {
          point.definition = '这是关于' + point.title + '的自动生成内容。根据实际需要，这里会提供该知识点的核心内容、背景和重要性。'
        }
        
        // 生成示例
        if (point.examples.length === 1 && !point.examples[0]) {
          point.examples = [
            '这是第一个关于' + point.title + '的示例。示例内容会根据知识点的性质提供相关的场景或代码。',
            '这是第二个关于' + point.title + '的示例。通过多个示例帮助学生从不同角度理解知识点。'
          ]
        }
        
        // 生成注意事项
        if (point.notes.length === 1 && !point.notes[0]) {
          point.notes = [
            '在理解' + point.title + '时需要注意的第一个要点。',
            '在应用' + point.title + '相关知识时的常见误区或关键考虑因素。'
          ]
        }
      })
      
      ElMessage.success('内容生成成功！')
      generatingContent.value = false
    }, 2000)
  })
}

// 提交表单
const submitLessonForm = async () => {
  if (!lessonFormRef.value) return
  
  await lessonFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      submitting.value = true
      
      // 模拟提交
      setTimeout(() => {
        if (isEditMode.value) {
          // 更新现有课件
          const index = lessonList.value.findIndex(item => item.id === lessonForm.id)
          if (index !== -1) {
            // 构建更新后的课件对象
            const updatedLesson = {
              ...lessonList.value[index],
              title: lessonForm.title,
              subject: lessonForm.subject,
              sections: [
                {
                  title: '第一章',
                  knowledgePoints: lessonForm.knowledgePoints
                }
              ]
            }
            
            // 更新列表
            lessonList.value.splice(index, 1, updatedLesson)
            currentLesson.value = updatedLesson
          }
          
          ElMessage.success('课件更新成功')
        } else {
          // 创建新课件
          const newId = String(lessonList.value.length + 1)
          const newLesson = {
            id: newId,
            title: lessonForm.title,
            subject: lessonForm.subject,
            date: new Date().toISOString().split('T')[0],
            sections: [
              {
                title: '第一章',
                knowledgePoints: lessonForm.knowledgePoints
              }
            ],
            plan: [],
            exercises: []
          }
          
          lessonList.value.unshift(newLesson)
          currentLesson.value = newLesson
          
          ElMessage.success('课件创建成功')
        }
        
        submitting.value = false
        isCreatingNew.value = false
      }, 1000)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 获取练习类型标签类型
const getExerciseTypeTag = (type: string): string => {
  switch (type) {
    case 'concept': return 'info'
    case 'fillBlank': return 'warning'
    case 'shortAnswer': return 'success'
    case 'programming': return 'danger'
    default: return 'info'
  }
}

// 获取练习类型名称
const getExerciseTypeName = (type: string): string => {
  switch (type) {
    case 'concept': return '概念题'
    case 'fillBlank': return '填空题'
    case 'shortAnswer': return '简答题'
    case 'programming': return '编程题'
    default: return '其他'
  }
}

onMounted(() => {
  // 默认选中第一个课件
  if (lessonList.value.length > 0) {
    currentLesson.value = lessonList.value[0]
  }
})
</script>

<style scoped>
.lesson-design-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.main-content {
  display: flex;
  height: calc(100vh - 140px);
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.sidebar-header h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar-item:hover {
  background-color: #f5f7fa;
}

.sidebar-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409EFF;
}

.sidebar-item-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #909399;
}

.sidebar-item-content {
  flex: 1;
}

.sidebar-item-title {
  font-size: 14px;
  margin-bottom: 5px;
  color: #303133;
}

.sidebar-item-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.content-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.no-selection {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 课件内容样式 */
.lesson-tabs {
  margin-top: 20px;
}

.section-content {
  padding: 10px 0;
}

.knowledge-point {
  margin-bottom: 20px;
}

.knowledge-point h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.knowledge-content {
  padding-left: 15px;
  border-left: 2px solid #ebeef5;
}

.definition, .examples, .notes {
  margin-bottom: 15px;
}

.definition h5, .examples h5, .notes h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.text-content {
  line-height: 1.6;
  color: #303133;
}

.example-item {
  margin-bottom: 10px;
}

.example-title {
  font-weight: 500;
  margin-bottom: 5px;
  color: #606266;
}

.example-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  color: #303133;
  line-height: 1.6;
}

.notes ul {
  padding-left: 20px;
  margin: 0;
}

.notes li {
  margin-bottom: 5px;
  color: #303133;
}

/* 练习部分样式 */
.exercise-item {
  margin-bottom: 25px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exercise-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.exercise-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #303133;
}

.exercise-options {
  margin-bottom: 15px;
}

.option {
  margin-bottom: 10px;
  display: flex;
}

.option-label {
  margin-right: 10px;
  font-weight: 500;
  min-width: 20px;
}

.option-text {
  flex: 1;
}

.exercise-solution {
  background-color: #f0f9eb;
  border-left: 3px solid #67c23a;
  padding: 10px 15px;
  margin-top: 15px;
}

.solution-header {
  display: flex;
  align-items: center;
  color: #67c23a;
  font-weight: 500;
  margin-bottom: 10px;
}

.solution-header .el-icon {
  margin-right: 5px;
}

.solution-content {
  color: #303133;
  line-height: 1.6;
}

.solution-analysis {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #c2e7b0;
}

.analysis-header {
  font-weight: 500;
  color: #67c23a;
  margin-bottom: 5px;
}

.analysis-content {
  color: #303133;
  line-height: 1.6;
}

.solutions-toggle {
  display: flex;
  justify-content: flex-end;
  margin: 20px 0;
}

/* 创建页面样式 */
.creation-page {
  padding: 20px;
}

.creation-card {
  margin-bottom: 20px;
}

.creation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creation-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.knowledge-point-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.knowledge-point-card {
  margin-bottom: 5px;
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.example-input, .note-input {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.example-input .el-input, .note-input .el-input {
  flex: 1;
  margin-right: 10px;
}

.add-knowledge-point {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
