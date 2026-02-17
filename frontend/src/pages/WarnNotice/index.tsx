import {
  listMaterialUsingGet,
  listWarnRuleUsingGet,
  listWarnUsingGet,
  markWarnHandledUsingPut,
  remindWarnUsingPost,
  saveWarnRuleUsingPost,
  MaterialVO,
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
import { useLocation, useModel } from '@umijs/max';
import { countUnhandledWarnUsingGet } from '@/services/backend/warnController';
import { message, Space, Tabs, Tag, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const toTotal = (value?: string | number) => Number(value ?? 0);

type RuleRow = {
  id?: number;
  ruleType: number;
  ruleName?: string;
  materialId?: number;
  materialName: string;
  thresholdValue?: number;
  isEnabled?: number;
  updateTime?: string;
  source: '全局' | '自定义';
  isInherited?: boolean;
};

const WarnNoticePage: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.userRole === 'admin';

  const refreshWarnCount = async () => {
    try {
      const res = await countUnhandledWarnUsingGet();
      setInitialState((prev: any) => ({ ...prev, unhandledWarnCount: res.data ?? 0 }));
    } catch (_) {}
  };
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('warn');
  const [warnParams, setWarnParams] = useState<Record<string, any>>({});
  const tableRef = useRef<ActionType>();
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleRow>();
  const [ruleTypeTab, setRuleTypeTab] = useState<number>(1);
  const [ruleRows, setRuleRows] = useState<RuleRow[]>([]);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [globalRuleMap, setGlobalRuleMap] = useState<Record<number, WarnRuleVO | undefined>>({});

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'warn' || tab === 'rule') {
      setActiveTab(tab);
    }
    const handled = searchParams.get('handled');
    const warnType = searchParams.get('warnType');
    setWarnParams({
      handled: handled !== null ? Number(handled) : undefined,
      warnType: warnType !== null ? Number(warnType) : undefined,
    });
    tableRef.current?.reload();
  }, [location.search]);

  const loadRuleRows = React.useCallback(async () => {
    setRuleLoading(true);
    try {
      const [ruleRes, materialRes] = await Promise.all([
        listWarnRuleUsingGet(),
        listMaterialUsingGet({ current: 1, pageSize: 200 }),
      ]);
      const ruleList = ruleRes.data || [];
      const materialList = materialRes.data?.records || [];
      const nextGlobalMap: Record<number, WarnRuleVO | undefined> = {};
      const ruleMap = new Map<string, WarnRuleVO>();
      ruleList.forEach((rule) => {
        if (!rule.materialId) {
          if (rule.ruleType) {
            nextGlobalMap[rule.ruleType] = rule;
          }
        } else if (rule.ruleType && rule.materialId) {
          ruleMap.set(`${rule.ruleType}-${rule.materialId}`, rule);
        }
      });
      setGlobalRuleMap(nextGlobalMap);

      const buildRows = (ruleType: number, list: MaterialVO[]): RuleRow[] =>
        list.map((material) => {
          const key = `${ruleType}-${material.id}`;
          const rule = ruleMap.get(key);
          if (rule) {
            return {
              id: rule.id,
              ruleType,
              ruleName: rule.ruleName,
              materialId: material.id,
              materialName: material.materialName || '-',
              thresholdValue: rule.thresholdValue ?? 0,
              isEnabled: rule.isEnabled ?? 1,
              updateTime: rule.updateTime,
              source: '自定义',
              isInherited: false,
            };
          }
          const globalRule = nextGlobalMap[ruleType];
          return {
            ruleType,
            ruleName: globalRule?.ruleName,
            materialId: material.id,
            materialName: material.materialName || '-',
            thresholdValue: globalRule?.thresholdValue ?? 0,
            isEnabled: globalRule?.isEnabled ?? 1,
            updateTime: globalRule?.updateTime,
            source: '全局',
            isInherited: true,
          };
        });

      const stockRows = buildRows(1, materialList);
      const expireRows = buildRows(2, materialList);
      setRuleRows([...stockRows, ...expireRows]);
    } finally {
      setRuleLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'rule') {
      loadRuleRows();
    }
  }, [activeTab, loadRuleRows]);

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
        sorter: true,
      },
      {
        title: '当前值',
        dataIndex: 'currentValue',
        hideInSearch: true,
        sorter: true,
      },
      {
        title: '阈值',
        dataIndex: 'thresholdValue',
        hideInSearch: true,
        sorter: true,
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
        sorter: true,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => {
          if ((record.handled ?? 0) !== 0) {
            return '-';
          }
          if (isAdmin) {
            return (
              <Typography.Link
                onClick={async () => {
                  if (!record.id) return;
                  const hide = message.loading('处理中');
                  try {
                    const res = await markWarnHandledUsingPut(String(record.id));
                    hide();
                    if (res.code === 0) {
                      message.success('已标记处理');
                      tableRef.current?.reload();
                      refreshWarnCount();
                    } else {
                      message.error(res.message || '处理失败');
                    }
                  } catch (e: any) {
                    hide();
                    message.error(`处理失败，${e.message}`);
                  }
                }}
              >
                标记已处理
              </Typography.Link>
            );
          }
          return (
            <Typography.Link
              onClick={async () => {
                if (!record.id) return;
                const hide = message.loading('已通知管理员');
                try {
                  const res = await remindWarnUsingPost(String(record.id));
                  hide();
                  if (res.code === 0) {
                    message.success('已提醒管理员处理');
                  } else {
                    message.error(res.message || '提醒失败');
                  }
                } catch (e: any) {
                  hide();
                  message.error(`提醒失败，${e.message}`);
                }
              }}
            >
              提醒管理员
            </Typography.Link>
          );
        },
      },
    ],
    [],
  );

  const ruleColumns = useMemo<ProColumns<RuleRow>[]>(
    () => [
      { title: '物资', dataIndex: 'materialName', hideInSearch: true },
      { title: '阈值', dataIndex: 'thresholdValue', hideInSearch: true },
      {
        title: '状态',
        dataIndex: 'isEnabled',
        valueType: 'select',
        valueEnum: {
          1: { text: '启用' },
          0: { text: '停用' },
        },
        render: (_, record) =>
          (record.isEnabled ?? 1) === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
      },
      {
        title: '规则来源',
        dataIndex: 'source',
        hideInSearch: true,
        render: (_, record) =>
          record.source === '全局' ? <Tag color="blue">全局</Tag> : <Tag color="geekblue">自定义</Tag>,
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
            {record.isInherited ? '设置' : '编辑'}
          </Typography.Link>
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
          { key: 'warn', label: isAdmin ? '预警列表' : '我的预警' },
          ...(isAdmin ? [{ key: 'rule', label: '预警规则' }] : []),
        ]}
      />

      {activeTab === 'warn' ? (
        <ProTable<WarnVO>
          actionRef={tableRef}
          rowKey="id"
          columns={warnColumns}
          search={{ labelWidth: 100 }}
          params={warnParams}
          request={async (params, sort) => {
            const sortField = Object.keys(sort || {})?.[0];
            const sortOrder = sortField ? sort?.[sortField] : undefined;
            const res = await listWarnUsingGet({
              current: params.current,
              pageSize: params.pageSize,
              warnType: params.warnType as unknown as number,
              handled: params.handled as unknown as number,
              materialName: params.materialName as string,
              sortField,
              sortOrder: sortOrder ?? undefined,
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
          <Tabs
            activeKey={String(ruleTypeTab)}
            onChange={(key) => setRuleTypeTab(Number(key))}
            items={[
              { key: '1', label: '库存预警规则' },
              { key: '2', label: '临期预警规则' },
            ]}
          />
          <ProTable<RuleRow>
            rowKey={(record) => `${record.ruleType}-${record.materialId}`}
            columns={ruleColumns}
            dataSource={ruleRows.filter((item) => item.ruleType === ruleTypeTab)}
            search={false}
            options={false}
            loading={ruleLoading}
            toolBarRender={() => {
              const globalRule = globalRuleMap[ruleTypeTab];
              const thresholdText =
                globalRule?.thresholdValue !== undefined ? String(globalRule.thresholdValue) : '-';
              return [
                <Space key="tool">
                  <Tag color="blue">全局阈值：{thresholdText}</Tag>
                </Space>,
              ];
            }}
          />
          <ModalForm<{
            ruleName?: string;
            thresholdValue: number;
            isEnabled: number;
          }>
            title={editingRule ? `编辑规则 - ${editingRule.materialName}` : '编辑规则'}
            open={ruleModalOpen}
            initialValues={{
              ruleName: editingRule?.ruleName,
              materialName: editingRule?.materialName,
              thresholdValue: editingRule?.thresholdValue || 0,
              isEnabled: (editingRule?.isEnabled ?? 1) as number,
            }}
            modalProps={{
              destroyOnHidden: true,
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
                  ruleType: editingRule?.ruleType ?? ruleTypeTab,
                  materialId: editingRule?.materialId,
                  ruleName: values.ruleName,
                  thresholdValue: values.thresholdValue,
                  isEnabled: values.isEnabled,
                });
                hide();
                message.success('保存成功');
                setRuleModalOpen(false);
                setEditingRule(undefined);
                loadRuleRows();
                return true;
              } catch (e: any) {
                hide();
                message.error(`保存失败，${e.message}`);
                return false;
              }
            }}
          >
            <ProFormText name="materialName" label="物资" fieldProps={{ readOnly: true }} />
            <ProFormText name="ruleName" label="规则名称" />
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

    </PageContainer>
  );
};

export default WarnNoticePage;
