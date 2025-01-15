import { lazy } from 'react';
import { AppIcon, ScanIcon } from 'tdesign-icons-react';
import { useTranslation } from 'react-i18next';

export const useApplicationPriorityRouteConfig = () => {
  const { t } = useTranslation();
  return [
    {
      path: '/applicationPriority',
      meta: {
        title: t('应用优先级'),
        // Icon: ScanIcon,
        Icon: AppIcon,
      },
      children: [
        {
          path: 'resourceForecas',
          Component: lazy(() => import('pages/ApplicationPriority/applicationPriority')),
          meta: {
            title: t('应用优先级'),
          },
        },
        {
          path: 'resourceManage',
          Component: lazy(() => import('pages/ApplicationPriority/manage')),
          meta: {
            title: t('应用管理'),
          },
        },
      ],
    },
  ];
};
