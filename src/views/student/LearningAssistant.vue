<template>
  <div class="learning-assistant-container">
    <div class="chat-container">
      <div class="chat-header">
        <h1>AI学习助手</h1>
        <el-select v-model="selectedCourse" placeholder="选择课程" class="course-selector">
          <el-option
            v-for="course in courseOptions"
            :key="course.value"
            :label="course.label"
            :value="course.value"
          />
        </el-select>
      </div>
      
      <div class="chat-messages" ref="chatMessagesRef">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'ai' }"
        >
          <div class="message-avatar">
            <el-avatar :size="36" :src="message.role === 'user' ? userAvatar : aiAvatar" />
          </div>
          <div class="message-content">
            <div class="message-sender">{{ message.role === 'user' ? '我' : 'AI学习助手' }}</div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            
            <!-- 如果有引用资料 -->
            <div class="message-references" v-if="message.references && message.references.length > 0">
              <div class="references-title">
                <el-icon><InfoFilled /></el-icon> 知识来源
              </div>
              <ul class="references-list">
                <li v-for="(ref, refIndex) in message.references" :key="refIndex">
                  <el-link type="primary" :underline="false">{{ ref.title }}</el-link>
                  <span class="reference-location">{{ ref.location }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 加载中状态 -->
        <div class="message ai-message" v-if="isLoading">
          <div class="message-avatar">
            <el-avatar :size="36" :src="aiAvatar" />
          </div>
          <div class="message-content">
            <div class="message-sender">AI学习助手</div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-actions">
          <el-tooltip content="上传图片" placement="top">
            <el-button type="primary" plain circle>
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="上传文件" placement="top">
            <el-button type="primary" plain circle>
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入您的问题，AI学习助手将智能解答..."
          resize="none"
          @keyup.enter.exact="handleSendMessage"
        />
        <div class="send-container">
          <el-button type="primary" @click="handleSendMessage" :disabled="!inputMessage.trim() || isLoading">
            发送 <el-icon class="el-icon--right"><Position /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="sidebar">
      <div class="history-container">
        <div class="sidebar-header">
          <h3>历史会话</h3>
          <el-button type="primary" link @click="handleClearHistory">
            <el-icon><Delete /></el-icon> 清空
          </el-button>
        </div>
        <div class="history-list">
          <div
            v-for="(history, index) in chatHistory"
            :key="index"
            class="history-item"
            @click="selectHistory(history)"
          >
            <el-icon><ChatDotSquare /></el-icon>
            <div class="history-content">
              <div class="history-title">{{ history.title }}</div>
              <div class="history-time">{{ history.time }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="suggestion-container">
        <div class="sidebar-header">
          <h3>推荐问题</h3>
          <el-button type="primary" link @click="refreshSuggestions">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
        <div class="suggestion-list">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
            @click="useSuggestion(suggestion)"
          >
            <el-icon><QuestionFilled /></el-icon>
            <div class="suggestion-text">{{ suggestion }}</div>
          </div>
        </div>
      </div>
      
      <div class="resource-container">
        <div class="sidebar-header">
          <h3>相关学习资源</h3>
        </div>
        <div class="resource-list">
          <div
            v-for="(resource, index) in relatedResources"
            :key="index"
            class="resource-item"
          >
            <el-icon>
              <Document v-if="resource.type === 'document'" />
              <VideoPlay v-else-if="resource.type === 'video'" />
              <PieChart v-else-if="resource.type === 'ppt'" />
              <Collection v-else-if="resource.type === 'exercise'" />
              <Files v-else />
            </el-icon>
            <div class="resource-info">
              <div class="resource-title">{{ resource.title }}</div>
              <div class="resource-meta">{{ resource.category }} | {{ resource.views }}次浏览</div>
            </div>
            <el-button type="primary" link>查看</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

// 聊天消息滚动区域引用
const chatMessagesRef = ref<HTMLDivElement | null>(null)

// 输入框内容
const inputMessage = ref('')

// 加载状态
const isLoading = ref(false)

// 当前选中的课程
const selectedCourse = ref('cs101')

// 课程选项
const courseOptions = [
  { value: 'cs101', label: '计算机基础' },
  { value: 'cs102', label: '程序设计' },
  { value: 'cs103', label: '数据结构' },
  { value: 'cs104', label: '操作系统' }
]

// 用户头像
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// AI头像
const aiAvatar = 'https://cdn.jsdelivr.net/gh/hua1995116/static/img/avatar.jpg'

// 聊天消息
const messages = ref<Array<{
  role: 'user' | 'ai';
  content: string;
  references?: Array<{ title: string; location: string }>;
}>>([
  {
    role: 'ai',
    content: '你好！我是你的AI学习助手。你可以问我任何关于计算机基础的问题，我会尽力帮助你解答。',
    references: []
  }
])

// 聊天历史
const chatHistory = ref([
  {
    title: '计算机网络基础概念',
    time: '2024-06-28 15:30'
  },
  {
    title: 'Python列表和元组的区别',
    time: '2024-06-27 10:15'
  },
  {
    title: '操作系统进程与线程',
    time: '2024-06-25 14:20'
  }
])

// 推荐问题
const suggestions = ref([
  '什么是计算机网络的OSI七层模型？',
  '如何理解IP地址和子网掩码？',
  '计算机的主要组成部分有哪些？',
  '什么是计算机操作系统？'
])

// 相关学习资源
const relatedResources = ref([
  {
    title: '计算机网络基础教程',
    category: '教材',
    type: 'document',
    views: 1205
  },
  {
    title: '网络协议详解视频',
    category: '视频',
    type: 'video',
    views: 873
  },
  {
    title: 'TCP/IP模型课件',
    category: '课件',
    type: 'ppt',
    views: 562
  },
  {
    title: '计算机网络习题集',
    category: '习题',
    type: 'exercise',
    views: 984
  }
])

// 发送消息
const handleSendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isLoading.value) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text
  })
  
  // 清空输入
  inputMessage.value = ''
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 显示AI正在输入状态
  isLoading.value = true
  
  // 模拟AI响应延迟
  setTimeout(() => {
    // 基于用户问题和当前选中课程生成响应
    const response = generateResponse(text, selectedCourse.value)
    
    // 添加AI回复
    messages.value.push(response)
    
    // 移除加载状态
    isLoading.value = false
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    // 更新推荐问题
    refreshSuggestions()
    
    // 更新相关资源
    updateRelatedResources(text)
  }, 1500)
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 模拟生成AI响应
const generateResponse = (question: string, course: string) => {
  // 这里可以根据问题和课程类型生成不同的回答
  let response = {
    role: 'ai' as const,
    content: '',
    references: [] as Array<{ title: string; location: string }>
  }
  
  // 简单匹配一些问题模式
  if (question.toLowerCase().includes('osi') && question.toLowerCase().includes('七层')) {
    response.content = `<p>OSI七层模型是国际标准化组织（ISO）制定的一个用于计算机或通信系统间互联的标准体系，它定义了网络互联的七层框架（物理层、数据链路层、网络层、传输层、会话层、表示层、应用层）。</p>
    <p>从下到上依次为：</p>
    <ol>
      <li><strong>物理层（Physical Layer）</strong>：主要定义物理设备标准，如网线的接口类型、光纤的接口类型、各种传输介质的传输速率等。它的主要作用是传输比特流（就是由1、0转化为电流强弱来进行传输，到达目的地后再转化为1、0），这一层的数据叫做比特。</li>
      <li><strong>数据链路层（Data Link Layer）</strong>：定义了如何格式化数据以进行传输，以及如何控制对物理介质的访问。这一层通常还提供错误检测和纠正，以确保数据的可靠传输。</li>
      <li><strong>网络层（Network Layer）</strong>：在不同子网之间提供数据路由和转发服务，负责数据包从源到目的地的传递和路由选择。IP地址的处理就在这一层。</li>
      <li><strong>传输层（Transport Layer）</strong>：定义了主机到主机的连接，提供端到端的可靠或不可靠的数据传输服务，如TCP和UDP协议。</li>
      <li><strong>会话层（Session Layer）</strong>：负责建立、管理和终止表示层实体之间的通信会话。提供对不同应用程序之间会话的协调与管理。</li>
      <li><strong>表示层（Presentation Layer）</strong>：处理数据的表示形式，如数据加密、压缩、格式转换等，确保一个系统的应用层发送的信息可以被另一个系统的应用层读取。</li>
      <li><strong>应用层（Application Layer）</strong>：是OSI参考模型的最高层，直接面向用户提供服务，如HTTP、FTP、SMTP等协议就在这层。</li>
    </ol>`
    
    response.references = [
      { title: '计算机网络基础教材', location: '第3章，第45页' },
      { title: '网络协议详解', location: '第2节，OSI参考模型' }
    ]
  } else if (question.toLowerCase().includes('ip') && question.toLowerCase().includes('子网')) {
    response.content = `<p>IP地址是互联网协议使用的一种地址，用于标识计算机网络中的设备。而子网掩码是用来划分IP地址的网络标识和主机标识的。</p>
    <p><strong>IP地址</strong>：</p>
    <ul>
      <li>IPv4地址是一个32位的二进制数，通常被分割为4个8位二进制数（即4个字节），每个字节用十进制表示，然后用点分隔，如192.168.1.1。</li>
      <li>IP地址由两部分组成：网络标识和主机标识。网络标识在Internet上标识一个网络，主机标识标识该网络中的一个主机。</li>
    </ul>
    <p><strong>子网掩码</strong>：</p>
    <ul>
      <li>子网掩码是一个32位的地址，用于屏蔽IP地址的一部分以区别网络标识和主机标识。</li>
      <li>子网掩码中的"1"表示该位置是网络位，"0"表示该位置为主机位。如255.255.255.0表示前24位是网络位，后8位是主机位。</li>
      <li>通过将IP地址与子网掩码进行按位"与"运算，可以得到网络地址。</li>
    </ul>
    <p><strong>例如</strong>：</p>
    <p>对于IP地址192.168.1.1，子网掩码255.255.255.0：</p>
    <p>- IP：11000000.10101000.00000001.00000001</p>
    <p>- 掩码：11111111.11111111.11111111.00000000</p>
    <p>- 网络地址：11000000.10101000.00000001.00000000 (192.168.1.0)</p>
    <p>这意味着192.168.1.0是网络地址，主机可以使用从192.168.1.1到192.168.1.254的地址。</p>`
    
    response.references = [
      { title: '计算机网络基础教材', location: '第4章，第78页' },
      { title: 'TCP/IP详解', location: 'IP寻址与子网划分部分' }
    ]
  } else if (question.toLowerCase().includes('计算机') && question.toLowerCase().includes('组成')) {
    response.content = `<p>计算机的主要组成部分可以分为硬件和软件两大类。</p>
    <p><strong>硬件部分主要包括</strong>：</p>
    <ol>
      <li><strong>中央处理器（CPU）</strong>：计算机的大脑，负责执行指令、处理数据。包含控制单元和算术逻辑单元。</li>
      <li><strong>内存（Memory）</strong>：用于临时存储程序和数据，分为随机访问存储器（RAM）和只读存储器（ROM）。</li>
      <li><strong>输入设备</strong>：如键盘、鼠标、扫描仪等，用于向计算机输入信息。</li>
      <li><strong>输出设备</strong>：如显示器、打印机、扬声器等，用于展示计算机处理的结果。</li>
      <li><strong>存储设备</strong>：如硬盘、固态硬盘、光盘等，用于长期存储数据。</li>
      <li><strong>主板</strong>：连接计算机所有部件的电路板。</li>
      <li><strong>电源</strong>：为计算机提供电力。</li>
      <li><strong>外围设备</strong>：如网卡、声卡、显卡等扩展功能的设备。</li>
    </ol>
    <p><strong>软件部分主要包括</strong>：</p>
    <ol>
      <li><strong>操作系统</strong>：如Windows、macOS、Linux等，是管理计算机硬件与软件资源的程序。</li>
      <li><strong>应用软件</strong>：如办公软件、游戏、浏览器等，用于完成特定任务的程序。</li>
      <li><strong>系统软件</strong>：如驱动程序、编译器等，支持应用软件和硬件运行的程序。</li>
    </ol>
    <p>这些组件共同工作，使计算机能够接收信息、处理信息并输出结果。</p>`
    
    response.references = [
      { title: '计算机组成原理教材', location: '第1章，第10-15页' },
      { title: '计算机硬件基础', location: '计算机系统概述部分' }
    ]
  } else if (question.toLowerCase().includes('操作系统')) {
    response.content = `<p>操作系统（Operating System，简称OS）是管理计算机硬件与软件资源的计算机程序，同时也是计算机系统的内核与基石。</p>
    <p><strong>操作系统的主要功能</strong>：</p>
    <ol>
      <li><strong>进程管理</strong>：负责创建、调度、中断以及结束进程，并提供进程间通信的机制。</li>
      <li><strong>内存管理</strong>：管理物理内存和虚拟内存，分配和释放内存空间。</li>
      <li><strong>文件系统管理</strong>：管理文件的存储、检索、命名、共享和保护等。</li>
      <li><strong>设备管理</strong>：控制所有外围设备的操作，协调和分配设备资源。</li>
      <li><strong>用户界面</strong>：提供用户与计算机交互的接口，如命令行界面（CLI）或图形用户界面（GUI）。</li>
    </ol>
    <p><strong>常见的操作系统</strong>：</p>
    <ul>
      <li>Windows系列（如Windows 10、Windows 11）</li>
      <li>macOS系列</li>
      <li>Linux系列（如Ubuntu、CentOS、Debian等）</li>
      <li>Android（移动设备）</li>
      <li>iOS（Apple移动设备）</li>
    </ul>
    <p>操作系统是计算机科学中最复杂的软件系统之一，它为应用程序提供运行环境，并管理计算机资源，使用户能够方便地使用计算机。</p>`
    
    response.references = [
      { title: '操作系统原理教材', location: '第1章，第1-8页' },
      { title: '现代操作系统概念', location: '操作系统概述章节' }
    ]
  } else {
    // 默认回答
    response.content = `<p>你的问题很有趣！我需要更多信息来为你提供准确的回答。</p>
    <p>关于"${question}"，我可以告诉你的是，这在${getCourseFullName(course)}课程中是一个重要的概念。</p>
    <p>你能告诉我更具体的问题吗？比如，你想了解它的哪个方面？或者你在学习过程中遇到了什么困难？</p>`
  }
  
  return response
}

