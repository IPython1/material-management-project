// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** readNotice PUT /api/notice/${param0}/read */
export async function readNoticeUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.readNoticeUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean_>(`/api/notice/${param0}/read`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** listNotice GET /api/notice/list */
export async function listNoticeUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listNoticeUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageNoticeVO_>('/api/notice/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
