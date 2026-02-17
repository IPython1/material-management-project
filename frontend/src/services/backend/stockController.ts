// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** listFlow GET /api/flow/list */
export async function listFlowUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listFlowUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportFlowVO_>('/api/flow/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** adjustStock POST /api/stock/adjust */
export async function adjustStockUsingPost(
  body: API.StockAdjustRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/stock/adjust', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteStock POST /api/stock/delete */
export async function deleteStockUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/stock/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getStockDetail GET /api/stock/detail */
export async function getStockDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStockDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseReportStockVO_>('/api/stock/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listStock GET /api/stock/list */
export async function listStockUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listStockUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageReportStockVO_>('/api/stock/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** saveStock POST /api/stock/save */
export async function saveStockUsingPost(
  body: API.StockSaveRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/stock/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
