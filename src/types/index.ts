// 用户信息类型
export interface UserInfo {
  id: string | number;
  username: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  email?: string;
  class?: string;  // 学生班级
  department?: string;  // 教师部门
}

// 知识点类型
export interface KnowledgePoint {
  id: string | number;
  title: string;
  content: string;
  examples: string[];
  notes: string[];
}

// 课程类型
export interface Course {
  id: string | number;
  title: string;
  description: string;
  knowledgePoints: KnowledgePoint[];
}

// 习题类型
export interface Exercise {
  id: string | number;
  type: 'concept' | 'fillBlank' | 'shortAnswer' | 'programming';
  title: string;
  content: string;
  options?: string[];  // 选择题选项
  answer: string;
  analysis: string;
  knowledgePointIds: (string | number)[];  // 关联的知识点ID
  difficulty: 1 | 2 | 3 | 4 | 5;  // 难度等级
  completed?: boolean;  // 是否已完成
  score?: number;  // 得分
  errorCount?: number;  // 错误次数
  courseId?: string | number;  // 所属课程ID
}

// 学生答题记录
export interface StudentAnswer {
  id: string | number;
  studentId: string | number;
  exerciseId: string | number;
  answer: string;
  isCorrect: boolean;
  usedTime: number;  // 答题用时（秒）
  submitTime: string;  // 提交时间
}

// 学情分析数据
export interface AnalysisData {
  knowledgePointId: string | number;
  title: string;  // 知识点标题
  correctRate: number;
  averageTime: number;
  masteryLevel: 'unfamiliar' | 'familiar' | 'proficient' | 'expert';
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

// 资源类型
export interface Resource {
  id: string | number;
  title: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'other';
  url: string;
  size: number; // 文件大小(KB)
  format: string;
  uploadTime: string;
  uploaderId: string | number;
  uploaderName: string;
  tags: string[];
  description?: string;
  courseId?: string | number;
}

// 考核/试卷类型
export interface Examination {
  id: string | number;
  title: string;
  description: string;
  courseId: string | number;
  courseName: string;
  createTime: string;
  startTime: string;
  endTime: string;
  totalScore: number;
  questions: Exercise[];
  isPublished: boolean;
}

// 任务类型
export interface Task {
  id: string | number;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'inProgress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string | number;
  assigneeName?: string;
  courseId?: string | number;
}

// 通知类型
export interface Notification {
  id: string | number;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: 'system' | 'course' | 'assignment' | 'exam';
  senderId?: string | number;
  senderName?: string;
}
