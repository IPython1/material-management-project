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
