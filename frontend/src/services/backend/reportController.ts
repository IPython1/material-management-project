// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** exportReport GET /api/report/export */
export async function exportReportUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.exportReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/report/export', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getFlowReport GET /api/report/flow */
export async function getFlowReportUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFlowReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportFlowVO_>('/api/report/flow', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getStockReport GET /api/report/stock */
export async function getStockReportUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStockReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportStockVO_>('/api/report/stock', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getTurnoverReport GET /api/report/turnover */
export async function getTurnoverReportUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTurnoverReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportTurnoverVO_>('/api/report/turnover', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getUsageReport GET /api/report/usage */
export async function getUsageReportUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUsageReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportUsageVO_>('/api/report/usage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
