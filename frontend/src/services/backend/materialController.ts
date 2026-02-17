// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** deleteMaterial POST /api/material/delete */
export async function deleteMaterialUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/material/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getMaterialDetail GET /api/material/detail */
export async function getMaterialDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMaterialDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMaterialVO_>('/api/material/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listMaterial GET /api/material/list */
export async function listMaterialUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listMaterialUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageMaterialVO_>('/api/material/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** saveMaterial POST /api/material/save */
export async function saveMaterialUsingPost(
  body: API.MaterialSaveRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/material/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
