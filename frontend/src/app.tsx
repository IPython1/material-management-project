import Footer from '@/components/Footer';
import { getDashboardStatUsingGet } from '@/services/backend/materialManagementController';
import { getLoginUserUsingGet } from '@/services/backend/userController';
import { countUnhandledWarnUsingGet } from '@/services/backend/warnController';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Badge } from 'antd';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown } from './components/RightContent/AvatarDropdown';
import { requestConfig } from './requestConfig';

const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  const initialState: InitialState = {
    currentUser: undefined,
    unhandledWarnCount: 0,
    pendingApplyCount: 0,
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    try {
      const res = await getLoginUserUsingGet();
      initialState.currentUser = res.data;
    } catch (error: any) {
      // 如果未登录
    }
    try {
      const warnRes = await countUnhandledWarnUsingGet();
      initialState.unhandledWarnCount = warnRes.data ?? 0;
    } catch (_) {
      // 忽略预警计数加载失败
    }
    try {
      const statRes = await getDashboardStatUsingGet();
      initialState.pendingApplyCount = statRes.data?.pendingApplyCount ?? 0;
    } catch (_) {
      // 忽略待审批计数加载失败
    }
  }
  return initialState;
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    avatarProps: {
      render: () => {
        return <AvatarDropdown />;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    menuItemRender: (menuItemProps: any, defaultDom: any) => {
      if (menuItemProps.path === '/notice') {
        const count = initialState?.unhandledWarnCount ?? 0;
        return (
          <a href={menuItemProps.path} onClick={(e) => { e.preventDefault(); history.push(menuItemProps.path || '/notice'); }}>
            <Badge count={count} size="small" offset={[6, 0]}>
              {defaultDom}
            </Badge>
          </a>
        );
      }
      if (menuItemProps.path === '/apply' && initialState?.currentUser?.userRole === 'admin') {
        const count = initialState?.pendingApplyCount ?? 0;
        return (
          <a href={menuItemProps.path} onClick={(e) => { e.preventDefault(); history.push(menuItemProps.path || '/apply'); }}>
            <Badge count={count} size="small" offset={[6, 0]}>
              {defaultDom}
            </Badge>
          </a>
        );
      }
      return (
        <a href={menuItemProps.path} onClick={(e) => { e.preventDefault(); history.push(menuItemProps.path || '/'); }}>
          {defaultDom}
        </a>
      );
    },
    ...defaultSettings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = requestConfig;
