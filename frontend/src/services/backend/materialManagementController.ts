// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export type BaseResponse<T> = {
  code?: number;
  data?: T;
  message?: string;
};

export type PageResult<T> = {
  records?: T[];
  total?: string | number;
  current?: string | number;
  size?: string | number;
};

export type ApplyVO = {
  id?: string;
  approvalNo?: string;
  materialId?: string;
  materialName?: string;
  quantity?: number;
  purpose?: string;
  applicantId?: string;
  applicantName?: string;
  approveId?: string;
  approveName?: string;
  applyTime?: string;
  approveTime?: string;
  outTime?: string;
  approveRemark?: string;
  status?: number;
};

export type ApplyTimelineItemVO = {
  nodeName?: string;
  operatorName?: string;
  actionTime?: string;
  remark?: string;
};

export type ApplyDetailVO = ApplyVO & {
  timeline?: ApplyTimelineItemVO[];
};

export type WarnVO = {
  id?: string;
  ruleId?: string;
  warnType?: number;
  warnTypeText?: string;
  materialId?: string;
  materialName?: string;
  currentValue?: number;
  thresholdValue?: number;
  handled?: number;
  handledBy?: string;
  handledTime?: string;
  createTime?: string;
};

export type WarnRuleVO = {
  id?: string;
  ruleName?: string;
  ruleType?: number;
  ruleTypeText?: string;
  materialId?: string;
  materialName?: string;
  thresholdValue?: number;
  isEnabled?: number;
  createTime?: string;
  updateTime?: string;
};

export type NoticeVO = {
  id?: string;
  title?: string;
  content?: string;
  noticeType?: number;
  refId?: string;
  refType?: number;
  isRead?: number;
  createTime?: string;
};

export type ReportStockVO = {
  materialId?: string;
  materialName?: string;
  category?: string;
  location?: string;
  currentStock?: number;
  warnThreshold?: number;
  status?: number;
};

export type ReportFlowVO = {
  applyId?: string;
  approvalNo?: string;
  materialId?: string;
  materialName?: string;
  flowType?: string;
  bizType?: string;
  quantity?: number;
  operatorId?: string;
  operatorName?: string;
  createTime?: string;
};

export type ReportUsageVO = {
  materialId?: string;
  materialName?: string;
  usageCount?: string | number;
  totalQuantity?: number;
};

export type ReportTurnoverVO = {
  materialId?: string;
  materialName?: string;
  outQuantity?: number;
  currentStock?: number;
  turnoverRate?: number;
};

export type MaterialVO = {
  id?: string;
  materialName?: string;
  category?: string;
  location?: string;
  expireDate?: string;
  stockTotal?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
};

export type StockAdjustRequest = {
  materialId: number;
  location?: string;
  adjustAmount: number;
  remark?: string;
};

export type DashboardStatVO = {
  materialCount?: number;
  totalStock?: number;
  todayApplyCount?: number;
  pendingApplyCount?: number;
  unhandledWarnCount?: number;
};

export type DashboardTrendItemVO = {
  date?: string;
  applyCount?: number;
  outQuantity?: number;
};

export type DashboardPieItemVO = {
  category?: string;
  value?: number;
};

