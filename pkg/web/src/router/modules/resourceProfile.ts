import { IRouter } from '../index';
import { lazy } from 'react';
import { ChartIcon } from 'tdesign-icons-react';
import { useTranslation } from 'react-i18next';

export const useResourceProfile = (): IRouter[] => {
  const { t } = useTranslation();
  return [
    {
      path: '/resourceProfile',
      meta: {
        title: t('资源画像'),
        Icon: ChartIcon,
      },
      children: [
        {
          path: 'base-monitor',
          Component: lazy(() => import('pages/ResourceProfile/baseMonitor/index')),
          meta: {
            title: t('基础监控'),
          },
        },
        {
          path: 'cluster-overview',
          Component: lazy(() => import('pages/ResourceProfile/profile/index')),
          meta: {
            title: t('资源画像'),
          },
        },
        {
          path: 'workload-overview',
          Component: lazy(() => import('pages/ResourceProfile/cloudResource/index')),
          meta: {
            title: t('云资源性能视图'),
          },
        },
        {
          path: 'workload-insight',
          Component: lazy(() => import('pages/ResourceProfile/costVisual/index')),
          meta: {
            title: t('成本可视化'),
          },
        },
        // {
        //   path: 'namespace-costs',
        //   Component: lazy(() => import('pages/Cost/NamespaceCosts/NamespaceCostsPanel')),
        //   meta: {
        //     title: t('命名空间成本分布'),
        //   },
        // },
        // {
        //   path: 'costs-by-dimension',
        //   Component: lazy(() => import('pages/Cost/CostsByDimension/CostsByDimensionPanel')),
        //   meta: {
        //     title: t('应用成本分布'),
        //   },
        // },
        // {
        //   path: 'carbon',
        //   Component: lazy(() => import('pages/Cost/CarbonInsight/Index')),
        //   meta: {
        //     title: t('碳排放分析'),
        //   },
        // },
      ],
    },
  ];
};
