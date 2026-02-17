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
import { Bar, Column, Line, Pie } from '@ant-design/plots';
import { Button, Card, Empty, Tabs, Tag, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';

type ReportTabKey = 'stock' | 'flow' | 'usage' | 'turnover';

const toTotal = (value?: string | number) => Number(value ?? 0);
const categoryValueEnum = {
  防护用品: { text: '防护用品' },
  医疗用品: { text: '医疗用品' },
  办公用品: { text: '办公用品' },
  安全器材: { text: '安全器材' },
  工具器材: { text: '工具器材' },
} as const;

const formatDateTime = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value?.format) return value.format('YYYY-MM-DD HH:mm:ss');
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
};

const flowTypeLabelMap: Record<string, { text: string; color: string }> = {
  MANUAL_IN: { text: '调整入库', color: 'green' },
  MANUAL_OUT: { text: '调整出库', color: 'orange' },
  APPLY_OUT: { text: '审批出库', color: 'red' },
  IN: { text: '调整入库', color: 'green' },
  OUT: { text: '调整出库', color: 'orange' },
};

const ReportPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<ReportTabKey>('stock');
  const [lastQuery, setLastQuery] = useState<Record<string, any>>({});
  const [reportData, setReportData] = useState<any[]>([]);

  const getRowKey = useCallback(
    (record: any) => {
      if (activeTab === 'flow') {
        const key = record.applyId || record.approvalNo || record.id || `${record.materialId}-${record.createTime || ''}`;
        return `${activeTab}-${String(key)}`;
      }
      const key = record.materialId || record.id || record.materialName || '';
      return `${activeTab}-${String(key)}`;
    },
    [activeTab],
  );

  const chartTitle = useMemo(() => {
    if (activeTab === 'stock') return '库存数量分布';
    if (activeTab === 'flow') return '出入库趋势';
    if (activeTab === 'usage') return '领用频次占比';
    return '周转率分布';
  }, [activeTab]);

  const stockChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    return reportData
      .map((item) => ({
        name: item.materialName || '-',
        value: Number(item.currentStock ?? 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [reportData]);

  const flowChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const map = new Map<string, number>();
    reportData.forEach((item) => {
      const date = item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD') : '-';
      const value = Number(item.quantity ?? 0);
      map.set(date, (map.get(date) || 0) + value);
    });
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [reportData]);

  const usageChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    return reportData
      .map((item) => ({
        type: item.materialName || '-',
        value: Number(item.usageCount ?? 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [reportData]);

  const turnoverChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    return reportData
      .map((item) => ({
        name: item.materialName || '-',
        value: Number(item.turnoverRate ?? 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [reportData]);

  const renderChart = () => {
    if (activeTab === 'stock') {
      return stockChartData.length === 0 ? (
        <Empty description="暂无图表数据" />
      ) : (
        <Column
          data={stockChartData}
          xField="name"
          yField="value"
          label={false}
          xAxis={{ label: { autoHide: true, autoRotate: true } }}
          height={260}
        />
      );
    }
    if (activeTab === 'flow') {
      return flowChartData.length === 0 ? (
        <Empty description="暂无图表数据" />
      ) : (
        <Line data={flowChartData} xField="date" yField="value" smooth height={260} />
      );
    }
    if (activeTab === 'usage') {
      return usageChartData.length === 0 ? (
        <Empty description="暂无图表数据" />
      ) : (
        <Pie
          data={usageChartData}
          angleField="value"
          colorField="type"
          radius={0.9}
          label={false}
          legend={{ position: 'bottom' }}
          height={260}
        />
      );
    }
    return turnoverChartData.length === 0 ? (
      <Empty description="暂无图表数据" />
    ) : (
      <Bar
        data={turnoverChartData}
        xField="value"
        yField="name"
        label={false}
        height={260}
      />
    );
  };

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
          sorter: true,
        },
        {
          title: '分类',
          dataIndex: 'category',
          valueEnum: categoryValueEnum,
          sorter: true,
        },
        {
          title: '位置',
          dataIndex: 'location',
          hideInSearch: true,
          sorter: true,
        },
        {
          title: '当前库存',
          dataIndex: 'currentStock',
          hideInSearch: true,
          sorter: true,
        },
        {
          title: '预警阈值',
          dataIndex: 'warnThreshold',
          hideInSearch: true,
          sorter: true,
        },
        {
          title: '状态',
          dataIndex: 'status',
          valueEnum: {
            1: { text: '正常' },
            0: { text: '停用' },
          },
          hideInSearch: true,
          sorter: true,
          render: (_, record) => {
            if ((record.status ?? 1) === 0) {
              return <Tag>停用</Tag>;
            }
            const warnThreshold = record.warnThreshold ?? 0;
            const currentStock = record.currentStock ?? 0;
            if (warnThreshold > 0 && currentStock <= warnThreshold) {
              return <Tag color="red">预警</Tag>;
            }
            return <Tag color="green">正常</Tag>;
          },
        },
      ] as ProColumns<ReportStockVO>[];
    }
    if (activeTab === 'flow') {
      return [
        ...commonSearchColumns,
        { title: '申请单号', dataIndex: 'approvalNo', hideInSearch: true },
        { title: '物资', dataIndex: 'materialName', hideInSearch: true },
        {
          title: '流水类型',
          dataIndex: 'flowType',
          hideInSearch: true,
          render: (_, record) => {
            const cfg = flowTypeLabelMap[String(record.flowType || '')];
            return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : (record.flowType || '-');
          },
        },
        { title: '数量', dataIndex: 'quantity', hideInSearch: true, sorter: true },
        { title: '操作人', dataIndex: 'operatorName', hideInSearch: true },
        { title: '时间', dataIndex: 'createTime', valueType: 'dateTime', hideInSearch: true, sorter: true },
      ] as ProColumns<ReportFlowVO>[];
    }
    if (activeTab === 'usage') {
      return [
        ...commonSearchColumns,
        { title: '物资', dataIndex: 'materialName', hideInSearch: true },
        { title: '领用次数', dataIndex: 'usageCount', hideInSearch: true, sorter: true },
        { title: '领用总量', dataIndex: 'totalQuantity', hideInSearch: true, sorter: true },
      ] as ProColumns<ReportUsageVO>[];
    }
    return [
      ...commonSearchColumns,
      { title: '物资', dataIndex: 'materialName', hideInSearch: true },
      { title: '出库总量', dataIndex: 'outQuantity', hideInSearch: true, sorter: true },
      { title: '当前库存', dataIndex: 'currentStock', hideInSearch: true, sorter: true },
      { title: '周转率', dataIndex: 'turnoverRate', hideInSearch: true, sorter: true },
    ] as ProColumns<ReportTurnoverVO>[];
  }, [activeTab]);

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as ReportTabKey);
          setLastQuery({});
          setReportData([]);
        }}
        items={[
          { key: 'stock', label: '库存报表' },
          { key: 'flow', label: '出入库报表' },
          { key: 'usage', label: '领用频次' },
          { key: 'turnover', label: '周转率' },
        ]}
      />

      <Card title={chartTitle} bordered={false} style={{ marginBottom: 16 }}>
        {renderChart()}
      </Card>

      <ProTable<any>
        key={activeTab}
        actionRef={actionRef}
        rowKey={getRowKey}
        columns={columns}
        search={{ labelWidth: 110 }}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            onClick={async () => {
              const url = getReportExportUrl(activeTab, lastQuery);
              try {
                const resp = await fetch(url, { credentials: 'include' });
                if (!resp.ok) {
                  throw new Error(`HTTP ${resp.status}`);
                }
                const contentType = resp.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                  const errData = await resp.json();
                  throw new Error(errData?.message || '导出接口返回了业务错误');
                }
                const blob = await resp.blob();
                if (!blob || blob.size === 0) {
                  throw new Error('导出文件为空');
                }
                const disposition = resp.headers.get('content-disposition') || '';
                const matched = disposition.match(/filename\*=utf-8''([^;]+)/i);
                const decodedName = matched?.[1] ? decodeURIComponent(matched[1]) : `report_${activeTab}.xlsx`;
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = decodedName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
              } catch (e: any) {
                message.error(`导出失败：${e?.message || '未知错误'}`);
              }
            }}
          >
            导出当前报表
          </Button>,
        ]}
        request={async (params, sort) => {
          const sortField = Object.keys(sort || {})?.[0];
          const sortOrder = sortField ? sort?.[sortField] : undefined;
          const query = {
            current: params.current,
            pageSize: params.pageSize,
            materialName: params.materialName,
            category: params.category,
            startTime: formatDateTime(params.startTime),
            endTime: formatDateTime(params.endTime),
            sortField,
            sortOrder,
          };
          setLastQuery(query);
          if (activeTab === 'stock') {
            const res = await getReportStockUsingGet(query);
            setReportData(res.data?.records || []);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          if (activeTab === 'flow') {
            const res = await getReportFlowUsingGet(query);
            setReportData(res.data?.records || []);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          if (activeTab === 'usage') {
            const res = await getReportUsageUsingGet(query);
            setReportData(res.data?.records || []);
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }
          const res = await getReportTurnoverUsingGet(query);
          setReportData(res.data?.records || []);
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
