// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** listRole GET /api/role/list */
export async function listRoleUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListString_>('/api/role/list', {
    method: 'GET',
    ...(options || {}),
  });
}
