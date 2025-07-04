<template>
  <div class="resource-management-container">
    <div class="page-header">
      <h1>资源管理</h1>
      <div class="header-actions">
        <el-button-group>
          <el-button :type="currentView === 'list' ? 'primary' : ''" @click="switchView('list')">
            <el-icon><List /></el-icon> 列表视图
          </el-button>
          <el-button :type="currentView === 'card' ? 'primary' : ''" @click="switchView('card')">
            <el-icon><Grid /></el-icon> 卡片视图
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="handleUpload">
          <el-icon><Upload /></el-icon> 上传资源
        </el-button>
      </div>
    </div>
    
    <!-- 搜索过滤 -->
    <el-card class="filter-container">
      <el-form :model="filterForm" inline>
        <el-form-item label="资源名称">
          <el-input v-model="filterForm.name" placeholder="请输入资源名称" clearable />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="filterForm.type" placeholder="请选择资源类型" clearable>
            <el-option label="教学课件" value="ppt" />
            <el-option label="教学视频" value="video" />
            <el-option label="练习题库" value="exercise" />
            <el-option label="文档教材" value="document" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传者">
          <el-input v-model="filterForm.uploader" placeholder="请输入上传者" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 列表视图 -->
    <el-card v-if="currentView === 'list'" class="table-container">
      <el-table
        v-loading="tableLoading"
        :data="resourceList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="资源名称" min-width="180">
          <template #default="{ row }">
            <div class="resource-name">
              <el-icon class="resource-icon">
                <Document v-if="row.type === 'document'" />
                <Film v-else-if="row.type === 'video'" />
                <PieChart v-else-if="row.type === 'ppt'" />
                <Collection v-else-if="row.type === 'exercise'" />
                <Files v-else />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'document'" type="primary">文档教材</el-tag>
            <el-tag v-else-if="row.type === 'video'" type="success">教学视频</el-tag>
            <el-tag v-else-if="row.type === 'ppt'" type="warning">教学课件</el-tag>
            <el-tag v-else-if="row.type === 'exercise'" type="danger">练习题库</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传者" width="120" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column prop="downloads" label="下载次数" width="100" />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handlePreview(row)">
              <el-icon><View /></el-icon> 预览
            </el-button>
            <el-button type="primary" link @click="handleDownload(row)">
              <el-icon><Download /></el-icon> 下载
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 卡片视图 -->
    <div v-else class="card-view-container">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6" :lg="6" :xl="4" 
          v-for="resource in resourceList" :key="resource.id"
        >
          <el-card shadow="hover" class="resource-card">
            <div class="resource-card-header">
              <div class="resource-type-icon" :class="resource.type">
                <el-icon :size="24">
                  <Document v-if="resource.type === 'document'" />
                  <Film v-else-if="resource.type === 'video'" />
                  <PieChart v-else-if="resource.type === 'ppt'" />
                  <Collection v-else-if="resource.type === 'exercise'" />
                  <Files v-else />
                </el-icon>
              </div>
            </div>
            <h3 class="resource-title">{{ resource.name }}</h3>
            <div class="resource-info">
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ resource.uploader }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ resource.uploadTime.substring(0, 10) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Files /></el-icon>
                <span>{{ formatFileSize(resource.size) }}</span>
              </div>
            </div>
            <div class="resource-actions">
              <el-button type="primary" circle @click="handlePreview(resource)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button type="success" circle @click="handleDownload(resource)">
                <el-icon><Download /></el-icon>
              </el-button>
              <el-button type="danger" circle @click="handleDelete(resource)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 卡片视图分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 上传资源对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传资源"
      width="500px"
    >
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadFormRules"
        label-width="100px"
      >
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源类型" prop="type">
          <el-select v-model="uploadForm.type" placeholder="请选择资源类型" style="width: 100%">
            <el-option label="教学课件" value="ppt" />
            <el-option label="教学视频" value="video" />
            <el-option label="练习题库" value="exercise" />
            <el-option label="文档教材" value="document" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源描述" prop="description">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入资源描述"
          />
        </el-form-item>
        <el-form-item label="资源文件" prop="file">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持各种类型的文件，单个文件大小不超过100MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 资源预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentResource.name"
      width="70%"
      :destroy-on-close="true"
    >
      <div class="resource-preview">
        <div v-if="currentResource.type === 'document'" class="document-preview">
          <iframe :src="currentResource.url" width="100%" height="600"></iframe>
        </div>
        <div v-else-if="currentResource.type === 'video'" class="video-preview">
          <video :src="currentResource.url" controls width="100%"></video>
        </div>
        <div v-else-if="currentResource.type === 'ppt'" class="ppt-preview">
          <img src="../../assets/ppt-preview.png" alt="PPT预览" width="100%" />
        </div>
        <div v-else class="general-preview">
          <div class="preview-placeholder">
            <el-icon :size="64"><Document /></el-icon>
            <p>无法预览此类型文件，请下载后查看</p>
          </div>
        </div>
      </div>
      <div class="resource-details">
        <h4>资源信息</h4>
        <p><strong>文件类型：</strong>{{ getResourceTypeName(currentResource.type) }}</p>
        <p><strong>文件大小：</strong>{{ formatFileSize(currentResource.size) }}</p>
        <p><strong>上传者：</strong>{{ currentResource.uploader }}</p>
        <p><strong>上传时间：</strong>{{ currentResource.uploadTime }}</p>
        <p><strong>下载次数：</strong>{{ currentResource.downloads }}</p>
        <p v-if="currentResource.description"><strong>描述：</strong>{{ currentResource.description }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownload(currentResource)">
            <el-icon><Download /></el-icon> 下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 视图类型
const currentView = ref<'list' | 'card'>('list')

// 表单引用
const uploadFormRef = ref<FormInstance>()

// 表格加载状态
const tableLoading = ref(false)

// 对话框相关
const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 当前查看的资源
const currentResource = ref<any>({})

// 过滤表单
const filterForm = reactive({
  name: '',
  type: '',
  uploader: ''
})

// 上传表单
const uploadForm = reactive({
  name: '',
  type: 'document',
  description: '',
  file: null as File | null
})

// 表单验证规则
const uploadFormRules = {
  name: [
    { required: true, message: '请输入资源名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ]
}

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

// 模拟资源数据
const resourceList = ref<any[]>([])

// 切换视图
const switchView = (view: 'list' | 'card') => {
  currentView.value = view
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 获取资源类型名称
const getResourceTypeName = (type: string): string => {
  switch (type) {
    case 'document': return '文档教材'
    case 'video': return '教学视频'
    case 'ppt': return '教学课件'
    case 'exercise': return '练习题库'
    default: return '其他'
  }
}

// 生成模拟数据
const generateMockResources = () => {
  const resources = []
  const types = ['document', 'video', 'ppt', 'exercise', 'other']
  const names = [
    '计算机基础教程', '数据结构与算法', '操作系统原理', 
    'Python编程基础', 'Java核心技术', 'Web前端开发', 
    '数据库系统概论', '软件工程', '人工智能导论',
    '计算机网络', '微机原理', 'C++程序设计'
  ]
  
  const uploaders = ['张老师', '李老师', '王老师', '赵老师', '黄老师']
  
  for (let i = 1; i <= 48; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const name = `${names[Math.floor(Math.random() * names.length)]}_${i}`
    
    resources.push({
      id: i.toString().padStart(4, '0'),
      name,
      type,
      size: Math.floor(Math.random() * 1024 * 1024 * 100), // 0-100MB
      uploader: uploaders[Math.floor(Math.random() * uploaders.length)],
      uploadTime: `2024-0${Math.floor(Math.random() * 6) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      downloads: Math.floor(Math.random() * 1000),
      description: `这是一份${getResourceTypeName(type)}资源，适用于计算机科学专业的学生学习。`,
      url: type === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : 
           type === 'document' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : 
           ''
    })
  }
  
  return resources
}

// 搜索处理
const handleSearch = () => {
  tableLoading.value = true
  
  // 模拟搜索，实际项目中应调用API
  setTimeout(() => {
    const allResources = generateMockResources()
    
    let filteredResources = [...allResources]
    
    if (filterForm.name) {
      filteredResources = filteredResources.filter(resource => 
        resource.name.toLowerCase().includes(filterForm.name.toLowerCase())
      )
    }
    
    if (filterForm.type) {
      filteredResources = filteredResources.filter(resource => resource.type === filterForm.type)
    }
    
    if (filterForm.uploader) {
      filteredResources = filteredResources.filter(resource => 
        resource.uploader.includes(filterForm.uploader)
      )
    }
    
    pagination.total = filteredResources.length
    
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    
    resourceList.value = filteredResources.slice(start, end)
    tableLoading.value = false
  }, 500)
}

// 重置过滤条件
const resetFilter = () => {
  filterForm.name = ''
  filterForm.type = ''
  filterForm.uploader = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  handleSearch()
}

// 上传处理
const handleUpload = () => {
  uploadForm.name = ''
  uploadForm.type = 'document'
  uploadForm.description = ''
  uploadForm.file = null
  uploadDialogVisible.value = true
}

// 文件变更处理
const handleFileChange = (file: any) => {
  uploadForm.file = file.raw
  // 如果文件名为空，自动填充文件名
  if (!uploadForm.name && file.name) {
    uploadForm.name = file.name.split('.')[0]
  }
}

// 提交上传
const submitUpload = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (!uploadForm.file) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      // 模拟上传
      ElMessage.success('文件上传成功')
      uploadDialogVisible.value = false
      handleSearch()
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 预览资源
const handlePreview = (resource: any) => {
  currentResource.value = resource
  previewDialogVisible.value = true
}

// 下载资源
const handleDownload = (resource: any) => {
  ElMessage.success(`开始下载: ${resource.name}`)
  
  // 实际项目中应该触发文件下载
}

// 删除资源
const handleDelete = (resource: any) => {
  ElMessageBox.confirm(
    `确定要删除资源 "${resource.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      resourceList.value = resourceList.value.filter(item => item.id !== resource.id)
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.resource-management-container {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.resource-name {
  display: flex;
  align-items: center;
}

.resource-icon {
  margin-right: 10px;
  font-size: 18px;
}

/* 卡片视图样式 */
.card-view-container {
  margin-bottom: 20px;
}

.resource-card {
  margin-bottom: 20px;
  height: 280px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.resource-card-header {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.resource-type-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.resource-type-icon.document {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.resource-type-icon.video {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.resource-type-icon.ppt {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.resource-type-icon.exercise {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.resource-type-icon.other {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.resource-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 15px;
}

.resource-info {
  flex-grow: 1;
  padding: 0 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.info-item .el-icon {
  margin-right: 5px;
}

.resource-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px 0;
}

/* 预览对话框样式 */
.resource-preview {
  margin-bottom: 20px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f5f7fa;
  color: #909399;
}

.resource-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.resource-details h4 {
  margin-top: 0;
  font-size: 16px;
  color: #303133;
}

.upload-demo {
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
