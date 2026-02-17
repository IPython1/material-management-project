import {
  adjustStockUsingPost,
  deleteStockUsingPost,
  getStockDetailUsingGet,
  listFlowUsingGet,
  listStockUsingGet,
  ReportFlowVO,
  ReportStockVO,
  StockAdjustRequest,
  StockSaveRequest,
  saveStockUsingPost,
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
import { Button, Descriptions, message, Modal, Popconfirm, Space, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';

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

type TabKey = 'stock' | 'flow';

const StockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('stock');
  const stockActionRef = useRef<ActionType>();
  const flowActionRef = useRef<ActionType>();
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ReportStockVO | undefined>();
  const [detailData, setDetailData] = useState<ReportStockVO | undefined>();

  const stockColumns = useMemo<ProColumns<ReportStockVO>[]>(
    () => [
      {
        title: '序号',
        valueType: 'index',
        width: 60,
        hideInSearch: true,
      },
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
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => (
          <Space size="small">
            <Button
              key="detail"
              size="small"
              type="link"
              onClick={async () => {
                if (!record.materialId) return;
                const res = await getStockDetailUsingGet(Number(record.materialId));
                if (res.code === 0) {
                  setDetailData(res.data);
                  setDetailOpen(true);
                } else {
                  message.error(res.message || '加载详情失败');
                }
              }}
            >
              详情
            </Button>
            <Button
              key="edit"
              size="small"
              type="link"
              onClick={() => {
                setCurrentRow(record);
                setEditModalOpen(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该物资库存记录？"
              onConfirm={async () => {
                if (!record.materialId) return;
                const hide = message.loading('删除中');
                try {
                  await deleteStockUsingPost({ id: Number(record.materialId) });
                  hide();
                  message.success('删除成功');
                  stockActionRef.current?.reload();
                } catch (error: any) {
                  hide();
                  message.error(`删除失败，${error.message}`);
                }
              }}
            >
              <Button key="delete" size="small" type="link" danger>
                删除
              </Button>
            </Popconfirm>
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
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  const flowTypeEnum = {
    MANUAL_IN: { text: '调整入库', color: 'green' },
    MANUAL_OUT: { text: '调整出库', color: 'orange' },
    APPLY_OUT: { text: '审批出库', color: 'red' },
    IN: { text: '调整入库', color: 'green' },
    OUT: { text: '调整出库', color: 'orange' },
  } as const;

  const flowColumns = useMemo<ProColumns<ReportFlowVO>[]>(
    () => [
      {
        title: '申请单号',
        dataIndex: 'approvalNo',
        hideInSearch: true,
        render: (_, record) => record.approvalNo || '-',
      },
      {
        title: '物资',
        dataIndex: 'materialName',
        hideInSearch: true,
        sorter: true,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        hideInSearch: true,
        sorter: true,
      },
      {
        title: '流水类型',
        dataIndex: 'flowType',
        valueType: 'select',
        valueEnum: {
          MANUAL_IN: { text: '调整入库' },
          MANUAL_OUT: { text: '调整出库' },
          APPLY_OUT: { text: '审批出库' },
        },
        sorter: true,
        render: (_, record) => {
          const ft = record.flowType as keyof typeof flowTypeEnum;
          const cfg = flowTypeEnum[ft];
          return cfg ? <Tag color={cfg.color}>{cfg.text}</Tag> : (record.flowType || '-');
        },
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
        sorter: true,
        defaultSortOrder: 'descend',
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
        request={async (params, sort) => {
          const sortField = Object.keys(sort || {})?.[0];
          const sortOrder = sortField ? sort?.[sortField] : undefined;
            const res = await listStockUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              materialName: params.materialName as string,
              category: params.category as string,
            sortField,
            sortOrder,
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
          request={async (params, sort) => {
            const sortField = Object.keys(sort || {})?.[0];
            const sortOrder = sortField ? sort?.[sortField] : undefined;
            const res = await listFlowUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              materialName: params.materialName as string,
              flowType: params.flowType as string,
              startTime: formatDateTime(params.startTime),
              endTime: formatDateTime(params.endTime),
              sortField,
              sortOrder,
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
        title={`库存调整 - ${currentRow?.materialName || ''}`}
        open={adjustModalOpen}
        initialValues={{
          materialId: currentRow?.materialId ? Number(currentRow.materialId) : undefined,
          location: currentRow?.location,
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setAdjustModalOpen(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={async (values) => {
          const hide = message.loading('提交中');
          try {
            const payload = {
              ...values,
              adjustAmount: Number((values as any).adjustAmount),
            };
            await adjustStockUsingPost(payload);
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
        <ProFormDigit name="materialId" label="物资ID" hidden />
        <ProFormText name="location" label="位置（可选）" />
        <ProFormText
          name="adjustAmount"
          label="调整数量（正数入库，负数出库）"
          fieldProps={{ inputMode: 'numeric', placeholder: '请输入整数，如 10 或 -10' }}
          rules={[
            { required: true, message: '请输入调整数量' },
            {
              validator: (_: any, value: string) => {
                if (!/^-?\d+$/.test(String(value ?? '').trim())) {
                  return Promise.reject('调整数量必须为整数');
                }
                if (Number(value) === 0) {
                  return Promise.reject('调整数量不能为 0');
                }
                return Promise.resolve();
              },
            },
          ]}
        />
        <ProFormText name="remark" label="备注" />
      </ModalForm>

      <ModalForm<StockSaveRequest>
        title="编辑库存信息"
        open={editModalOpen}
        initialValues={{
          materialId: currentRow?.materialId ? Number(currentRow.materialId) : undefined,
          location: currentRow?.location,
          warnThreshold: currentRow?.warnThreshold ?? 0,
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setEditModalOpen(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={async (values) => {
          const hide = message.loading('保存中');
          try {
            await saveStockUsingPost(values);
            hide();
            message.success('保存成功');
            setEditModalOpen(false);
            setCurrentRow(undefined);
            stockActionRef.current?.reload();
            return true;
          } catch (error: any) {
            hide();
            message.error(`保存失败，${error.message}`);
            return false;
          }
        }}
      >
        <ProFormDigit name="materialId" label="物资ID" hidden />
        <ProFormText name="location" label="位置" />
        <ProFormDigit name="warnThreshold" label="预警阈值" min={0} />
      </ModalForm>

      <Modal
        open={detailOpen}
        title="库存详情"
        footer={null}
        onCancel={() => {
          setDetailOpen(false);
          setDetailData(undefined);
        }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="物资编号">{detailData?.materialId || '-'}</Descriptions.Item>
          <Descriptions.Item label="物资名称">{detailData?.materialName || '-'}</Descriptions.Item>
          <Descriptions.Item label="分类">{detailData?.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="位置">{detailData?.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="当前库存">{detailData?.currentStock ?? 0}</Descriptions.Item>
          <Descriptions.Item label="预警阈值">{detailData?.warnThreshold ?? 0}</Descriptions.Item>
          <Descriptions.Item label="状态">{(detailData?.status ?? 1) === 1 ? '正常' : '停用'}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </PageContainer>
  );
};

export default StockPage;

