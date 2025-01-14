import { useTranslation } from 'react-i18next';

export enum QueryWindow {
  LAST_12_HOURS = 'last12hours',
  LAST_1_DAY = 'last1day',
  PRE_7_DAY = 'predict7day',
  PRE_14_DAY = 'predict14day',
  LAST_7_DAY = 'last7day',
  LAST_30_DAY = 'last30day',
}

export const useQueryWindowOptions = () => {
  const { t } = useTranslation();
  return [
    { value: QueryWindow.LAST_12_HOURS, text: t('12小时') },
    { value: QueryWindow.LAST_1_DAY, text: t('24小时') },
    { value: QueryWindow.LAST_7_DAY, text: t('7天') },
    { value: QueryWindow.LAST_30_DAY, text: t('30天') },
  ];
};

export const usePredictQueryWindowOptions = () => {
  const { t } = useTranslation();
  return [
    { value: QueryWindow.PRE_7_DAY, text: t('未来7天') },
    { value: QueryWindow.PRE_14_DAY, text: t('未来14天') },
  ];
};

export enum Aggregation {
  CLUSTER = 'cluster',
  NAMESPACE = 'namespace',
  NODE = 'node',
  DEPLOYMENT = 'deployment',
  DAEMONSET = 'daemonset',
  STATEFULSET = 'statefulset',
  JOB = 'job',
  CRONJOB = 'cronjob',
  CONTROLLER = 'controller',
  POD = 'pod',
  CONTAINER = 'container',
}

export const useAggregationOptions = () => {
  const { t } = useTranslation();
  return [
    {
      value: Aggregation.CLUSTER,
      text: t('集群'),
    },
    {
      value: Aggregation.NAMESPACE,
      text: t('命名空间'),
    },
    {
      value: Aggregation.NODE,
      text: t('节点'),
    },
    {
      value: Aggregation.DEPLOYMENT,
      text: 'Deployment',
    },
    {
      value: Aggregation.DAEMONSET,
      text: 'Daemonset',
    },
    {
      value: Aggregation.STATEFULSET,
      text: 'Statefulset',
    },
    {
      value: Aggregation.JOB,
      text: 'Job',
    },
    // {
    //   value: Aggregation.CRONJOB,
    //   text: 'Cronjob'
    // },
    {
      value: Aggregation.CONTROLLER,
      text: 'Controller',
    },
    {
      value: Aggregation.POD,
      text: 'Pod',
    },
    {
      value: Aggregation.CONTAINER,
      text: 'Container',
    },
  ];
};

export interface ClusterSimpleInfo {
  id: string;
  name: string;
  craneUrl: string;
  grafanaUrl?: string;
  discount?: number;
  dashboardControl?: boolean;
}
