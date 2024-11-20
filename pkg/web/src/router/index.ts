import { useCostRouteConfig } from './modules/cost';
import otherRoutes from './modules/others';
import React from 'react';
import { BrowserRouterProps } from 'react-router-dom';
import { useDashboardRouteConfig } from './modules/dashboard';
import { useUserRouteConfig } from './modules/user';
import { useMenuRouteConfig } from './modules/menu';
import { useLoginRouteConfig } from './modules/login';
import { useClusterRouteConfig } from './modules/cluster';
import { useRecommendRouteConfig } from './modules/recommend';
import { useSettingRouteConfig } from './modules/settings';
import { useResourceProfile } from './modules/resourceProfile';
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
  // {
  //   path: '/',
  //   redirect: '/login',
  // },
  {
    path: '/',
    redirect: '/login',
  },
];

export const useRouteConfig = () => {
  // console.log('===', getUserInfo().IsAdmin);
  const userInfo = JSON.parse(getUserInfo());
  console.log('userInfo', userInfo);
  const cost = useCostRouteConfig();
  const dashboard = useDashboardRouteConfig();
  const recommend = useRecommendRouteConfig();
  const settings = useSettingRouteConfig();
  const user = useUserRouteConfig();
  const menu = useMenuRouteConfig();
  const cluster = useClusterRouteConfig();
  const login = useLoginRouteConfig();
  const resourceProfile = useResourceProfile();

  if (!userInfo) {
    return [...login, ...otherRoutes];
  }
  // eslint-disable-next-line no-else-return
  else {
    const IsAdmin = userInfo.IsAdmin;
    if (IsAdmin) {
      return [
        ...routes,
        ...dashboard,
        ...resourceProfile,
        ...cost,
        ...recommend,
        ...settings,
        ...user,
        ...menu,
        ...cluster,
        ...otherRoutes,
        ...login,
      ];
    }
    // eslint-disable-next-line no-else-return
    else {
      return [
        ...routes,
        ...dashboard,
        ...cost,
        ...recommend,
        ...settings,
        // ...user,
        // ...menu,
        // ...cluster,
        ...login,
        ...otherRoutes,
      ];
    }
  }
};
