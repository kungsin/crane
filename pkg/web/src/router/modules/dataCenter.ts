import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

export const useDataCenterRouteConfig = (): IRouter[] => {
  const { t } = useTranslation();

  return [
    {
      path: '/data-center',
      meta: {
        title: t('数据中心'),
        Icon: DashboardIcon,
      },
      Component: lazy(() => import('pages/DataCenter/Base')),
    },
  ];
};
