// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** markWarnHandled PUT /api/warn/${param0}/handled */
export async function markWarnHandledUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.markWarnHandledUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/warn/${param0}/handled`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** remindWarn POST /api/warn/${param0}/remind */
export async function remindWarnUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.remindWarnUsingPOSTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/warn/${param0}/remind`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** listWarn GET /api/warn/list */
export async function listWarnUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listWarnUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageWarnVO_>('/api/warn/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listWarnRule GET /api/warn/rule */
export async function listWarnRuleUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListWarnRuleVO_>('/api/warn/rule', {
    method: 'GET',
    ...(options || {}),
  });
}

/** saveWarnRule POST /api/warn/rule */
export async function saveWarnRuleUsingPost(
  body: API.WarnRuleSaveRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/warn/rule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** countUnhandledWarn GET /api/warn/unhandled/count */
export async function countUnhandledWarnUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/warn/unhandled/count', {
    method: 'GET',
    ...(options || {}),
  });
}
