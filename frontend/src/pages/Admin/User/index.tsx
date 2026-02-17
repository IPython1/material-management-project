import {
  addUserUsingPost,
  assignUserRoleUsingPut,
  deleteUserUsingPost,
  listUserByPageUsingPost,
  resetUserPasswordUsingPost,
  updateUserStatusUsingPut,
  updateUserUsingPost,
} from '@/services/backend/userController';
import { listRoleUsingGet } from '@/services/backend/roleController';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * 用户管理页面
 *
 * @constructor
 */
const UserAdminPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.User>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([
    { label: '用户', value: 'user' },
    { label: '管理员', value: 'admin' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await listRoleUsingGet();
        if (res.code === 0 && res.data?.length) {
          setRoleOptions(
            res.data.map((role) => ({
              label: role === 'admin' ? '管理员' : '用户',
              value: role,
            })),
          );
        }
      } catch (error) {
        // 角色接口异常时，使用默认角色选项
      }
    })();
  }, []);

  const handleDelete = async (row: API.User) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deleteUserUsingPost({
        id: row.id as any,
      });
      hide();
      message.success('删除成功');
      actionRef?.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  const roleValueEnum = useMemo(() => {
    const enumMap: Record<string, { text: string }> = {};
    roleOptions.forEach((role) => {
      enumMap[role.value] = { text: role.label };
    });
    return enumMap;
  }, [roleOptions]);

  const handleStatusChange = async (row: API.User, targetStatus: number) => {
    if (!row?.id) return;
    const hide = message.loading(targetStatus === 1 ? '正在启用' : '正在禁用');
    try {
      await updateUserStatusUsingPut({ id: row.id }, { userStatus: targetStatus });
      hide();
      message.success(targetStatus === 1 ? '启用成功' : '禁用成功');
      actionRef.current?.reload();
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
    }
  };

  const handleResetPassword = async (row: API.User) => {
    if (!row?.id) return;
    const hide = message.loading('正在重置密码');
    try {
      await resetUserPasswordUsingPost({ id: row.id });
      hide();
      message.success('密码已重置为 12345678');
    } catch (error: any) {
      hide();
      message.error('重置失败，' + error.message);
    }
  };

  const handleAssignRole = async (row: API.User, role: 'user' | 'admin') => {
    if (!row?.id) return;
    const hide = message.loading('正在分配角色');
    try {
      await assignUserRoleUsingPut({ id: row.id }, { userRole: role });
      hide();
      message.success('角色分配成功');
      actionRef.current?.reload();
    } catch (error: any) {
      hide();
      message.error('分配失败，' + error.message);
    }
  };

  const columns: ProColumns<API.User>[] = [
    {
      title: '用户名',
      dataIndex: 'userName',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'userPhone',
      valueType: 'text',
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      valueType: 'select',
      valueEnum: roleValueEnum,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'userStatus',
      valueType: 'select',
      valueEnum: {
        1: { text: '启用' },
        0: { text: '禁用' },
      },
      render: (_, record) =>
        (record.userStatus ?? 1) === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      sorter: true,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalVisible(true);
            }}
          >
            修改
          </Typography.Link>
          <Popconfirm
            title={(record.userStatus ?? 1) === 1 ? '确认禁用该账号？' : '确认启用该账号？'}
            onConfirm={() => handleStatusChange(record, (record.userStatus ?? 1) === 1 ? 0 : 1)}
          >
            <Typography.Link>{(record.userStatus ?? 1) === 1 ? '禁用' : '启用'}</Typography.Link>
          </Popconfirm>
          <Popconfirm title="确认重置密码为 12345678？" onConfirm={() => handleResetPassword(record)}>
            <Typography.Link>重置密码</Typography.Link>
          </Popconfirm>
          {record.userRole === 'admin' ? (
            <Popconfirm title="确认设为普通用户？" onConfirm={() => handleAssignRole(record, 'user')}>
              <Typography.Link>设为用户</Typography.Link>
            </Popconfirm>
          ) : (
            <Popconfirm title="确认设为管理员？" onConfirm={() => handleAssignRole(record, 'admin')}>
              <Typography.Link>设为管理员</Typography.Link>
            </Popconfirm>
          )}
          <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete(record)}>
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.User>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新增用户
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          const { data, code } = await listUserByPageUsingPost({
            ...params,
            sortField,
            sortOrder,
            ...filter,
          } as API.UserQueryRequest);

          return {
            success: code === 0,
            data: data?.records || [],
            total: Number(data?.total) || 0,
          };
        }}
        columns={columns}
      />
      <ModalForm<API.UserAddRequest>
        title="新增用户"
        open={createModalVisible}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => setCreateModalVisible(false),
        }}
        onFinish={async (values) => {
          const hide = message.loading('正在创建');
          try {
            await addUserUsingPost(values);
            hide();
            message.success('创建成功');
            setCreateModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (error: any) {
            hide();
            message.error('创建失败，' + error.message);
            return false;
          }
        }}
      >
        <ProFormText
          name="userAccount"
          label="账号"
          rules={[{ required: true, message: '请输入账号' }]}
        />
        <ProFormText name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
        <ProFormText name="userPhone" label="手机号" />
        <ProFormText name="userAvatar" label="头像地址" />
        <ProFormTextArea name="userProfile" label="简介" />
        <ProFormSelect
          name="userRole"
          label="角色"
          options={roleOptions}
          initialValue="user"
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormSelect
          name="userStatus"
          label="状态"
          options={[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]}
          initialValue={1}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </ModalForm>

      <ModalForm<API.UserUpdateRequest>
        title="编辑用户"
        open={updateModalVisible}
        initialValues={{
          userName: currentRow?.userName,
          userPhone: currentRow?.userPhone,
          userAvatar: currentRow?.userAvatar,
          userProfile: currentRow?.userProfile,
          userRole: currentRow?.userRole,
          userStatus: currentRow?.userStatus ?? 1,
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setUpdateModalVisible(false);
            setCurrentRow(undefined);
          },
        }}
        onFinish={async (values) => {
          if (!currentRow?.id) return false;
          const hide = message.loading('正在更新');
          try {
            await updateUserUsingPost({
              ...values,
              id: currentRow.id,
            });
            hide();
            message.success('更新成功');
            setUpdateModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
            return true;
          } catch (error: any) {
            hide();
            message.error('更新失败，' + error.message);
            return false;
          }
        }}
      >
        <ProFormText name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
        <ProFormText name="userPhone" label="手机号" />
        <ProFormText name="userAvatar" label="头像地址" />
        <ProFormTextArea name="userProfile" label="简介" />
        <ProFormSelect
          name="userRole"
          label="角色"
          options={roleOptions}
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormSelect
          name="userStatus"
          label="状态"
          options={[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};
export default UserAdminPage;
