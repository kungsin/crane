import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { UserIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

export const useUserRouteConfig = (): IRouter[] => {
  const { t } = useTranslation();

  return [
    {
      path: '/user',
      meta: {
        title: t('用户管理'),
        Icon: UserIcon,
      },
      Component: lazy(() => import('pages/User')),
    },

    {
      path: 'user/add',
      Component: lazy(() => import('pages/User/AddUser')),
    },
  ];
};