export async function createApplyUsingPost(
  body: {
    materialId: number;
    quantity: number;
    purpose?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<string>>('/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function listMyApplyUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ApplyVO>>>('/api/apply/my', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function listPendingApplyUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ApplyVO>>>('/api/apply/pending', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function approveApplyUsingPost(
  id: string,
  body?: {
    approveRemark?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>(`/api/apply/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body ?? {},
    ...(options || {}),
  });
}

export async function rejectApplyUsingPost(
  id: string,
  body: {
    approveRemark: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>(`/api/apply/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function getApplyDetailUsingGet(id: string, options?: { [key: string]: any }) {
  return request<BaseResponse<ApplyDetailVO>>(`/api/apply/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function listWarnUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    warnType?: number;
    handled?: number;
    materialName?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<WarnVO>>>('/api/warn/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function listWarnRuleUsingGet(options?: { [key: string]: any }) {
  return request<BaseResponse<WarnRuleVO[]>>('/api/warn/rule', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function saveWarnRuleUsingPost(
  body: {
    id?: string;
    ruleName?: string;
    ruleType: number;
    materialId?: number;
    thresholdValue: number;
    isEnabled?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<string>>('/api/warn/rule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function markWarnHandledUsingPut(id: string, options?: { [key: string]: any }) {
  return request<BaseResponse<boolean>>(`/api/warn/${id}/handled`, {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function listNoticeUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    isRead?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<NoticeVO>>>('/api/notice/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function readNoticeUsingPut(id: string, options?: { [key: string]: any }) {
  return request<BaseResponse<boolean>>(`/api/notice/${id}/read`, {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function getReportStockUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    category?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportStockVO>>>('/api/report/stock', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getReportFlowUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    startTime?: string;
    endTime?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportFlowVO>>>('/api/report/flow', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getReportUsageUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    startTime?: string;
    endTime?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportUsageVO>>>('/api/report/usage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getReportTurnoverUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    startTime?: string;
    endTime?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportTurnoverVO>>>('/api/report/turnover', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export function getReportExportUrl(reportType: 'stock' | 'flow' | 'usage' | 'turnover', params?: Record<string, any>) {
  const query = new URLSearchParams();
  query.append('reportType', reportType);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
  }
  return `/api/report/export?${query.toString()}`;
}

export async function listMaterialUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    category?: string;
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<MaterialVO>>>('/api/material/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function saveMaterialUsingPost(
  body: {
    id?: number;
    materialName: string;
    category?: string;
    location?: string;
    expireDate?: string;
    status?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<string>>('/api/material/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteMaterialUsingPost(
  body: {
    id: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<boolean>>('/api/material/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function getMaterialDetailUsingGet(id: string, options?: { [key: string]: any }) {
  return request<BaseResponse<MaterialVO>>('/api/material/detail', {
    method: 'GET',
    params: {
      id,
    },
    ...(options || {}),
  });
}

export async function listStockUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    category?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportStockVO>>>('/api/stock/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getStockDetailUsingGet(materialId: number, options?: { [key: string]: any }) {
  return request<BaseResponse<ReportStockVO>>('/api/stock/detail', {
    method: 'GET',
    params: {
      materialId,
    },
    ...(options || {}),
  });
}

export async function adjustStockUsingPost(body: StockAdjustRequest, options?: { [key: string]: any }) {
  return request<BaseResponse<boolean>>('/api/stock/adjust', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function listFlowUsingGet(
  params: {
    current?: number;
    pageSize?: number;
    materialName?: string;
    startTime?: string;
    endTime?: string;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ReportFlowVO>>>('/api/flow/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDashboardStatUsingGet(options?: { [key: string]: any }) {
  return request<BaseResponse<DashboardStatVO>>('/api/dashboard/stat', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDashboardTrendUsingGet(options?: { [key: string]: any }) {
  return request<BaseResponse<DashboardTrendItemVO[]>>('/api/dashboard/trend', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDashboardPieUsingGet(options?: { [key: string]: any }) {
  return request<BaseResponse<DashboardPieItemVO[]>>('/api/dashboard/pie', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getDashboardTodoUsingGet(
  params?: {
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<ApplyVO>>>('/api/dashboard/todo', {
    method: 'GET',
    params: {
      ...(params || {}),
    },
    ...(options || {}),
  });
}

export async function getDashboardWarnUsingGet(
  params?: {
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<BaseResponse<PageResult<WarnVO>>>('/api/dashboard/warn', {
    method: 'GET',
    params: {
      ...(params || {}),
    },
    ...(options || {}),
  });
}

