import {
  listNoticeUsingGet,
  listWarnRuleUsingGet,
  listWarnUsingGet,
  markWarnHandledUsingPut,
  NoticeVO,
  readNoticeUsingPut,
  saveWarnRuleUsingPost,
  WarnRuleVO,
  WarnVO,
} from '@/services/backend/materialManagementController';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { message, Space, Tabs, Tag, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const toTotal = (value?: string | number) => Number(value ?? 0);

const WarnNoticePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.userRole === 'admin';
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'warn' : 'notice');
  const tableRef = useRef<ActionType>();
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WarnRuleVO>();

  const warnColumns = useMemo<ProColumns<WarnVO>[]>(
    () => [
      {
        title: '预警类型',
        dataIndex: 'warnType',
        valueType: 'select',
        valueEnum: {
          1: { text: '库存预警' },
          2: { text: '临期预警' },
        },
        render: (_, record) => record.warnTypeText || '-',
      },
      {
        title: '物资',
        dataIndex: 'materialName',
        hideInSearch: true,
      },
      {
        title: '当前值',
        dataIndex: 'currentValue',
        hideInSearch: true,
      },
      {
        title: '阈值',
        dataIndex: 'thresholdValue',
        hideInSearch: true,
      },
      {
        title: '处理状态',
        dataIndex: 'handled',
        valueType: 'select',
        valueEnum: {
          0: { text: '未处理' },
          1: { text: '已处理' },
        },
        render: (_, record) =>
          (record.handled ?? 0) === 1 ? <Tag color="green">已处理</Tag> : <Tag color="gold">未处理</Tag>,
      },
      {
        title: '触发时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) =>
          (record.handled ?? 0) === 0 ? (
            <Typography.Link
              onClick={async () => {
                if (!record.id) return;
                const hide = message.loading('处理中');
                try {
                  await markWarnHandledUsingPut(record.id);
                  hide();
                  message.success('已标记处理');
                  tableRef.current?.reload();
                } catch (e: any) {
                  hide();
                  message.error(`处理失败，${e.message}`);
                }
              }}
            >
              标记已处理
            </Typography.Link>
          ) : (
            '-'
          ),
      },
    ],
    [],
  );

  const ruleColumns = useMemo<ProColumns<WarnRuleVO>[]>(
    () => [
      { title: '规则名称', dataIndex: 'ruleName' },
      { title: '规则类型', dataIndex: 'ruleTypeText', hideInSearch: true },
      { title: '作用物资', dataIndex: 'materialName', hideInSearch: true },
      { title: '阈值', dataIndex: 'thresholdValue', hideInSearch: true },
      {
        title: '状态',
        dataIndex: 'isEnabled',
        valueType: 'select',
        valueEnum: {
          1: { text: '启用' },
          0: { text: '停用' },
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => (
          <Typography.Link
            onClick={() => {
              setEditingRule(record);
              setRuleModalOpen(true);
            }}
          >
            编辑
          </Typography.Link>
        ),
      },
    ],
    [],
  );

  const noticeColumns = useMemo<ProColumns<NoticeVO>[]>(
    () => [
      { title: '标题', dataIndex: 'title', ellipsis: true, hideInSearch: true },
      { title: '内容', dataIndex: 'content', ellipsis: true, hideInSearch: true },
      {
        title: '类型',
        dataIndex: 'noticeType',
        valueType: 'select',
        valueEnum: {
          1: { text: '预警通知' },
          2: { text: '审批结果' },
        },
      },
      {
        title: '已读',
        dataIndex: 'isRead',
        valueType: 'select',
        valueEnum: {
          0: { text: '未读' },
          1: { text: '已读' },
        },
        render: (_, record) =>
          (record.isRead ?? 0) === 1 ? <Tag color="green">已读</Tag> : <Tag color="blue">未读</Tag>,
      },
      { title: '时间', dataIndex: 'createTime', valueType: 'dateTime', hideInSearch: true },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) =>
          (record.isRead ?? 0) === 0 ? (
            <Typography.Link
              onClick={async () => {
                if (!record.id) return;
                const hide = message.loading('处理中');
                try {
                  await readNoticeUsingPut(record.id);
                  hide();
                  message.success('已标记已读');
                  tableRef.current?.reload();
                } catch (e: any) {
                  hide();
                  message.error(`操作失败，${e.message}`);
                }
              }}
            >
              标记已读
            </Typography.Link>
          ) : (
            '-'
          ),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          tableRef.current?.reload();
        }}
        items={[
          ...(isAdmin ? [{ key: 'warn', label: '预警列表' }] : []),
          ...(isAdmin ? [{ key: 'rule', label: '预警规则' }] : []),
          { key: 'notice', label: '通知中心' },
        ]}
      />

      {activeTab === 'warn' ? (
        <ProTable<WarnVO>
          actionRef={tableRef}
          rowKey="id"
          columns={warnColumns}
          search={{ labelWidth: 100 }}
          request={async (params) => {
            const res = await listWarnUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              warnType: params.warnType as unknown as number,
              handled: params.handled as unknown as number,
              materialName: params.materialName as string,
            });
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }}
        />
      ) : null}

      {activeTab === 'rule' ? (
        <>
          <ProTable<WarnRuleVO>
            actionRef={tableRef}
            rowKey="id"
            columns={ruleColumns}
            search={{ labelWidth: 100 }}
            toolBarRender={() => [
              <Space key="tool">
                <Typography.Link
                  onClick={() => {
                    setEditingRule(undefined);
                    setRuleModalOpen(true);
                  }}
                >
                  新建规则
                </Typography.Link>
              </Space>,
            ]}
            request={async () => {
              const res = await listWarnRuleUsingGet();
              return {
                data: res.data || [],
                success: res.code === 0,
                total: (res.data || []).length,
              };
            }}
          />
          <ModalForm<{
            ruleName?: string;
            ruleType: number;
            materialId?: number;
            thresholdValue: number;
            isEnabled: number;
          }>
            title={editingRule ? '编辑规则' : '新建规则'}
            open={ruleModalOpen}
            initialValues={{
              ruleName: editingRule?.ruleName,
              ruleType: (editingRule?.ruleType || 1) as number,
              materialId: editingRule?.materialId ? Number(editingRule.materialId) : undefined,
              thresholdValue: editingRule?.thresholdValue || 0,
              isEnabled: (editingRule?.isEnabled ?? 1) as number,
            }}
            modalProps={{
              destroyOnClose: true,
              onCancel: () => {
                setRuleModalOpen(false);
                setEditingRule(undefined);
              },
            }}
            onFinish={async (values) => {
              const hide = message.loading('保存中');
              try {
                await saveWarnRuleUsingPost({
                  id: editingRule?.id,
                  ...values,
                });
                hide();
                message.success('保存成功');
                setRuleModalOpen(false);
                setEditingRule(undefined);
                tableRef.current?.reload();
                return true;
              } catch (e: any) {
                hide();
                message.error(`保存失败，${e.message}`);
                return false;
              }
            }}
          >
            <ProFormText name="ruleName" label="规则名称" />
            <ProFormSelect
              name="ruleType"
              label="规则类型"
              valueEnum={{
                1: '库存预警',
                2: '临期预警',
              }}
              rules={[{ required: true, message: '请选择规则类型' }]}
            />
            <ProFormDigit name="materialId" label="物资ID（留空=全局）" min={1} />
            <ProFormDigit
              name="thresholdValue"
              label="阈值"
              min={0}
              rules={[{ required: true, message: '请输入阈值' }]}
            />
            <ProFormSelect
              name="isEnabled"
              label="状态"
              valueEnum={{
                1: '启用',
                0: '停用',
              }}
              rules={[{ required: true, message: '请选择状态' }]}
            />
          </ModalForm>
        </>
      ) : null}

      {activeTab === 'notice' ? (
        <ProTable<NoticeVO>
          actionRef={tableRef}
          rowKey="id"
          columns={noticeColumns}
          search={{ labelWidth: 100 }}
          request={async (params) => {
            const res = await listNoticeUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              isRead: params.isRead as unknown as number,
            });
            return {
              data: res.data?.records || [],
              success: res.code === 0,
              total: toTotal(res.data?.total),
            };
          }}
        />
      ) : null}
    </PageContainer>
  );
};

export default WarnNoticePage;
