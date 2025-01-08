import otherRoutes from './modules/others';
import React from 'react';
import { BrowserRouterProps } from 'react-router-dom';
import { useDashboardRouteConfig } from './modules/dashboard';
import { useUserRouteConfig } from './modules/user';
import { useLoginRouteConfig } from './modules/login';
import { useSettingRouteConfig } from './modules/settings';
import { useResourceProfile } from './modules/resourceProfile';
import { useresourceRecommendRouteConfig } from './modules/resourceRecommend';
import { useresourceForecasRouteConfig } from './modules/resourceForecas';
import { useApplicationPriorityRouteConfig } from './modules/applicationPriority';
import { getUserInfo } from 'utils/user';

export interface IRouter {
  path: string;
  redirect?: string;
  Component?: React.FC<BrowserRouterProps> | (() => any);
  /**
   * 当前路由是否全屏显示
   */
  isFullPage?: boolean;
  /**
   * meta未赋值 路由不显示到菜单中
   */
  meta?: {
    title?: string;
    Icon?: React.FC;
    /**
     * 侧边栏隐藏该路由
     */
    hidden?: boolean;
    /**
     * 单层路由
     */
    single?: boolean;
  };
  children?: IRouter[];
}

const routes: IRouter[] = [
  {
    path: '/',
    redirect: '/login',
  },
];

export const useRouteConfig = () => {
  // 获取 userInfo
  const IsAdmin = JSON.parse(getUserInfo())?.IsAdmin;
  const dashboard = useDashboardRouteConfig();
  const settings = useSettingRouteConfig();
  const user = useUserRouteConfig();
  const login = useLoginRouteConfig();
  const resourceProfile = useResourceProfile();
  const resourceRecommend = useresourceRecommendRouteConfig();
  const resourceForecas = useresourceForecasRouteConfig();
  const applicationPriority = useApplicationPriorityRouteConfig();

  // 是否为管理员
  if (IsAdmin) {
    return [
      ...routes,
      ...dashboard,
      ...resourceProfile,
      ...resourceRecommend,
      ...resourceForecas,
      ...applicationPriority,
      ...user,
      ...settings,
      ...otherRoutes,
      ...login,
    ];
  }
  // eslint-disable-next-line prettier/prettier, no-else-return
  else {
    return [
      ...routes,
      ...dashboard,
      ...resourceProfile,
      ...resourceRecommend,
      ...resourceForecas,
      ...applicationPriority,
      ...otherRoutes,
      ...login,
    ];
  }
};
