import {
  getReportExportUrl,
  getReportFlowUsingGet,
  getReportStockUsingGet,
  getReportTurnoverUsingGet,
  getReportUsageUsingGet,
  ReportFlowVO,
  ReportStockVO,
  ReportTurnoverVO,
  ReportUsageVO,
} from '@/services/backend/materialManagementController';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';

type ReportTabKey = 'stock' | 'flow' | 'usage' | 'turnover';

const toTotal = (value?: string | number) => Number(value ?? 0);

const formatDateTime = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value?.format) return value.format('YYYY-MM-DD HH:mm:ss');
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
};

const ReportPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<ReportTabKey>('stock');
  const [lastQuery, setLastQuery] = useState<Record<string, any>>({});

  const columns = useMemo<ProColumns<any>[]>(() => {
    const commonSearchColumns: ProColumns<any>[] = [
      {
        title: '物资名称',
        dataIndex: 'materialName',
        hideInTable: true,
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        valueType: 'dateTime',
        hideInTable: true,
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        valueType: 'dateTime',
        hideInTable: true,
      },
    ];
    if (activeTab === 'stock') {
      return [
        { title: '物资ID', dataIndex: 'materialId', hideInSearch: true },
        {
          title: '物资名称',
          dataIndex: 'materialName',
        },
        {
          title: '分类',
          dataIndex: 'category',
        },
        {
          title: '位置',
          dataIndex: 'location',
          hideInSearch: true,
        },
        {
          title: '当前库存',
          dataIndex: 'currentStock',
          hideInSearch: true,
        },
        {
          title: '预警阈值',
          dataIndex: 'warnThreshold',
          hideInSearch: true,
        },
        {
          title: '状态',
          dataIndex: 'status',
          valueEnum: {
            1: { text: '正常' },
            0: { text: '停用' },
          },
          hideInSearch: true,
        },
      ] as ProColumns<ReportStockVO>[];
    }
    if (activeTab === 'flow') {
      return [
        ...commonSearchColumns,
        { title: '申请单号', dataIndex: 'approvalNo', hideInSearch: true },
        { title: '物资', dataIndex: 'materialName', hideInSearch: true },
        { title: '流水类型', dataIndex: 'flowType', hideInSearch: true },
        { title: '业务类型', dataIndex: 'bizType', hideInSearch: true },
        { title: '数量', dataIndex: 'quantity', hideInSearch: true },
        { title: '操作人', dataIndex: 'operatorName', hideInSearch: true },
        { title: '时间', dataIndex: 'createTime', valueType: 'dateTime', hideInSearch: true },
      ] as ProColumns<ReportFlowVO>[];
    }
    if (activeTab === 'usage') {
      return [
        ...commonSearchColumns,
        { title: '物资', dataIndex: 'materialName', hideInSearch: true },
        { title: '领用次数', dataIndex: 'usageCount', hideInSearch: true },
        { title: '领用总量', dataIndex: 'totalQuantity', hideInSearch: true },
      ] as ProColumns<ReportUsageVO>[];
    }
    return [
      ...commonSearchColumns,
      { title: '物资', dataIndex: 'materialName', hideInSearch: true },
      { title: '出库总量', dataIndex: 'outQuantity', hideInSearch: true },
      { title: '当前库存', dataIndex: 'currentStock', hideInSearch: true },
      { title: '周转率', dataIndex: 'turnoverRate', hideInSearch: true },
    ] as ProColumns<ReportTurnoverVO>[];
  }, [activeTab]);

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as ReportTabKey);
          setLastQuery({});
          actionRef.current?.reload();
        }}
        items={[
          { key: 'stock', label: '库存报表' },
          { key: 'flow', label: '出入库报表' },
          { key: 'usage', label: '领用频次' },
          { key: 'turnover', label: '周转率' },
        ]}
      />

      <ProTable<any>
        actionRef={actionRef}
        rowKey={(record) => record.id || record.materialId || record.approvalNo}
        columns={columns}
        search={{ labelWidth: 110 }}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            onClick={() => {
              window.open(getReportExportUrl(activeTab, lastQuery), '_blank');
            }}
          >
            导出当前报表
          </Button>,
        ]}
        request={async (params) => {
          const query = {
            current: params.current,
            pageSize: params.pageSize,
            materialName: params.materialName,
            category: params.category,
            startTime: formatDateTime(params.startTime),
            endTime: formatDateTime(params.endTime),
          };
          setLastQuery(query);
          if (activeTab === 'stock') {
            const res = await getReportStockUsingGet(query);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          if (activeTab === 'flow') {
            const res = await getReportFlowUsingGet(query);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          if (activeTab === 'usage') {
            const res = await getReportUsageUsingGet(query);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          const res = await getReportTurnoverUsingGet(query);
          return {
            data: res.data?.records || [],
            success: res.code === 0,
            total: toTotal(res.data?.total),
          };
        }}
      />
    </PageContainer>
  );
};

export default ReportPage;
