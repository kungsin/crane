import { lazy } from 'react';
import { ScanIcon } from 'tdesign-icons-react';
import { useTranslation } from 'react-i18next';

export const useresourceRecommendRouteConfig = () => {
  const { t } = useTranslation();
  return [
    {
      path: '/resourceRecommend',
      meta: {
        title: t('资源规格推荐'),
        Icon: ScanIcon,
      },
      children: [
        {
          path: 'recommendationRule',
          Component: lazy(() => import('pages/resourceRecommend/RecommendationRule')),
          meta: {
            title: t('推荐规则'),
          },
        },
        {
          path: 'resourcesRecommend',
          Component: lazy(() => import('pages/resourceRecommend/ResourcesRecommend')),
          meta: {
            title: t('资源推荐'),
          },
        },
        {
          path: 'replicaRecommend',
          Component: lazy(() => import('pages/resourceRecommend/ReplicaRecommend')),
          meta: {
            title: t('副本数推荐'),
          },
        },
        {
          path: 'monitor',
          Component: lazy(() => import('pages/resourceRecommend/WorkloadInsight/WorkloadInsightPanel')),
          meta: {
            title: t('监控'),
          },
        },
      ],
    },
  ];
};
