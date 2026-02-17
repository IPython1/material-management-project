import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel } from '@umijs/max';
import {
  ApplyVO,
  DashboardPieItemVO,
  DashboardStatVO,
  DashboardTrendItemVO,
  WarnVO,
  getDashboardPieUsingGet,
  getDashboardStatUsingGet,
  getDashboardTodoUsingGet,
  getDashboardTrendUsingGet,
  getDashboardWarnUsingGet,
} from '@/services/backend/materialManagementController';
import { Line, Pie } from '@ant-design/plots';
import { Card, Col, Row, Statistic, Tag, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const applyStatusTextMap: Record<number, string> = {
  0: '待审批',
  1: '已通过',
  2: '已驳回',
  3: '已出库',
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.userRole === 'admin';
  const [stat, setStat] = useState<DashboardStatVO>({});
  const [trend, setTrend] = useState<DashboardTrendItemVO[]>([]);
  const [pie, setPie] = useState<DashboardPieItemVO[]>([]);
  const [todo, setTodo] = useState<ApplyVO[]>([]);
  const [warn, setWarn] = useState<WarnVO[]>([]);

  const cardHoverClassName = useEmotionCss(() => ({
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    borderRadius: 8,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 24px rgba(24, 144, 255, 0.18)',
    },
  }));

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

  const trendData = trend.flatMap((item) => [
    { date: item.date || '-', type: '申请单数', value: Number(item.applyCount ?? 0) },
    { date: item.date || '-', type: '出库总量', value: Number(item.outQuantity ?? 0) },
  ]);

  const trendLineConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    point: {
      size: 4,
      shape: 'diamond',
    },
    legend: {
      position: 'top' as const,
    },
    height: 280,
  };

  const pieData = pie
    .map((item) => ({
      category: item.category || '未分类',
      value: Number(item.value ?? 0),
    }))
    .filter((item) => item.value > 0);

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'category',
    radius: 0.9,
    // Keep pie config minimal to avoid runtime expression parser errors.
    label: false,
    legend: {
      position: 'bottom' as const,
    },
    height: 280,
  };

  const todoColumns: ProColumns<ApplyVO>[] = [
    { title: '申请人', dataIndex: 'applicantName' },
    { title: '物资', dataIndex: 'materialName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '时间', dataIndex: 'applyTime', valueType: 'dateTime' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        const status = record.status ?? 0;
        const color = status === 0 ? 'gold' : status === 2 ? 'red' : 'blue';
        return <Tag color={color}>{applyStatusTextMap[status] || '-'}</Tag>;
      },
    },
  ];

  const warnColumns: ProColumns<WarnVO>[] = [
    { title: '物资', dataIndex: 'materialName' },
    { title: '当前库存', dataIndex: 'currentValue' },
    { title: '阈值', dataIndex: 'thresholdValue' },
    {
      title: '建议处理',
      dataIndex: 'suggestion',
      render: (_, record) =>
        (record.warnType ?? 1) === 1 ? '及时补货或下调领用量' : '优先出库临期物资',
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            className={cardHoverClassName}
            onClick={() => {
              history.push('/material');
            }}
          >
            <Statistic title="物资总数" value={stat.materialCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            className={cardHoverClassName}
            onClick={() => {
              history.push('/notice');
            }}
          >
            <Statistic title="库存预警数" value={stat.unhandledWarnCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            className={cardHoverClassName}
            onClick={() => {
              history.push('/apply');
            }}
          >
            <Statistic title="待审批申请" value={stat.pendingApplyCount ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            className={cardHoverClassName}
            onClick={() => {
              history.push(isAdmin ? '/stock' : '/apply');
            }}
          >
            <Statistic title="今日出库/领用" value={stat.todayOutQuantity ?? 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card title="近 7 天出入库趋势" bordered={false}>
            <Line {...trendLineConfig} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="物资分类占比" bordered={false}>
            {pieData.length === 0 ? (
              <div style={{ color: token.colorTextSecondary }}>暂无分类数据（请先准备库存数据）</div>
            ) : (
              <Pie {...pieConfig} />
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
