<template>
  <div class="uploader-container">
    <el-upload
      v-model:file-list="fileList"
      :action="action"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :accept="accept"
      :list-type="listType"
      :auto-upload="autoUpload"
      :drag="drag"
      :show-file-list="showFileList"
    >
      <template #trigger>
        <slot name="trigger">
          <el-button type="primary">选择文件</el-button>
        </slot>
      </template>
      
      <template #tip>
        <slot name="tip">
          <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
        </slot>
      </template>
      
      <template v-if="drag" #default>
        <slot>
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
        </slot>
      </template>
    </el-upload>

    <div v-if="showProgress && uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadStatus" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { UploadProps, UploadUserFile, UploadFile, UploadRawFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '../utils/auth'

const props = defineProps({
  action: {
    type: String,
    default: '/api/resource/upload'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 5
  },
  autoUpload: {
    type: Boolean,
    default: true
  },
  drag: {
    type: Boolean,
    default: false
  },
  tip: {
    type: String,
    default: '支持的文件类型: .jpg, .png, .pdf, .doc, .docx, .ppt, .pptx'
  },
  showFileList: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  accept: {
    type: String,
    default: ''
  },
  listType: {
    type: String,
    default: 'text', // text, picture, picture-card
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    default: 10, // MB
  },
  value: {
    type: Array as () => UploadUserFile[],
    default: () => []
  }
})

const emits = defineEmits([
  'update:value', 
  'success', 
  'error', 
  'remove', 
  'preview', 
  'exceed'
])

const fileList = ref<UploadUserFile[]>(props.value || [])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<'' | 'success' | 'exception'>('')

watch(() => props.value, (val) => {
  if (val) {
    fileList.value = val
  }
})

watch(fileList, (val) => {
  emits('update:value', val)
})

// 计算上传请求头，添加认证信息
const headers = computed(() => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 文件大小检查
const beforeUpload = (file: UploadRawFile) => {
  const isLessThanLimit = file.size / 1024 / 1024 < props.fileSize
  
  if (!isLessThanLimit) {
    ElMessage.error(`上传文件大小不能超过 ${props.fileSize}MB!`)
    return false
  }
  
  // 开始上传，显示进度
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''
  
  // 模拟上传进度
  const timer = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.floor(Math.random() * 10) + 1
    } else {
      clearInterval(timer)
    }
  }, 300)
  
  return true
}

const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  uploading.value = false
  uploadProgress.value = 100
  uploadStatus.value = 'success'
  
  ElMessage({
    type: 'success',
    message: `文件 ${uploadFile.name} 上传成功!`
  })
  
  emits('success', response, uploadFile, uploadFiles)
}

const handleError: UploadProps['onError'] = (error, uploadFile, uploadFiles) => {
  uploading.value = false
  uploadProgress.value = 100
  uploadStatus.value = 'exception'
  
  ElMessage({
    type: 'error',
    message: `文件 ${uploadFile.name} 上传失败: ${error.message || '未知错误'}`
  })
  
  emits('error', error, uploadFile, uploadFiles)
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  emits('remove', uploadFile, uploadFiles)
  return true
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  emits('preview', uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + uploadFiles.length} 个文件`)
  emits('exceed', files, uploadFiles)
}
</script>

<style scoped>
.uploader-container {
  margin-bottom: 20px;
}

.upload-progress {
  margin-top: 20px;
}

:deep(.el-upload-dragger) {
  padding: 30px 20px;
  background-color: #fafcff;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  box-sizing: border-box;
  width: 100%;
  text-align: center;
  transition: border-color 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

:deep(.el-upload-dragger .el-icon--upload) {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

:deep(.el-upload-dragger .el-upload__text) {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

:deep(.el-upload-dragger .el-upload__text em) {
  color: #409eff;
  font-style: normal;
}
</style>
