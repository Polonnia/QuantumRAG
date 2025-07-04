import request from './request';
import type { Exercise, Examination } from '../types';

/**
 * 获取习题列表
 * @param params 查询参数
 */
export function getExerciseList(params?: any) {
  return request({
    url: '/exercise/list',
    method: 'get',
    params
  });
}

/**
 * 获取习题详情
 * @param id 习题ID
 */
export function getExerciseDetail(id: string | number) {
  return request({
    url: `/exercise/${id}`,
    method: 'get'
  });
}

/**
 * 创建习题（教师）
 * @param data 习题信息
 */
export function createExercise(data: Partial<Exercise>) {
  return request({
    url: '/exercise/create',
    method: 'post',
    data
  });
}

/**
 * 更新习题（教师）
 * @param id 习题ID
 * @param data 习题信息
 */
export function updateExercise(id: string | number, data: Partial<Exercise>) {
  return request({
    url: `/exercise/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除习题（教师）
 * @param id 习题ID
 */
export function deleteExercise(id: string | number) {
  return request({
    url: `/exercise/${id}`,
    method: 'delete'
  });
}

/**
 * 提交习题答案（学生）
 * @param exerciseId 习题ID
 * @param answer 学生答案
 */
export function submitExerciseAnswer(exerciseId: string | number, answer: string) {
  return request({
    url: '/exercise/submit',
    method: 'post',
    data: {
      exerciseId,
      answer
    }
  });
}

/**
 * 获取错题集（学生）
 */
export function getWrongExercises() {
  return request({
    url: '/exercise/wrong-collection',
    method: 'get'
  });
}

/**
 * 创建考核/试卷（教师）
 * @param data 考核信息
 */
export function createExamination(data: Partial<Examination>) {
  return request({
    url: '/examination/create',
    method: 'post',
    data
  });
}

/**
 * 获取考核列表
 * @param params 查询参数
 */
export function getExaminationList(params?: any) {
  return request({
    url: '/examination/list',
    method: 'get',
    params
  });
}

/**
 * 获取考核详情
 * @param id 考核ID
 */
export function getExaminationDetail(id: string | number) {
  return request({
    url: `/examination/${id}`,
    method: 'get'
  });
}

/**
 * 发布考核（教师）
 * @param id 考核ID
 */
export function publishExamination(id: string | number) {
  return request({
    url: `/examination/${id}/publish`,
    method: 'put'
  });
}

/**
 * 使用AI生成考核内容（教师）
 * @param params 生成参数
 */
export function generateExamination(params: {
  courseId: string | number;
  difficultyLevel?: number;
  questionCount?: number;
  knowledgePointIds?: (string | number)[];
}) {
  return request({
    url: '/ai/generate-exam',
    method: 'post',
    data: params
  });
}
