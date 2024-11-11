import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

export const useClusterRouteConfig = (): IRouter[] => {
  const { t } = useTranslation();

  return [
    {
      path: '/cluster',
      meta: {
        title: t('集群管理'),
        Icon: SettingIcon,
      },
      Component: lazy(() => import('pages/Cluster')),
    },
  ];
};
