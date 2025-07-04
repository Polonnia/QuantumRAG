import request from './request';
import type { Course, KnowledgePoint } from '../types';

/**
 * 获取课程列表
 * @param params 查询参数
 */
export function getCourseList(params?: any) {
  return request({
    url: '/course/list',
    method: 'get',
    params
  });
}

/**
 * 获取课程详情
 * @param id 课程ID
 */
export function getCourseDetail(id: string | number) {
  return request({
    url: `/course/${id}`,
    method: 'get'
  });
}

/**
 * 创建课程（教师）
 * @param data 课程信息
 */
export function createCourse(data: Partial<Course>) {
  return request({
    url: '/course/create',
    method: 'post',
    data
  });
}

/**
 * 更新课程信息（教师）
 * @param id 课程ID
 * @param data 课程信息
 */
export function updateCourse(id: string | number, data: Partial<Course>) {
  return request({
    url: `/course/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除课程（教师）
 * @param id 课程ID
 */
export function deleteCourse(id: string | number) {
  return request({
    url: `/course/${id}`,
    method: 'delete'
  });
}

/**
 * 获取知识点列表
 * @param courseId 课程ID
 */
export function getKnowledgePoints(courseId: string | number) {
  return request({
    url: '/knowledge-point/list',
    method: 'get',
    params: { courseId }
  });
}

/**
 * 添加知识点
 * @param data 知识点信息
 */
export function addKnowledgePoint(data: Partial<KnowledgePoint>) {
  return request({
    url: '/knowledge-point/add',
    method: 'post',
    data
  });
}

/**
 * 更新知识点
 * @param id 知识点ID
 * @param data 知识点信息
 */
export function updateKnowledgePoint(id: string | number, data: Partial<KnowledgePoint>) {
  return request({
    url: `/knowledge-point/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除知识点
 * @param id 知识点ID
 */
export function deleteKnowledgePoint(id: string | number) {
  return request({
    url: `/knowledge-point/${id}`,
    method: 'delete'
  });
}

/**
 * 使用AI生成知识点内容
 * @param prompt 提示信息
 */
export function generateKnowledgeContent(prompt: string) {
  return request({
    url: '/ai/generate-knowledge',
    method: 'post',
    data: { prompt }
  });
}
