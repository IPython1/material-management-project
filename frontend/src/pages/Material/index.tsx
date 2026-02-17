import {
  deleteMaterialUsingPost,
  getMaterialDetailUsingGet,
  listMaterialUsingGet,
  MaterialVO,
  saveMaterialUsingPost,
} from '@/services/backend/materialManagementController';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Descriptions, message, Modal, Popconfirm, Space, Tag, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const toTotal = (value?: string | number) => Number(value ?? 0);
const categoryValueEnum = {
  防护用品: { text: '防护用品' },
  医疗用品: { text: '医疗用品' },
  办公用品: { text: '办公用品' },
  安全器材: { text: '安全器材' },
  工具器材: { text: '工具器材' },
} as const;

const MaterialPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const isAdmin = initialState?.currentUser?.userRole === 'admin';
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialVO | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<MaterialVO | undefined>();

  const columns = useMemo<ProColumns<MaterialVO>[]>(
    () => [
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
        title: '有效期',
        dataIndex: 'expireDate',
        valueType: 'date',
        hideInSearch: true,
      },
      {
        title: '库存总量',
        dataIndex: 'stockTotal',
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
        valueType: 'select',
        valueEnum: {
          1: { text: '正常' },
          0: { text: '停用' },
        },
        sorter: true,
        render: (_, record) => {
          if ((record.status ?? 1) === 0) {
            return <Tag>停用</Tag>;
          }
          const warnThreshold = record.warnThreshold ?? 0;
          const stockTotal = record.stockTotal ?? 0;
          if (warnThreshold > 0 && stockTotal <= warnThreshold) {
            return <Tag color="red">预警</Tag>;
          }
          return <Tag color="green">正常</Tag>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        hideInSearch: true,
        sorter: true,
      },
      {
        title: '操作',
        valueType: 'option',
        width: 220,
        render: (_, record) => (
          <Space>
            <Typography.Link
              onClick={async () => {
                if (!record.id) return;
                const res = await getMaterialDetailUsingGet(record.id);
                if (res.code === 0) {
                  setDetailData(res.data);
                  setDetailOpen(true);
                } else {
                  message.error(res.message || '加载详情失败');
                }
              }}
            >
              详情
            </Typography.Link>
            {isAdmin ? (
              <Typography.Link
                onClick={() => {
                  setEditing(record);
                  setModalOpen(true);
                }}
              >
                编辑
              </Typography.Link>
            ) : null}
            {isAdmin ? (
              <Popconfirm
                title="确认删除该物资？"
                onConfirm={async () => {
                  if (!record.id) return;
                  const hide = message.loading('删除中');
                  try {
                    await deleteMaterialUsingPost({ id: Number(record.id) });
                    hide();
                    message.success('删除成功');
                    actionRef.current?.reload();
                  } catch (e: any) {
                    hide();
                    message.error(`删除失败，${e.message}`);
                  }
                }}
              >
                <Typography.Link type="danger">删除</Typography.Link>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      },
    ],
    [isAdmin],
  );

  return (
    <PageContainer>
      <ProTable<MaterialVO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 100 }}
        toolBarRender={() =>
          isAdmin
            ? [
                <Typography.Link
                  key="create"
                  onClick={() => {
                    setEditing(undefined);
                    setModalOpen(true);
                  }}
                >
                  新建物资
                </Typography.Link>,
              ]
            : []
        }
        request={async (params, sort) => {
          const sortField = Object.keys(sort || {})?.[0];
          const sortOrder = sortField ? sort?.[sortField] : undefined;
          const res = await listMaterialUsingGet({
            current: params.current,
            pageSize: params.pageSize,
            materialName: params.materialName as string,
            category: params.category as string,
            status: params.status as unknown as number,
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

      {isAdmin ? (
        <ModalForm<{
          id?: number;
          materialName: string;
          category?: string;
          location?: string;
          expireDate?: string;
          status?: number;
        }>
          title={editing ? '编辑物资' : '新建物资'}
          open={modalOpen}
          initialValues={{
            id: editing?.id ? Number(editing.id) : undefined,
            materialName: editing?.materialName,
            category: editing?.category,
            location: editing?.location,
            expireDate: editing?.expireDate,
            status: editing?.status ?? 1,
          }}
          modalProps={{
            destroyOnHidden: true,
            onCancel: () => {
              setModalOpen(false);
              setEditing(undefined);
            },
          }}
          onFinish={async (values) => {
            const hide = message.loading('保存中');
            try {
              await saveMaterialUsingPost(values);
              hide();
              message.success('保存成功');
              setModalOpen(false);
              setEditing(undefined);
              actionRef.current?.reload();
              return true;
            } catch (e: any) {
              hide();
              message.error(`保存失败，${e.message}`);
              return false;
            }
          }}
        >
          <ProFormDigit name="id" label="ID" hidden />
          <ProFormText
            name="materialName"
            label="物资名称"
            rules={[{ required: true, message: '请输入物资名称' }]}
          />
          <ProFormText name="category" label="分类" />
          <ProFormText name="location" label="位置" />
          <ProFormDatePicker name="expireDate" label="有效期" />
          <ProFormSelect
            name="status"
            label="状态"
            valueEnum={{
              1: '正常',
              0: '停用',
            }}
            rules={[{ required: true, message: '请选择状态' }]}
          />
        </ModalForm>
      ) : null}

      <Modal
        open={detailOpen}
        title="物资详情"
        footer={null}
        onCancel={() => {
          setDetailOpen(false);
          setDetailData(undefined);
        }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="物资名称">{detailData?.materialName || '-'}</Descriptions.Item>
          <Descriptions.Item label="分类">{detailData?.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="位置">{detailData?.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="有效期">{detailData?.expireDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="库存总量">{detailData?.stockTotal ?? 0}</Descriptions.Item>
          <Descriptions.Item label="预警阈值">{detailData?.warnThreshold ?? 0}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {(detailData?.status ?? 1) === 0
              ? '停用'
              : (detailData?.warnThreshold ?? 0) > 0 &&
                  (detailData?.stockTotal ?? 0) <= (detailData?.warnThreshold ?? 0)
                ? '预警'
                : '正常'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </PageContainer>
  );
};

export default MaterialPage;

