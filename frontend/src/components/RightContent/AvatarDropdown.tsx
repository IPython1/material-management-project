import { userLogoutUsingPost } from '@/services/backend/userController';
import {
  getDashboardStatUsingGet,
  listNoticeUsingGet,
  NoticeVO,
  readNoticeUsingPut,
} from '@/services/backend/materialManagementController';
import { countUnhandledWarnUsingGet } from '@/services/backend/warnController';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Badge, Button, List, Popover, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'umi';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeList, setNoticeList] = useState<NoticeVO[]>([]);

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await userLogoutUsingPost();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };

  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const roleLabel = useMemo(() => {
    if (!currentUser?.userRole) return '访客';
    return currentUser.userRole === 'admin' ? '管理员' : '普通用户';
  }, [currentUser?.userRole]);

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });
        loginOut();
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const refreshNotice = useCallback(async () => {
    if (!currentUser) return;
    setNoticeLoading(true);
    try {
      const res = await listNoticeUsingGet({
        current: 1,
        pageSize: 200,
        isRead: 0,
      });
      if (res.code === 0) {
        setNoticeList(res.data?.records || []);
      } else {
        setNoticeList([]);
      }
    } catch (error) {
      setNoticeList([]);
    } finally {
      setNoticeLoading(false);
    }
  }, [currentUser]);

  const refreshGlobalNoticeAndWarn = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [noticeRes, warnRes, statRes] = await Promise.all([
        listNoticeUsingGet({
          current: 1,
          pageSize: 200,
          isRead: 0,
        }),
        countUnhandledWarnUsingGet(),
        getDashboardStatUsingGet(),
      ]);
      if (noticeRes.code === 0) {
        setNoticeList(noticeRes.data?.records || []);
      }
      setInitialState((prev) => ({
        ...prev,
        unhandledWarnCount: warnRes.data ?? 0,
        pendingApplyCount: statRes.data?.pendingApplyCount ?? 0,
      }));
    } catch (_) {
      // ignore polling failures
    }
  }, [currentUser, setInitialState]);

  useEffect(() => {
    if (!currentUser) return;
    refreshNotice();
  }, [currentUser, refreshNotice]);

  useEffect(() => {
    if (!currentUser) return;
    refreshGlobalNoticeAndWarn();
    const timer = window.setInterval(() => {
      refreshGlobalNoticeAndWarn();
    }, 5000);
    return () => {
      window.clearInterval(timer);
    };
  }, [currentUser, refreshGlobalNoticeAndWarn]);

  useEffect(() => {
    if (noticeOpen) {
      refreshNotice();
    }
  }, [noticeOpen, refreshNotice]);

  if (!currentUser) {
    return (
      <Link to="/user/login">
        <Button type="primary" shape="round">
          登录
        </Button>
      </Link>
    );
  }

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const unreadList = noticeList.filter((item) => (item.isRead ?? 0) === 0);
  const warnUnreadCount = unreadList.filter((item) => item.noticeType === 1).length;
  const applyUnreadCount = unreadList.filter((item) => item.noticeType === 2).length;
  const totalUnread = warnUnreadCount + applyUnreadCount;

  const warnNoticeList = noticeList.filter((item) => item.noticeType === 1).slice(0, 5);
  const applyNoticeList = noticeList.filter((item) => item.noticeType === 2).slice(0, 5);

  const handleReadNotice = async (noticeId?: number) => {
    if (!noticeId) return;
    const res = await readNoticeUsingPut(noticeId);
    if (res.code === 0) {
      setNoticeList((prev) =>
        prev.map((item) => (item.id === noticeId ? { ...item, isRead: 1 } : item)),
      );
    }
  };

  const markAllReadByType = async (noticeType: number) => {
    const targets = noticeList
      .filter((item) => item.noticeType === noticeType && (item.isRead ?? 0) === 0)
      .map((item) => item.id);
    if (targets.length === 0) {
      return;
    }
    await Promise.all(targets.map((id) => readNoticeUsingPut(id as number)));
    setNoticeList((prev) =>
      prev.map((item) =>
        item.noticeType === noticeType ? { ...item, isRead: 1 } : item,
      ),
    );
  };

  const renderNoticeSection = (
    title: string,
    count: number,
    list: NoticeVO[],
    emptyText: string,
    onView: () => void,
  ) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>{title}</span>
        <Space size={8}>
          <Badge count={count} size="small" />
          <Typography.Link
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setNoticeOpen(false);
              onView();
            }}
          >
            查看
          </Typography.Link>
        </Space>
      </div>
      <List<NoticeVO>
        size="small"
        dataSource={list}
        locale={{ emptyText }}
        renderItem={(item) => (
          <List.Item
            actions={[
              (item.isRead ?? 0) === 0 ? (
                <Typography.Link
                  key="read"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleReadNotice(item.id);
                  }}
                >
                  标记已读
                </Typography.Link>
              ) : (
                <span key="read" style={{ color: '#999' }}>
                  已读
                </span>
              ),
            ]}
          >
            <List.Item.Meta
              title={item.title || title}
              description={item.content || '-'}
            />
          </List.Item>
        )}
      />
    </div>
  );

  const noticeContent = (
    <div style={{ width: 360 }}>
      <Spin spinning={noticeLoading}>
        {renderNoticeSection('预警通知', warnUnreadCount, warnNoticeList, '暂无预警通知', () => {
          markAllReadByType(1);
          history.push('/notice?tab=warn&handled=0');
        })}
        {renderNoticeSection('申请通知', applyUnreadCount, applyNoticeList, '暂无申请通知', () => {
          markAllReadByType(2);
          const tab = currentUser?.userRole === 'admin' ? 'pending' : 'my';
          const query = currentUser?.userRole === 'admin' ? '?tab=pending&status=0' : '?tab=my';
          history.push(`/apply${query}`);
        })}
      </Spin>
    </div>
  );

  return (
    <Space size={20}>
      <Tooltip title="通知">
        <span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={noticeContent}
            open={noticeOpen}
            onOpenChange={(open) => {
              setNoticeOpen(open);
            }}
          >
            <span>
              <Badge count={totalUnread} size="small">
                <BellOutlined
                  style={{ fontSize: 16 }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setNoticeOpen((prev) => !prev);
                  }}
                />
              </Badge>
            </span>
          </Popover>
        </span>
      </Tooltip>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        <span>
          <Space>
            {currentUser?.userAvatar ? (
              <Avatar size="small" src={currentUser?.userAvatar} />
            ) : (
              <Avatar size="small" icon={<UserOutlined />} />
            )}
            <span className="anticon">{currentUser?.userName ?? '无名'}</span>
          </Space>
        </span>
      </HeaderDropdown>
    </Space>
  );
};

export const AvatarName = () => {};