// 获取课程全名
const getCourseFullName = (courseCode: string): string => {
  const course = courseOptions.find(c => c.value === courseCode)
  return course ? course.label : '当前选择的课程'
}

// 格式化消息内容，处理HTML标签
const formatMessage = (content: string): string => {
  return content
}

// 刷新推荐问题
const refreshSuggestions = () => {
  // 根据当前选择的课程和对话内容生成相关的推荐问题
  if (selectedCourse.value === 'cs101') {
    suggestions.value = [
      '什么是计算机网络的OSI七层模型？',
      '如何理解IP地址和子网掩码？',
      '计算机的主要组成部分有哪些？',
      '什么是计算机操作系统？'
    ]
  } else if (selectedCourse.value === 'cs102') {
    suggestions.value = [
      'Python和Java的主要区别是什么？',
      '如何理解面向对象编程的三大特性？',
      '什么是递归算法？',
      '如何处理Python中的异常？'
    ]
  } else if (selectedCourse.value === 'cs103') {
    suggestions.value = [
      '数组和链表的区别是什么？',
      '什么是二叉树？',
      '如何理解快速排序算法？',
      '散列表的工作原理是什么？'
    ]
  } else {
    suggestions.value = [
      '进程和线程的区别是什么？',
      '什么是死锁？如何避免？',
      '操作系统的内存管理方式有哪些？',
      '什么是分页和分段？'
    ]
  }
}

