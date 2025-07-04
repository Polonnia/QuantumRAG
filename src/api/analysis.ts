import request from './request';
import type { AnalysisData } from '../types';

/**
 * 获取学生学习分析数据
 * @param studentId 学生ID
 * @param courseId 课程ID
 */
export function getStudentAnalysis(studentId?: string | number, courseId?: string | number) {
  return request({
    url: '/analysis/student',
    method: 'get',
    params: { studentId, courseId }
  });
}

/**
 * 获取班级学习分析数据
 * @param classId 班级ID
 * @param courseId 课程ID
 */
export function getClassAnalysis(classId: string | number, courseId?: string | number) {
  return request({
    url: '/analysis/class',
    method: 'get',
    params: { classId, courseId }
  });
}

/**
 * 获取知识点掌握情况
 * @param studentId 学生ID
 */
export function getKnowledgeMastery(studentId?: string | number) {
  return request({
    url: '/analysis/knowledge-mastery',
    method: 'get',
    params: { studentId }
  });
}

/**
 * 获取学生练习统计数据
 * @param studentId 学生ID
 */
export function getExerciseStatistics(studentId?: string | number) {
  return request({
    url: '/analysis/exercise-statistics',
    method: 'get',
    params: { studentId }
  });
}

/**
 * 获取学生学习时间分布
 * @param studentId 学生ID
 */
export function getLearningTimeDistribution(studentId?: string | number) {
  return request({
    url: '/analysis/learning-time',
    method: 'get',
    params: { studentId }
  });
}

/**
 * 获取管理员系统概览数据
 */
export function getSystemOverview() {
  return request({
    url: '/analysis/system-overview',
    method: 'get'
  });
}

/**
 * 获取活跃用户统计
 * @param days 天数
 */
export function getActiveUsers(days: number = 7) {
  return request({
    url: '/analysis/active-users',
    method: 'get',
    params: { days }
  });
}

/**
 * 获取资源使用统计
 */
export function getResourceUsageStats() {
  return request({
    url: '/analysis/resource-usage',
    method: 'get'
  });
}

/**
 * 获取AI助手交互统计
 */
export function getAiInteractionStats() {
  return request({
    url: '/analysis/ai-interaction',
    method: 'get'
  });
}
