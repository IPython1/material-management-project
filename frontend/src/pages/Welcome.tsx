import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  DashboardPieItemVO,
  DashboardTrendItemVO,
  getDashboardPieUsingGet,
  getDashboardStatUsingGet,
  getDashboardTodoUsingGet,
  getDashboardTrendUsingGet,
  getDashboardWarnUsingGet,
  ApplyVO,
  WarnVO,
} from '@/services/backend/materialManagementController';
import { Card, Col, Progress, Row, Statistic, Table, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [stat, setStat] = useState<{
    materialCount?: number;
    totalStock?: number;
    todayApplyCount?: number;
    pendingApplyCount?: number;
    unhandledWarnCount?: number;
  }>({});
  const [trend, setTrend] = useState<DashboardTrendItemVO[]>([]);
  const [pie, setPie] = useState<DashboardPieItemVO[]>([]);
  const [todo, setTodo] = useState<ApplyVO[]>([]);
  const [warn, setWarn] = useState<WarnVO[]>([]);

  useEffect(() => {
    (async () => {
      const [statRes, trendRes, pieRes, todoRes, warnRes] = await Promise.all([
        getDashboardStatUsingGet(),
        getDashboardTrendUsingGet(),
        getDashboardPieUsingGet(),
        getDashboardTodoUsingGet({ pageSize: 5 }),
        getDashboardWarnUsingGet({ pageSize: 5 }),
      ]);
      if (statRes.code === 0) {
        setStat(statRes.data || {});
      }
      if (trendRes.code === 0) {
        setTrend(trendRes.data || []);
      }
      if (pieRes.code === 0) {
        setPie(pieRes.data || []);
      }
      if (todoRes.code === 0) {
        setTodo(todoRes.data?.records || []);
      }
      if (warnRes.code === 0) {
        setWarn(warnRes.data?.records || []);
      }
    })();
  }, []);

  const trendColumns: ProColumns<DashboardTrendItemVO>[] = [
    { title: '日期', dataIndex: 'date' },
    { title: '申请单数', dataIndex: 'applyCount' },
    { title: '出库总量', dataIndex: 'outQuantity' },
  ];

  const todoColumns: ProColumns<ApplyVO>[] = [
    { title: '申请单号', dataIndex: 'approvalNo' },
    { title: '物资', dataIndex: 'materialName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '申请人', dataIndex: 'applicantName' },
    { title: '申请时间', dataIndex: 'applyTime', valueType: 'dateTime' },
  ];

  const warnColumns: ProColumns<WarnVO>[] = [
    { title: '物资', dataIndex: 'materialName' },
    { title: '类型', dataIndex: 'warnTypeText' },
    { title: '当前值', dataIndex: 'currentValue' },
    { title: '阈值', dataIndex: 'thresholdValue' },
    { title: '时间', dataIndex: 'createTime', valueType: 'dateTime' },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="物资总数" value={stat.materialCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="库存总量" value={stat.totalStock ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日申请" value={stat.todayApplyCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="待审批" value={stat.pendingApplyCount ?? 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card
            title="近 7 天申请与出库趋势"
            bordered={false}
            bodyStyle={{ padding: 0, paddingTop: 16, paddingBottom: 16 }}
          >
            <ProTable<DashboardTrendItemVO>
              search={false}
              options={false}
              toolBarRender={false}
              rowKey="date"
              pagination={false}
              dataSource={trend}
              columns={trendColumns}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="按分类库存占比" bordered={false}>
            {pie.length === 0 ? (
              <div style={{ color: token.colorTextSecondary }}>暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pie.map((item) => (
                  <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: '0 0 80px' }}>{item.category}</span>
                    <Progress
                      percent={item.value && stat.totalStock ? Math.round((item.value / (stat.totalStock || 1)) * 100) : 0}
                      showInfo
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="待审批列表" bordered={false}>
            <ProTable<ApplyVO>
              search={false}
              options={false}
              toolBarRender={false}
              rowKey="id"
              pagination={false}
              dataSource={todo}
              columns={todoColumns}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="预警列表" bordered={false}>
            <ProTable<WarnVO>
              search={false}
              options={false}
              toolBarRender={false}
              rowKey="id"
              pagination={false}
              dataSource={warn}
              columns={warnColumns}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Welcome;
