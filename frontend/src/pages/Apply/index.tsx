import {
  approveApplyUsingPost,
  ApplyDetailVO,
  ApplyVO,
  createApplyUsingPost,
  getApplyDetailUsingGet,
  listMyApplyUsingGet,
  listPendingApplyUsingGet,
  rejectApplyUsingPost,
} from '@/services/backend/materialManagementController';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Descriptions, message, Modal, Space, Tabs, Tag, Timeline, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const statusColorMap: Record<number, string> = {
  0: 'gold',
  1: 'blue',
  2: 'red',
  3: 'green',
};

const statusTextMap: Record<number, string> = {
  0: '待审批',
  1: '已通过',
  2: '已驳回',
  3: '已出库',
};

const toTotal = (value?: string | number) => Number(value ?? 0);

const ApplyPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.userRole === 'admin';

  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'pending' : 'my');
  const [createVisible, setCreateVisible] = useState(false);
  const [decisionVisible, setDecisionVisible] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [decisionTarget, setDecisionTarget] = useState<ApplyVO>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<ApplyDetailVO>();

  const columns = useMemo<ProColumns<ApplyVO>[]>(
    () => [
      {
        title: '申请单号',
        dataIndex: 'approvalNo',
        copyable: true,
      },
      {
        title: '物资',
        dataIndex: 'materialName',
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        hideInSearch: true,
      },
      {
        title: '用途',
        dataIndex: 'purpose',
        ellipsis: true,
      },
      ...(activeTab === 'pending'
        ? ([
            {
              title: '申请人',
              dataIndex: 'applicantName',
              hideInSearch: true,
            },
          ] as ProColumns<ApplyVO>[])
        : []),
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: {
          0: { text: '待审批' },
          1: { text: '已通过' },
          2: { text: '已驳回' },
          3: { text: '已出库' },
        },
        render: (_, record) => {
          const status = record.status ?? 0;
          return <Tag color={statusColorMap[status] || 'default'}>{statusTextMap[status] || '-'}</Tag>;
        },
      },
      {
        title: '申请时间',
        dataIndex: 'applyTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
      {
        title: '审批时间',
        dataIndex: 'approveTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (_, record) => (
          <Space>
            <Typography.Link
              onClick={async () => {
                if (!record.id) return;
                const res = await getApplyDetailUsingGet(record.id);
                setDetailData(res.data);
                setDetailVisible(true);
              }}
            >
              详情
            </Typography.Link>
            {activeTab === 'pending' && record.status === 0 ? (
              <>
                <Typography.Link
                  onClick={() => {
                    setDecisionType('approve');
                    setDecisionTarget(record);
                    setDecisionVisible(true);
                  }}
                >
                  通过
                </Typography.Link>
                <Typography.Link
                  type="danger"
                  onClick={() => {
                    setDecisionType('reject');
                    setDecisionTarget(record);
                    setDecisionVisible(true);
                  }}
                >
                  驳回
                </Typography.Link>
              </>
            ) : null}
          </Space>
        ),
      },
    ],
    [activeTab],
  );

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'my', label: '我的申请' },
          ...(isAdmin ? [{ key: 'pending', label: '待审批列表' }] : []),
        ]}
      />

      <ProTable<ApplyVO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 100 }}
        toolBarRender={() =>
          activeTab === 'my'
            ? [
                <Button
                  key="create"
                  type="primary"
                  onClick={() => {
                    setCreateVisible(true);
                  }}
                >
                  新建申请
                </Button>,
              ]
            : []
        }
        request={async (params) => {
          const query = {
            current: params.current,
            pageSize: params.pageSize,
            status: params.status as unknown as number,
          };
          const res =
            activeTab === 'pending'
              ? await listPendingApplyUsingGet(query)
              : await listMyApplyUsingGet(query);
          return {
            data: res.data?.records || [],
            success: res.code === 0,
            total: toTotal(res.data?.total),
          };
        }}
      />

      <ModalForm<{
        materialId: number;
        quantity: number;
        purpose?: string;
      }>
        title="新建申请"
        open={createVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateVisible(false),
        }}
        onFinish={async (values) => {
          const hide = message.loading('正在提交');
          try {
            await createApplyUsingPost(values);
            hide();
            message.success('提交成功');
            setCreateVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (e: any) {
            hide();
            message.error(`提交失败，${e.message}`);
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
        <ProFormDigit
          name="quantity"
          label="申请数量"
          min={1}
          rules={[{ required: true, message: '请输入申请数量' }]}
        />
        <ProFormTextArea name="purpose" label="用途/去向" placeholder="如：部门领用" />
      </ModalForm>

      <ModalForm<{ approveRemark?: string }>
        title={decisionType === 'approve' ? '审批通过' : '审批驳回'}
        open={decisionVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setDecisionVisible(false);
            setDecisionTarget(undefined);
          },
        }}
        onFinish={async (values) => {
          if (!decisionTarget?.id) return false;
          const hide = message.loading('正在提交');
          try {
            if (decisionType === 'approve') {
              await approveApplyUsingPost(decisionTarget.id, values);
            } else {
              await rejectApplyUsingPost(decisionTarget.id, {
                approveRemark: values.approveRemark || '',
              });
            }
            hide();
            message.success('操作成功');
            setDecisionVisible(false);
            setDecisionTarget(undefined);
            actionRef.current?.reload();
            return true;
          } catch (e: any) {
            hide();
            message.error(`操作失败，${e.message}`);
            return false;
          }
        }}
      >
        <ProFormTextArea
          name="approveRemark"
          label="审批意见"
          rules={
            decisionType === 'reject' ? [{ required: true, message: '驳回时请填写审批意见' }] : undefined
          }
        />
      </ModalForm>

      <Modal
        open={detailVisible}
        title="申请详情"
        width={720}
        footer={null}
        onCancel={() => {
          setDetailVisible(false);
          setDetailData(undefined);
        }}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="申请单号">{detailData?.approvalNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {statusTextMap[detailData?.status || 0] || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="物资">{detailData?.materialName}</Descriptions.Item>
          <Descriptions.Item label="数量">{detailData?.quantity}</Descriptions.Item>
          <Descriptions.Item label="申请人">{detailData?.applicantName}</Descriptions.Item>
          <Descriptions.Item label="审批人">{detailData?.approveName || '-'}</Descriptions.Item>
          <Descriptions.Item label="用途/去向" span={2}>
            {detailData?.purpose || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="审批意见" span={2}>
            {detailData?.approveRemark || '-'}
          </Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <Timeline
            items={(detailData?.timeline || []).map((item) => ({
              children: (
                <div>
                  <div>{item.nodeName}</div>
                  <div style={{ color: '#999' }}>
                    {item.operatorName} {item.actionTime}
                  </div>
                  {item.remark ? <div>{item.remark}</div> : null}
                </div>
              ),
            }))}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ApplyPage;
