// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** getPie GET /api/dashboard/pie */
export async function getPieUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListDashboardPieItemVO_>('/api/dashboard/pie', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getStat GET /api/dashboard/stat */
export async function getStatUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseDashboardStatVO_>('/api/dashboard/stat', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getTodo GET /api/dashboard/todo */
export async function getTodoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTodoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageApplyVO_>('/api/dashboard/todo', {
    method: 'GET',
    params: {
      // pageSize has a default value: 5
      pageSize: '5',
      ...params,
    },
    ...(options || {}),
  });
}

/** getTrend GET /api/dashboard/trend */
export async function getTrendUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListDashboardTrendItemVO_>('/api/dashboard/trend', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getWarn GET /api/dashboard/warn */
export async function getWarnUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWarnUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageWarnVO_>('/api/dashboard/warn', {
    method: 'GET',
    params: {
      // pageSize has a default value: 5
      pageSize: '5',
      ...params,
    },
    ...(options || {}),
  });
}
