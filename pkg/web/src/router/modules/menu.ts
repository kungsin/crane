import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuFoldIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

export const useMenuRouteConfig = (): IRouter[] => {
  const { t } = useTranslation();

  return [
    {
      path: '/menu',
      meta: {
        title: t('菜单管理'),
        Icon: MenuFoldIcon,
      },
      Component: lazy(() => import('pages/Menu')),
    },
  ];
};
