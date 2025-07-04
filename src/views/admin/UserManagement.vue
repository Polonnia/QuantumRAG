<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon> 添加用户
        </el-button>
        <el-button @click="handleBatchImport">
          <el-icon><Upload /></el-icon> 批量导入
        </el-button>
      </div>
    </div>
    
    <!-- 搜索过滤 -->
    <el-card class="filter-container">
      <el-form :model="filterForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
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
    
    <!-- 用户列表 -->
    <el-card class="table-container">
      <el-table
        v-loading="tableLoading"
        :data="userList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else-if="row.role === 'teacher'" type="primary">教师</el-tag>
            <el-tag v-else-if="row.role === 'student'" type="success">学生</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="department" label="部门/班级" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="primary" link @click="handleResetPassword(row)">
              <el-icon><Key /></el-icon> 重置密码
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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item 
          :label="userForm.role === 'teacher' ? '部门' : '班级'" 
          prop="department"
        >
          <el-input v-model="userForm.department" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="userForm.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入用户"
      width="500px"
    >
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
            请上传 XLSX 格式的文件，<el-button type="primary" link @click="downloadTemplate">下载模板</el-button>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport">确认导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UserInfo } from '../../types'

// 表单引用
const userFormRef = ref<FormInstance>()

// 表格加载状态
const tableLoading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const importDialogVisible = ref(false)

// 过滤表单
const filterForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  name: '',
  role: 'student',
  email: '',
  department: '',
  password: '',
  confirmPassword: '',
  status: 'active'
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟用户数据
const userList = ref<any[]>([])

// 生成模拟数据
const generateMockUsers = () => {
  const users = []
  const roles = ['admin', 'teacher', 'student']
  const status = ['active', 'inactive']
  const departments = ['计算机科学系', '数学系', '物理系', '外语系']
  const classes = ['计算机科学1班', '计算机科学2班', '数学1班', '物理1班', '英语1班']
  
  for (let i = 1; i <= 55; i++) {
    const role = roles[Math.floor(Math.random() * (roles.length - 1)) + (i <= 5 ? 0 : 1)]
    const dept = role === 'teacher' ? departments[Math.floor(Math.random() * departments.length)] : ''
    const cls = role === 'student' ? classes[Math.floor(Math.random() * classes.length)] : ''
    
    users.push({
      id: i.toString().padStart(4, '0'),
      username: role === 'admin' ? `admin${i}` : role === 'teacher' ? `teacher${i}` : `student${i}`,
      name: role === 'admin' ? `管理员${i}` : role === 'teacher' ? `教师${i}` : `学生${i}`,
      role,
      email: `${role}${i}@example.com`,
      department: dept || cls,
      createTime: `2024-0${Math.floor(Math.random() * 6) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    })
  }
  
  return users
}

// 搜索处理
const handleSearch = () => {
  tableLoading.value = true
  
  // 模拟搜索，实际项目中应调用API
  setTimeout(() => {
    const allUsers = generateMockUsers()
    
    let filteredUsers = [...allUsers]
    
    if (filterForm.username) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(filterForm.username.toLowerCase()) ||
        user.name.toLowerCase().includes(filterForm.username.toLowerCase())
      )
    }
    
    if (filterForm.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filterForm.role)
    }
    
    if (filterForm.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filterForm.status)
    }
    
    pagination.total = filteredUsers.length
    
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    
    userList.value = filteredUsers.slice(start, end)
    tableLoading.value = false
  }, 500)
}

// 重置过滤条件
const resetFilter = () => {
  filterForm.username = ''
  filterForm.role = ''
  filterForm.status = ''
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

// 添加用户
const handleAddUser = () => {
  dialogType.value = 'add'
  userForm.id = ''
  userForm.username = ''
  userForm.name = ''
  userForm.role = 'student'
  userForm.email = ''
  userForm.department = ''
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.status = 'active'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  userForm.id = row.id
  userForm.username = row.username
  userForm.name = row.name
  userForm.role = row.role
  userForm.email = row.email
  userForm.department = row.department
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.status = row.status
  dialogVisible.value = true
}

// 提交用户表单
const submitUserForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
        dialogVisible.value = false
        handleSearch()
      }, 500)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      userList.value = userList.value.filter(user => user.id !== row.id)
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    // 取消删除
  })
}

// 重置密码
const handleResetPassword = (row: any) => {
  ElMessageBox.confirm(
    `确定要重置用户 "${row.name}" 的密码吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟重置密码
    setTimeout(() => {
      ElMessage.success('密码重置成功，新密码已发送至用户邮箱')
    }, 500)
  }).catch(() => {
    // 取消重置
  })
}

// 状态变更处理
const handleStatusChange = (row: any) => {
  const statusText = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`已${statusText}用户 "${row.name}"`)
}

// 批量导入
const handleBatchImport = () => {
  importDialogVisible.value = true
}

// 文件变更处理
const handleFileChange = (file: any) => {
  console.log('Selected file:', file)
}

// 下载模板
const downloadTemplate = () => {
  ElMessage.info('模板下载功能开发中...')
}

// 提交导入
const submitImport = () => {
  // 模拟导入
  setTimeout(() => {
    ElMessage.success('导入成功，已添加15名用户')
    importDialogVisible.value = false
    handleSearch()
  }, 1000)
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.user-management-container {
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
  justify-content: flex-end;
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
