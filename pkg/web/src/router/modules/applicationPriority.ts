import { lazy } from 'react';
import { ScanIcon } from 'tdesign-icons-react';
import { useTranslation } from 'react-i18next';

export const useApplicationPriorityRouteConfig = () => {
  const { t } = useTranslation();
  return [
    {
      path: '/applicationPriority',
      meta: {
        title: t('应用优先级'),
        Icon: ScanIcon,
      },
      children: [
        {
          path: 'resourceForecas',
          Component: lazy(() => import('pages/ApplicationPriority/costVisual')),
          meta: {
            title: t('应用优先级'),
          },
        },
      ],
    },
  ];
};