// 更新相关资源
const updateRelatedResources = (question: string) => {
  // 这里可以根据问题内容和课程更新相关资源
  if (question.toLowerCase().includes('网络') || question.toLowerCase().includes('osi') || question.toLowerCase().includes('ip')) {
    relatedResources.value = [
      {
        title: '计算机网络基础教程',
        category: '教材',
        type: 'document',
        views: 1205
      },
      {
        title: '网络协议详解视频',
        category: '视频',
        type: 'video',
        views: 873
      },
      {
        title: 'TCP/IP模型课件',
        category: '课件',
        type: 'ppt',
        views: 562
      },
      {
        title: '网络配置实践指南',
        category: '实验',
        type: 'document',
        views: 758
      }
    ]
  } else if (question.toLowerCase().includes('计算机') && (question.toLowerCase().includes('组成') || question.toLowerCase().includes('硬件'))) {
    relatedResources.value = [
      {
        title: '计算机组成原理教材',
        category: '教材',
        type: 'document',
        views: 986
      },
      {
        title: '计算机硬件组装视频',
        category: '视频',
        type: 'video',
        views: 1432
      },
      {
        title: 'CPU架构详解',
        category: '课件',
        type: 'ppt',
        views: 682
      },
      {
        title: '计算机硬件练习题',
        category: '习题',
        type: 'exercise',
        views: 547
      }
    ]
  }
}

