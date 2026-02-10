import {
  deleteMaterialUsingPost,
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
import { message, Popconfirm, Space, Tag, Typography } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const toTotal = (value?: string | number) => Number(value ?? 0);

const MaterialPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialVO | undefined>();

  const columns = useMemo<ProColumns<MaterialVO>[]>(
    () => [
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
        title: '有效期',
        dataIndex: 'expireDate',
        valueType: 'date',
        hideInSearch: true,
      },
      {
        title: '库存总量',
        dataIndex: 'stockTotal',
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: {
          1: { text: '正常' },
          0: { text: '停用' },
        },
        render: (_, record) =>
          (record.status ?? 1) === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">停用</Tag>,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
      {
        title: '操作',
        valueType: 'option',
        width: 160,
        render: (_, record) => (
          <Space>
            <Typography.Link
              onClick={() => {
                setEditing(record);
                setModalOpen(true);
              }}
            >
              编辑
            </Typography.Link>
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
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <ProTable<MaterialVO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <Typography.Link
            key="create"
            onClick={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
          >
            新建物资
          </Typography.Link>,
        ]}
        request={async (params) => {
          const res = await listMaterialUsingGet({
            current: params.current,
            pageSize: params.pageSize,
            materialName: params.materialName as string,
            category: params.category as string,
            status: params.status as unknown as number,
          });
          return {
            data: res.data?.records || [],
            success: res.code === 0,
            total: toTotal(res.data?.total),
          };
        }}
      />

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
          destroyOnClose: true,
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
    </PageContainer>
  );
};

export default MaterialPage;

