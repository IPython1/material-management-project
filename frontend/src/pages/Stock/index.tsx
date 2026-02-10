import {
  adjustStockUsingPost,
  listFlowUsingGet,
  listStockUsingGet,
  ReportFlowVO,
  ReportStockVO,
  StockAdjustRequest,
} from '@/services/backend/materialManagementController';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';

const toTotal = (value?: string | number) => Number(value ?? 0);

const formatDateTime = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value?.format) return value.format('YYYY-MM-DD HH:mm:ss');
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
};

type TabKey = 'stock' | 'flow';

const StockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('stock');
  const stockActionRef = useRef<ActionType>();
  const flowActionRef = useRef<ActionType>();
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ReportStockVO | undefined>();

  const stockColumns = useMemo<ProColumns<ReportStockVO>[]>(
    () => [
      {
        title: '物资ID',
        dataIndex: 'materialId',
        hideInSearch: true,
      },
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
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => [
          <Button
            key="adjust"
            size="small"
            type="link"
            onClick={() => {
              setCurrentRow(record);
              setAdjustModalOpen(true);
            }}
          >
            库存调整
          </Button>,
        ],
      },
    ],
    [],
  );

  const flowColumns = useMemo<ProColumns<ReportFlowVO>[]>(
    () => [
      {
        title: '申请单号',
        dataIndex: 'approvalNo',
        hideInSearch: true,
      },
      {
        title: '物资',
        dataIndex: 'materialName',
        hideInSearch: true,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        hideInSearch: true,
      },
      {
        title: '流水类型',
        dataIndex: 'flowType',
        hideInSearch: true,
      },
      {
        title: '业务类型',
        dataIndex: 'bizType',
        hideInSearch: true,
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        hideInSearch: true,
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
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
    ],
    [],
  );

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        items={[
          { key: 'stock', label: '库存台账' },
          { key: 'flow', label: '出入库流水' },
        ]}
      />

      {activeTab === 'stock' ? (
        <ProTable<ReportStockVO>
          actionRef={stockActionRef}
          rowKey={(record) => record.materialId || ''}
          columns={stockColumns}
          search={{ labelWidth: 100 }}
          request={async (params) => {
            const res = await listStockUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              materialName: params.materialName as string,
              category: params.category as string,
            });
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }}
        />
      ) : null}

      {activeTab === 'flow' ? (
        <ProTable<ReportFlowVO>
          actionRef={flowActionRef}
          rowKey={(record) => record.applyId || record.approvalNo || ''}
          columns={flowColumns}
          search={{ labelWidth: 110 }}
          request={async (params) => {
            const res = await listFlowUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              materialName: params.materialName as string,
              startTime: formatDateTime(params.startTime),
              endTime: formatDateTime(params.endTime),
            });
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }}
        />
      ) : null}

      <ModalForm<StockAdjustRequest>
        title="库存调整"
        open={adjustModalOpen}
        initialValues={{
          materialId: currentRow?.materialId ? Number(currentRow.materialId) : undefined,
          location: currentRow?.location,
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setAdjustModalOpen(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={async (values) => {
          const hide = message.loading('提交中');
          try {
            await adjustStockUsingPost(values);
            hide();
            message.success('调整成功');
            setAdjustModalOpen(false);
            setCurrentRow(undefined);
            stockActionRef.current?.reload();
            return true;
          } catch (e: any) {
            hide();
            message.error(`调整失败，${e.message}`);
            return false;
          }
        }}
      >
        <ProFormDigit
          name="materialId"
          label="物资ID"
          min={1}
          rules={[{ required: true, message: '请输入物资ID' }]}
        />
        <ProFormText name="location" label="位置（可选）" />
        <ProFormDigit
          name="adjustAmount"
          label="调整数量（正数加库存，负数减库存）"
          rules={[{ required: true, message: '请输入调整数量' }]}
        />
        <ProFormText name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};

export default StockPage;

