// @ts-ignore
/* eslint-disable */
import {
  addApplyUsingPost as addApplyRawUsingPost,
  approveApplyUsingPost as approveApplyRawUsingPost,
  getApplyDetailUsingGet as getApplyDetailRawUsingGet,
  listHistoryApplyUsingGet,
  listMyApplyUsingGet,
  listPendingApplyUsingGet,
  rejectApplyUsingPost as rejectApplyRawUsingPost,
} from './applyController';
import {
  getPieUsingGet as getDashboardPieRawUsingGet,
  getStatUsingGet as getDashboardStatRawUsingGet,
  getTodoUsingGet as getDashboardTodoRawUsingGet,
  getTrendUsingGet as getDashboardTrendRawUsingGet,
  getWarnUsingGet as getDashboardWarnRawUsingGet,
} from './dashboardController';
import {
  deleteMaterialUsingPost,
  getMaterialDetailUsingGet as getMaterialDetailRawUsingGet,
  listMaterialUsingGet,
  saveMaterialUsingPost,
} from './materialController';
import { listNoticeUsingGet, readNoticeUsingPut as readNoticeRawUsingPut } from './noticeController';
import {
  exportReportUsingGet,
  getFlowReportUsingGet as getReportFlowRawUsingGet,
  getStockReportUsingGet as getReportStockRawUsingGet,
  getTurnoverReportUsingGet as getReportTurnoverRawUsingGet,
  getUsageReportUsingGet as getReportUsageRawUsingGet,
} from './reportController';
import {
  adjustStockUsingPost,
  deleteStockUsingPost,
  getStockDetailUsingGet as getStockDetailRawUsingGet,
  listFlowUsingGet,
  listStockUsingGet,
  saveStockUsingPost,
} from './stockController';
import {
  listWarnRuleUsingGet,
  listWarnUsingGet,
  markWarnHandledUsingPut as markWarnHandledRawUsingPut,
  remindWarnUsingPost as remindWarnRawUsingPost,
  saveWarnRuleUsingPost,
} from './warnController';

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

export type ApplyVO = API.ApplyVO;
export type ApplyDetailVO = API.ApplyDetailVO;
export type ApplyTimelineItemVO = API.ApplyTimelineItemVO;
export type WarnVO = API.WarnVO;
export type WarnRuleVO = API.WarnRuleVO;
export type NoticeVO = API.NoticeVO;
export type ReportStockVO = API.ReportStockVO;
export type ReportFlowVO = API.ReportFlowVO;
export type ReportUsageVO = API.ReportUsageVO;
export type ReportTurnoverVO = API.ReportTurnoverVO;
export type MaterialVO = API.MaterialVO;
export type StockAdjustRequest = API.StockAdjustRequest;
export type StockSaveRequest = API.StockSaveRequest;
export type DashboardStatVO = API.DashboardStatVO;
export type DashboardTrendItemVO = API.DashboardTrendItemVO;
export type DashboardPieItemVO = API.DashboardPieItemVO;

export async function createApplyUsingPost(body: API.ApplyAddRequest, options?: { [key: string]: any }) {
  return addApplyRawUsingPost(body, options);
}

export async function getApplyDetailUsingGet(id: string, options?: { [key: string]: any }) {
  return getApplyDetailRawUsingGet({ id }, options);
}

export async function approveApplyUsingPost(
  id: string,
  body?: API.ApplyDecisionRequest,
  options?: { [key: string]: any },
) {
  return approveApplyRawUsingPost({ id }, body || {}, options);
}

export async function rejectApplyUsingPost(
  id: string,
  body: API.ApplyDecisionRequest,
  options?: { [key: string]: any },
) {
  return rejectApplyRawUsingPost({ id }, body, options);
}

export { listMyApplyUsingGet, listPendingApplyUsingGet, listHistoryApplyUsingGet };

export async function getDashboardStatUsingGet(options?: { [key: string]: any }) {
  return getDashboardStatRawUsingGet(options);
}

export async function getDashboardTrendUsingGet(options?: { [key: string]: any }) {
  return getDashboardTrendRawUsingGet(options);
}

export async function getDashboardPieUsingGet(options?: { [key: string]: any }) {
  return getDashboardPieRawUsingGet(options);
}

export async function getDashboardTodoUsingGet(
  params?: {
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return getDashboardTodoRawUsingGet(params || {}, options);
}

export async function getDashboardWarnUsingGet(
  params?: {
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return getDashboardWarnRawUsingGet(params || {}, options);
}

export {
  listMaterialUsingGet,
  saveMaterialUsingPost,
  deleteMaterialUsingPost,
  listStockUsingGet,
  adjustStockUsingPost,
  saveStockUsingPost,
  deleteStockUsingPost,
  listFlowUsingGet,
  listWarnUsingGet,
  listWarnRuleUsingGet,
  saveWarnRuleUsingPost,
  listNoticeUsingGet,
};

export async function getMaterialDetailUsingGet(id: string, options?: { [key: string]: any }) {
  return getMaterialDetailRawUsingGet({ id }, options);
}

export async function getStockDetailUsingGet(materialId: number, options?: { [key: string]: any }) {
  return getStockDetailRawUsingGet({ materialId }, options);
}

export async function markWarnHandledUsingPut(id: string, options?: { [key: string]: any }) {
  return markWarnHandledRawUsingPut({ id }, options);
}

export async function remindWarnUsingPost(id: string, options?: { [key: string]: any }) {
  return remindWarnRawUsingPost({ id }, options);
}

export async function readNoticeUsingPut(id: string, options?: { [key: string]: any }) {
  return readNoticeRawUsingPut({ id }, options);
}

export async function getReportStockUsingGet(
  params: API.getStockReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return getReportStockRawUsingGet(params, options);
}

export async function getReportFlowUsingGet(
  params: API.getFlowReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return getReportFlowRawUsingGet(params, options);
}

export async function getReportUsageUsingGet(
  params: API.getUsageReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return getReportUsageRawUsingGet(params, options);
}

export async function getReportTurnoverUsingGet(
  params: API.getTurnoverReportUsingGETParams,
  options?: { [key: string]: any },
) {
  return getReportTurnoverRawUsingGet(params, options);
}

export function getReportExportUrl(
  reportType: 'stock' | 'flow' | 'usage' | 'turnover',
  params?: Record<string, any>,
) {
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

export { exportReportUsingGet };

