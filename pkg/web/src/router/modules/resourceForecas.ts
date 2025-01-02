import { lazy } from 'react';
import { ScanIcon } from 'tdesign-icons-react';
import { useTranslation } from 'react-i18next';

export const useresourceForecasRouteConfig = () => {
  const { t } = useTranslation();
  return [
    {
      path: '/resourceForecas',
      meta: {
        title: t('资源预测'),
        Icon: ScanIcon,
      },
      children: [
        {
          path: 'resourceForecas',
          Component: lazy(() => import('pages/resourceForecas/resourceForecas')),
          meta: {
            title: t('资源预测'),
          },
        },
      ],
    },
  ];
};
