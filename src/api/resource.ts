import request from './request';
import type { Resource } from '../types';

/**
 * 获取资源列表
 * @param params 查询参数
 */
export function getResourceList(params?: any) {
  return request({
    url: '/resource/list',
    method: 'get',
    params
  });
}

/**
 * 获取资源详情
 * @param id 资源ID
 */
export function getResourceDetail(id: string | number) {
  return request({
    url: `/resource/${id}`,
    method: 'get'
  });
}

/**
 * 上传资源
 * @param data FormData 包含文件和元数据
 */
export function uploadResource(data: FormData) {
  return request({
    url: '/resource/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 更新资源信息
 * @param id 资源ID
 * @param data 资源信息
 */
export function updateResource(id: string | number, data: Partial<Resource>) {
  return request({
    url: `/resource/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除资源
 * @param id 资源ID
 */
export function deleteResource(id: string | number) {
  return request({
    url: `/resource/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除资源
 * @param ids 资源ID数组
 */
export function batchDeleteResources(ids: (string | number)[]) {
  return request({
    url: '/resource/batch-delete',
    method: 'post',
    data: { ids }
  });
}

/**
 * 获取资源预览URL
 * @param id 资源ID
 */
export function getResourcePreviewUrl(id: string | number) {
  return request({
    url: `/resource/${id}/preview`,
    method: 'get'
  });
}

/**
 * 获取资源下载URL
 * @param id 资源ID
 */
export function getResourceDownloadUrl(id: string | number) {
  return request({
    url: `/resource/${id}/download`,
    method: 'get'
  });
}
