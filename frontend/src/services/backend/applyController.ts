// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** addApply POST /api/apply */
export async function addApplyUsingPost(
  body: API.ApplyAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getApplyDetail GET /api/apply/${param0} */
export async function getApplyDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApplyDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseApplyDetailVO_>(`/api/apply/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** approveApply POST /api/apply/${param0}/approve */
export async function approveApplyUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.approveApplyUsingPOSTParams,
  body: API.ApplyDecisionRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/apply/${param0}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** rejectApply POST /api/apply/${param0}/reject */
export async function rejectApplyUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.rejectApplyUsingPOSTParams,
  body: API.ApplyDecisionRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/apply/${param0}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** listMyApply GET /api/apply/my */
export async function listMyApplyUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listMyApplyUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageApplyVO_>('/api/apply/my', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listPendingApply GET /api/apply/pending */
export async function listPendingApplyUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listPendingApplyUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageApplyVO_>('/api/apply/pending', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listHistoryApply GET /api/apply/history */
export async function listHistoryApplyUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listPendingApplyUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageApplyVO_>('/api/apply/history', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
