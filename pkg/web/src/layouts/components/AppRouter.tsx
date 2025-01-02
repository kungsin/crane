import React, { memo, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout, Loading } from 'tdesign-react';
import { useRouteConfig, IRouter } from 'router';
import { resolve } from 'utils/path';
import Page from './Page';
import Style from './AppRouter.module.less';

const { Content } = Layout;

type TRenderRoutes = (routes: IRouter[], parentPath?: string, breadcrumbs?: string[]) => React.ReactNode[];
/**
 * 渲染应用路由
 * @param routes
 * @param parentPath
 * @param breadcrumb
 */
const renderRoutes: TRenderRoutes = (routes, parentPath = '', breadcrumb = []) =>
  routes.map((route, index: number) => {
    const { Component, children, redirect, meta } = route;
    // console.log('route', route);
    // console.log('routes1', Component);
    // console.log('routes2', children);
    // console.log('routes3', redirect);
    // console.log('routes4', meta);

    const currentPath = resolve(parentPath, route.path);
    let currentBreadcrumb = breadcrumb;

    if (meta?.title) {
      currentBreadcrumb = currentBreadcrumb.concat([meta?.title]);
    }
    if (redirect) {
      // 重定向
      return <Route key={index} path={currentPath} element={<Navigate to={redirect} replace />} />;
    }

    if (Component) {
      // console.log('==============1234');
      // console.log('breadcrumb', currentBreadcrumb);
      // console.log('index', index);
      // console.log('currentPath', currentPath);

      // 有路由菜单
      return (
        <Route
          key={index}
          path={currentPath}
          element={
            <Page isFullPage={route.isFullPage ?? false} breadcrumbs={currentBreadcrumb}>
              <Component />
            </Page>
          }
        />
      );
    }
    // 无路由菜单
    return children ? renderRoutes(children, currentPath, currentBreadcrumb) : null;
  });

const AppRouter = () => {
  const routers = useRouteConfig();

  const location = useLocation();
  console.log('当前菜单为', location.pathname);

  // 如果当前路径是 '/login'，则不显示 AppRouter
  // if (location.pathname === '/login') {
  //   return null;
  // }

  return (
    <Content>
      <Suspense
        fallback={
          <div className={Style.loading}>
            <Loading />
          </div>
        }
      >
        <Routes>{renderRoutes(routers)}</Routes>
      </Suspense>
    </Content>
  );
};

export default memo(AppRouter);