// 使用推荐问题
const useSuggestion = (question: string) => {
  inputMessage.value = question
  handleSendMessage()
}

// 选择历史会话
const selectHistory = (history: any) => {
  // 模拟加载历史会话
  ElMessage.success(`已加载历史会话：${history.title}`)
  messages.value = [
    {
      role: 'ai',
      content: `你好！我已加载关于"${history.title}"的历史会话。请问还有什么问题需要我解答吗？`,
      references: []
    }
  ]
}

// 清空历史记录
const handleClearHistory = () => {
  ElMessageBox.confirm('确定要清空所有历史会话记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    chatHistory.value = []
    ElMessage.success('历史记录已清空')
  }).catch(() => {
    // 用户取消操作
  })
}

onMounted(() => {
  // 初始化页面时滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 根据当前选择的课程更新推荐问题
  refreshSuggestions()
})
</script>

<style scoped>
.learning-assistant-container {
  display: flex;
  height: calc(100vh - 140px);
  padding: 20px;
  gap: 20px;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.course-selector {
  width: 150px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin-right: 12px;
  margin-left: 12px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
}

.ai-message .message-content {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 0;
}

.user-message .message-content {
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-top-right-radius: 0;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.message-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.message-text p {
  margin-top: 0;
  margin-bottom: 10px;
}

.message-text p:last-child {
  margin-bottom: 0;
}

.message-text ul, .message-text ol {
  padding-left: 20px;
}

.message-references {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(103, 194, 58, 0.1);
  border-left: 3px solid #67c23a;
  border-radius: 4px;
}

.references-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #67c23a;
  font-weight: 500;
  margin-bottom: 5px;
}

.references-title .el-icon {
  margin-right: 5px;
}

.references-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
}

.references-list li {
  margin-bottom: 5px;
}

.reference-location {
  margin-left: 5px;
  color: #909399;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.input-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.send-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 打字指示器动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  height: 20px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;
  background-color: #409EFF;
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0px);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0px);
    opacity: 0.4;
  }
}

/* 侧边栏样式 */
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-container,
.suggestion-container,
.resource-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.history-list,
.suggestion-list,
.resource-list {
  padding: 10px;
}

.history-item,
.suggestion-item,
.resource-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover,
.suggestion-item:hover {
  background-color: #f5f7fa;
}

.history-item .el-icon,
.suggestion-item .el-icon,
.resource-item .el-icon {
  margin-right: 10px;
  color: #909399;
}

.history-content {
  flex: 1;
}

.history-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.suggestion-text {
  font-size: 14px;
  color: #303133;
}

.resource-item {
  cursor: default;
  margin-bottom: 5px;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-meta {
  font-size: 12px;
  color: #909399;
}
</style>
