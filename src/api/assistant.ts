import request from './request';

/**
 * 发送消息到AI学习助手
 * @param message 用户消息
 * @param sessionId 会话ID
 */
export function sendMessageToAI(message: string, sessionId?: string) {
  return request({
    url: '/ai/chat',
    method: 'post',
    data: { message, sessionId }
  });
}

/**
 * 获取历史对话记录
 * @param sessionId 会话ID
 */
export function getChatHistory(sessionId: string) {
  return request({
    url: '/ai/chat/history',
    method: 'get',
    params: { sessionId }
  });
}

/**
 * 创建新的会话
 */
export function createNewSession() {
  return request({
    url: '/ai/chat/session',
    method: 'post'
  });
}

/**
 * 获取会话列表
 */
export function getSessionList() {
  return request({
    url: '/ai/chat/sessions',
    method: 'get'
  });
}

/**
 * 删除会话
 * @param sessionId 会话ID
 */
export function deleteSession(sessionId: string) {
  return request({
    url: `/ai/chat/session/${sessionId}`,
    method: 'delete'
  });
}

/**
 * 获取推荐问题
 */
export function getRecommendedQuestions() {
  return request({
    url: '/ai/recommended-questions',
    method: 'get'
  });
}

/**
 * AI辅助评估学生答案
 * @param exerciseId 习题ID
 * @param answer 学生答案
 */
export function evaluateStudentAnswer(exerciseId: string | number, answer: string) {
  return request({
    url: '/ai/evaluate-answer',
    method: 'post',
    data: { exerciseId, answer }
  });
}

/**
 * 获取AI辅导建议
 * @param exerciseId 习题ID
 * @param wrongAnswer 错误答案
 */
export function getAiTutoringAdvice(exerciseId: string | number, wrongAnswer?: string) {
  return request({
    url: '/ai/tutoring-advice',
    method: 'post',
    data: { exerciseId, wrongAnswer }
  });
}

/**
 * 获取相关学习资源推荐
 * @param query 查询关键词
 */
export function getRelatedResources(query: string) {
  return request({
    url: '/ai/related-resources',
    method: 'get',
    params: { query }
  });
}
