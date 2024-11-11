import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

export const useLoginRouteConfig = (): IRouter[] => {
  const { t } = useTranslation();

  return [
    {
      path: '/login',
      meta: {
        title: t('登录'),
        Icon: DashboardIcon,
      },
      isFullPage: true,

      Component: lazy(() => import('pages/Login')),
    },
  ];
};
